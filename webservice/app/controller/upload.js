'use strict';

const Controller = require('egg').Controller;
const sendToWormhole = require('stream-wormhole');
class UploadController extends Controller {

  async uploadImage() {
    const { ctx } = this;

    
  }

  async uploadCoverImage(){

    let stream = await this.ctx.getFileStream()
    let { articleId } = stream.fields
    let permissionCheck = await this.ctx.service.permission.checkArticlePermission(articleId)
    if(permissionCheck === 'none'){
      sendToWormhole(stream)
      throw '权限不足'
    }
    if(!stream.filename.endsWith('png') && !stream.filename.endsWith('jpg') && !stream.filename.endsWith('jpeg')){
      sendToWormhole(stream)
      throw '封面图片文件格式错误'
    }
    
    let savedFilename = await this.ctx.service.upload.saveUploadStreamToFile(stream)

    // 给文章设置封面文件
    let article = await this.ctx.model.Article.findById(articleId)
    article.coverImg = savedFilename
    await article.save()

    // 创建记录
    let uploadRecord = new this.ctx.model.Upload({
        articleId,
        resourceName: savedFilename,
        type: 'cover-image',
    })
    await uploadRecord.save()

    return `${this.ctx.helper.randomFromArray(this.app.config.static.publicUrlPrefix)}${savedFilename}`
    
  }

  async uploadVideo(){

  }

  async uploadAppendFile(){

  }
}

module.exports = UploadController;