const Service = require('egg').Service;

class ArticleService extends Service {
  async prepare(article) {
    let wellPrepared = {
      title: article.title,
      authorName: article.authorName,
      abstract: article.abstract,
      refLink: article.refLink,
      lastModifiedTime: article.lastModifiedTime,
      publishTime:article.publishTime,
      topFixed:article.topFixed,
      status:article.status,
      code:article.code
    }

    // 将article中的静态资源前缀替换
    const publicUrlPrefixPlaceholder = '{%-ZZJ-SO-CUTE-%}'
    wellPrepared.content = article.content.replace(publicUrlPrefixPlaceholder,
      this.ctx.helper.randomFromArray(this.app.config.static.publicUrlPrefix))
    
    // 将 coverImg 组装成 coverUrl
    wellPrepared.coverUrl = article.coverImg ? `${this.ctx.helper.randomFromArray(this.app.config.static.publicUrlPrefix)}${article.coverImg}` : ''

    // 视频文件列表
    let videoList = await this.ctx.model.Resource.find({articleId:article._id, type:'video'})
    wellPrepared.videoList = videoList.map(v => {
      return {
        name:v.displayName,
        url:`${this.ctx.helper.randomFromArray(this.app.config.static.publicUrlPrefix)}${v.resourceName}`,
        fileId:v._id
      }
    })

    // 附件文件列表
    let appendFileList = await this.ctx.model.Resource.find({articleId:article._id, type:'appendFile'})
    wellPrepared.appendFileList = appendFileList.map(f => {
      return {
        name:f.displayName,
        url:`${this.ctx.helper.randomFromArray(this.app.config.static.publicUrlPrefix)}${f.resourceName}`,
        fileId:f._id
      }
    })

    return wellPrepared
  }

  async delete(articleId){
    let permission = await this.ctx.service.permission.checkArticlePermission(articleId)
    let userId = await this.ctx.getUserId()
    if(!articleId){
      throw '未指定文章ID'
    }
    let article = await this.ctx.model.Article.findById(articleId)
    // 权限检查
    if(permission === 'none'){
      throw '无权操作'
    } else if (permission === 'edit') {
      if(article.authorId !== userId){
        throw '无权操作'
      }
    }
    // 获取关联文件列表并删除
    let fileList = await this.ctx.model.Resource.find({articleId})
    fileList.forEach(f => {
      this.ctx.model.Resource.deleteOne({_id:f._id})
      this.ctx.service.upload.deleteFile(f.resourceName)
    })
    // 删除文章
    await this.ctx.model.Article.deleteOne({_id:article._id})
    return '删除成功'
  }
}

module.exports = ArticleService;