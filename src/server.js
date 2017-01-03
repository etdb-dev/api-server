'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const bodyParser = require('body-parser');

const config = require('./config');
const apiApp = require('express')();
const routers = require('./routers');

let server = {};

server.start = () => {
  return new Promise((resolve) => {
    logInfo('Starting API server');

    apiApp.use(bodyParser.json());
    let routerKeys = _.keys(routers);
    _.values(routers).forEach((router, idx) => {
      logVerbose('Registering router: ' + routerKeys[idx]);
      apiApp.use(router);
    });
    apiApp.use(logError);

    let cfg = config.get('server');
    let port = cfg.port || 3000;
    let host = cfg.host || '127.0.0.1';
    apiApp.listen(port, host, () => {
      logSuccess(`API server listening on ${host}:${port}`);
      return resolve();
    });
  });
};

module.exports = server;
