const crypto = require('crypto')
const nodemailer = require('nodemailer')

class AppBootHook {
    constructor(app) {
      this.app = app;
    }
  
    configWillLoad() {
      // 此时 config 文件已经被读取并合并，但是还并未生效
      // 这是应用层修改配置的最后时机
      // 注意：此函数只支持同步调用
  
      // 例如：参数中的密码是加密的，在此处进行解密
      // this.app.config.mysql.password = decrypt(this.app.config.mysql.password);
      // // 例如：插入一个中间件到框架的 coreMiddleware 之间
      // const statusIdx = this.app.config.coreMiddleware.indexOf('status');
      // this.app.config.coreMiddleware.splice(statusIdx + 1, 0, 'limit');
    }
  
    async didLoad() {
      // 所有的配置已经加载完毕
      // 可以用来加载应用自定义的文件，启动自定义的服务
  
      // 例如：创建自定义应用的示例
      // this.app.queue = new Queue(this.app.config.queue);
      // await this.app.queue.init();
  
      // // 例如：加载自定义的目录
      // this.app.loader.loadToContext(path.join(__dirname, 'app/tasks'), 'tasks', {
      //   fieldClass: 'tasksClasses',
      // });
    }
  
    async willReady() {
      //await this.app.model.User.deleteMany({})
      let adminCount = await this.app.model.User.countDocuments({isAdmin:true})
      if(adminCount === 0){
        // 当前数据库中管理员的数量为0
        // 执行初始化管理员操作
        let passwordHash = crypto.createHash('sha256');
        passwordHash.update('admin')
        passwordHash = passwordHash.digest('hex')
        let initAdmin = new this.app.model.User({
          name:'admin',
          passwordHash,
          email:this.app.config.adminEmail,
          phoneNumber:this.app.config.adminPhoneNumber,
          isAdmin:true,
          isActivated:true
        })
        await initAdmin.save()
        console.log('网站初始化完毕，初始登录用户名：admin，初始密码：admin')
      }
      // 初始化栏目操作

      const ctx = await this.app.createAnonymousContext();
      await ctx.service.column.init()
    }
  
    async didReady() {
      // 应用已经启动完毕
      let transporter = nodemailer.createTransport(this.app.config.mail);
      transporter.verify(function(error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });
    }
  
    async serverDidReady() {
      // http / https server 已启动，开始接受外部请求
      // 此时可以从 app.server 拿到 server 的实例
  
      this.app.server.on('timeout', socket => {
        // handle socket timeout
      });
    }
  }
  
  module.exports = AppBootHook;