# Google Auth 设置指南

## 1. 获取 Google Client ID

### 步骤 1: 创建 Google Cloud 项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API 和 Google Identity API

### 步骤 2: 配置 OAuth 2.0
1. 进入 "APIs & Services" > "Credentials"
2. 点击 "Create Credentials" > "OAuth 2.0 Client IDs"
3. 选择 "Web application"
4. 添加授权的 JavaScript 源：
   - `http://localhost:8787` (开发环境)
   - `https://your-domain.com` (生产环境)
5. 添加授权的重定向 URI：
   - `http://localhost:8787`
   - `https://your-domain.com`

### 步骤 3: 获取 Client ID
复制生成的 Client ID，格式类似：
```
123456789-abcdefghijklmnop.apps.googleusercontent.com
```

## 2. 配置环境变量

### Cloudflare Workers 部署
在 Cloudflare Workers 中设置环境变量：

```bash
# 使用 wrangler CLI
wrangler secret put GOOGLE_CLIENT_ID
# 然后输入你的 Google Client ID

# 或者在 Cloudflare Dashboard 中设置
# Workers & Pages > 你的项目 > Settings > Environment Variables
```

### 本地开发
在项目根目录创建 `.dev.vars` 文件：

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## 3. 验证配置

### 检查配置是否正确
1. 部署应用后访问首页
2. 点击 "Google 登录" 按钮
3. 应该弹出 Google 登录窗口
4. 登录成功后，界面应显示用户信息

### 常见问题排查

#### 问题 1: "Invalid client ID"
- 检查 Client ID 是否正确
- 确认域名已添加到授权列表

#### 问题 2: "Popup blocked"
- 确保浏览器允许弹窗
- 检查 HTTPS 配置

#### 问题 3: "Unauthorized domain"
- 在 Google Cloud Console 中添加当前域名
- 等待配置生效（可能需要几分钟）

## 4. 安全注意事项

1. **Client ID 不是秘密**: Client ID 可以在前端代码中暴露
2. **验证 JWT Token**: 在后端验证 Google 返回的 JWT token
3. **HTTPS 必需**: 生产环境必须使用 HTTPS
4. **域名限制**: 只允许授权的域名使用 Google Auth

## 5. 高级配置

### 自定义登录按钮
```javascript
// 自定义按钮样式和行为
google.accounts.id.renderButton(
  document.getElementById('google-signin-button'),
  {
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    logo_alignment: 'left'
  }
);
```

### 处理登录状态
```javascript
// 检查用户是否已登录
const user = localStorage.getItem('user');
if (user) {
  const userData = JSON.parse(user);
  // 更新 UI 显示用户信息
  updateUserInterface(userData);
}
```

## 6. 测试

### 本地测试
```bash
npm run dev
# 访问 http://localhost:8787
# 测试 Google 登录功能
```

### 生产测试
```bash
npm run build
npm run deploy
# 访问你的生产域名
# 测试完整的登录流程
```

---

**注意**: 请确保在生产环境中使用真实的 Google Client ID，并正确配置所有授权域名。
