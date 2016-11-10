'use strict';

const basicAuth = require('basic-auth');
const jwt = require('jsonwebtoken');
const db = require.main.require('./src/db');

let middleware = {};

middleware.validateToken = (req, res, next) => {

  let token = req.body.token || req.query.token || req.headers['x-access-token'];

  logDebug('Validating token');
  if (token) {
    jwt.verify(token, 'matokensecret', (err, tokenPayload) => {
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
      res.locals.tokenPayload = userDoc.getTokenData();
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

let failAuthRequest = (res) => {
  res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
  return res.sendStatus(401);
};

module.exports = middleware;
