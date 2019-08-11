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
      ['title', 'authorName', 'abstract', 'refLink', 'lastModifiedTime', 'publishTime', 'code', 'topFixed'], 
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
      ['title', 'authorName', 'abstract', 'refLink', 'lastModifiedTime', 'publishTime', 'code', 'topFixed'], 
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

}

module.exports = PublicArticleController;
