'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ArticleAccessSchema = new Schema({
    token: { type: String },
    articleId: { type: String },
    expireTime: { type: Number },
    valid: { type: Boolean, default: false },
    accessTime: { type: Number },
    userIdentifier1: { type: String },
    userIdentifier2: { type: String },
    userIdentifier3: { type: String },
  });
  return mongoose.model('ArticleAccess', ArticleAccessSchema);
};
