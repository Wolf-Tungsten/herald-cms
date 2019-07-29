'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.post('/api/v1/login', controller.auth.login);
  router.get('/', controller.home.index);
};
