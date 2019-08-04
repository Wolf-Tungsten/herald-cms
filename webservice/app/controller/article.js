'use strict';

const Controller = require('egg').Controller;

class ArticleController extends Controller {

  async create() {
    const { ctx } = this;
    let userInfo = await this.ctx.getUserInfo()
    let { columnId } = ctx.request.body
    if(!columnId){
        throw '未指定栏目'
    }
    let checkPermission = await this.service.permission.checkPermission(columnId)
    if( checkPermission === 'none' ){
        throw '您无权在此栏目创建文章'
    }
    let code = this.ctx.helper.uuid().split('-')[0].toUpperCase()
    let newArticle = new this.ctx.model.Article({
        columnId,
        authorId:userInfo._id,
        createdTime:this.ctx.helper.now(),
        status:'draft',
        code
    })
    await newArticle.save()
    return newArticle._id
  }
}

module.exports = ArticleController;