'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // 身份认证相关路由
  router.post('/api/v1/login', controller.auth.login);
  router.post('/api/v1/signup', controller.auth.signup);
  router.post('/api/v1/request-verify', controller.auth.requestVerify);
  router.post('/api/v1/activate', controller.auth.activate);
  router.post('/api/v1/reset-password', controller.auth.resetPassword);

  // 栏目管理相关路由
  router.get('/api/v1/column', controller.column.getColumnTree);
  router.post('/api/v1/column/create', controller.column.create);
  router.get('/api/v1/column/children', controller.column.findChildColumns);

  // 权限管理相关路由
  router.get('/api/v1/permission/column', controller.permission.getColumnPermission)
  router.post('/api/v1/permission/column', controller.permission.set)
  router.delete('/api/v1/permission/column', controller.permission.cancel)
  router.get('/api/v1/permission/user-info', controller.permission.getUserInfoByEmail)
  router.get('/api/v1/permission/user-column', controller.permission.getUserPermission)
  router.get('/api/v1/permission/article', controller.permission.checkArticlePermission)

  // 文章管理路由
  router.post('/api/v1/article/create', controller.article.create)

  // 静态文件上传
  router.post('/api/v1/upload/cover-img', controller.upload.uploadCoverImage)
  router.get('/', controller.home.index);
};
