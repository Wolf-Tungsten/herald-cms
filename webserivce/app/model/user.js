'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const UserSchema = new Schema({
    name: { type: String },
    passwordHash: { type: String },
    attemptCount: {type:Number, default:0}, // 出现错误登录验证的计数
    captchaCode: {type:String, default:''},
    tokenHash: {type: String, default:''},
    tokenExpireTime: {type: Number, default:0},
    smsCode: {type: String, default:''},
    smsCodeExpireTime: {type: Number, default:0},
    phoneNumber: { type:String, default:'' },
    email: {type:String, default:''},
    emailCode: {type:String, default:''},
    emailCodeExpireTime:{type:Number, default:0},
    extraInfoJson: {type:Map, default:{}},
    isAdmin: {type:Boolean, default:false},
    isAuthor: {type:Boolean, default:false}
  });

  return mongoose.model('User', UserSchema);
}