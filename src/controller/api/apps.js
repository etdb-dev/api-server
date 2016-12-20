'use strict';

const Promise = require('bluebird');
const _ = require('lodash');

const mw = require('../../middleware');
const App = require('../../db/app');

const appsController = {};

appsController.addApp = (req, res, next) => {
  mw.canAccess(req, res, () => {
    let data = req.body;
    let tokenData = req.tokenPayload;

    validateInput(['name', 'publisher', 'store_url'], data)
    .then(() => {
      let app = new App({
        name: data.name,
        publisher: data.publisher,
        store_url: data.store_url
      });
      app.save().then((appDoc) => {
        let msg = `${appDoc.name} has been createad`;
        logSuccess(msg + ' by ' + tokenData.username);
        res.status(201).json({
          message: msg,
          appId: appDoc._id
        });
      }).catch((err) => res.status(409).json({
        message: `${data.name} already exists`,
        appId: err.getOperation()._id
      }));
    })
    .catch((missing) => {
      res.status(400).json({
        message: 'Please provide values for all mandatory fields!',
        missing: missing
      });
    });
  }, { accessType: 'writeAPI' });
};

appsController.listApps = (req, res, next) => {
  mw.canAccess(req, res, () => {
    let findFilter = req.params.appId ? { _id: req.params.appId } : {};
    App.find(findFilter, '-__v').then((appDocs) => res.json({
      message: 'applist',
      apps: appDocs
    }));
  }, { accessType: 'readAPI' });
};

appsController.updateApp = (req, res, next) => {
  mw.canAccess(req, res, () => {
    let appId = req.params.appId;
    let clientDoc;
    let nameBeforeUpdate;
    return App.findOne({ _id: appId }).then((appDoc) => {
      nameBeforeUpdate = appDoc.name;
      _.assign(appDoc, req.body);
      clientDoc = _.omit(appDoc._doc, '__v');
      return appDoc.save();
    }).then((appDoc) => {
      res.json({
        message: nameBeforeUpdate + ' has been updated',
        appId: appDoc._id,
        updated: clientDoc
      });
    });
  }, { accessType: 'writeAPI' });
};

appsController.deleteApp = (req, res) => {
  mw.canAccess(req, res, () => {
    return App.findOneAndRemove({ _id: req.params.appId })
      .then((removedDoc) => {
        res.json({
          message: removedDoc.name + ' has been deleted'
        });
      });
  }, { accessType: 'writeAPI' });
};

let validateInput = (expected, input) => {
  return new Promise((resolve, reject) => {
    let missingFields = _.difference(expected, _.keys(input));
    missingFields.length > 0 ? reject(missingFields) : resolve();
  });
};

module.exports = appsController;
