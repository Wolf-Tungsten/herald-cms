'use strict';

const Controller = require('egg').Controller;

class OpenAPIController extends Controller {

  async getKeyList(){
    let userInfo = await this.ctx.getUserInfo()
    if(!userInfo.isAdmin){
        throw '无权操作'
    }
    let apiKeyList = await this.ctx.model.ApiKey.find({})
    return apiKeyList
  }
  
  async create(){
    let userInfo = await this.ctx.getUserInfo()
    if(!userInfo.isAdmin){
        throw '无权操作'
    }
    let { name } = this.ctx.request.body
    let appId = this.ctx.helper.uuid()
    let appSecret = [this.ctx.helper.uuid(),this.ctx.helper.uuid()].join('-')
    let apiKey = new this.ctx.model.ApiKey({appId, appSecret, name})
    await apiKey.save()
    return '密钥创建成功'
  }

  async delete(){
    let userInfo = await this.ctx.getUserInfo()
    if(!userInfo.isAdmin){
        throw '无权操作'
    }
    let { appKeyId } = this.ctx.request.query
    if(!appKeyId){
      throw '未指定待删除的ApiKey'
    }
    await this.ctx.model.ApiKey.deleteOne({_id:appKeyId})
    return '删除成功'
  }

  async enable(){
    let userInfo = await this.ctx.getUserInfo()
    if(!userInfo.isAdmin){
        throw '无权操作'
    }
    let { apiKeyId } = this.ctx.request.body
    if(!apiKeyId){
      throw '未指定待启用的ApiKey'
    }
    let apiKey = await this.ctx.model.ApiKey.findById(apiKeyId)
    if(!apiKey){
      throw '指定的ApiKey不存在'
    }
    apiKey.enable = true
    await apiKey.save()
    return '密钥启用成功'
  }

  async disable(){
    let userInfo = await this.ctx.getUserInfo()
    if(!userInfo.isAdmin){
        throw '无权操作'
    }
    let { apiKeyId } = this.ctx.request.body
    if(!apiKeyId){
      throw '未指定待停用的ApiKey'
    }
    let apiKey = await this.ctx.model.ApiKey.findById(apiKeyId)
    if(!apiKey){
      throw '指定的ApiKey不存在'
    }
    apiKey.enable = false
    await apiKey.save()
    return '密钥停用成功'
  }
}

module.exports = OpenAPIController;
