# 🔐 微信登录配置说明

## 前提条件

### 1. 微信小程序账号
- 已注册微信小程序账号
- 已获取小程序 AppID 和 AppSecret

### 2. 服务器要求
- HTTPS 域名（用于生产环境）
- 域名已在小程序后台配置为合法域名

---

## 后端配置（baby-reward API）

### 1. 添加环境变量

在 `.env` 文件中添加：

```env
# 微信小程序配置
WECHAT_MINIAPP_ID=wx_xxxxxxxxxxxxxxxx
WECHAT_MINIAPP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. 获取微信 AppID 和 AppSecret

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入小程序管理后台
3. 开发 → 开发管理 → 开发设置
4. 复制 **开发者 ID**（AppID）和 **AppSecret**

### 3. 配置服务器域名

1. 微信公众平台 → 开发管理 → 开发设置
2. 服务器域名 → request 合法域名
3. 添加你的 API 域名（如：`https://api.yourdomain.com`）

---

## 小程序配置（baby-reward-uniapp）

### 1. 配置小程序 AppID

编辑 `src/manifest.json`（如果存在）或 `project.config.json`：

```json
{
  "mp-weixin": {
    "appid": "你的小程序 AppID",
    "setting": {
      "urlCheck": false  // 开发时关闭域名校验
    }
  }
}
```

### 2. 开发模式（无需配置）

开发环境下，后端会使用测试 openid（`test_openid_xxx`），可以直接测试登录流程。

### 3. 生产模式

需要：
1. 配置正确的 AppID 和 AppSecret
2. 部署到 HTTPS 域名
3. 在小程序后台配置合法域名

---

## 使用流程

### 首次登录（创建家庭）

1. 用户打开小程序
2. 点击 **"微信一键登录"**
3. 自动创建家庭，用户成为管理员
4. 获得家庭码，可以邀请家人

### 加入已有家庭

1. 家人发送邀请链接
2. 用户点击链接
3. 自动保存邀请信息
4. 点击 **"微信一键登录"**
5. 自动加入家庭（选择的角色：家长/儿童）

### 邀请家人

1. 管理员/家长进入 **"邀请家人"** 页面
2. 选择邀请角色（家长/儿童）
3. 点击 **"生成邀请链接"**
4. 分享给微信好友
5. 对方点击链接即可加入

---

## API 接口

### 微信登录
```
POST /api/auth/wechat-login
Body: {
  "code": "微信登录 code",
  "familyCode": "邀请码（可选）",
  "role": "parent|baby（可选）"
}
```

### 生成邀请
```
POST /api/invite/generate
Body: {
  "role": "parent|baby"
}
```

### 验证邀请
```
GET /api/invite/join?code=邀请码
```

### 确认加入
```
POST /api/invite/join?code=邀请码
Body: {
  "username": "用户名",
  "wechatOpenid": "微信 openid"
}
```

---

## 数据库变更

User 表新增字段：
- `wechatOpenid` (String, unique, optional) - 微信 openid

---

## 开发测试

### 本地测试（无需微信配置）

1. 后端不配置 `WECHAT_MINIAPP_ID` 和 `WECHAT_MINIAPP_SECRET`
2. 后端会使用测试 openid
3. 小程序调用 `wx.login()` 获取 code
4. 后端用 code 生成测试 openid：`test_openid_{code}`

### 注意事项

1. **开发环境**：可以使用测试 openid
2. **生产环境**：必须配置正确的 AppID 和 AppSecret
3. **域名配置**：生产环境必须使用 HTTPS
4. **用户隐私**：openid 是用户唯一标识，妥善保管

---

## 常见问题

### Q: 微信登录失败？
A: 检查：
1. AppID 和 AppSecret 是否正确
2. 域名是否已配置为合法域名
3. 是否使用 HTTPS

### Q: 邀请链接打不开？
A: 检查：
1. 链接是否过期（24 小时）
2. 域名是否可以访问
3. 小程序是否正确处理了 URL 参数

### Q: 如何重置测试数据？
A: 连接数据库，清空 User 和 Family 表：
```sql
DELETE FROM "DrawRecord";
DELETE FROM "DrawRequest";
DELETE FROM "Prize";
DELETE FROM "User";
DELETE FROM "Family";
```

---

## 下一步

- [ ] 配置生产环境 AppID 和 AppSecret
- [ ] 部署后端 API 到 HTTPS 域名
- [ ] 小程序提交审核
- [ ] 上线测试
