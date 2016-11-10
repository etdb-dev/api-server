'use strict';

const Promise = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = Promise;
const config = require.main.require('./src/config');

let db = {
  connection: null
};

db.connect = () => {
  Promise.try(() => {
    let cfg = config.db;
    mongoose.connect(`mongodb://${cfg.host}:${cfg.port}/${cfg.db}`);
    db.connection = mongoose.connection;
    db.connection.once('open', () => {
      return logSuccess('Connection to database established');
    });
  });
};

module.exports = db;