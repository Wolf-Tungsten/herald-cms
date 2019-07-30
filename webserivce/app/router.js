'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.post('/api/v1/login', controller.auth.login);
  router.post('/api/v1/register', controller.auth.register);
  router.post('/api/v1/request-activate', controller.auth.requestActivate);
  router.post('/api/v1/activate', controller.auth.activate);
  router.get('/', controller.home.index);
};
