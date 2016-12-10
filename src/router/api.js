'use strict';

const apiRouter = require('express-promise-router')();
const apiController = require.main.require('./src/controller/api');
const middleware = require.main.require('./src/middleware');

apiRouter.use('/v1', middleware.validateToken);

apiRouter.post('/v1/apps', apiController.addApp);
apiRouter.get('/v1/apps', apiController.listApps);
apiRouter.get('/v1/apps/:appId', apiController.listApps);

module.exports = apiRouter;
