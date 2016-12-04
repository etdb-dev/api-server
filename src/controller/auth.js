'use strict';

const jwt = require('jsonwebtoken');
const _ = require('lodash');

const config = require('../config');
const mw = require('../middleware');
const User = require('../db/user');

let authController = {
  accessDefaults: {
    'test': true
  }
};

authController.getToken = (req, res, next) => {
  mw.canAccess(req, res, () => {
    logDebug('Creating token');
    let tokenData = req.tokenPayload;
    let token = jwt.sign({
      username: tokenData.username,
      access: tokenData.access
    }, config.get('secret'), {
      expiresIn: '2h'
    });
    res.json({
      message: 'Token for evr\'body!',
      token: token
    });
  }, 'readAPI');
};

authController.addUser = (req, res) => {
  mw.canAccess(req, res, () => {
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

    user.save().then(() => {
      let msg = `${data.username} has been createad`;
      logSuccess(msg + ' by ' + tokenData.username);
      res.status(201).json({ message: msg });
    }).catch(() => res.status(409).json({
      message: `user (${data.username}) already exists`
    }));
  }, 'manageUsers');
};

authController.deleteUser = (req, res) => {
  mw.canAccess(req, res, () => {
    User.findOneAndRemove({ username: req.params.uname }).then((deletedDoc) => {
      if (!deletedDoc) {
        logWarn(`User (uid=${req.params.uname}) not found`);
        res.sendStatus(404);
      } else {
        let msg = `${deletedDoc.username} has been deleted`;
        logSuccess(msg);
        res.json({ message: msg });
      }
    });
  }, 'manageUsers');
};

authController.updateUser = (req, res) => {
  mw.canAccess(req, res, () => {
    User.findOneAndUpdate({ username: req.params.uname }, {
      password: req.body.password,
      access: _.assign(authController.accessDefaults, req.body.access || {})
    }).then((updatedDoc) => {
      let msg = `${updatedDoc.username} has been updated`;
      logSuccess(msg);
      res.json({ message: msg });
    });
  }, 'manageUsers');
};

module.exports = authController;
