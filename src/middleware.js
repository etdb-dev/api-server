'use strict';

const basicAuth = require('basic-auth');
const jwt = require('jsonwebtoken');

const config = require('./config');
const db = require('./db');
const AccessRequest = require('./access-request.cls');
const routeLevels = require('./route-access-levels.map.json');

let middleware = {};

middleware.validateToken = (req, res, next) => {

  let token = req.body.token || req.query.token || req.headers['x-access-token'];

  logDebug('Validating token');
  if (token) {
    jwt.verify(token, config.get('secret'), (err, tokenPayload) => {
      let msg;
      if (err) {
        if (err.name === 'TokenExpiredError') {
          logWarn('Received expired token. Rejecting');
          msg = 'Your token has expired.';
        } else {
          logWarn('Received token is invalid. Rejecting');
          msg = 'Your token is invalid.';
        }
        return res.status(401).json({
          message: msg + ' Please authenticate again!'
        });
      }
      logSuccess(`Token verifyed (uid=${tokenPayload.username})`);
      req.tokenPayload = tokenPayload;
      next();
    });
  } else {
    logWarn('No token found');
    res.sendStatus(401);
  }
};

middleware.doBasicAuth = (req, res, next) => {
  logInfo('Validating basic auth data.');
  let userData = basicAuth(req) || { name: null, pass: null };
  let name = userData.name;
  let pass = userData.pass;
  logSuccess(`username: ${name}`);
  !pass ? logWarn('No password!') : logSuccess('password supplied');
  db.user.findOne({ username: name }).then((userDoc) => {
    if (!userData || !name || !pass) {
      throw new Error();
    }
    userDoc.validatePassword(pass).then(() => {
      req.tokenPayload = userDoc.getTokenData();
      logSuccess('Basic Auth credentials accepted');
      return next();
    }).catch((err) => {
      logError(err.message);
      return failAuthRequest(res);
    });
  }).catch(() => {
    logWarn(`User (uid=${name}) not found`);
    return failAuthRequest(res);
  });
};

middleware.buildAccessRequest = (req, res, next) => {
  let token = req.tokenPayload;
  req.accessRequest = new AccessRequest({
    req: req,
    res: res,
    neededLevel: getAccessLevel(req),
    allowSelf: token.userId
  });
  if (req.accessRequest.neededLevel === 'none') {
    logWarn(`Access to ${req.originalUrl} isn't defined!`);
    logWarn('Please add an access level to /src/route-access-levels.map.json!');
  } else {
    logInfo('Issued AccessRequest for ' + req.originalUrl);
  }
  next();
};

let getAccessLevel = (req) => {
  let methods = routeLevels[req.originalUrl];
  if (!methods) {
    let lastSlashIdx = req.originalUrl.lastIndexOf('/') + 1;
    if (lastSlashIdx < req.originalUrl.length) {
      let routeUrl = req.originalUrl.slice(0, lastSlashIdx) + '*';
      methods = routeLevels[routeUrl];
    }
  }
  return methods ? methods[req.method] || 'none' : 'none';
};

let failAuthRequest = (res) => {
  res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
  return res.sendStatus(401);
};

module.exports = middleware;
