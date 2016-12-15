'use strict';

module.exports = (apiRouter, apiController) => {
  apiRouter.post('/v0/spis', apiController.spis.addSPI);
};
