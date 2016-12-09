'use strict';

const Promise = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

const config = require('./config');

let db = {
  connection: null,
  user: require('./db/user'),
  app: require('./db/app')
};

db.connect = () => {
  return new Promise((resolve, reject) => {
    let cfg = config.get('db');
    let uri = `mongodb://${cfg.host}:${cfg.port}/${cfg.db}`;
    logInfo('Connecting to database');
    logVerbose(uri);
    mongoose.connect(uri).then((args) => {
      db.connection = mongoose.connection;
      logSuccess('Connection to database established');
      return resolve();
    }).catch((err) => {
      logError('Connection to database failed');
      return reject(err);
    });
  });
};

module.exports = db;
