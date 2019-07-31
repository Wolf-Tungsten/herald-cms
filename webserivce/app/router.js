'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // 身份认证相关路由
  router.post('/api/v1/login', controller.auth.login);
  router.post('/api/v1/register', controller.auth.register);
  router.post('/api/v1/request-verify', controller.auth.requestVerify);
  router.post('/api/v1/activate', controller.auth.activate);
  router.post('/api/v1/reset-password', controller.auth.resetPassword);

  // 栏目管理相关路由
  router.get('/api/v1/column', controller.column.getColumnTree);
  router.post('/api/v1/column/create', controller.column.create);
  router.get('/api/v1/column/children', controller.column.findChildColumns);

  router.get('/', controller.home.index);
};
