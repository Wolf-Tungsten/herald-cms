'use strict';
const captchaGen = require('svg-captcha')
const Controller = require('egg').Controller;

class AuthController extends Controller {
  // 用户登录逻辑
  async login() {
    const { ctx } = this;
    let { username, password, captchaCode } = ctx.request.body
    // 用户可以用：用户名、电子邮箱、电话号码登录
    let passwordHash = ctx.helper.hash(password)
    let user = []
    if(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(username)){
      // 如果符合电子邮件正则 - 优先匹配电子邮件
      user.push(await ctx.model.User.findOne({email:username}))
    } else if(/^1[0-9]{10}$/.test(username)){
      // 如果符合电话号码正则 - 优先匹配电话号码
      user.push(await ctx.model.User.findOne({phoneNumber:username}))
    } else {
      // 以上两种都无法匹配 - 按照用户名匹配
      user.push(await ctx.model.User.findOne({name:username}))
    }
    if(user.length === 0){
      // 用户名不存在
      throw '用户名/邮箱地址/手机号码不存在'
    }
    user = user[0] // 按照优先级选取第一个记录

    if(user.attemptCount > 3){
      // 密码输错次数大于3
      if(!captchaCode || user.captchaCode === '' || (captchaCode.toUpperCase() !== user.captchaCode.toUpperCase())){
        // 并且提交的验证码不匹配
        // 生成新的验证码
        let {data:captchaData, text:captchaCode} = captchaGen.create({size:6})
        user.attemptCount++
        user.captchaCode = captchaCode
        ctx.logger.info(`用户名：${user.name} 验证码：${user.captchaCode}`)
        await user.save()
        return {
          needCaptcha:true,
          captchaData
        }
      }
    }

    // 执行到此处 - 用户名存在，通过了验证码验证，开始比对密码
    if (passwordHash === user.passwordHash){
      // 密码正确
      let token = ctx.helper.uuid()
      let tokenHash = ctx.helper.hash(token)
      user.attemptCount = 0
      user.tokenHash = tokenHash
      user.tokenExpireTime = +(ctx.helper.now() + 8 * 60 * 60 * 1000)
      await user.save()
      console.log(user)
      return {
        needCaptcha:false,
        token
      }
    } else {
      // 密码不正确
      user.attemptCount++
      user.captchaCode = ''
      await user.save()
      throw '密码错误'
    }
  }
  // 用户注册
}

module.exports = AuthController;
