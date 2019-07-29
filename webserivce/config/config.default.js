/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */


module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const mongodbSecret = require('../secret/mongodb.json')

  const config = exports = {
    security: {
      csrf: {
        enable: false
      },
      domainWhiteList: [ 'http://localhost:4200' ] // 跨域白名单
    },
    cors:{
      // 跨域中间件
    },
    mongoose:{
      client: {
        url: mongodbSecret.url,
        options: {},
        // mongoose global plugins, expected a function or an array of function and options
        plugins: [],
      },
    }
  };
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1563698732399_8150';

  // add your middleware config here
  config.middleware = ['return', 'token'];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};

