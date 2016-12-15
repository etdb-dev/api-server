'use strict';

module.exports = (apiRouter, apiController) => {
  apiRouter.post('/v1/apps', apiController.apps.addApp);
  apiRouter.get('/v1/apps', apiController.apps.listApps);

  apiRouter.get('/v1/apps/:appId', apiController.apps.listApps);
  apiRouter.put('/v1/apps/:appId', apiController.apps.updateApp);
  apiRouter.delete('/v1/apps/:appId', apiController.apps.deleteApp);
};
