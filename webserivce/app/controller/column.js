'use strict';

const Controller = require('egg').Controller;

class ColumnController extends Controller {

  async getColumnTree() {
    // 获取完整栏目树
    let root = await this.ctx.model.Column.findOne({ level: 0 })
    return await this.ctx.service.column.findChildColumns(root._id)
  }

  async create() {
    const { ctx } = this;
    let userInfo = await this.ctx.getUserInfo()
    if(!userInfo.isAdmin){
      throw 401
    }
    let { name, parentId } = ctx.request.body
    if (!name) {
      throw '请指定栏目标题'
    }
    if (!parentId) {
      throw '必须指定父栏目'
    }
    let parentColumn = await ctx.service.column.findColumnById(parentId)
    if (!parentColumn) {
      throw '父栏目不存在'
    }
    let code = this.ctx.helper.uuid().split('-')[0].toUpperCase()
    let newColumn = new this.ctx.model.Column({ parentId, name, code, level:parentColumn.level+1 })
    await newColumn.save()
    return '新栏目创建成功'
  }

  async findChildColumns() {
    let { parentId } = this.ctx.request.query
    return this.ctx.service.column.findChildColumns(parentId)
  }

}

module.exports = ColumnController;