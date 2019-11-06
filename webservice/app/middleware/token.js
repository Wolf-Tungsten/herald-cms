'use strict';
// token解析中间件，当存在Headers中存在Access-Token字段
module.exports = () => {
  return async (ctx, next) => {
    const token = ctx.request.headers['access-token'] || '';
    ctx.getUserId = async () => {
      if (token === '') {
        throw 401;
      }
      let result = await ctx.model.User.find({ tokenHash: ctx.helper.hash(token) });
      if (result.length !== 1) {
        throw 401;
      }
      result = result[0];
      if (ctx.helper.now > result.tokenExpireTime) {
        throw 401;
      }
      return '' + result._id;
    };
    ctx.getUserInfo = async () => {
      if (token === '') {
        throw 401;
      }
      let result = await ctx.model.User.find({ tokenHash: ctx.helper.hash(token) });
      if (result.length !== 1) {
        throw 401;
      }
      result = result[0];
      if (ctx.helper.now > result.tokenExpireTime) {
        throw 401;
      }
      return result;
    };
    return await next();
  };
};
