# 云端部署指南

本项目已清理所有代理相关代码，适合直接在云端服务器上部署和测试。

## 🚀 推荐的云端部署平台

### 1. Vercel (推荐)

**优势**:
- 与Next.js完美集成
- 自动HTTPS
- 全球CDN
- 简单的环境变量配置

**部署步骤**:
```bash
# 安装Vercel CLI
npm install -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel --prod
```

**环境变量配置**:
在Vercel Dashboard中设置：
- `GOOGLE_CLOUD_PROJECT`: 你的Google Cloud项目ID
- `GOOGLE_SERVICE_ACCOUNT_KEY`: 服务账号密钥JSON字符串
- `GOOGLE_CLOUD_LOCATION`: global
- `JWT_SECRET`: 随机字符串

### 2. Railway

**优势**:
- 支持多种语言和框架
- 简单的Git集成
- 内置数据库支持

**部署步骤**:
```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录Railway
railway login

# 初始化项目
railway init

# 部署
railway up
```

### 3. Netlify

**优势**:
- 静态站点优化
- 表单处理
- 边缘函数支持

**部署步骤**:
```bash
# 构建项目
npm run build

# 上传到Netlify
# 或连接GitHub仓库自动部署
```

### 4. Google Cloud Run

**优势**:
- 与Google Cloud服务深度集成
- 按需付费
- 自动扩缩容

**部署步骤**:
```bash
# 构建Docker镜像
docker build -t gcr.io/[PROJECT-ID]/image-editor .

# 推送到Container Registry
docker push gcr.io/[PROJECT-ID]/image-editor

# 部署到Cloud Run
gcloud run deploy --image gcr.io/[PROJECT-ID]/image-editor
```

## 📋 环境变量配置

无论选择哪个平台，都需要配置以下环境变量：

```bash
# Google Cloud配置
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=global
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# 应用配置
JWT_SECRET=your-random-secret-string
```

## 🔧 本地测试

在部署前，可以在本地测试：

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 文件

# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 📊 性能优化

### 1. 图像优化
- 使用Next.js Image组件
- 启用图像压缩
- 配置适当的缓存策略

### 2. API优化
- 实现请求缓存
- 添加速率限制
- 优化响应大小

### 3. 监控和日志
- 配置错误监控（如Sentry）
- 设置性能监控
- 启用访问日志

## 🛡️ 安全配置

### 1. 环境变量安全
- 不要在代码中硬编码密钥
- 使用平台的环境变量管理
- 定期轮换密钥

### 2. API安全
- 实现身份验证
- 添加CORS配置
- 设置请求限制

### 3. 网络安全
- 启用HTTPS
- 配置安全头
- 实现CSP策略

## 🧪 测试部署

部署后测试以下功能：

1. **基础功能**:
   - 页面加载
   - 工具栏交互
   - 画布操作

2. **AI功能**:
   - 图像生成
   - 图像编辑
   - 错误处理

3. **性能测试**:
   - 页面加载速度
   - API响应时间
   - 图像处理速度

## 📞 故障排除

### 常见问题

1. **Google Cloud认证失败**:
   - 检查服务账号密钥格式
   - 验证项目ID正确性
   - 确认API已启用

2. **构建失败**:
   - 检查Node.js版本兼容性
   - 验证依赖安装完整
   - 查看构建日志

3. **运行时错误**:
   - 检查环境变量配置
   - 查看服务器日志
   - 验证网络连接

### 调试技巧

- 启用详细日志
- 使用浏览器开发者工具
- 检查网络请求
- 监控服务器资源使用

## 📈 扩展建议

1. **数据库集成**: 添加用户数据存储
2. **文件存储**: 集成云存储服务
3. **用户认证**: 实现用户登录系统
4. **API限制**: 添加使用配额管理
5. **多语言**: 支持国际化
