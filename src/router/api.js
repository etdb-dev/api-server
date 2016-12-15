'use strict';

const apiRouter = require('express-promise-router')();
const apiController = require.main.require('./src/controller/api');
const middleware = require.main.require('./src/middleware');

apiRouter.use('/v1', middleware.validateToken);
apiRouter.use('/v0', middleware.validateToken);
require('./api/apps')(apiRouter, apiController);
require('./api/spis')(apiRouter, apiController);

module.exports = apiRouter;
