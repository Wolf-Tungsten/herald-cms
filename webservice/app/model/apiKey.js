'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ApiKeySchema = new Schema({
    appId: { type: String },
    appSecret: { type: String },
    enable: { type: Boolean, default: true },
    name: { type: String },
  });

  return mongoose.model('APIKey', ApiKeySchema);
};
