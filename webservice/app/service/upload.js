'use strict';
const Service = require('egg').Service;
const path = require('path');
const stream = require('stream');
const fs = require('fs');

class UploadService extends Service {
  async saveUploadStreamToFile(uploadStream) {
    const uploadFilename = uploadStream.filename;
    const extName = path.extname(uploadFilename);
    const newName = `${this.ctx.helper.uuid()}${extName}`;
    const localSavePath = path.join(this.app.config.static.localStaticPath, newName);
    const fileStream = fs.createWriteStream(localSavePath);
    await new Promise((resolve, reject) => {
      stream.pipeline(uploadStream, fileStream, err => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
    return newName;
  }

  async deleteFile(filename) {
    fs.unlinkSync(path.join(this.app.config.static.localStaticPath, filename));
  }
}
module.exports = UploadService;
