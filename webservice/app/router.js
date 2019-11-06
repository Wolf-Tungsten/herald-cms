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
  router.post('/api/v1/column/rename', controller.column.renameColumn);
  router.get('/api/v1/column/children', controller.column.findChildColumns);
  router.delete('/api/v1/column', controller.column.delete);

  // 权限管理相关路由
  router.get('/api/v1/permission/column', controller.permission.getColumnPermission);
  router.post('/api/v1/permission/column', controller.permission.set);
  router.delete('/api/v1/permission/column', controller.permission.cancel);
  router.get('/api/v1/permission/user-info', controller.permission.getUserInfoByEmail);
  router.get('/api/v1/permission/user-column', controller.permission.getUserPermission);
  router.get('/api/v1/permission/article', controller.permission.checkArticlePermission);
  router.get('/api/v1/permission/admin', controller.permission.getAdminList);
  router.post('/api/v1/permission/admin', controller.permission.setAdmin);
  router.delete('/api/v1/permission/admin', controller.permission.cancelAdmin);

  // 文章管理路由
  router.post('/api/v1/article/create', controller.article.create);
  router.post('/api/v1/article/save', controller.article.save);
  router.post('/api/v1/article/publish', controller.article.publishOrReviewing);
  router.post('/api/v1/article/cancel-publish', controller.article.rejectOrCancelPublish);
  router.get('/api/v1/article', controller.article.get);
  router.get('/api/v1/article/list/own', controller.article.findArticleOfOwn);
  router.get('/api/v1/article/list/reviewing', controller.article.findArticleNeedReviewing);
  router.get('/api/v1/article/list/column', controller.article.findArticleOfColumn);
  router.delete('/api/v1/article', controller.article.delete);

  // 静态文件上传
  router.post('/api/v1/upload/cover-img', controller.upload.uploadCoverImage);
  router.post('/api/v1/upload/img', controller.upload.uploadImage);
  router.post('/api/v1/upload/video', controller.upload.uploadVideo);
  router.post('/api/v1/upload/append', controller.upload.uploadAppendFile);
  router.delete('/api/v1/upload/delete-file', controller.upload.deleteFile);

  // API-Key管理
  router.get('/api/v1/api-key', controller.apiKey.getKeyList);
  router.post('/api/v1/api-key/create', controller.apiKey.create);
  router.delete('/api/v1/api-key/delete', controller.apiKey.delete);
  router.post('/api/v1/api-key/enable', controller.apiKey.enable);
  router.post('/api/v1/api-key/disable', controller.apiKey.disable);

  /**
  * 开放API
  **/

  router.get('/public-api/v1/article-token', controller.public.accessToken.articleAccess);
  router.get('/public-api/v1/function-token', controller.public.accessToken.functionAccess);

  router.get('/public-api/v1/column', controller.public.column.getColumnTree);

  router.get('/public-api/v1/article-list', controller.public.article.getArticleList);
  router.get('/public-api/v1/article', controller.public.article.getArticleContent);
  router.get('/', controller.home.index);


};
