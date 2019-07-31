/* eslint valid-jsdoc: "off" */

'use strict';
const yaml = require('yaml')
const fs = require('fs')
const path = require('path')

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */


module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  let configYaml = yaml.parse(fs.readFileSync(path.join(appInfo.baseDir, 'herald-cms-config.yml'), 'utf8'))
  console.log(configYaml.domainWhiteList)
  const config = exports = {
    security: {
      csrf: {
        enable: false
      },
      domainWhiteList: configYaml.domainWhiteList // 跨域白名单
    },
    cors:{
      // 跨域中间件
    },
    mongoose:{
      client: {
        url: configYaml.mongodbURL,
        options: {},
        // mongoose global plugins, expected a function or an array of function and options
        plugins: [],
      },
    },
    mail:configYaml.mail
  };
  config.webPostLoginURL = configYaml.webPostLoginURL
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

