const Service = require('egg').Service;

class PermissionService extends Service {
    async getPermissionList(userId = null) {
        // 获取指定用户所有拥有权限的栏目
        let userInfo = await this.ctx.getUserInfo()
        if (!userId) {
            // 如果不指定userId，就是获取当前用户
            userId = userInfo._id
        }

        if (userInfo.isAdmin) {
            // 如果是管理员就全能发布/编辑
            let col = (await this.ctx.model.Column.find({})).map(c => ({ id: c._id, name: c.name, level: 'publish' }))
            return { publish: col, edit: col }
        } else {
            // 如果不是管理员就按章办事
            // 首先找出所有直接授权的栏目
            let directColumn = await this.ctx.model.Permission.find({ userId })
            directColumn = directColumn.map(c => ({ id: c.columnId, level: c.level }))
            // 对于直接授权的栏目找出间接授权的栏目
            let indirectColumn = []
            await Promise.all(directColumn.map(async (d) => {
                let children = await this.ctx.service.column.findChildColumnInList(d.id)
                children.forEach(c => {
                    console.log(c)
                    indirectColumn.push({
                        id: c.id,
                        level: d.level
                    })
                })
            }))
            // 拼接在一起获取栏目的名称
            let permissionColumn = [...directColumn, ...indirectColumn]
            permissionColumn = await Promise.all(permissionColumn.map(async (c) => {
                let columnName = (await this.ctx.model.Column.findById(c.id)).name
                c.name = columnName
                return c
            }))
            // 按照可发布和可编辑过滤
            let publish = permissionColumn.filter(c => c.level === 'publish')
            let edit = permissionColumn.filter(c => c.level === 'edit')
            // 可发布 > 可编辑
            edit = edit.concat(publish)
            return { publish, edit }
        }
    }

    async checkPermission(columnId, userId = null){
        let userInfo = await this.ctx.getUserInfo()
        if (!userId) {
            // 如果不指定userId，就是获取当前用户
            userId = userInfo._id
        }
        if(userInfo.isAdmin){
            // 站点管理员有所有栏目的授权
            return 'publish'
        } else {
            let permission = await this.ctx.model.Permission.findOne({columnId, userId})
            if(permission && permission.level === 'publish'){
                // 如果有直接的发布授权就直接返回
                return 'publish'
            }
            // 没有直接的发布权限，就要按照链式查找了
            permission = permission ? permission.level : 'none'
            let parentChain = await this.ctx.service.column.findParentColumnChain(columnId)
            for(let parent of parentChain){
                let parentPermission = await this.ctx.model.Permission.findOne({columnId:parent._id, userId})
                if(parentPermission && parentPermission.level === 'publish'){
                    return 'publish'
                } else if (parentPermission && parentPermission.level === 'edit'){
                    permission = 'edit'
                }
            }
            return permission
        }
    }
}
module.exports = PermissionService;