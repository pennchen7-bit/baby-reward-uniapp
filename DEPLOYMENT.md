# 📱 宝宝奖励计划 - 小程序部署指南

## 📋 准备工作

### 1. 注册微信小程序账号

1. 访问 https://mp.weixin.qq.com
2. 点击"立即注册"
3. 选择账号类型：
   - **个人** - 免费（功能受限，不能商业化）
   - **企业** - 300 元认证费（功能完整）
4. 填写信息并完成验证
5. 获取 **AppID**（开发 → 开发管理 → 开发设置）

### 2. 安装微信开发者工具

下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

- 选择对应系统版本（Mac/Windows）
- 安装后用微信扫码登录

### 3. 安装 Node.js

下载地址：https://nodejs.org

- 推荐安装 LTS 版本（18.x 或 20.x）
- 安装后运行 `node -v` 和 `npm -v` 验证

---

## 🚀 部署步骤

### 步骤 1：安装依赖

```bash
cd baby-reward-uniapp
npm install
```

### 步骤 2：配置小程序

编辑 `src/manifest.json`，填入你的小程序 AppID：

```json
{
  "mp-weixin": {
    "appid": "你的小程序 AppID",
    "setting": {
      "urlCheck": false
    }
  }
}
```

### 步骤 3：配置后端 API 地址

编辑 `src/utils/config.js`：

```javascript
// 开发环境（本地测试）
export const API_BASE_URL = 'http://localhost:3000/api';

// 生产环境（部署后）
export const API_BASE_URL = 'https://your-app.vercel.app/api';
```

### 步骤 4：运行开发模式

```bash
# 微信小程序
npm run dev:mp-weixin

# H5（浏览器测试）
npm run dev:h5
```

### 步骤 5：用微信开发者工具打开

1. 运行 `npm run dev:mp-weixin` 后，会输出编译后的路径
2. 打开微信开发者工具
3. 导入项目，选择编译输出目录（通常是 `dist/dev/mp-weixin`）
4. 在开发者工具中预览和调试

### 步骤 6：构建发布版本

```bash
npm run build:mp-weixin
```

构建完成后，用微信开发者工具打开 `dist/build/mp-weixin` 目录。

### 步骤 7：上传小程序代码

1. 在微信开发者工具中，点击右上角"上传"
2. 填写版本号和备注
3. 上传成功后，在微信公众平台可以看到审核版本

### 步骤 8：提交审核

1. 访问 https://mp.weixin.qq.com
2. 版本管理 → 选择刚上传的版本
3. 提交审核（通常 1-2 个工作日）
4. 审核通过后发布

---

## 🌐 后端部署（Vercel）

### 方法 1：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 进入后端项目目录
cd ../baby-reward

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

### 方法 2：使用 GitHub 自动部署

1. 将代码 push 到 GitHub
2. 访问 https://vercel.com
3. 导入 GitHub 仓库
4. 配置构建命令：`npm run build`
5. 输出目录：`.next`
6. 点击 Deploy

部署成功后会获得一个域名，如：`https://your-app.vercel.app`

然后更新小程序的 `API_BASE_URL` 配置。

---

## ⚠️ 注意事项

### 域名备案

- 如果后端服务器在国内，**必须备案**才能被小程序访问
- Vercel 的国外域名不需要备案，但国内访问速度较慢
- 建议使用腾讯云/阿里云服务器 + 备案

### HTTPS

- 小程序要求所有 API 必须是 HTTPS
- Vercel 自动提供 HTTPS 证书
- 自己的服务器需要配置 SSL 证书

### 域名白名单

在微信公众平台配置服务器域名：
1. 登录 https://mp.weixin.qq.com
2. 开发 → 开发管理 → 开发设置
3. 服务器域名 → 添加 request 合法域名
4. 填入你的后端 API 域名（如 `https://your-app.vercel.app`）

---

## 📊 项目结构说明

```
baby-reward-uniapp/
├── src/
│   ├── api/              # API 接口封装
│   │   └── index.js
│   ├── pages/            # 页面
│   │   ├── index/        # 首页
│   │   ├── login/        # 登录页
│   │   └── history/      # 历史记录
│   ├── utils/            # 工具函数
│   │   ├── config.js     # 配置文件
│   │   └── request.js    # 请求封装
│   ├── App.vue           # 应用入口
│   ├── main.js           # 入口文件
│   ├── manifest.json     # 应用配置
│   └── pages.json        # 页面配置
├── package.json
└── vite.config.js
```

---

## 🔧 常用命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev:mp-weixin    # 微信小程序
npm run dev:h5           # H5
npm run dev:mp-alipay    # 支付宝小程序

# 构建发布
npm run build:mp-weixin  # 微信小程序
npm run build:h5         # H5
```

---

## 📚 相关资源

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Vercel 部署文档](https://vercel.com/docs)
- [Next.js 部署](https://nextjs.org/docs/deployment)

---

## 🆘 遇到问题？

1. **编译错误** - 检查 Node.js 版本（推荐 18.x+）
2. **API 请求失败** - 检查域名配置和 HTTPS
3. **真机调试** - 需要在微信公众平台配置体验者
4. **审核不通过** - 检查小程序内容是否符合规范

---

**祝你部署顺利！🎉**
