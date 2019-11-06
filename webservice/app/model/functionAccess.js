'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const FunctionAccessSchema = new Schema({
    token: { type: String },
    expireTime: { type: Number },
  });
  return mongoose.model('FunctionAccess', FunctionAccessSchema);
};
