/**
 * @api {POST} /v1/app Add a mobile app.
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
