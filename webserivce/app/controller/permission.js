'use strict';

const Controller = require('egg').Controller;

class PermissionController extends Controller {

  async getUserInfoByEmail() {
    let {email} = this.ctx.request.query
    let userInfo = await ctx.getUserInfo()
    if(!userInfo.isAdmin){
        throw '无权操作'
    }
    let user = await this.ctx.model.User.findOne({email})
    if(user){
      return {
        name:user.name,
        id:user._id,
        email:user.email,
        phoneNumber:user.phoneNumber
      }
    } else {
      throw '用户不存在'
    }
  }

  async getColumnPermission() {
    // 获取指定栏目所有的授权
    let { columnId } = this.ctx.request.query
    let userInfo = await ctx.getUserInfo()
    if(!userInfo.isAdmin){
        throw '无权操作'
    }
    let res = await this.ctx.model.Permission.find({columnId})
    return res
  }

  async getUserPermission(){
    let { userId } = this.ctx.request.query
    let userInfo = await ctx.getUserInfo()
    if(!userInfo.isAdmin){
        throw '无权操作'
    }
    if(!userId){
      userId = userInfo._id
    }
    return await this.ctx.service.permission.getPermissionList(userId)
  }
  
  async setAdmin(){

  }

  async cancelAdmin(){

  }
  
  async set() {
    const { ctx } = this;
    let userInfo = await ctx.getUserInfo()
    if(!userInfo.isAdmin){
        throw '无权操作'
    }
    let { level, userId, columnId } = ctx.request.body
    if(level !== 'edit' && level !== 'publish'){
        throw 'level参数错误'
    }
    let userCheck = await ctx.model.User.findById(userId)
    if(!userCheck){
        throw '授权用户不存在'
    }
    let columnCheck = await ctx.model.Column.findById({columnId})
    if(!columnCheck){
        throw '授权栏目不存在'
    }
    let permissionCheck = await ctx.model.Permission.findOne({userId, columnId})
    if(permissionCheck){
        permissionCheck.level = level
    }else{
        permissionCheck = new ctx.model.Permission({userId, level, columnId})
    }
    await permissionCheck.save()
    return '授权成功'
  }

  async cancel(){
    const { ctx } = this;
    let userInfo = await ctx.getUserInfo()
    if(!userInfo.isAdmin){
        throw '无权操作'
    }
    let { userId, columnId } = ctx.request.query
    return await ctx.model.Permission.deleteMany({userId, columnId})
  }

}

module.exports = PermissionController;
