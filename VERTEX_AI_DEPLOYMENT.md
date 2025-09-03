# Vertex AI Gemini 2.5 Flash Image Preview 集成部署指南

本文档说明如何将集成了 Vertex AI Gemini 2.5 Flash Image Preview 模型的图像编辑器部署到 Vercel。

## 🚀 功能特性

- ✅ **Vertex AI 集成**: 使用 Google Vertex AI 的 Gemini 2.5 Flash Image Preview 模型
- ✅ **图像编辑**: AI 驱动的图像编辑和增强
- ✅ **图像分析**: 智能图像内容分析和描述
- ✅ **图像生成**: 基于文本提示的图像生成（如果模型支持）
- ✅ **流式响应**: 支持流式处理，实时获取结果
- ✅ **严格模式**: 要求正确配置 Vertex AI，未配置时直接报错
- ✅ **Vercel 兼容**: 完全支持在 Vercel 上部署
- ✅ **多选对象支持**: 正确处理画布中多个选中对象的图像生成
- ✅ **智能图片尺寸**: 上传图片按原始比例显示，大图自动适配
- ✅ **框选功能**: 支持鼠标拖拽框选多个对象

## 📋 环境变量配置

### 必需的环境变量

```bash
# Google Cloud / Vertex AI 配置（必需）
GOOGLE_CLOUD_PROJECT=zippy-aurora-444204-q2
GOOGLE_CLOUD_LOCATION=global

# 服务账号认证（必需）
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# 其他配置
JWT_SECRET=your-jwt-secret-key-here
REPLICATE_API_TOKEN=your-replicate-api-token-here
```

**重要**: 所有 Google Cloud 环境变量都是必需的。如果未正确配置，API 将返回错误而不是使用模拟模式。

### Vercel 环境变量设置

1. 在 Vercel 项目设置中添加环境变量：
   - `GOOGLE_CLOUD_PROJECT`: `zippy-aurora-444204-q2`
   - `GOOGLE_CLOUD_LOCATION`: `global`
   - `GOOGLE_SERVICE_ACCOUNT_KEY`: 完整的服务账号密钥 JSON 字符串

2. 对于服务账号密钥，建议使用 Vercel 的加密环境变量功能

## 🔧 本地开发设置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```bash
GOOGLE_CLOUD_PROJECT=zippy-aurora-444204-q2
GOOGLE_CLOUD_LOCATION=global
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
JWT_SECRET=your-jwt-secret-key
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问应用

```
http://localhost:3000/image-editor
```

## 🌐 API 端点

### 图像编辑
```http
POST /api/ai/image/edit
Content-Type: application/json

{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "instruction": "Add some chocolate drizzle to the croissants",
  "model": "gemini-2.5-flash-image-preview"
}
```

### 图像分析
```http
POST /api/ai/image/analyze
Content-Type: application/json

{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "prompt": "Describe this image in detail"
}
```

### 图像生成
```http
POST /api/ai/image/generate
Content-Type: application/json

{
  "prompt": "A beautiful sunset over mountains",
  "model": "gemini-2.5-flash-image-preview",
  "width": 1024,
  "height": 1024
}
```

## 🔐 Google Cloud 认证设置

### 方法 1: 服务账号密钥（推荐）

1. 在 Google Cloud Console 中创建服务账号
2. 为服务账号分配必要的权限：
   - `Vertex AI User`
   - `AI Platform Developer`
3. 下载服务账号密钥 JSON 文件
4. 将 JSON 内容设置为 `GOOGLE_SERVICE_ACCOUNT_KEY` 环境变量

### 方法 2: 应用默认凭据（本地开发）

```bash
gcloud auth application-default login
```

## 📦 部署到 Vercel

### 1. 准备部署

确保所有文件都已提交到 Git 仓库：

```bash
git add .
git commit -m "Add Vertex AI Gemini 2.5 Flash Image Preview integration"
git push
```

### 2. Vercel 部署

```bash
# 安装 Vercel CLI（如果尚未安装）
npm i -g vercel

# 首次部署
vercel

# 生产部署
npm run deploy
```

### 3. 配置环境变量

在 Vercel Dashboard 中设置环境变量：

1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加所需的环境变量
4. 重新部署项目

## 🧪 测试集成

### 1. 健康检查

```bash
curl https://your-app.vercel.app/api/health
```

### 2. 测试图像编辑

```bash
curl -X POST https://your-app.vercel.app/api/ai/image/edit \
  -H "Content-Type: application/json" \
  -d '{
    "imageData": "data:image/jpeg;base64,...",
    "instruction": "Make the image brighter"
  }'
```

## 🔍 故障排除

### 常见问题

1. **认证失败**
   - 检查 `GOOGLE_CLOUD_PROJECT` 是否正确
   - 验证服务账号密钥格式
   - 确认服务账号有足够权限

2. **模型不可用**
   - 确认项目已启用 Vertex AI API
   - 检查区域设置是否正确
   - 验证模型名称拼写

3. **部署失败**
   - 检查依赖是否正确安装
   - 验证环境变量设置
   - 查看 Vercel 部署日志

### 调试模式

启用详细日志：

```javascript
console.log('Vertex AI Status:', vertexAI.isAvailable());
```

## 📊 性能优化

### 1. 缓存策略

- 对相同请求实施缓存
- 使用 CDN 缓存生成的图像

### 2. 错误处理

- 实施重试机制
- 优雅降级到模拟模式

### 3. 监控

- 添加请求日志
- 监控 API 使用量和成本

## 🔒 安全考虑

1. **API 密钥保护**
   - 使用环境变量存储敏感信息
   - 定期轮换服务账号密钥

2. **请求验证**
   - 实施请求大小限制
   - 添加速率限制

3. **内容过滤**
   - 启用安全设置
   - 过滤不当内容

## 📈 扩展功能

### 未来增强

- [ ] 批量图像处理
- [ ] 自定义模型微调
- [ ] 多语言支持
- [ ] 实时协作编辑

### 集成其他服务

- [ ] Cloudflare R2 存储
- [ ] Redis 缓存
- [ ] WebSocket 实时更新

## 📞 支持

如有问题，请查看：

1. [Google Vertex AI 文档](https://cloud.google.com/vertex-ai/docs)
2. [Vercel 部署指南](https://vercel.com/docs)
3. [项目 GitHub Issues](https://github.com/your-repo/issues)

---

**注意**: 确保在生产环境中正确配置所有安全设置和环境变量。
