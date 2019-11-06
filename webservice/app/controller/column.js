'use strict';

const Controller = require('egg').Controller;

class ColumnController extends Controller {

  async getColumnTree() {
    // 获取完整栏目树
    const root = await this.ctx.model.Column.findOne({ level: 0 });
    return await this.ctx.service.column.findChildColumns(root._id);
  }

  async create() {
    const { ctx } = this;
    const userInfo = await this.ctx.getUserInfo();
    if (!userInfo.isAdmin) {
      throw 401;
    }
    const { name, parentId } = ctx.request.body;
    if (!name) {
      throw '请指定栏目标题';
    }
    if (!parentId) {
      throw '必须指定父栏目';
    }
    const parentColumn = await ctx.service.column.findColumnById(parentId);
    if (!parentColumn) {
      throw '父栏目不存在';
    }
    const code = this.ctx.helper.uuid().split('-')[0].toUpperCase();
    const newColumn = new this.ctx.model.Column({ parentId, name, code, level: parentColumn.level + 1 });
    await newColumn.save();
    return '新栏目创建成功';
  }

  async findChildColumns() {
    const userInfo = await this.ctx.getUserInfo();
    if (!(userInfo.isAdmin || userInfo.isAuthor)) {
      throw 401;
    }
    const { parentId } = this.ctx.request.query;
    return this.ctx.service.column.findChildColumns(parentId);
  }

  async delete() {
    const { columnId } = this.ctx.request.query;
    const userInfo = await this.ctx.getUserInfo();
    if (!userInfo.isAdmin) {
      throw '无权操作';
    }
    if (!columnId) {
      throw '未指定栏目ID';
    }
    await this.ctx.service.column.deleteColumn(columnId);
    return '栏目删除成功';
  }

  async renameColumn() {
    const { columnId, newName } = this.ctx.request.body;
    const userInfo = await this.ctx.getUserInfo();
    if (!userInfo.isAdmin) {
      throw '无权操作';
    }
    const column = await this.ctx.model.Column.findById(columnId);
    if (column.level === 0) {
      throw '站点根栏目不可重命名';
    }
    column.name = newName;
    await column.save();
    return '栏目重命名成功';
  }

}

module.exports = ColumnController;
