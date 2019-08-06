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
}

module.exports = ArticleService;