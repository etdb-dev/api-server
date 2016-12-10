'use strict';

const Promise = require('bluebird');
const _ = require('lodash');

const mw = require('../middleware');
const App = require('../db/app');

const apiController = {};

apiController.addApp = (req, res, next) => {
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
      app.save().then(() => {
        let msg = `${data.name} has been createad`;
        logSuccess(msg + ' by ' + tokenData.username);
        res.status(201).json({ message: msg });
      }).catch(() => res.status(409).json({
        message: `${data.name} already exists`
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

apiController.listApps = (req, res, next) => {
  let findFilter = req.param.appId ? { name: req.param.appId } : {};
  App.find(findFilter).then((appDocs) => {
    appDocs = _.each(appDocs, doc => _.omit(doc, '_id'));
    return res.json({
      message: 'applist' + req.param.appId ? ' for ' + req.param.appId : '',
      apps: appDocs
    });
  });
};

let validateInput = (expected, input) => {
  return new Promise((resolve, reject) => {
    let missingFields = _.difference(expected, _.keys(input));
    missingFields.length > 0 ? reject(missingFields) : resolve();
  });
};

module.exports = apiController;
