'use strict';
const captchaGen = require('svg-captcha');
const Controller = require('egg').Controller;

class AuthController extends Controller {
  // 用户登录逻辑
  /**
 * @api {post} /login 用户登录
 * @apiVersion 1.0.0
 * @apiName Login
 * @apiGroup Auth
 *
 * @apiDescription 用于请求用户登录过程，需要提交用户名和密码，部分情况需要用户识别验证码。
 *
 * 设置密码尝试错误保护，超过三次密码尝试错误会要求用户输入验证码，验证码由 captchaData 字段以 svg 格式提供。
 *
 * 设置邮箱验证机制，必须保证用户邮箱有效才允许用户登录。
 *
 *
 * @apiParam {String} username 用户登录名（可能是用户名/电子邮箱/手机号码）
 * @apiParam {String} password 登录密码
 * @apiParam {String} captchaCode 验证码识别结果
 *
 * @apiSuccess (200) {String} needCaptcha 登录受到限制时（密码3次错误），该字段为 true
 * @apiSuccess (200) {String} captchaData 内容为 svg 格式的验证码图片
 * @apiSuccess (200) {Boolean} isAdmin 指示用户是否为站点管理员
 * @apiSuccess (200) {Boolean} isAuthor 指示用户是否具有文章编辑权限
 * @apiSuccess (200) {Boolean} postLoginUrl 登录后跳转的 URL - 由用户在配置文件中指定，用于前端站没有自行实现用户系统时，cms用户系统会在登录成功后自动跳转到该URL
 * @apiSuccess (200) {String} token 用户身份凭据
 *
 *
 * @apiError (400) {String} UsernameNotExist
 * 用户名/邮箱地址/手机号码不存在
 * @apiError (400) {String} UserNotActivated
 * 用户未激活
 * @apiError (400) {String} PasswordError
 * 密码错误
 *
 */
  async login() {
    const { ctx } = this;
    const { username, password, captchaCode } = ctx.request.body;
    // 用户可以用：用户名、电子邮箱、电话号码登录
    const passwordHash = ctx.helper.hash(password);
    let user = [];
    if (/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(username)) {
      // 如果符合电子邮件正则 - 优先匹配电子邮件
      user.push(await ctx.model.User.findOne({ email: username }));
    } else if (/^1[0-9]{10}$/.test(username)) {
      // 如果符合电话号码正则 - 优先匹配电话号码
      user.push(await ctx.model.User.findOne({ phoneNumber: username }));
    } else {
      // 以上两种都无法匹配 - 按照用户名匹配
      user.push(await ctx.model.User.findOne({ name: username }));
    }
    user = user[0]; // 按照优先级选取第一个记录
    if (!user) {
      throw '用户名/邮箱地址/手机号码不存在';
    }
    if (!user.isActivated) {
      throw '用户未激活';
    }
    if (user.attemptCount > 3) {
      // 密码输错次数大于3
      if (!captchaCode || user.captchaCode === '' || (captchaCode.toUpperCase() !== user.captchaCode.toUpperCase())) {
        // 并且提交的验证码不匹配
        // 生成新的验证码
        const { data: captchaData, text: captchaCode } = captchaGen.create({ size: 6 });
        user.attemptCount++;
        user.captchaCode = captchaCode;
        ctx.logger.info(`用户名：${user.name} 验证码：${user.captchaCode}`);
        await user.save();
        return {
          needCaptcha: true,
          captchaData,
        };
      }
    }

    // 执行到此处 - 用户名存在，通过了验证码验证，开始比对密码
    if (passwordHash === user.passwordHash) {
      // 密码正确
      const token = ctx.helper.uuid();
      const tokenHash = ctx.helper.hash(token);
      user.attemptCount = 0;
      user.tokenHash = tokenHash;
      user.tokenExpireTime = +(ctx.helper.now() + 8 * 60 * 60 * 1000);
      await user.save();
      console.log(user);
      return {
        needCaptcha: false,
        isAdmin: user.isAdmin,
        isAuthor: user.isAuthor,
        postLoginUrl: ctx.app.config.webPostLoginURL,
        token,
      };
    }
    // 密码不正确
    user.attemptCount++;
    user.captchaCode = '';
    await user.save();
    throw '密码错误';

  }

  // 用户注册
  /**
 * @api {post} /signup 用户注册
 * @apiVersion 1.0.0
 * @apiName SignUp
 * @apiGroup Auth
 *
 * @apiDescription 注册新用户
 *
 *
 * @apiParam {String} username 用户名
 * @apiParam {String} password 登录密码
 * @apiParam {String} passwordConfirm 密码确认（为了前端逻辑尽可能简单，直接后端实现）
 * @apiParam {String} email 电子邮箱
 * @apiParam {String} phoneNumber 手机号码
 *
 * @apiSuccessExample
 * 注册成功
 *
 * @apiErrorExample
 * 用户名已占用，请更换
 * @apiErrorExample
 * 用户名格式不合法
 * @apiErrorExample
 * 密码长度小于8位，请重新设置
 * @apiErrorExample
 * 两次密码输入不一致
 * @apiErrorExample
 * 电子邮箱格式不正确，请检查
 * @apiErrorExample
 * 电子邮箱地址已被注册，请更换
 *
 */
  async signup() {
    const { ctx } = this;
    const { username, password, email, phoneNumber, passwordConfirm } = ctx.request.body;
    // 检查用户名是否被注册
    let count = await ctx.model.User.countDocuments({ name: username });
    if (count > 0) {
      throw '用户名已占用，请更换';
    }
    if (username.indexOf('@') !== -1) {
      throw '用户名格式不合法';
    }

    if (password.length < 8) {
      throw '密码长度小于8位，请重新设置';
    }
    if (password !== passwordConfirm) {
      throw '两次密码输入不一致';
    }
    if (!(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(email))) {
      throw '电子邮箱格式不正确，请检查';
    }
    // 检查邮箱是否被占用
    count = await ctx.model.User.countDocuments({ email });
    if (count > 0) {
      throw '电子邮箱地址已被注册，请更换';
    }
    const newUser = new ctx.model.User({
      name: username,
      passwordHash: ctx.helper.hash(password),
      email,
      phoneNumber,
    });
    await newUser.save();
    return '注册成功';
  }

  // 请求激活
  /**
 * @api {post} /request-verify 请求邮箱激活验证
 * @apiVersion 1.0.0
 * @apiName RequestVerify
 * @apiGroup Auth
 *
 * @apiDescription 在进行用户激活和重置密码操作之前，需要调用该接口。
 * 调用成功后，用户会收到验证码。
 *
 * @apiParam {String} email 电子邮箱
 *
 * @apiSuccessExample
 * 邮件已发送，请注意查收
 *
 * @apiErrorExample
 * 电子邮箱未注册，请检查
 * @apiErrorExample
 * 验证请求频率过高，请1分钟后重试
 *
 */
  async requestVerify() {
    const { ctx } = this;
    const { email } = ctx.request.body;
    const record = await ctx.model.User.findOne({ email });
    if (!record) {
      throw '电子邮箱未注册，请检查';
    }
    if (record.emailCodeExpireTime - ctx.helper.now() > 15 * 60 * 1000) {
      throw '验证请求频率过高，请1分钟后重试';
    }
    const code = ctx.helper.randomCode(6);
    // 记录邮箱验证码，15分钟有效
    record.emailCode = code;
    record.emailCodeExpireTime = +(ctx.helper.now() + 15 * 60 * 1000);
    await record.save();
    await ctx.helper.sendCodeEmail(code, email);
    return '邮件已发送，请注意查收';
  }

  /**
 * @api {post} /activate 激活用户
 * @apiVersion 1.0.0
 * @apiName Activate
 * @apiGroup Auth
 *
 * @apiDescription 请求邮箱验证码后，可以进行用户激活
 *
 * @apiParam {String} email 电子邮箱
 * @apiParam {String} emailCode 电子邮箱收到的验证码
 *
 * @apiSuccessExample
 * 激活成功
 *
 * @apiErrorExample
 * 邮箱地址未注册或已激活
 * @apiErrorExample
 * 验证码无效
 *
 */
  async activate() {
    const { ctx } = this;
    const { email, emailCode } = ctx.request.body;
    const record = await ctx.model.User.findOne({ email, isActivated: false });
    if (!record) {
      throw '邮箱地址未注册或已激活';
    }
    if (record.emailCode === emailCode && ctx.helper.now() < record.emailCodeExpireTime) {
      record.isActivated = true;
      record.emailCode = '';
      await record.save();
      return '激活成功';
    }
    record.isActivated = false;
    record.emailCode = '';
    await record.save();
    throw '验证码无效';

  }

  /**
 * @api {post} /reset-password 重置密码
 * @apiVersion 1.0.0
 * @apiName PasswordReset
 * @apiGroup Auth
 *
 * @apiDescription 请求邮箱验证码后，可以进行密码重置
 *
 * @apiParam {String} email 电子邮箱
 * @apiParam {String} emailCode 电子邮箱收到的验证码
 * @apiParam {String} newPassword 新的密码
 *
 * @apiSuccessExample
 * 密码重置成功
 *
 * @apiErrorExample
 * 邮箱地址未注册
 * @apiErrorExample
 * 验证码无效
 *
 */
  async resetPassword() {
    const { ctx } = this;
    const { email, emailCode, newPassword } = ctx.request.body;
    const record = await ctx.model.User.findOne({ email });
    if (!record) {
      throw '邮箱地址未注册';
    }
    if (record.emailCode === emailCode && ctx.helper.now() < record.emailCodeExpireTime) {
      record.passwordHash = ctx.helper.hash(newPassword);
      await record.save();
      return '密码重置成功';
    }
    record.emailCode = '';
    await record.save();
    throw '验证码无效';

  }


}

module.exports = AuthController;
