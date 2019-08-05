const Service = require('egg').Service;
const sendToWormhole = require('stream-wormhole');
const path = require('path');
const stream = require('stream');
const fs = require('fs')

class UploadService extends Service {
    async saveUploadStreamToFile(uploadStream){
        let uploadFilename = uploadStream.filename;
        let extName = path.extname(uploadFilename);
        let newName = `${this.ctx.helper.uuid()}${extName}`
        let localSavePath = path.join(this.app.config.static.localStaticPath,newName)
        let fileStream = fs.createWriteStream(localSavePath)
        await new Promise((resolve, reject)=>{
            stream.pipeline(uploadStream, fileStream, (err) => {
                if(!err){
                    resolve()
                } else {
                    reject()
                }
            })
        })
        return newName
    }
}
module.exports = UploadService;