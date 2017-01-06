'use strict';

module.exports = (apiRouter, apiController) => {

  /**
   * @api {POST} /v0/apps Add a mobile app.
   * @apiName AddApp
   * @apiGroup Apps
   * @apiPermission writeAPI
   * @apiVersion 0.1.0
   * @apiHeader {String} Authorization Basic [b64string]
   * @apiHeader content-type=application/json
   * @apiParamExample {json} request body
   * {
   *   "name": String,
   *   "publisher": String,
   *   "store_url": String
   * }
   */
  apiRouter.post('/v0/apps', apiController.apps.addApp);

  /**
   * @api {GET} /v0/apps Get list of all apps
   * @apiName ListApps
   * @apiGroup Apps
   * @apiPermission readAPI
   * @apiVersion 0.1.0
   * @apiHeader {String} x-access-token JSON Web Token, acquired from GET /auth
   * @apiSuccessExample {json} List of apps
   * {
   *   "msg": "applist",
   *   "apps": [
   *     {
   *       "name": "some app",
   *       "publisher": "publisher's name",
   *       "store_url": "source URL for the app (playstore, etc.)"
   *     },
   *     {
   *       "name": "yet another app",
   *       "publisher": "another publisher's name, or maybe the same",
   *       "store_url": "source URL for the app (playstore, etc.)"
   *     }
   *   ]
   * }
   */
  apiRouter.get('/v0/apps', apiController.apps.listApps);

  /**
   * @api {GET} /v0/apps/:appId Get the data for :appId
   * @apiName GetApp
   * @apiGroup Apps
   * @apiPermission readAPI
   * @apiVersion 0.1.0
   * @apiHeader {String} x-access-token JSON Web Token, acquired from GET /auth
   * @apiSuccessExample {json} Data of the app with name=:appId
   * {
   *   "msg": "applist",
   *   "apps": [
   *     {
   *       "name": ":appId",
   *       "publisher": "publisher of :appId",
   *       "store_url": "source URL for :appId"
   *     }
   *   ]
   * }
   */
  apiRouter.get('/v0/apps/:appId', apiController.apps.listApps);

  /**
   * @api {PUT} /v0/apps/:appId Update data of :appId
   * @apiName UpdateApp
   * @apiGroup Apps
   * @apiPermission writeAPI
   * @apiVersion 0.1.0
   * @apiHeader {String} x-access-token JSON Web Token, acquired from GET /auth
   * @apiHeader content-type=application/json
   * @apiHeaderExample {json} Updated data for :appId
   * {
   *   "name": String,
   *   "publisher": String,
   *   "store_url": String
   * }
   * @apiSuccessExample {json} Returns all data for updated app
   * {
   *   "msg: ":appId has been updated",
   *   "updated": {
   *     "name": String,
   *     "publisher": String,
   *     "store_url": String
   *   }
   * }
   */
  apiRouter.put('/v0/apps/:appId', apiController.apps.updateApp);

  /**
   * @api {DELETE} /v1/apps/:appId Delete :appId
   * @apiName DeleteApp
   * @apiGroup Apps
   * @apiPermission writeAPI
   * @apiVersion 0.1.0
   * @apiHeader {String} x-access-token JSON Web Token, acquired from GET /auth
   * @apiSuccessExample {json} Returns, when :appId was deleted
   * { "msg": ":appId has been deleted" }
   */
  apiRouter.delete('/v0/apps/:appId', apiController.apps.deleteApp);
};
