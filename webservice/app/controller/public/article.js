'use strict';

const Controller = require('egg').Controller;

class PublicArticleController extends Controller {

  // 获取以指定栏目为根的栏目树
  async getArticleList() {
    let { columnCode, deep = false, showLimited = false, pagesize = 10, page = 1 } = this.ctx.request.query
    if (!columnCode) {
      throw { errCode: 30001, reason: '未指定栏目编号' }
    }
    let rootColumn = await this.ctx.service.column.findColumnByCode(columnCode)
    if (!rootColumn) {
      throw { errCode: 30002, reason: '栏目不存在' }
    }
    let columnIdList = [rootColumn._id]
    if (deep) {
      columnIdList = columnIdList.concat((await this.ctx.service.column.findChildColumnInList(rootColumn._id)).map(c => c._id))
    }

    // 处理参数类型
    if (showLimited) {
      showLimited = true
    }

    if (pagesize) {
      pagesize = +pagesize
    }

    if (page) {
      page = +page
    }

    let articleListRaw = await this.ctx.model.Article.find({ columnId: { $in: columnIdList }, 
      limited: { $in: [false, showLimited] }, 
      status: 'published',
      topFixed: false // 检索的过程中忽略置顶文章
     },
      ['title', 'authorName', 'abstract', 'refLink', 'lastModifiedTime', 'publishTime', 'code', 'topFixed', 'viewCount'], 
      {
      sort: { publishTime: -1 },
      skip: pagesize * (page - 1),
      limit: pagesize,
    })

    let articleAmount = await this.ctx.model.Article.countDocuments({ columnId: { $in: columnIdList }, 
      limited: { $in: [false, showLimited] }, 
      status: 'published',
      topFixed: false // 检索的过程中忽略置顶文章
     })

    let topFixedListRaw = await this.ctx.model.Article.find({ columnId: { $in: columnIdList }, 
      limited: { $in: [false, showLimited] }, 
      status: 'published',
      topFixed: true
     },
      ['title', 'authorName', 'abstract', 'refLink', 'lastModifiedTime', 'publishTime', 'code', 'topFixed', 'viewCount'], 
      {
      sort: { publishTime: -1 }
    })

    let articleList = [], topFixedList = []

    for(let article of articleListRaw){
      articleList.push(await this.ctx.service.article.prepare(article))
    }

    for(let article of topFixedListRaw){
      topFixedList.push(await this.ctx.service.article.prepare(article))
    }

    return {
      articleList, topFixedList, articleAmount
    }
  }

  async getArticleContent(){
    let { articleCode, token, identifier } = this.ctx.request.query
    let article = await this.ctx.model.Article.findOne({code:articleCode, status:'published', publishTime:{$lte:+this.ctx.helper.now()}})
    if(!article){
      throw {errCode:40001, reason:'文章不存在'}
    }
    let articleAccess = await this.ctx.model.ArticleAccess.findOne({token, valid:false, articleId:article._id, expireTime:{$gte:+this.ctx.helper.now()}})
    if(article.limited && !articleAccess){
      throw {errCode:40002, reason:'访问认证凭据无效'}
    }

    if(articleAccess){
      // 有权限文章和无权限文章都可以通过凭据记录
      articleAccess.valid = true
      articleAccess.accessTime = +this.ctx.helper.now()
      await articleAccess.save()
    }

    // 更新浏览量计数
    let articleView = new this.ctx.model.ArticleView({articleId:article._id,timestamp:+this.ctx.helper.now(), identifier})
    await articleView.save()
    article.viewCount = await this.ctx.model.ArticleView.countDocuments({articleId:article._id})
    await article.save()

    // 组织文章内容
    article = await this.ctx.service.article.prepare(article)

    return article

  }

}

module.exports = PublicArticleController;
