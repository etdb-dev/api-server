'use strict';

const authRouter = require('express-promise-router')();
const authController = require('../controller/auth');
const middleware = require('../middleware');

authRouter.use('/auth', middleware.doBasicAuth);

authRouter.get('/auth', authController.getToken);
authRouter.get('/auth/users', authController.listUsers);
authRouter.post('/auth', authController.addUser);
authRouter.put('/auth/:userId', authController.updateUser);
authRouter.delete('/auth/:userId', authController.deleteUser);

module.exports = authRouter;
