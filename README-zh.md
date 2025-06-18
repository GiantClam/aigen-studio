# 🎨 AI Gen Studio - AI 驱动的创意生成工作室

AI Gen Studio 是一个基于 Cloudflare Workers 的现代化 AI 图像生成平台，集成了先进的 CoT（思维链）推理技术和 FLUX 模型，为用户提供智能化的创意生成体验。

<div align="center">
  <img src="https://img.shields.io/badge/Cloudflare-Workers-orange?style=for-the-badge&logo=cloudflare" alt="Cloudflare Workers" />
  <img src="https://img.shields.io/badge/AI-FLUX-blue?style=for-the-badge" alt="FLUX AI" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</div>

---

## ✨ 核心功能

### 🧠 智能 CoT 推理
- 使用 Chain of Thought（思维链）技术分析用户输入
- 自动解析用户意图和需求
- 生成高质量的英文图像生成提示
- 智能优化和增强用户描述

### 🖼️ AI 图像生成
- 集成 Replicate FLUX 模型，生成高质量图像
- 支持多种图像风格和主题
- 实时图像生成状态监控
- 无缝画布集成，直接展示生成结果

### 🎨 现代化画布界面
- 基于 TLDraw 的交互式画布
- 支持图像编辑和创意工具
- 响应式设计，适配各种设备
- 直观的用户界面和操作体验

### 💬 智能对话系统
- AI 驱动的聊天界面
- 支持文本和图像生成混合对话
- 实时状态反馈和进度显示
- 智能关键词检测和任务路由

---

## 🚀 技术特性

- **无服务器架构**: 基于 Cloudflare Workers，全球部署
- **现代化前端**: React + TypeScript 构建
- **AI 服务集成**: Cloudflare AI Gateway + Replicate FLUX
- **数据存储**: Cloudflare D1 + R2 + KV 存储
- **画布引擎**: TLDraw 提供流畅的创意体验

---

## 📦 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn
- Cloudflare 账号
- Replicate API 密钥

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/aigen-studio.git
cd aigen-studio
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
复制 `wrangler.jsonc` 并配置：
```json
{
  "vars": {
    "REPLICATE_API_TOKEN": "你的-replicate-api-token",
    "JWT_SECRET": "你的-jwt-密钥"
  }
}
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **部署到生产环境**
```bash
npm run deploy
```

---

## 🔧 详细配置

### Replicate API 配置
1. 访问 [Replicate](https://replicate.com/) 并注册账号
2. 在个人设置中生成 API 令牌
3. 将令牌配置到 `wrangler.jsonc` 中

### Cloudflare 服务配置
项目使用以下 Cloudflare 服务：

- **D1 数据库**: 存储用户数据和会话信息
- **R2 存储**: 存储生成的图像和文件
- **KV 存储**: 缓存和临时数据存储
- **AI Gateway**: 统一管理 AI 服务调用

---

## 📚 使用指南

### 基本使用流程

1. **启动应用**: 访问部署的 URL 或本地开发地址
2. **输入描述**: 在聊天界面输入你想要生成的图像描述
3. **CoT 分析**: 系统会自动分析你的输入并优化提示词
4. **图像生成**: 调用 FLUX 模型生成图像
5. **画布展示**: 生成的图像会自动显示在画布上

### 关键功能

- **智能提示词优化**: 系统会自动将中文描述转换为优化的英文提示
- **实时状态监控**: 可以实时查看图像生成进度
- **画布集成**: 生成的图像直接展示在交互式画布上
- **聊天历史**: 保存对话历史和生成记录

---

## 🎯 使用场景

### 创意设计师
- 快速生成设计概念和灵感
- 创建原型和草图
- 探索不同的视觉风格

### 内容创作者
- 为文章和博客生成配图
- 创建社交媒体素材
- 制作演示文稿图像

### 教育工作者
- 创建教学材料和图表
- 可视化复杂概念
- 生成案例研究图像

### 个人用户
- 创意表达和艺术创作
- 个人项目和爱好
- 学习 AI 技术应用

---

## 🛠️ 开发指南

### 项目结构
```
aigen-studio/
├── src/
│   ├── worker.ts          # 主入口文件
│   ├── routes/            # API 路由
│   │   └── ai.ts         # AI 相关 API
│   ├── frontend/         # 前端页面生成
│   └── types/            # 类型定义
├── server/               # Python 后端服务
└── docs/                 # 文档
```

### 开发环境设置
1. 安装依赖: `npm install`
2. 启动开发服务器: `npm run dev`
3. 构建项目: `npm run build`
4. 部署项目: `npm run deploy`

### API 接口

#### 图像生成 API
- **POST** `/api/ai/generate-image`
- **GET** `/api/ai/image-status/:id`
- **POST** `/api/ai/chat-image`

详细的 API 文档请参考源代码中的注释。

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. **Fork 项目**
2. **创建功能分支**: `git checkout -b feature/AmazingFeature`
3. **提交更改**: `git commit -m 'Add some AmazingFeature'`
4. **推送到分支**: `git push origin feature/AmazingFeature`
5. **提交 Pull Request**

### 贡献类型

- 🐛 Bug 修复
- ✨ 新功能开发
- 📝 文档改进
- 🎨 UI/UX 优化
- 🔧 性能优化

---

## 📄 许可证

本项目采用 MIT 许可证。查看 [LICENSE](LICENSE) 文件了解更多详情。

---

## 🔗 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Replicate API 文档](https://replicate.com/docs)
- [TLDraw 官方文档](https://tldraw.dev/)
- [Hono 框架文档](https://hono.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

---

## 📞 联系我们

如果你有任何问题或建议，欢迎：

- 提交 [Issue](https://github.com/your-username/aigen-studio/issues)
- 发起 [Discussion](https://github.com/your-username/aigen-studio/discussions)
- 通过邮件联系我们

---

**AI Gen Studio** - 让创意无限可能 🚀
