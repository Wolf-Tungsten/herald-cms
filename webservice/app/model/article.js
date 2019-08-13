
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ArticleSchema = new Schema({
    columnId: { type: String }, // 所属栏目ID
    authorId: { type: String }, // 作者用户ID
    authorName: { type: String, default:'未署名'}, // 注意作者的名字并不来自于用户信息，像微信公众号一样是发布文章时指定的
    title: { type: String ,default:'无标题'},
    content: { type: String, default:'', index:true },
    abstract: { type: String,default:'' },
    refLink: { type:String, default: ''}, // 外链
    coverImg: { type: String, default:'' }, // 封面图片
    lastModifiedTime: { type: Number },
    status: { type: String }, // draft, reviewing, rejected, published
    publishTime: { type: Number, default:0 }, // 用于设置定时发布
    code: { type: String }, // 前端站使用的便捷Code
    topFixed: {type:Boolean, default:false}, //置顶
    limited:{type:Boolean, default:false}, // 权限文章预留字段
    viewCount:{type:Number, default:0} // 阅读量
  });

  return mongoose.model('Article', ArticleSchema);
}