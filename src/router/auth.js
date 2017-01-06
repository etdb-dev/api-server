'use strict';

const authRouter = require('express-promise-router')();
const authController = require('../controller/auth');
const middleware = require('../middleware');

/**
 * @apiDefine writeAPI Can write to the API.
 */
/**
 * @apiDefine readAPI Can read from the API.
 */
/**
 * @apiDefine manageUsers Can list, add, update, delete users.
 */
/**
 * @apiDefine isAdmin Has full access.
 */

const allRoutesMiddlewares = [
  // validate user by request's basic auth data; creates token at req.tokenPayload
  middleware.doBasicAuth,
  // create AccessRequest instance and expose at req.accessRequest
  middleware.buildAccessRequest
];

authRouter.use('/auth', allRoutesMiddlewares);

/**
 * @api        {GET} /auth Request token
 * @apiName    GetToken
 * @apiGroup Auth
 * @apiPermission readAPI
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization Basic [b64string]
 * @apiExample {curl} fetch a token
 * curl -X GET -H "Authorization: Basic `printf <user>:<pass> | base64`" -H "Cache-Control: no-cache" "https://api.etdb.de/auth"
 */
authRouter.get('/auth', authController.getToken);

/**
 * @api {POST} /auth Add a new user
 * @apiName AddUser
 * @apiGroup Auth
 * @apiPermission manageUsers
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization Basic [b64string]
 * @apiHeader content-type=application/json
 * @apiHeaderExample {json} Data for new user
 * {
 *   "username": String,
 *   "password": String,
 *   "access": Object
 * }
 * @apiExample {curl} Add a new user, providing username and password
 * curl -X POST -H "Authorization: Basic `printf <user>:<pass> | base64`" -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '{
 *   "username": "bobby",
 *   "password": "needssomeapi",
 *   "access": {
 *     "isAdmin": true,
 *     "writeAPI": false
 *   }
 * }' "https://api.etdb.de/auth"
 */
authRouter.post('/auth', authController.addUser);
/**
 * @api {PUT} /auth/:uname Update user
 * @apiName UpdateUser
 * @apiGroup Auth
 * @apiPermission manageUsers
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization Basic [b64string]
 * @apiHeader content-type=application/json
 * @apiParam :uname Username of account to edit
 * @apiHeaderExample {json} Userdata for update
 * {
 *   password: String,
 *   access: Object
 * }
 */
authRouter.put('/auth/:userId', authController.updateUser);
/**
 * @api {DELETE} /auth/:uname Delete User
 * @apiName DeleteUser
 * @apiGroup Auth
 * @apiPermission manageUsers
 * @apiVersion 0.1.0
 * @apiParam :uname Username of account to delete
 */
authRouter.delete('/auth/:userId', authController.deleteUser);
/**
 * @api {GET} /auth/users Get a list of all users
 * @apiName  ListUsers
 * @apiGroup  Auth
 * @apiPermission manageUsers
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization Basic [b64string]
 * @apiSuccessExample {json} List of users
 * {
 *   "msg": "Userlist",
 *   "users": [
 *     {
 *       "username": "atLeastYourAdmin",
 *       "access": {
 *         "writeAPI": true,
 *         "readAPI": true,
 *         "manageUsers": true,
 *         "isAdmin": true
 *       }
 *     },
 *     {
 *       "username": "anyOtherUsers",
 *       "access": {
 *         "writeAPI": false,
 *         "readAPI": true,
 *         "manageUsers": false,
 *         "isAdmin": false
 *       }
 *     }
 *   ]
 * }
 */
authRouter.get('/auth/users', authController.listUsers);

module.exports = authRouter;
