# 👶 宝宝奖励计划 - uni-app 小程序版

## 📱 项目说明

这是宝宝奖励计划的微信小程序版本，基于 uni-app 开发。

## 🏗️ 技术栈

- **前端**: uni-app (Vue 3)
- **后端**: Next.js API (与 Web 版共用)
- **目标平台**: 微信小程序

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
# 微信小程序
npm run dev:mp-weixin

# H5 (浏览器测试)
npm run dev:h5
```

### 构建发布
```bash
# 微信小程序
npm run build:mp-weixin

# H5
npm run build:h5
```

## 📁 项目结构

```
baby-reward-uniapp/
├── src/
│   ├── pages/           # 页面
│   │   ├── index/       # 首页
│   │   ├── login/       # 登录
│   │   ├── history/     # 历史记录
│   │   └── requests/    # 审批
│   ├── components/      # 组件
│   ├── api/             # API 封装
│   ├── utils/           # 工具函数
│   ├── App.vue          # 应用配置
│   ├── main.js          # 入口文件
│   ├── manifest.json    # 应用配置
│   └── pages.json       # 页面配置
├── package.json
└── vite.config.js
```

## 🔧 配置

### 后端 API 地址
在 `src/utils/config.js` 中配置后端 API 地址。

### 小程序配置
在 `src/manifest.json` 中配置小程序 AppID 等信息。

## 📝 开发进度

- [x] 项目初始化
- [ ] API 封装
- [ ] 登录页面
- [ ] 首页
- [ ] 审批页面
- [ ] 历史记录页面
- [ ] 联调测试
- [ ] 提交审核

## 📚 相关文档

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [后端 API 文档](../baby-reward/README.md)
