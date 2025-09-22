# 🎨 AI Image Editor - AI 驱动的智能图像编辑器

AI Image Editor 是一个基于 Vercel 的现代化 AI 图像编辑平台，集成了 Google Vertex AI Gemini 2.5 Flash Image Preview 模型，为用户提供智能化的图像编辑、分析和生成体验。

<div align="center">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Vertex_AI-Gemini_2.5-blue?style=for-the-badge&logo=google" alt="Vertex AI" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Fabric.js-Canvas-red?style=for-the-badge" alt="Fabric.js" />
</div>

## ✨ 核心功能

### 🤖 Vertex AI 集成
- 集成 Google Vertex AI Gemini 2.5 Flash Image Preview 模型
- 支持图像编辑、分析和生成三大核心功能
- 严格模式配置，确保生产环境使用真实 AI 服务
- 智能错误处理和用户友好的配置指导

### 🖼️ AI 图像处理
- **图像编辑**: AI 驱动的图像增强和修改
- **图像分析**: 智能图像内容分析和描述
- **图像生成**: 基于文本提示的图像创建
- 支持多种图像格式和高质量输出

### 🎨 专业画布编辑器
- 基于 Fabric.js 的高性能画布引擎
- 支持多选对象、框选、拖拽等交互操作
- 智能图片尺寸适配，保持原始比例
- 丰富的编辑工具和图层管理

### 💬 AI 聊天助手
- 右侧浮动 AI 聊天面板
- 支持图像上传和 AI 分析
- 实时对话和智能建议
- 多语言支持（中英文）

### 🔒 严格模式配置
- 要求正确配置 Vertex AI 环境变量
- 未配置时直接报错，不使用模拟模式
- 确保生产环境使用真实 AI 服务
- 友好的错误提示和配置指导

## 🚀 技术架构

- **后端**: Vercel Serverless Functions + API Routes
- **前端**: 原生 TypeScript + Fabric.js
- **AI 服务**: Google Vertex AI Gemini 2.5 Flash Image Preview
- **画布引擎**: Fabric.js
- **部署平台**: Vercel

## 📦 快速开始

### 环境配置

1. 克隆项目：
```bash
git clone https://github.com/your-username/image-editor.git
cd image-editor
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
创建 `.env.local` 文件：

**必需的 Vertex AI 配置**:
```bash
GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id
GOOGLE_CLOUD_LOCATION=global
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
JWT_SECRET=your-jwt-secret-key
```

**可选配置**:
```bash
REPLICATE_API_TOKEN=your-replicate-api-token
```

4. 运行开发服务器：
```bash
npm run dev
```

5. 访问应用：
```
http://localhost:3000/standard-editor
```

> **⚠️ 重要提示**: 项目采用严格模式，必须正确配置 Vertex AI 环境变量才能使用 AI 功能。未配置时会显示配置错误信息。

### 部署

#### Vercel 部署
```bash
# 首次部署
vercel

# 生产部署
npm run deploy
```

## 🔧 配置说明

### Vertex AI 配置（必需）

项目使用 Google Vertex AI Gemini 2.5 Flash Image Preview 模型。配置步骤：

1. **创建 Google Cloud 项目**
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)
   - 创建新项目或选择现有项目
   - 启用 Vertex AI API

2. **创建服务账号**
   - 在 IAM & Admin > Service Accounts 中创建服务账号
   - 分配以下权限：
     - `Vertex AI User`
     - `AI Platform Developer`
   - 下载服务账号密钥 JSON 文件

3. **配置环境变量**
   ```bash
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_CLOUD_LOCATION=global
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   ```

### Vercel 环境变量配置

在 Vercel 项目设置中配置环境变量：

1. 进入 Vercel Dashboard
2. 选择项目 > Settings > Environment Variables
3. 添加以下变量：
   - `GOOGLE_CLOUD_PROJECT`
   - `GOOGLE_CLOUD_LOCATION`
   - `GOOGLE_SERVICE_ACCOUNT_KEY`
   - `JWT_SECRET`

### 环境变量总表（生产必看）

必填：

- `NEXT_PUBLIC_SUPABASE_URL`（Supabase 项目 URL）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`（Supabase 匿名公钥）
- `SUPABASE_SERVICE_ROLE_KEY`（Supabase Service Role 密钥，仅服务端）
- `NEXTAUTH_SECRET`（next-auth 会话密钥）
- `JWT_SECRET`（后端签名密钥）
- `GOOGLE_CLOUD_PROJECT`（GCP 项目 ID）
- `GOOGLE_CLOUD_LOCATION`（如 `us-central1` 或 `global`）
- `GOOGLE_SERVICE_ACCOUNT_KEY`（服务账号 JSON 字符串，推荐）

可选：

- `GITHUB_ID`、`GITHUB_SECRET`（GitHub 登录）
- `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`（Google 登录）
- `REPLICATE_API_TOKEN`（如启用 Replicate）
- `HTTP_PROXY`、`HTTPS_PROXY`、`NO_PROXY`（如需代理）

### 可选服务

- **Replicate API**: 用于额外的图像生成功能（可选）

## 🧱 权限与积分（摘要）

- 角色字段：`users.role`（`admin` | `user`），新用户默认为 `user`
- 管理页访问：仅 `admin` 可访问 `/admin/*`
- 积分规则：
  - 新注册赠送 100 分
  - 每日首次登录 +10 分
  - 每次 AI 生图 -5 分（临时定价）

## 📦 模板上传（摘要）

- 支持模板的名称、提示词、封面图、类型
- 提供管理页面与上传端点 `/api/templates/upload`
- 存储走 Supabase（无 Cloudflare R2 依赖）

## 📚 API 文档

### 图像编辑 API

#### POST `/api/ai/image/edit`
AI 图像编辑和增强

**请求体**:
```json
{
  "imageData": "data:image/jpeg;base64,...",
  "instruction": "Make this image brighter and more colorful",
  "model": "gemini-2.5-flash-image-preview"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "editedImageUrl": "data:image/jpeg;base64,...",
    "textResponse": "AI 处理说明",
    "provider": "vertex-ai",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🚑 常见错误与解决

- 413 Payload Too Large：
  - 前端：导出 JPEG、降低质量、限制倍率、启用智能压缩
  - 后端：限制并校验请求体大小，超限返回 413
  - 提供直传/流式上传端点，避免 Base64 过大

- 环境变量缺失：
  - 严格模式会直接报错，请按“环境变量总表”补齐

## 🚀 部署到 Vercel（快速）

1. 连接 GitHub 仓库并导入 Vercel
2. 在 Project → Settings → Environment Variables 配置“环境变量总表”中的必填项
3. 点击 Deploy，或在本地 `vercel`/`npm run deploy`

### 图像分析 API

#### POST `/api/ai/image/analyze`
AI 图像内容分析

**请求体**:
```json
{
  "imageData": "data:image/jpeg;base64,...",
  "prompt": "Describe this image in detail"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "analysis": "详细的图像分析结果",
    "provider": "vertex-ai",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 图像生成 API

#### POST `/api/ai/image/generate`
基于文本提示生成图像

**请求体**:
```json
{
  "prompt": "A beautiful sunset over mountains",
  "model": "gemini-2.5-flash-image-preview",
  "width": 1024,
  "height": 1024
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "data:image/jpeg;base64,...",
    "provider": "vertex-ai",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🎯 使用场景

- **图像编辑**: AI 驱动的图像增强、修复和优化
- **内容分析**: 智能图像内容识别和描述
- **创意生成**: 基于文本描述生成原创图像
- **设计工作流**: 集成到设计流程中的 AI 助手
- **教育培训**: AI 图像处理技术学习和实践
- **原型开发**: 快速验证图像处理想法

## 🎮 功能演示

### 基本操作流程

1. **打开编辑器**: 访问 `/standard-editor` 页面
2. **上传图像**: 点击上传按钮或拖拽图像到画布
3. **AI 分析**: 右侧聊天面板会自动分析图像内容
4. **编辑操作**:
   - 使用画布工具进行基本编辑
   - 通过 AI 聊天进行智能编辑
   - 多选对象进行批量操作
5. **AI 增强**: 点击 AI 增强按钮应用智能优化
6. **保存结果**: 导出编辑后的图像

### 画布操作

- **选择**: 单击选择对象，Ctrl+点击多选
- **移动**: 拖拽对象到新位置
- **缩放**: 拖拽角落控制点调整大小
- **框选**: 按住鼠标拖拽框选多个对象
- **删除**: 选中对象后按 Delete 键

### AI 聊天功能

- **图像上传**: 直接拖拽图像到聊天框
- **智能分析**: AI 自动分析图像内容和特征
- **编辑建议**: 获取专业的图像编辑建议
- **实时对话**: 与 AI 进行自然语言交互

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/AmazingFeature`
3. 提交更改: `git commit -m 'Add some AmazingFeature'`
4. 推送到分支: `git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🧪 测试

运行测试脚本验证 Vertex AI 集成：

```bash
node test-vertex-ai.js
```

预期输出（未配置时）：
```
❌ Image Edit API Error: Vertex AI is not configured. Please set GOOGLE_CLOUD_PROJECT and GOOGLE_SERVICE_ACCOUNT_KEY environment variables.
```

## 🚨 故障排除

### 常见问题

1. **Vertex AI 未配置错误**
   - 确保设置了 `GOOGLE_CLOUD_PROJECT` 环境变量
   - 确保设置了 `GOOGLE_SERVICE_ACCOUNT_KEY` 环境变量
   - 验证服务账号有足够的权限

2. **图像上传失败**
   - 检查图像格式是否支持（JPEG, PNG, WebP）
   - 确认图像大小不超过限制

3. **画布操作问题**
   - 刷新页面重新加载画布
   - 检查浏览器控制台错误信息

## 🔗 相关链接

- [Google Vertex AI 文档](https://cloud.google.com/vertex-ai/docs)
- [Vercel Serverless Functions 文档](https://vercel.com/docs/functions)
- [Fabric.js 文档](http://fabricjs.com/)
- [Vercel API Routes 文档](https://vercel.com/docs/functions/serverless-functions)
- [Vercel 部署文档](https://vercel.com/docs)
