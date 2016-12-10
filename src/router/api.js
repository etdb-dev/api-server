'use strict';

const apiRouter = require('express-promise-router')();
const apiController = require.main.require('./src/controller/api');
const middleware = require.main.require('./src/middleware');

apiRouter.use('/v1', middleware.validateToken);

apiRouter.post('/v1/apps', apiController.apps.addApp);
apiRouter.get('/v1/apps', apiController.apps.listApps);

apiRouter.get('/v1/apps/:appId', apiController.apps.listApps);
apiRouter.put('/v1/apps/:appId', apiController.apps.updateApp);
apiRouter.delete('/v1/apps/:appId', apiController.apps.deleteApp);

module.exports = apiRouter;
