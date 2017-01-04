'use strict';

const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const config = require('../config');
const db = require('../db');
const User = db.user;
const accessDefaults = require('../constants').accessDefaults;

let authController = {};

authController.signToken = (tokenData) => {
  return jwt.sign({
    userId: tokenData.userId,
    username: tokenData.username,
    access: tokenData.access
  }, config.get('secret'), {
    expiresIn: '2h'
  });
};

authController.getToken = (req, res, next) => {
  authController.canAccess(req, res, 'readAPI')
  .then(() => {
    logDebug('Creating token');
    let tokenData = req.tokenPayload;
    let token = authController.signToken(tokenData);
    res.json({
      message: 'Token for evr\'body!',
      token: token
    });
  });
};

authController.canAccess = (req, res, accessType, allowSelf) => {

  return new Promise((resolve, reject) => {

    if (!accessType) {
      return reject(res, req.tokenPayload.username, accessType);
    }

    let selfTest;

    User.findOne({ _id: allowSelf }).then(() => {
      selfTest = true;
    }).catch(() => {
      selfTest = false;
    }).finally(() => {
      let access = req.tokenPayload.access;
      let isAdmin = access['isAdmin'];
      let accessTest = access[accessType];
      let grantedBy = isAdmin ? 'isAdmin' : accessTest ? accessType : selfTest ? 'self' : '';

      if (isAdmin || accessTest || selfTest) {
        logSuccess(`Requested access level (${accessType}) satisfied by: ${grantedBy}`);
        return resolve(grantedBy);
      }
      return reject(req, res, accessType, req.tokenPayload.username);
    });

  });
};

authController.denyAccess = (res, username, accessType) => {

  return new Promise((resolve, reject) => {

    logWarn(`Access denied to ${username} on ${accessType}`);
    res.status(401).json({
      message: `You don't have the permission to ${accessType}.`
    });
  });

};

authController.addUser = (req, res) => {
  authController.canAccess(req, res, 'manageUsers')
  .then(() => {
    let data = req.body;
    let tokenData = req.tokenPayload;
    if (tokenData.username === data.username) {
      logWarn(`${data.username} tried to add himself.`);
      return res.status(409).json({
        message: 'Now, why would you want to add yourself again?'
      });
    }

    let user = new User({
      'username': data.username,
      'password': data.password,
      'access': _.assign(accessDefaults, data.access || {})
    });

    user.save().then((userDoc) => {
      let msg = `${data.username} has been createad`;
      logSuccess(msg + ' by ' + tokenData.username);
      res.status(201).json({
        message: msg,
        userId: userDoc._id
      });
    }).catch((err) => res.status(409).json({
      message: `user (${data.username}) already exists`,
      userId: err.getOperation()._id
    }));
  });
};

authController.deleteUser = (req, res) => {
  authController.canAccess(req, res, 'manageUsers', req.params.userId)
  .then(() => {
    User.findOneAndRemove({ _id: req.params.userId }).then((deletedDoc) => {
      if (!deletedDoc) {
        logWarn(`User (uid=${req.params.userId}) not found`);
        res.sendStatus(404);
      } else {
        let msg = `${deletedDoc.username} has been deleted`;
        logSuccess(msg);
        res.json({ message: msg });
      }
    });
  });
};

authController.updateUser = (req, res) => {
  authController.canAccess(req, res, 'manageUsers', req.params.userId)
  .then((grantedBy) => {
    let updates = req.body;

    if (updates.access) {
      updates.access = grantedBy === 'self' ? req.tokenPayload.access : _.assign(accessDefaults, req.body.access || {});;
    }

    User.findOne({ _id: req.params.userId }).then((userDoc) => {
      userDoc = _.assign(userDoc, updates);
      return userDoc.save();
    }).then((updatedDoc) => {
      let msg = `${updatedDoc.username} has been updated`;
      logSuccess(msg);
      res.json({ message: msg });
    });
  });
};

authController.listUsers = (req, res) => {
  let username = req.tokenPayload.username;
  authController.canAccess(req, res, 'manageUsers', req.tokenPayload.userId)
  .then((grantedBy) => {
    let findFilter = grantedBy === 'self' ? { username: username } : {};
    User.find(findFilter, {_id: 0, username: 1, access: 1 }).then((docs) => {
      res.json({
        msg: 'Userlist',
        users: docs
      });
    });
  });
};

module.exports = authController;
