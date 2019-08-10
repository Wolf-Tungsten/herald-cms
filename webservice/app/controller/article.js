'use strict';

const Controller = require('egg').Controller;

class ArticleController extends Controller {

  async create() {
    const { ctx } = this;
    let userInfo = await this.ctx.getUserInfo()
    let { columnId } = ctx.request.body
    if (!columnId) {
      throw '未指定栏目'
    }
    let checkPermission = await this.service.permission.checkPermission(columnId)
    if (checkPermission === 'none') {
      throw '您无权在此栏目创建文章'
    }
    let code = this.ctx.helper.uuid().split('-')[0].toUpperCase()
    let newArticle = new this.ctx.model.Article({
      columnId,
      authorId: userInfo._id,
      createdTime: this.ctx.helper.now(),
      status: 'draft',
      code
    })
    await newArticle.save()
    return newArticle._id
  }

  async get() {
    let { articleId } = this.ctx.request.query
    if (!articleId) {
      throw '未指定文章ID'
    }
    let permissionCheck = await this.ctx.service.permission.checkArticlePermission(articleId)
    if (permissionCheck === 'none') {
      throw '您无权操作本栏目文章'
    }
    let article = await this.ctx.model.Article.findById(articleId)
    if (permissionCheck === 'edit' && article.authorId != (await this.ctx.getUserId())) {
      throw '您无权操作本篇文章'
    }

    if (article.status === 'published') {
      throw '不能编辑处于发布状态的文章'
    }
    return await this.ctx.service.article.prepare(article)
  }

  async save() {
    let { articleId, title, authorName, abstract, refLink, content, limited } = this.ctx.request.body
    if (!articleId) {
      throw '未指定文章ID'
    }
    let permissionCheck = await this.ctx.service.permission.checkArticlePermission(articleId)
    if (permissionCheck === 'none') {
      throw '您无权操作本栏目文章'
    }
    let article = await this.ctx.model.Article.findById(articleId)
    if (permissionCheck === 'edit' && article.authorId != (await this.ctx.getUserId())) {
      throw '您无权操作本篇文章'
    }

    if (article.status === 'published') {
      throw '不能编辑处于发布状态的文章'
    }

    article.title = title
    article.authorName = authorName
    article.abstract = abstract
    article.refLink = refLink
    article.limited = limited
    
    // 替换静态文件前缀
    const publicUrlPrefixPlaceholder = '{%-ZZJ-SO-CUTE-%}'
    this.app.config.static.publicUrlPrefix.forEach(p => {
      content = content.replace(p, publicUrlPrefixPlaceholder)
    })

    article.content = content

    // 检查是否有冗余的图片文件
    let imageList = await this.ctx.model.Resource.find({ articleId, type: 'image' })
    imageList.forEach(image => {
      let isInUse = (content.indexOf(image.resourceName) !== -1) || article.coverImg === image.resourceName
      if (!isInUse) {
        // 如果图片没有被引用，就要删除
        this.ctx.service.upload.deleteFile(image.resourceName)
        this.ctx.model.Resource.deleteOne({ _id: image._id })
      }
    })

    // 调整文章状态
    if (article.status === 'rejected') {
      // 处于被拒稿的状态经过编辑自动切换回草稿状态
      article.status = 'draft'
    }
    article.lastModifiedTime = this.ctx.helper.now()
    await article.save()
    return '文章保存成功'

  }

  async publishOrReviewing() {
    let { articleId, publishTime } = this.ctx.request.body
    let permission = await this.ctx.service.permission.checkArticlePermission(articleId)
    if (permission === 'none') {
      throw '无权操作'
    }
    let article = await this.ctx.model.Article.findById(articleId)
    let userId = await this.ctx.getUserId()
    console.log(permission, article.status, userId, article.authorId)
    if (permission === 'edit') {
      // 如果对于当前文章有编辑权限
      if (article.status === 'draft') {
        // 且当前文章处于草稿状态
        if (''+userId === article.authorId) {
          // 只允许本人操作
          article.status = 'reviewing'
          await article.save()
          return '文章已提交审核'
        }
      }
    } else if (permission === 'publish') {
      // 如果有发布权限，无论文章状态如何都可以直接被发布
      if (!publishTime) {
        publishTime = this.ctx.helper.now()
      }
      publishTime = +publishTime
      article.status = 'published'
      article.publishTime = publishTime
      await article.save()
      return '文章已发布'
    }
    throw '操作不允许'
  }

  async rejectOrCancelPublish() {
    let { articleId } = this.ctx.request.body
    let permission = await this.ctx.service.permission.checkArticlePermission(articleId)
    if (permission === 'none') {
      throw '无权操作'
    }
    let article = await this.ctx.model.Article.findById(articleId)
    if (permission === 'publish') {
      if (article.status === 'published') {
        article.status = 'draft'
        await article.save()
        return '文章已发布'
      } else if (article.status === 'reviewing') {
        article.status = 'rejected'
        await article.save()
        return '已拒稿'
      }
    } else if (permission === 'edit'){
      if (article.status === 'reviewing' && article.authorId === (await this.ctx.getUserId())) {
        article.status = 'draft'
        await article.save()
        return '已撤销审核申请'
      }
    }
    throw '操作不允许'
  }

  async delete() {
    let { articleId } = this.ctx.request.query
    return await this.ctx.service.article.delete(articleId)
  }

  async findArticleOfColumn() {
    let { columnId, pagesize = 10, page = 1, status, title } = await this.ctx.request.query
    let permission = await this.ctx.service.permission.checkPermission(columnId)
    if (permission === 'publish') {
      page = +page
      pagesize = +pagesize
      let articleList = (await this.ctx.model.Article.find((title ? { columnId, title: { $regex: `.*(${title}).*` } } : { columnId }),
        ['_id', 'title', 'authorName', 'status', 'publishTime', 'code'],
        {
          skip: pagesize * (page - 1),
          limit: pagesize,
          sort: { lastModifiedTime: -1 }
        })).map(a => ({
          id: a._id,
          title: a.title ? a.title : '无标题文章',
          authorName: a.authorName ? a.authorName : '未署名',
          status: a.status,
          publishTime: a.publishTime,
          code:a.code
        }))
      let articleCount = await this.ctx.model.Article.countDocuments({ columnId })
      return { articleList, articleAmount: articleCount }
    } else if (permission === 'edit') {
      page = +page
      pagesize = +pagesize
      let articleList = (await this.ctx.model.Article.find((title ? { columnId, title: { $regex: `.*(${title}).*` }, authorId:(await this.ctx.getUserId()) } : { columnId, authorId:(await this.ctx.getUserId()) }),
        ['_id', 'title', 'authorName', 'status', 'publishTime', 'code'],
        {
          skip: pagesize * (page - 1),
          limit: pagesize,
          sort: { lastModifiedTime: -1 }
        })).map(a => ({
          id: a._id,
          title: a.title ? a.title : '无标题文章',
          authorName: a.authorName ? a.authorName : '未署名',
          status: a.status,
          publishTime: a.publishTime,
          code:a.code
        }))
      let articleCount = await this.ctx.model.Article.countDocuments({ columnId })
      return { articleList, articleAmount: articleCount }
    }

  }

  async findArticleOfOwn() {
    // 查找自己创建的草稿、等待审核、审核被拒的文章
    let userId = await this.ctx.getUserId()
    let res = {
      draft: (await this.ctx.model.Article.find({ authorId: userId, status: 'draft' }, ['_id', 'title', 'lastModifiedTime', 'columnId'], { sort: { lastModifiedTime: -1 } })).map(a => ({ id: a._id, title: a.title ? a.title : '无标题文章', lastModifiedTime: a.lastModifiedTime, columnId: a.columnId })),
      reviewing: (await this.ctx.model.Article.find({ authorId: userId, status: 'reviewing' }, ['_id', 'title', 'lastModifiedTime', 'columnId'], { sort: { lastModifiedTime: -1 } })).map(a => ({ id: a._id, title: a.title ? a.title : '无标题文章', lastModifiedTime: a.lastModifiedTime, columnId: a.columnId })),
      rejected: (await this.ctx.model.Article.find({ authorId: userId, status: 'rejected' }, ['_id', 'title', 'lastModifiedTime', 'columnId'], { sort: { lastModifiedTime: -1 } })).map(a => ({ id: a._id, title: a.title ? a.title : '无标题文章', lastModifiedTime: a.lastModifiedTime, columnId: a.columnId })),
    }
    res.draft = await Promise.all(res.draft.map(async article => {
      let column = await this.ctx.model.Column.findOne({ _id: article.columnId }, ['name'])
      article.columnName = column.name
      return article
    }))
    res.reviewing = await Promise.all(res.reviewing.map(async article => {
      let column = await this.ctx.model.Column.findOne({ _id: article.columnId }, ['name'])
      article.columnName = column.name
      return article
    }))
    res.rejected = await Promise.all(res.rejected.map(async article => {
      let column = await this.ctx.model.Column.findOne({ _id: article.columnId }, ['name'])
      article.columnName = column.name
      return article
    }))
    return res
  }

  async findArticleNeedReviewing() {
    // 查找需要审核的文章
    // 若未指定栏目ID就搜索全部需要审核的文章
    let { columnId } = await this.ctx.request.query
    let reviewingList = []
    if (columnId) {
      let permission = await this.ctx.service.permission.checkPermission(columnId)
      if (permission !== 'publish') {
        throw '无权查看'
      }
      reviewingList = reviewingList.concat((await this.ctx.model.Article.find({ columnId, status: 'reviewing' }, ['_id', 'title'])).map(article => ({
        id: article._id,
        columnName: column.name,
        title: article.title
      })))
    } else {
      let columnList = await this.ctx.service.permission.getPermissionList()
      for (let column of columnList.publish) {
        reviewingList = reviewingList.concat((await this.ctx.model.Article.find({ columnId: column.id, status: 'reviewing' }, ['_id', 'title'])).map(article => ({
          id: article._id,
          columnName: column.name,
          title: article.title
        })))
      }
    }
    return reviewingList
  }
}

module.exports = ArticleController;