'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const bodyParser = require('body-parser');

const config = require('./config');
const apiApp = require('express')();
const routers = require('./routers');
const middleware = require('./middleware');

let server = {};

server.start = () => {
  return new Promise((resolve) => {
    logInfo('Starting API server');

    // enable content-type: json
    apiApp.use(bodyParser.json());

    // CORS, if enabled
    if (config.get('CORSair')) {
      logWarn('!!! Enabling Allow-Origin * !!!');
      apiApp.use(middleware.setCORS);
    }

    // attach routes
    let routerKeys = _.keys(routers);

    _.values(routers).forEach((router, idx) => {
      logVerbose('Registering router: ' + routerKeys[idx]);
      apiApp.use(router);
    });

    // start server
    let { port, host } = config.get('server');

    apiApp.listen(port, host, () => {
      logSuccess(`API server listening on ${host}:${port}`);
      return resolve();
    });
  });
};

module.exports = server;
