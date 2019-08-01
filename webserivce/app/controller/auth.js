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
    user = user[0] // 按照优先级选取第一个记录
    if(!user){
      throw '用户名/邮箱地址/手机号码不存在'
    }
    if(!user.isActivated){
      throw '用户未激活'
    }
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
        isAdmin:user.isAdmin,
        isAuthor:user.isAuthor,
        postLoginUrl:ctx.app.config.webPostLoginURL,
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
  async register(){
    const { ctx } = this;
    let { username, password, email, phoneNumber, passwordConfirm } = ctx.request.body
    // 检查用户名是否被注册
    let count = await ctx.model.User.countDocuments({name:username})
    if(count > 0){
      throw '用户名已占用，请更换'
    }
    if(username.indexOf('@') != -1){
      throw '用户名格式不合法'
    }
    
    if(password.length < 8){
      throw '密码长度小于8位，请重新设置'
    }
    if(password !=passwordConfirm){
        throw '两次密码输入不一致'
    }
    if(!(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(email))){
        throw '电子邮箱格式不正确，请检查'
      }
      // 检查邮箱是否被占用
      count = await ctx.model.User.countDocuments({email})
      if(count > 0){
        throw '电子邮箱地址已被注册，请更换'
      }
    let newUser = new ctx.model.User({
      name:username,
      passwordHash:ctx.helper.hash(password),
      email,
      phoneNumber
    })
    await newUser.save()
    return '注册成功'
  }

  // 请求激活
  async requestVerify(){
    const { ctx } = this;
    let { email } = ctx.request.body
    let record = await ctx.model.User.findOne({email})
    if(!record){
      throw '电子邮箱未注册，请检查'
    }
    if(record.emailCodeExpireTime - ctx.helper.now() > 15 * 60 * 1000){
      throw '验证请求频率过高，请1分钟后重试'
    }
    let code = ctx.helper.randomCode(6)
    // 记录邮箱验证码，15分钟有效
    record.emailCode = code
    record.emailCodeExpireTime = +(ctx.helper.now() + 15 * 60 * 1000)
    await record.save()
    await ctx.helper.sendCodeEmail(code, email)
    return '邮件已发送，请注意查收'
  }

  async activate(){
    const { ctx } = this;
    let { email, emailCode } = ctx.request.body
    let record = await ctx.model.User.findOne({email, isActivated:false})
    if(!record){
      throw '邮箱地址未注册或已激活'
    }
    if(record.emailCode === emailCode && ctx.helper.now() < record.emailCodeExpireTime){
      record.isActivated = true
      record.emailCode = ''
      await record.save()
      return '激活成功'
    } else {
      record.isActivated = false
      record.emailCode = ''
      await record.save()
      throw '验证码无效'
    }
  }

  async resetPassword(){
    const { ctx } = this;
    let { email, emailCode, newPassword } = ctx.request.body
    let record = await ctx.model.User.findOne({email})
    if(!record){
      throw '邮箱地址未注册或已激活'
    }
    if(record.emailCode === emailCode && ctx.helper.now() < record.emailCodeExpireTime){
      record.passwordHash = ctx.helper.hash(newPassword)
      await record.save()
      return '密码重制成功'
    } else {
      record.emailCode = ''
      await record.save()
      throw '验证码无效'
    }
  }


}

module.exports = AuthController;
