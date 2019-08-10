const Service = require('egg').Service;

class ColumnService extends Service {
  async init() {
    let rootColumnCount = await this.ctx.model.Column.countDocuments({ level: 0 })
    if (rootColumnCount === 0) {
      // 没有根栏目，创建根栏目
      this.ctx.logger.info('正在创建根栏目')
      let rootColumn = new this.ctx.model.Column({
        name: "站点",
        level: 0, code: this.ctx.helper.uuid().split('-')[0].toUpperCase()
      })
      await rootColumn.save()
    }
  }

  async findColumnById(id) {
    return await this.ctx.model.Column.findById(id)
  }

  async findColumnByCode(code) {
    return await this.ctx.model.Column.findOne({code})
  }

  // 以树结构形式查找指定栏目的所有子栏目（根节点为指定栏目）
  async findChildColumns(parentId){
    let userInfo = await this.ctx.getUserInfo()
    if(!(userInfo.isAdmin || userInfo.isAuthor)){
      throw 401
    }
    let root = await this.findColumnById(parentId)
    root = { _id:root._id, children:{}, name:root.name, childrenList:[], code:root.code }
    let bfsQueue = [root]
    let p
    while(bfsQueue.length > 0){
      p = bfsQueue.shift()
      p.children = {}
      let children = await this.ctx.model.Column.find({parentId:p._id})
      children.forEach(c => {
        c = { _id:c._id, name:c.name, parentId:c.parentId, childrenList:[], code:c.code}
        p.children[c._id] = c
        p.childrenList.push(c)
        bfsQueue.push(c)
      })
    }
    return root
  }

  // 以列表形式查找指定栏目的所有子栏目
  async findChildColumnInList(parentId){
    let children = await this.ctx.model.Column.find({parentId:parentId})
    let deep = []
    await Promise.all(children.map(async (c)=>{
      let d = await this.findChildColumnInList(c._id)
      deep = deep.concat(d)
    }))
    children = children.concat(deep)
    return children
  }

  // 查找指定栏目的所有祖先栏目
  async findParentColumnChain(columnId){
    let col = await this.findColumnById(columnId)
    if(col.level === 0){
      return []
    } else {
      col = await this.findColumnById(col.parentId)
      return [...(await this.findParentColumnChain(col._id)), col]
    }
  }

  // 删除栏目
  async deleteColumn(columnId){
    let children = await this.ctx.model.Column.find({parentId:columnId},['_id'])
    children.forEach((c) => {
      // 递归的删除子栏目
      this.deleteColumn(c._id)
    })
    // 删除所有授权
    await this.ctx.model.Permission.deleteMany({columnId})
    // 获取栏目下的所有文章，并删除
    let articles = await this.ctx.model.Article.find({columnId}, ['_id'])
    articles.forEach((a) => {
      this.ctx.service.article.delete(a._id)
    })
    // 删除栏目记录本身
    await this.ctx.model.Column.deleteOne({_id:columnId})
  }
}

module.exports = ColumnService;