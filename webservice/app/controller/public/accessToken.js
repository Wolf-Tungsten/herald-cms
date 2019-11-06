'use strict';

const Controller = require('egg').Controller;

class AccessTokenController extends Controller {

  // 获取访问文章的 access-token
  async articleAccess() {
    const { appId, articleCode, signature, userIdentifier1, userIdentifier2, userIdentifier3 } = this.ctx.request.query;
    // 验证签名
    const apiKey = await this.ctx.model.ApiKey.findOne({ appId, enable: true });
    if (!apiKey) {
      throw { errCode: 10001, reason: 'appId不正确或已停用，请检查' };
    }
    const appSecret = apiKey.appSecret;
    const signatureSource = encodeURIComponent(`appId=${appId}&appSecret=${appSecret}&articleCode=${articleCode}&userIdentifier1=${userIdentifier1 ? userIdentifier1 : ''}&userIdentifier2=${userIdentifier2 ? userIdentifier2 : ''}&userIdentifier3=${userIdentifier3 ? userIdentifier3 : ''}`);

    if (this.ctx.helper.hash(signatureSource) !== signature) {
      console.log(this.ctx.helper.hash(signatureSource));
      throw { errCode: 10002, reason: '签名验证错误' };
    }
    const token = this.ctx.helper.uuid();
    const article = await this.ctx.model.Article.findOne({ code: articleCode });
    if (!article) {
      throw { errCode: 10003, reason: '请求访问文章不存在' };
    }

    const articleId = article._id;
    const expireTime = 300 * 1000 + this.ctx.helper.now(); // 申请的 access-token 必须 5 分钟内使用
    const articleAccess = new this.ctx.model.ArticleAccess({ token, articleId, expireTime, userIdentifier1, userIdentifier2, userIdentifier3 });
    await articleAccess.save();
    return token;
  }

  async functionAccess() {
    const { appId, signature } = this.ctx.request.query;
    // 验证签名
    const apiKey = await this.ctx.model.ApiKey.findOne({ appId, enable: true });
    if (!apiKey) {
      throw { errCode: 10001, reason: 'appId不正确或已停用，请检查' };
    }
    const appSecret = apiKey.appSecret;
    const signatureSource = encodeURIComponent(`appId=${appId}&appSecret=${appSecret}`);

    if (this.ctx.helper.hash(signatureSource) !== signature) {
      console.log(this.ctx.helper.hash(signatureSource));
      throw { errCode: 10002, reason: '签名验证错误' };
    }
    const token = this.ctx.helper.uuid();

    const expireTime = 6 * 60 * 60 * 1000 + this.ctx.helper.now(); // 申请的 access-token 有效期为 6 小时
    await this.ctx.model.FunctionAccess.deleteMany({});
    const functionAccess = new this.ctx.model.FunctionAccess({ token, expireTime });
    await functionAccess.save();
    return token;
  }

}

module.exports = AccessTokenController;
