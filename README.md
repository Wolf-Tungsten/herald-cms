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

Herald-CMS 接口完全开放，实际上用户可以自行实现管理后台，但考虑到这是一个较为复杂(甚至令人生厌)的过程，所以提供一个管理后台。

# Herald-CMS Webservice 使用文档

Webservice 接口可以分为公开和私有两部分，公开部分面向用户前端站使用，私有部分面向 admin-ui 后台使用。

考虑到私有部分对于绝大数用户来说参考的意义较弱，文档以代码注释形式出现，不单独成文；公有接口此处提供详细的使用文档。

## 接口请求格式

Webservice 使用 3 个 HTTP 动词：GET/POST/DELETE。

**GET** 和 **DELETE** 请求参数通过Query Params给出。

**POST** 请求忽略 URL 参数，全部从请求Body中读取，接受 json 和 x-www-form-urlencoded 两种格式，建议使用json格式。

## 接口响应格式

成功响应：

```json
{
    "success":true,
    "code":200,
    "result":<接口的返回结果>
}
```

失败响应：

```json
{
    "success":true,
    "code":<错误代码>,
    "reason":<错误的文字解释>
}
```

## 开放接口部分



### 申请 Article-Token

Article-Token 用于将 Herald-CMS 与用户的身份认证系统实现对接；是用户访问带权限文章的身份依据；也是 Herald-CMS 统计接口的直接数据来源。

**有效性**：Article-Token 申请后须在 5 分钟内使用，使用一次后失效，如过期可重新申请。

Article-Token 的使用方法可按照用户系统设计和应用场景设计。可以在用户业务服务器申请后访问 Herald-CMS 获取文章内容，也可由客户端从业务服务器获取然后由客户端直接访问 Herald-CMS

接口请求所需的 AppID 和 AppSecret 需从 Herald-CMS 接口设置页面添加。

为了安全起见，AppID 和 AppSecret 的设计初衷是由用户业务服务器管理，不应发送到客户端，所以申请 token 的请求应在业务服务器完成。

**接口URL**：/public-api/v1/article-token

**请求方法**：GET

| 参数名称        | 参数解释                                                     | 参数示例                                  |
| --------------- | ------------------------------------------------------------ | ----------------------------------------- |
| appId           | 从管理后台「接口设置」页面申请的 AppID                       | faba8f80-7015-44c9-a824-88bcdcbf0b8d      |
| articleCode     | 请求访问的文章代码                                           | 05CAA2AE                                  |
| signature       | 请求参数签名，见签名计算方法部分                             | 00944618919455adf……67ebdf99af9409fb4b161d |
| userIdentifier1 | （可选）用户身份标识字段1，由用户根据系统设计和应用场景设定，为统计接口预留使 | 213162317                                 |
| userIdentifier2 | （可选）用户身份标识字段2，由用户根据系统设计和应用场景设定，为统计接口预留使用 |                                           |
| userIdentifier3 | （可选）用户身份标识字段3，由用户根据系统设计和应用场景设定，为统计接口预留使用 |                                           |

**签名计算方法**

1.以query字符串方式组织字段，须保证顺序一致。可选参数若为空，也应出现字段名但内容为空

```js
let signatureSrc = `appId=${appId}&articleCode=${articleCode}&appSecret=${appSecret}&userIdentifier1=${userIdentifier1}&userIdentifier2=${userIdentifier2}&userIdentifier3=${userIdentifier3}`
```

例如：

```javascript
appId=faba8f80-7015-44c9-a824-88bcdcbf0b8d&articleCode=05CAA2AE&appSecret=6a28b2ac-5153-46ae-a987-aa9117220b40-16d6aafd-c5e0-4f18-850c-b129de0f1472&userIdentifier1=213162317&userIdentifier2=&userIdentifier3=
```

2.对 `signatureSrc` 进行 encodeURIComponent 编码

```js
signatureSrc = encodeURIComponent(signatureSrc)
```

3.对 URI 编码后的`signatureSrc`计算 sha256 哈希值

```javascript
let signature = sha256(signatureSrc) // 此处 sha256 方法需自行实现
```

**成功响应**：token字符串

**失败响应**：

| 错误代码 | 错误提示                    |
| -------- | --------------------------- |
| 10001    | appId不正确或已停用，请检查 |
| 10002    | 签名验证错误                |
| 10003    | 请求访问文章不存在          |



### 申请 Function-Token

Function-Token 作为业务服务器访问 Herald-CMS 功能接口的身份认证凭据

**有效性**：Function-Token 有效期为 6 个小时，申请新的 Function-Token 会使旧的 Function-Token 失效。

接口请求所需的 AppID 和 AppSecret 需从 Herald-CMS 接口设置页面添加。

为了安全起见，AppID 和 AppSecret 的设计初衷是由用户业务服务器管理，不应发送到客户端，所以申请 token 的请求应在业务服务器完成。

**接口URL**：/public-api/v1/function-token

**请求方法**：GET

| 参数名称  | 参数解释                               | 参数示例                                  |
| --------- | -------------------------------------- | ----------------------------------------- |
| appId     | 从管理后台「接口设置」页面申请的 AppID | faba8f80-7015-44c9-a824-88bcdcbf0b8d      |
| signature | 请求参数签名，见签名计算方法部分       | 00944618919455adf……67ebdf99af9409fb4b161d |

**签名计算方法**

1.以query字符串方式组织字段，须保证顺序一致。可选参数若为空，也应出现字段名但内容为空

```js
let signatureSrc = `appId=${appId}&appSecret=${appSecret}`
```

例如：

```javascript
appId=faba8f80-7015-44c9-a824-88bcdcbf0b8d&appSecret=6a28b2ac-5153-46ae-a987-aa9117220b40-16d6aafd-c5e0-4f18-850c-b129de0f1472
```

2.对 `signatureSrc` 进行 encodeURIComponent 编码

```js
signatureSrc = encodeURIComponent(signatureSrc)
```

3.对 URI 编码后的`signatureSrc`计算 sha256 哈希值

```javascript
let signature = sha256(signatureSrc) // 此处 sha256 方法需自行实现
```

**成功响应**：token字符串

**失败响应**：

| 错误代码 | 错误提示                    |      |
| -------- | --------------------------- | ---- |
| 10001    | appId不正确或已停用，请检查 |      |
| 10002    | 签名验证错误                |      |



