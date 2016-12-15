'use strict';

module.exports = (apiRouter, apiController) => {
  apiRouter.post('/v0/apps', apiController.apps.addApp);
  apiRouter.get('/v0/apps', apiController.apps.listApps);

  apiRouter.get('/v0/apps/:appId', apiController.apps.listApps);
  apiRouter.put('/v0/apps/:appId', apiController.apps.updateApp);
  apiRouter.delete('/v0/apps/:appId', apiController.apps.deleteApp);
};
