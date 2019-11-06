'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ArticleViewSchema = new Schema({
    articleId: { type: String },
    timestamp: { type: Number },
    identifier: { type: String }, // 前端站请求时可以带一个标识符，便于统计
  });

  return mongoose.model('ArticleView', ArticleViewSchema);
};
