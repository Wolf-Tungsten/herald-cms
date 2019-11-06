'use strict';

const Controller = require('egg').Controller;
const sendToWormhole = require('stream-wormhole');
class UploadController extends Controller {

  async uploadImage() {

    const stream = await this.ctx.getFileStream();
    const { articleId } = stream.fields;
    const permissionCheck = await this.ctx.service.permission.checkArticlePermission(articleId);
    if (permissionCheck === 'none') {
      sendToWormhole(stream);
      throw '权限不足';
    }
    if (!stream.filename.endsWith('png') && !stream.filename.endsWith('jpg') && !stream.filename.endsWith('jpeg')) {
      sendToWormhole(stream);
      throw '图片文件格式错误';
    }

    const savedFilename = await this.ctx.service.upload.saveUploadStreamToFile(stream);

    // 创建记录
    const uploadRecord = new this.ctx.model.Resource({
      articleId,
      resourceName: savedFilename,
      type: 'image',
    });
    await uploadRecord.save();

    return `${this.ctx.helper.randomFromArray(this.app.config.static.publicUrlPrefix)}${savedFilename}`;

  }

  async uploadCoverImage() {

    const stream = await this.ctx.getFileStream();
    const { articleId } = stream.fields;
    const permissionCheck = await this.ctx.service.permission.checkArticlePermission(articleId);
    if (permissionCheck === 'none') {
      sendToWormhole(stream);
      throw '权限不足';
    }
    if (!stream.filename.endsWith('png') && !stream.filename.endsWith('jpg') && !stream.filename.endsWith('jpeg')) {
      sendToWormhole(stream);
      throw '封面图片文件格式错误';
    }

    const savedFilename = await this.ctx.service.upload.saveUploadStreamToFile(stream);

    // 给文章设置封面文件
    const article = await this.ctx.model.Article.findById(articleId);
    article.coverImg = savedFilename;
    await article.save();

    // 创建记录
    const uploadRecord = new this.ctx.model.Resource({
      articleId,
      resourceName: savedFilename,
      type: 'image',
    });
    await uploadRecord.save();

    return `${this.ctx.helper.randomFromArray(this.app.config.static.publicUrlPrefix)}${savedFilename}`;

  }

  async uploadVideo() {
    const stream = await this.ctx.getFileStream();
    const { articleId } = stream.fields;
    const permissionCheck = await this.ctx.service.permission.checkArticlePermission(articleId);
    if (permissionCheck === 'none') {
      sendToWormhole(stream);
      throw '权限不足';
    }
    if (!stream.filename.endsWith('mp4') && !stream.filename.endsWith('webm')) {
      sendToWormhole(stream);
      throw '视频文件格式错误';
    }

    const savedFilename = await this.ctx.service.upload.saveUploadStreamToFile(stream);

    // 创建记录
    const uploadRecord = new this.ctx.model.Resource({
      articleId,
      resourceName: savedFilename,
      type: 'video',
      displayName: stream.filename.split('.')[0],
    });
    await uploadRecord.save();

    return {
      url: `${this.ctx.helper.randomFromArray(this.app.config.static.publicUrlPrefix)}${savedFilename}`,
      fileId: uploadRecord._id,
    };
  }

  async uploadAppendFile() {
    const stream = await this.ctx.getFileStream();
    const { articleId } = stream.fields;
    const permissionCheck = await this.ctx.service.permission.checkArticlePermission(articleId);
    if (permissionCheck === 'none') {
      sendToWormhole(stream);
      throw '权限不足';
    }

    const savedFilename = await this.ctx.service.upload.saveUploadStreamToFile(stream);

    // 创建记录
    const uploadRecord = new this.ctx.model.Resource({
      articleId,
      resourceName: savedFilename,
      type: 'appendFile',
      displayName: stream.filename,
    });
    await uploadRecord.save();

    return {
      url: `${this.ctx.helper.randomFromArray(this.app.config.static.publicUrlPrefix)}${savedFilename}`,
      fileId: uploadRecord._id,
    };
  }

  async deleteFile() {
    const { fileId } = this.ctx.request.query;
    const uploadRecord = await this.ctx.model.Resource.findById(fileId);
    if (!uploadRecord) {
      throw '文件不存在';
    }
    const article = await this.ctx.model.Article.findById(uploadRecord.articleId);
    if (!article) {
      await this.ctx.service.upload.deleteFile(article.resourceName);
    }
    await this.ctx.model.Resource.deleteOne({ _id: uploadRecord._id });
    return '删除成功';
  }

}

module.exports = UploadController;
