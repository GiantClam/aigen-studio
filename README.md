# 🎨 AI Gen Studio - AI 驱动的创意生成工作室

AI Gen Studio 是一个基于 Cloudflare Workers 的现代化 AI 图像生成平台，集成了先进的 CoT（思维链）推理技术和 FLUX 模型，为用户提供智能化的创意生成体验。

<div align="center">
  <img src="https://img.shields.io/badge/Cloudflare-Workers-orange?style=for-the-badge&logo=cloudflare" alt="Cloudflare Workers" />
  <img src="https://img.shields.io/badge/AI-FLUX-blue?style=for-the-badge" alt="FLUX AI" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</div>

## ✨ 核心功能

### 🧠 智能 CoT 推理
- 使用 Chain of Thought（思维链）技术分析用户输入
- 自动优化和增强用户提示词
- 生成高质量的英文图像生成提示

### 🖼️ AI 图像生成
- 集成 Replicate FLUX 模型
- 支持实时图像生成状态监控
- 无缝画布集成，直接在画布上展示生成结果

### 🎨 现代化画布界面
- 基于 TLDraw 的交互式画布
- 支持多种创意工具和编辑功能
- 响应式设计，适配各种设备

### 💬 智能对话系统
- AI 驱动的聊天界面
- 支持文本和图像生成混合对话
- 实时状态反馈和进度显示

## 🚀 技术架构

- **后端**: Cloudflare Workers + Hono 框架
- **前端**: React + TypeScript
- **AI 服务**: Cloudflare AI Gateway + Replicate FLUX
- **数据存储**: Cloudflare D1 + R2 + KV
- **画布引擎**: TLDraw

## 📦 快速开始

### 环境配置

1. 克隆项目：
```bash
git clone https://github.com/your-username/aigen-studio.git
cd aigen-studio
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
复制 `wrangler.jsonc` 并填入你的 API 密钥：
- `REPLICATE_API_TOKEN`: Replicate API 令牌
- `JWT_SECRET`: JWT 密钥

4. 运行开发服务器：
```bash
npm run dev
```

### 部署

```bash
npm run deploy
```

## 🔧 配置说明

### Replicate API
项目使用 Replicate 平台的 FLUX 模型进行图像生成。你需要：

1. 在 [Replicate](https://replicate.com/) 注册账号
2. 获取 API 令牌
3. 在 `wrangler.jsonc` 中配置 `REPLICATE_API_TOKEN`

### Cloudflare 服务
项目依赖以下 Cloudflare 服务：

- **D1 数据库**: 存储用户数据和会话信息
- **R2 存储**: 存储生成的图像和文件
- **KV 存储**: 缓存和临时数据
- **AI Gateway**: AI 服务调用管理

## 📚 API 文档

### 图像生成 API

#### POST `/api/ai/generate-image`
生成 AI 图像

**请求体**:
```json
{
  "prompt": "用户输入的描述",
  "userId": "用户ID"
}
```

**响应**:
```json
{
  "success": true,
  "cotAnalysis": "CoT 分析结果",
  "optimizedPrompt": "优化后的提示词",
  "predictionId": "预测任务ID"
}
```

#### GET `/api/ai/image-status/:predictionId`
获取图像生成状态

**响应**:
```json
{
  "success": true,
  "status": "succeeded",
  "imageUrl": "生成的图像URL"
}
```

## 🎯 使用场景

- **创意设计**: 快速生成概念图和设计灵感
- **内容创作**: 为文章、博客生成配图
- **原型设计**: 快速可视化创意想法
- **教育培训**: AI 技术学习和实践

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/AmazingFeature`
3. 提交更改: `git commit -m 'Add some AmazingFeature'`
4. 推送到分支: `git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Replicate API 文档](https://replicate.com/docs)
- [TLDraw 文档](https://tldraw.dev/)
- [Hono 框架文档](https://hono.dev/)
