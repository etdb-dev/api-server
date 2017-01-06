'use strict';

const authRouter = require('express-promise-router')();
const authController = require('../controller/auth');
const middleware = require('../middleware');

const allRoutesMiddlewares = [
  // validate user by request's basic auth data; creates token at req.tokenPayload
  middleware.doBasicAuth,
  // create AccessRequest instance and expose at req.accessRequest
  middleware.buildAccessRequest
];

authRouter.use('/auth', allRoutesMiddlewares);

authRouter.get('/auth', authController.getToken);
authRouter.get('/auth/users', authController.listUsers);
authRouter.post('/auth', authController.addUser);
authRouter.put('/auth/:userId', authController.updateUser);
authRouter.delete('/auth/:userId', authController.deleteUser);

module.exports = authRouter;
