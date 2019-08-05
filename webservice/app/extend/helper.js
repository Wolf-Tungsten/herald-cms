const crypto = require('crypto')
const uuid = require('uuid/v4')
const moment = require('moment')
const nodemailer = require('nodemailer')
module.exports = {
    // this 是 helper 对象，在其中可以调用其他 helper 方法
    // this.ctx => context 对象
    // this.app => application 对象
    emailTransporter:null,
    hash(param) {
      // sha256 计算快捷方式
      if(!param){
        return ''
      }
      let hash = crypto.createHash('sha256');
      hash.update(param)
      return hash.digest('hex')
    },
    uuid(){
      // 计算uuid的快捷方式
      return uuid()
    },
    randomCode(len){
      let result = []
      do{
        result.push(Math.round(Math.random()*9))
      }while(--len)
      return result.join('')
    },
    now(){
      return +moment()
    },
    async sendCodeEmail(code, email){
      if(!this.emailTransporter){
        this.emailTransporter = nodemailer.createTransport(this.app.config.mail);
      }
      //
      await this.emailTransporter.sendMail({
        from: `"先声CMS" ${this.app.config.mail.auth.user}`, // sender address
        to: email, // list of receivers
        subject: "先声内容管理-邮箱验证码", // Subject line
        text: `您的邮箱验证码是：${code}，15分钟内有效，请勿透露给他人`, // plain text body
        html: `<p>您请求的邮箱验证码是：</p><p style="font-size:24px;color:#13ACD9;font-weight:bolder;">${code}</p><p>15分钟内有效，请勿透露给他人</p>` // html body
      });
    },
    randomFromArray(arr){
      return arr[Math.floor(Math.random()*arr.length)]
    }
  };