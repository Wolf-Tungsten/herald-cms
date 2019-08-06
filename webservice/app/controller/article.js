'use strict';

const Controller = require('egg').Controller;

class ArticleController extends Controller {

  async create() {
    const { ctx } = this;
    let userInfo = await this.ctx.getUserInfo()
    let { columnId } = ctx.request.body
    if(!columnId){
        throw '未指定栏目'
    }
    let checkPermission = await this.service.permission.checkPermission(columnId)
    if( checkPermission === 'none' ){
        throw '您无权在此栏目创建文章'
    }
    let code = this.ctx.helper.uuid().split('-')[0].toUpperCase()
    let newArticle = new this.ctx.model.Article({
        columnId,
        authorId:userInfo._id,
        createdTime:this.ctx.helper.now(),
        status:'draft',
        code
    })
    await newArticle.save()
    return newArticle._id
  }

  async get(){
    let { articleId } = this.ctx.request.query
    if(!articleId){
      throw '未指定文章ID'
    }
    let permissionCheck = await this.ctx.service.permission.checkArticlePermission(articleId)
    if(permissionCheck === 'none'){
      throw '您无权操作本栏目文章'
    }
    let article = await this.ctx.model.Article.findById(articleId)
    if(permissionCheck === 'edit' && article.authorId != (await this.ctx.getUserId())){
      throw '您无权操作本篇文章'
    }

    if(article.status === 'published'){
      throw '不能编辑处于发布状态的文章'
    }
    return await this.ctx.service.article.prepare(article)
  }

  async save(){
    let {articleId, title, authorName, abstract, refLink, content} = this.ctx.request.body
    if(!articleId){
      throw '未指定文章ID'
    }
    let permissionCheck = await this.ctx.service.permission.checkArticlePermission(articleId)
    if(permissionCheck === 'none'){
      throw '您无权操作本栏目文章'
    }
    let article = await this.ctx.model.Article.findById(articleId)
    if(permissionCheck === 'edit' && article.authorId != (await this.ctx.getUserId())){
      throw '您无权操作本篇文章'
    }

    if(article.status === 'published'){
      throw '不能编辑处于发布状态的文章'
    }

    article.title = title
    article.authorName = authorName
    article.abstract = abstract
    article.refLink = refLink

    // 替换静态文件前缀
    const publicUrlPrefixPlaceholder = '{%-ZZJ-SO-CUTE-%}'
    this.app.config.static.publicUrlPrefix.forEach( p => {
      content = content.replace(p, publicUrlPrefixPlaceholder)
    })

    article.content = content

    // 检查是否有冗余的图片文件
    let imageList = await this.ctx.model.Resource.find({articleId, type:'image'})
    imageList.forEach( image => {
      let isInUse = (content.indexOf(image.resourceName) !== -1) || article.coverImg === image.resourceName
      if(!isInUse){
        // 如果图片没有被引用，就要删除
        this.ctx.service.upload.deleteFile(image.resourceName)
        this.ctx.model.Resource.deleteOne({_id:image._id})
      }
    })

    article.lastModifiedTime = this.ctx.helper.now()
    await article.save()
    return '文章保存成功'

  }

  async publishOrReviewing(){

  }

  async rejectOrCancelPublish(){

  }

  async delete(){

  }
}

module.exports = ArticleController;