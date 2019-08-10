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

  async delete(){
    let {columnId} = this.ctx.request.query
    let userInfo = await this.ctx.getUserInfo()
    if(!userInfo.isAdmin){
      throw '无权操作'
    }
    if(!columnId){
      throw '未指定栏目ID'
    }
    await this.ctx.service.column.deleteColumn(columnId)
    return '栏目删除成功'
  }

  async renameColumn(){
    let {columnId, newName} = this.ctx.request.body
    let userInfo = await this.ctx.getUserInfo()
    if(!userInfo.isAdmin){
      throw '无权操作'
    }
    let column = await this.ctx.model.Column.findById(columnId)
    if(column.level === 0){
      throw '站点根栏目不可重命名'
    }
    column.name = newName
    await column.save()
    return '栏目重命名成功'
  }

}

module.exports = ColumnController;