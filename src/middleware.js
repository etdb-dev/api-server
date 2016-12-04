'use strict';

const basicAuth = require('basic-auth');
const jwt = require('jsonwebtoken');

const config = require('./config');
const db = require('./db');

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
  logInfo(`username: ${name}`);
  logInfo(`password supplied: [${!pass ? ' ' : 'X'}]`);
  db.user.findOne({ username: name }).then((userDoc) => {
    if (!userData || !name || !pass) {
      throw new Error();
    }
    userDoc.validatePassword(pass).then(() => {
      req.tokenPayload = userDoc.getTokenData();
      logSuccess('Credentials accepted');
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

middleware.canAccess = (req, res, next, accessType) => {

  function fail() {
    logWarn(`Access denied to ${req.tokenPayload.username} on ${accessType}`);
    res.status(401).json({
      message: `You don't have the permission to ${accessType}.`
    });
  }

  // Even though all /auth routes rely on Basic Auth,
  // req.tokenPayload is populated!
  // see: module:middleware.doBasicAuth
  let access = req.tokenPayload.access;

  if (!accessType) {
    return fail();
  }
  if (access['isAdmin'] || access[accessType]) {
    return next();
  }
  fail();
};

let failAuthRequest = (res) => {
  res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
  return res.sendStatus(401);
};

module.exports = middleware;
