# Vercel 部署指南

## 🚀 快速部署

### 1. 准备工作

确保你有以下信息：
- Google Cloud 项目 ID
- Google Cloud 服务账号密钥 JSON
- Vercel 账号

### 2. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```bash
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=global
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 3. 部署方式

#### 方式一：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署
./deploy.sh
```

#### 方式二：GitHub 集成

1. 将代码推送到 GitHub
2. 在 Vercel 中连接 GitHub 仓库
3. 配置环境变量
4. 自动部署

### 4. 验证部署

部署成功后，访问以下端点验证：

- `/` - 首页
- `/image-editor` - 图像编辑器
- `/api/health` - 健康检查
- `/api/ai/image/generate` - AI 图像生成
- `/api/ai/image/edit` - AI 图像编辑

## 🔧 故障排除

### 常见问题

1. **构建失败**
   - 检查 TypeScript 错误
   - 确保所有依赖已安装

2. **API 调用失败**
   - 检查环境变量是否正确设置
   - 验证 Google Cloud 服务账号权限

3. **图像处理错误**
   - 确保 Vertex AI API 已启用
   - 检查配额和限制

### 调试步骤

1. 查看 Vercel 函数日志
2. 检查浏览器控制台错误
3. 验证 API 响应

## 📝 注意事项

- Vercel 函数有 30 秒超时限制
- 图像大小建议控制在 5MB 以内
- 确保 Google Cloud 配额充足

## 🎯 性能优化

- 启用图像压缩
- 使用 CDN 缓存静态资源
- 优化 API 响应时间
