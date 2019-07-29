const crypto = require('crypto')
const uuid = require('uuid/v4')
const moment = require('moment')
module.exports = {
    // this 是 helper 对象，在其中可以调用其他 helper 方法
    // this.ctx => context 对象
    // this.app => application 对象
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
      return result.join()
    },
    now(){
      return +moment()
    }
  };