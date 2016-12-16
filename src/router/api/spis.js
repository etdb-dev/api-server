'use strict';

module.exports = (apiRouter, apiController) => {
  apiRouter.post('/v0/spis', apiController.spis.addSPI);
  apiRouter.get('/v0/spis', apiController.spis.listSPIs);

  apiRouter.put('/v0/spis/:name', apiController.spis.updateSPI);
  apiRouter.get('/v0/spis/:name', apiController.spis.listSPIs);
};
