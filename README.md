# 先声内容管理 Herald-CMS

「中国特色」的开源内容管理系统

## 项目介绍

Herald-CMS 是一个 Headless 的内容管理系统。系统以 API 的形式向外提供服务，网站运营者依托 Herald-CMS 提供的外部接口，可使用任意技术框架、完全自主的开发面向用户的**前端站**，提供最大的开发灵活度。

Herald-CMS 与传统 CMS 最大的区别在于不提供模板渲染系统，理由如下：

* 前端开发魔法日新月异、各种框架层出不穷，使用模板渲染会很大程度的限制这些技术的使用。
* 用户网站的服务可能不仅仅是内容发布，而在一个局限的 CMS 站点之上所能实现的功能终归是有限的，Herald-CMS 以纯后端服务的形式展示，能够为业务扩展提供最大的灵活性
* （编不下去了……

## 项目结构

### webservice

Herald-CMS 的核心服务，提供 RESTful 形式的 API 接口。

API 接口从功能上可以分类为面向前端站的接口和面向管理后台的接口。

### admin-ui

Herald-CMS 接口完全开放，实际上用户可以自行实现管理后台，但考虑到这是一个较为复杂的过程，所以提供一个管理后台。

## 功能&接口&开发需求

### 身份认证-auth

**数据模型**

```javascript
{
    name: { type: String },

    passwordHash: { type: String },

    attemptCount: {type:Number, default:0}, // 出现错误登录验证的计数
    captchaCode: {type:String, default:''},
    tokenHash: {type: String, default:''},
    tokenExpireTime: {type: Number, default:0},
    smsCode: {type: String, default:''},
    smsCodeExpireTime: {type: Number, default:0},
    phoneNumber: { type:String, default:'' },
    email: {type:String, default:''},
    emailCode: {type:String, default:''},
    emailCodeExpireTime:{type:Number, default:0},
    extraInfoJson: {type:Map, default:{}},
    isAdmin: {type:Boolean, default:false},
    isAuthor: {type:Boolean, default:false},
    isActivated: {type:Boolean, default:false}
}
```

**接口列表**

| 接口url                  | 请求方式 | 请求参数                                                                        | 响应参数                                                                                                                                                                                 | 备注                       |
| ---------------------- | ---- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| /api/v1/login          | POST | {        username,password ,captchaCode}                 | {needCaptcha:false,isAdmin:user.isAdmin,isAuthor:user.isAuthor,postLoginUrl:webPostLoginURL,token} | 仅列出了成功的相应参数，登陆失败的响应见后端代码 |
| /api/v1/register       | POST | {username,  password,          email,         phoneNumber, passwordConfirm} |                                                                                                                                                                                      | 返回各种验证失败的错误              |
| /api/v1/request-verify | POST | {email}                                                                     |                                                                                                                                                                                      | 发送验证邮件                   |
| /api/v1/activate       | POST | { email, emailCode }                                                        |                                                                                                                                                                                      | 激活账号                     |
| /api/v1/reset-password | POST | { email, emailCode, newPassword }                                           |                                                                                                                                                                                      |                          |

### 栏目管理 - Column

**数据模型**

```javascript
{
    _id: { type: ObjectId },
    code: { type: String }, // 便捷栏目代码，随机数字字母组合，便于前端站开发使用
    name: { type: String }, // 栏目名称（标题）
    level: { type:Number }, // 栏目的级别，下文详细解释
    parentId: {type:String, default:''} // 父栏目Id
}
```

**栏目的级别**

Herald-CMS 中栏目采用树状结构组织，有且仅有唯一的根栏目「站点」，根栏目 level 为 0 级，由系统自动维护。所有用户创建栏目均需指定父栏目，子栏目 level 较父栏目 level 增加 1。



**接口列表**

| 接口url                   | 请求方式 | 请求参数             | 响应参数          | 备注              |
|:----------------------- | ---- | ---------------- | ------------- | --------------- |
| /api/v1/column          | GET  |                  | {所有column文档}  | column文档格式见数据模型 |
| /api/v1/column/create   | POST | {name, parentId} |               |                 |
| /api/v1/column/children | GET  | {_id}            | {column子栏目文档} | column文档格式见数据模型 |

### 权限管理 - Permission

**数据类型**

```javascript
{
    userId: { type: String },
    columnId: { type: String },
    level: { type: String },
}
```

**接口列表**

| 接口url                        | 请求方式   | 请求参数                        | 响应参数                                                                                                                                                                                                        | 备注                          |
| ---------------------------- | ------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| /api/v1/permission/column    | GET    | { columnId }                | { name:user.name,email:user.email,phoneNumber:user.phoneNumber,userId:c.userId,level:c.level === 'publish'? '发布权限':'编辑权限'} |                             |
| /api/v1/permission/user-info | GET    | {email}                     | {name:user.name,id:user._id,email:user.email,phoneNumber:user.phoneNumber}                                                              |                             |
| /api/v1/permission/column    | POST   | { level, userId, columnId } |                                                                                                                                                                                                             | 使用getUserInfo()判断用户是否为admin |
| /api/v1/permission/column    | DELETE | {userId, columnId}          |                                                                                                                                                                                                             | 删除栏目                        |

**站点管理员角色**

通过用户数据的 isAdmin 字段标识

站点管理员拥有对网站完全的控制。

**编辑角色**

编辑角色是相对栏目而言的。通过 Permission 表中的记录判别。
