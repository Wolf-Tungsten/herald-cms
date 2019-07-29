'use strict';

module.exports = option => {
    return async (ctx, next) => {
        let body
        try {
            body = await next()
            ctx.body = body
        } catch (e) {
            ctx.body = ''
            if (!e) {
                ctx.status = 400
            } else if (typeof e === 'number') {
                ctx.status = e
            } else if (typeof e === 'string') {
                body = e
                ctx.logger.error(e)
                ctx.status = 400
            } else {
                console.trace(e)
                ctx.logger.error(e)
                ctx.status = 400
            }
        }

        let json = {}
        if (ctx.status < 400) {
            json = {
                success: true,
                code: ctx.status || 200,
                result: body
            }
        } else {
            json = {
                success: false,
                code: ctx.status || 200,
                reason: body,
                related: ctx._related
            }
            if (!body) {
                if (ctx.status === 400) {
                    json.reason = '请求出错'
                } else if (ctx.status === 401) {
                    json.reason = '身份认证无效'
                } else if (ctx.status === 403) {
                    json.reason = '权限不允许'
                } else if (ctx.status === 404) {
                    json.reason = '内容不存在'
                } else if (ctx.status === 405) {
                    json.reason = '调用方式不正确'
                } else if (ctx.status === 500) {
                    json.reason = '服务器出错'
                } else if (ctx.status === 502) {
                    json.reason = '服务器维护'
                } else {
                    json.code = 400
                    json.reason = '未知错误'
                }
            }
        }
        ctx.body = json
        ctx.status = 200
    }
}