'use strict';

const apiRouter = require('express-promise-router')();
const apiController = require.main.require('./src/controller/api');
const middleware = require.main.require('./src/middleware');

const allRoutesMiddlewares = [
  // decrypt request's JWT and expose at req.tokenPayload
  middleware.validateToken,
  // create AccessRequest instance and expose at req.accessRequest
  middleware.buildAccessRequest
];

apiRouter.use('/v0', allRoutesMiddlewares);
require('./api/apps')(apiRouter, apiController);
require('./api/spis')(apiRouter, apiController);

module.exports = apiRouter;
