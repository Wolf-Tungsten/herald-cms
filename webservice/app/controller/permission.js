'use strict';

const Controller = require('egg').Controller;

class PermissionController extends Controller {

  async getUserInfoByEmail() {
    const { email } = this.ctx.request.query;
    const userInfo = await this.ctx.getUserInfo();
    if (!userInfo.isAdmin) {
      throw '无权操作';
    }
    const user = await this.ctx.model.User.findOne({ email });
    if (user) {
      return {
        name: user.name,
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
      };
    }
    throw '用户不存在';

  }

  async getColumnPermission() {
    // 获取指定栏目所有的授权
    const { columnId } = this.ctx.request.query;
    const userInfo = await this.ctx.getUserInfo();
    if (!userInfo.isAdmin) {
      throw '无权操作';
    }
    let res = await this.ctx.model.Permission.find({ columnId });
    res = await Promise.all(res.map(async c => {
      const user = await this.ctx.model.User.findById(c.userId);
      return {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userId: c.userId,
        level: c.level === 'publish' ? '发布权限' : '编辑权限',
      };
    }));
    return res;
  }


  async getUserPermission() {
    let { userId } = this.ctx.request.query;
    const userInfo = await this.ctx.getUserInfo();
    if (!userInfo.isAdmin && !userInfo.isAuthor) {
      throw '无权操作';
    }
    if (!userId) {
      userId = userInfo._id;
    }
    return await this.ctx.service.permission.getPermissionList(userId);
  }

  async getAdminList() {
    const userInfo = await this.ctx.getUserInfo();
    if (!userInfo.isAdmin) {
      throw '无权操作';
    }
    const adminList = await this.ctx.model.User.find({ isAdmin: true }, [ 'name', 'email', '_id', 'phoneNumber' ]);
    return adminList;
  }

  async setAdmin() {
    const userInfo = await this.ctx.getUserInfo();
    if (!userInfo.isAdmin) {
      throw '无权操作';
    }
    const { userId } = this.ctx.request.body;
    if (!userId) {
      throw '未指定将要设置为管理员的用户';
    }
    const user = await this.ctx.model.User.findById(userId);
    if (!user) {
      throw '用户不存在';
    }
    if (user.isAdmin) {
      throw '管理员设置重复';
    }
    user.isAdmin = true;
    await user.save();
    return '管理员设置成功';
  }

  async cancelAdmin() {
    const userInfo = await this.ctx.getUserInfo();
    if (!userInfo.isAdmin) {
      throw '无权操作';
    }
    const { userId } = this.ctx.request.query;
    if (userId === userInfo._id) {
      throw '不能取消自身管理员权限';
    }
    if (!userId) {
      throw '未指定将要取消管理员权限的用户';
    }
    const user = await this.ctx.model.User.findById(userId);
    if (!user) {
      throw '用户不存在';
    }
    user.isAdmin = false;
    await user.save();
    return '管理员取消成功';
  }

  async set() {
    const { ctx } = this;
    const userInfo = await ctx.getUserInfo();
    if (!userInfo.isAdmin) {
      throw '无权操作';
    }
    const { level, userId, columnId } = ctx.request.body;
    if (level !== 'edit' && level !== 'publish') {
      throw 'level参数错误';
    }
    const userCheck = await ctx.model.User.findById(userId);
    if (!userCheck) {
      throw '授权用户不存在';
    }
    const columnCheck = await ctx.model.Column.findById(columnId);
    if (!columnCheck) {
      throw '授权栏目不存在';
    }
    let permissionCheck = await ctx.model.Permission.findOne({ userId, columnId });
    if (permissionCheck) {
      permissionCheck.level = level;
    } else {
      permissionCheck = new ctx.model.Permission({ userId, level, columnId });
    }
    await permissionCheck.save();
    // 更新 isAuthor 选项
    userCheck.isAuthor = true;
    await userCheck.save();
    return '授权成功';
  }

  async cancel() {
    const { ctx } = this;
    const userInfo = await ctx.getUserInfo();
    if (!userInfo.isAdmin) {
      throw '无权操作';
    }
    const { userId, columnId } = ctx.request.query;
    await ctx.model.Permission.deleteMany({ userId, columnId });
    // 更新 isAuthor
    const count = await this.ctx.model.Permission.countDocuments({ userId });
    if (count === 0) {
      userInfo.isAuthor = false;
      await userInfo.save();
    }
    return '权限撤销成功';
  }


  // 获取当前用户对于指定文章的权限
  async checkArticlePermission() {
    const { ctx } = this;
    const { articleId } = ctx.request.query;
    const article = await this.ctx.model.Article.findById(articleId);
    if (!article) {
      throw '文章不存在';
    }
    const columnId = article.columnId;
    return await this.service.permission.checkPermission(columnId);
  }
}

module.exports = PermissionController;
