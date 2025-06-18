# AI Gen Studio - AI 驱动的创意生成工作室 部署文档

## 🚀 项目概述

AI Gen Studio 是一个基于 Cloudflare Workers 的现代化 AI 图像生成平台，使用现代技术栈：

- **前端**: React + TypeScript + TanStack Router + Tailwind CSS + Radix UI
- **后端**: Hono 框架 + Cloudflare Workers
- **绘图**: TLDraw + Excalidraw
- **编辑器**: MDX Editor
- **存储**: Cloudflare R2 + D1 Database + KV Storage
- **AI**: Cloudflare Workers AI

## 🌐 访问地址

- **主域名**: https://your-domain.com
- **Worker 域名**: https://aigen-studio.your-account.workers.dev

## 📁 项目结构

```
aigen-studio/
├── src/                    # Worker 后端代码
│   ├── worker.ts          # 主 Worker 文件
│   ├── routes/            # API 路由
│   │   ├── ai.ts         # AI 聊天路由
│   │   ├── auth.ts       # 认证路由
│   │   ├── content.ts    # 内容管理路由
│   │   ├── storage.ts    # 存储路由
│   │   ├── files.ts      # 文件管理路由
│   │   └── upload.ts     # 静态文件上传路由
│   └── types/
│       └── env.ts        # 类型定义
├── react/                 # React 前端项目
│   ├── src/              # React 源代码
│   ├── dist/             # 构建产物
│   ├── package.json      # 前端依赖
│   └── vite.config.ts    # Vite 配置
├── scripts/               # 部署脚本
│   ├── deploy-with-assets.cjs  # 资产上传脚本
│   ├── upload-to-r2.cjs       # R2 上传脚本
│   └── upload-static.js       # 静态文件上传脚本
├── wrangler.jsonc        # Cloudflare Workers 配置
└── package.json          # 项目配置
```

## 🔧 配置说明

### Cloudflare Workers 配置 (wrangler.jsonc)

```json
{
  "name": "jazz",
  "main": "src/worker.ts",
  "compatibility_date": "2025-04-01",
  "compatibility_flags": ["nodejs_compat"],
  "vars": {
    "JWT_SECRET": "your-jwt-secret-key-here"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "jaaz-db",
      "database_id": "6f48fe53-0e03-46ca-908f-f15fd7e0c791"
    }
  ],
  "r2_buckets": [
    {
      "binding": "STORAGE",
      "bucket_name": "jaaz-storage"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "fcf3eedfe33b44519d0903ff8e318c50"
    }
  ],
  "ai": {
    "binding": "AI"
  }
}
```

### 绑定说明

- **DB**: D1 数据库，用于存储应用数据
- **STORAGE**: R2 存储桶，用于存储静态文件和用户文件
- **CACHE**: KV 命名空间，用于缓存
- **AI**: Cloudflare Workers AI，用于智能聊天功能

## 🚀 部署流程

### 1. 常规部署 (仅 Worker)

```bash
npm run build     # 构建 TypeScript
npm run deploy    # 部署 Worker
```

### 2. 完整部署 (包含静态资源)

```bash
npm run deploy-full
```

该命令会：
1. 构建 Worker 代码 (`npm run build`)
2. 部署 Worker (`npm run deploy`)
3. 上传 React 静态资源到 R2 (`node scripts/deploy-with-assets.cjs`)

### 3. 手动上传静态资源

如果需要单独上传静态资源：

```bash
# 先构建 React 应用
cd react && npm run build && cd ..

# 上传到 R2
node scripts/deploy-with-assets.cjs
```

## 🔄 静态文件服务

应用使用 R2 存储来提供静态文件服务：

1. **静态文件路径**: `/assets/*`, `/unicorn.png`, `/favicon.ico`
2. **存储位置**: R2 bucket 中的 `static/` 前缀
3. **缓存策略**: 86400 秒 (24小时)
4. **SPA 回退**: 未找到的路由会返回 `index.html`

### 静态文件上传 API

- **单文件上传**: `POST /api/upload/static`
- **批量上传**: `POST /api/upload/static/batch`
- **文件列表**: `GET /api/upload/static/list`

## 🔗 API 端点

### 核心 API

- **健康检查**: `GET /health`
- **AI 聊天**: `POST /api/ai/chat`
- **文件管理**: 
  - `GET /api/read_file`
  - `POST /api/update_file`
  - `POST /api/rename_file`
  - `GET /api/list`
- **发布**: `POST /api/publish`

### 存储管理

- **静态文件**: `/api/upload/static/*`
- **存储服务**: `/api/storage/*`

## 🎯 功能特性

### ✅ 已实现

1. **💬 智能聊天** - 基于 Cloudflare AI
2. **📝 文件编辑** - 支持多种格式
3. **☁️ 云端存储** - R2 + D1 + KV
4. **🔄 实时同步** - 多设备数据同步
5. **🌐 静态文件服务** - R2 存储 + CDN

### 🚧 待完善

1. **🎨 画布绘制** - TLDraw/Excalidraw 集成
2. **📱 多平台发布** - 社交媒体发布
3. **🔐 用户认证** - 完整的用户系统
4. **📊 数据分析** - 使用统计和分析

## 📊 部署状态

- **状态**: ✅ 成功部署
- **Worker URL**: https://aigen-studio.your-account.workers.dev
- **自定义域名**: https://your-domain.com
- **最新版本**: 查看 Cloudflare Dashboard

## 🛠️ 开发环境

### 本地开发

```bash
npm run dev    # 启动本地开发服务器
```

### 环境变量

在 `.dev.vars` 文件中配置本地环境变量：

```
JWT_SECRET=your-local-jwt-secret
```

## 📝 注意事项

1. **Node.js 版本**: 云端构建使用 Node.js 20+，本地开发建议使用 20+
2. **模块系统**: 项目使用 ES 模块，脚本文件使用 `.cjs` 扩展名
3. **静态文件**: 每次部署后需要重新上传静态资源
4. **缓存**: 静态文件有 24 小时缓存，更新后可能需要等待或强制刷新

## 🔧 故障排除

### 常见问题

1. **404 错误**: 检查静态文件是否已上传到 R2
2. **API 不可用**: 检查 Worker 部署状态
3. **样式不加载**: 检查 CSS 文件的 Content-Type
4. **路由问题**: 确认 SPA 回退逻辑工作正常

### 调试命令

```bash
# 检查 R2 中的文件
curl https://your-domain.com/api/upload/static/list

# 检查健康状态
curl https://your-domain.com/health

# 检查静态文件
curl -I https://your-domain.com/assets/index-[hash].css
``` 