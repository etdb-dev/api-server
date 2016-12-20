'use strict';

const jwt = require('jsonwebtoken');
const _ = require('lodash');

const config = require('../config');
const mw = require('../middleware');
const User = require('../db/user');

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
  mw.canAccess(req, res, { accessType: 'readAPI' })
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

authController.addUser = (req, res) => {
  mw.canAccess(req, res, { accessType: 'manageUsers' })
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
      'access': _.assign(authController.accessDefaults, data.access || {})
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
  mw.canAccess(req, res, { accessType: 'manageUsers', allowSelf: req.params.userId })
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
  mw.canAccess(req, res, { accessType: 'manageUsers', allowSelf: req.params.userId })
  .then((grantedBy) => {
    let updates = req.body;

    if (updates.access) {
      updates.access = grantedBy === 'self' ? req.tokenPayload.access : _.assign(authController.accessDefaults, req.body.access || {});;
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
  mw.canAccess(req, res, { accessType: 'manageUsers', allowSelf: req.tokenPayload.userId })
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
