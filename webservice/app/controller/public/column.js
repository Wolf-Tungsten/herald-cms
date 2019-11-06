'use strict';

const Controller = require('egg').Controller;

class PublicColumnController extends Controller {

  // 获取以指定栏目为根的栏目树
  async getColumnTree() {
    const { code } = this.ctx.request.query;
    if (!code) {
      throw { errCode: 20001, reason: '未指定栏目编号' };
    }
    return await this.ctx.service.column.findPublicColumnTree(code);
  }

}

module.exports = PublicColumnController;
