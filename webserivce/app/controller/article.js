'use strict';

const Controller = require('egg').Controller;

class ArticleController extends Controller {

  async create() {
    const { ctx } = this;
    let userInfo = await this.ctx.getUserInfo()
    if(!userInfo.isAdmin){
      throw 401
    }
    let { columnId } = ctx.request.body
    if(!columnId){
        throw '未指定栏目'
    }
    
  }

  async findChildColumns() {
    let { parentId } = this.ctx.request.query
    return this.ctx.service.column.findChildColumns(parentId)
  }

}

module.exports = ArticleController;