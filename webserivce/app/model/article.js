
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ArticleSchema = new Schema({
    columnId: { type: String }, // 所属栏目ID
    authorId: { type: String }, // 作者用户ID
    authorName: { type: String }, // 注意作者的名字并不来自于用户信息，像微信公众号一样是发布文章时指定的
    title: { type: String },
    content: { type: String },
    abstract: { type: String },
    coverImg: { type: String }, // 封面图片
    createdTime: { type: Number },
    status: { type: String },
    publishTime: { type: String }, // 用于设置定时发布
    code: { type: String } // 前端站使用的便捷Code
  });

  return mongoose.model('Article', ArticleSchema);
}