# 🚀 AI Gen Studio - GitHub 部署指南

## 📋 部署前检查清单

✅ **已完成的工作**：
- [x] 项目重命名为 `aigen-studio`
- [x] 移除所有敏感信息（API tokens、域名等）
- [x] 更新所有文档和配置文件
- [x] 清理不必要的文件和资源
- [x] 添加完整的 MIT 许可证
- [x] 创建环境变量示例文件
- [x] 更新 .gitignore 保护敏感信息
- [x] 提交所有更改到 Git

## 🔄 GitHub 仓库创建步骤

### 1. 在 GitHub 上创建新仓库

1. 访问 [GitHub](https://github.com/) 并登录
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `aigen-studio`
   - **Description**: `AI Gen Studio - AI 驱动的创意生成工作室`
   - **Visibility**: Public（或 Private，根据需要）
   - **不要**勾选 "Add a README file"（我们已经有了）
   - **不要**勾选 "Add .gitignore"（我们已经有了）
   - **不要**勾选 "Choose a license"（我们已经有了）

### 2. 连接本地仓库到新的 GitHub 仓库

```bash
# 移除旧的远程仓库
git remote remove origin

# 添加新的远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/aigen-studio.git

# 推送到 GitHub
git push -u origin main
```

### 3. 验证部署

访问你的 GitHub 仓库页面，确认：
- [ ] 所有文件都已上传
- [ ] README.md 正确显示
- [ ] 许可证文件存在
- [ ] 没有敏感信息暴露

## 🔧 环境配置说明

### 用户需要配置的环境变量

在 `wrangler.jsonc` 中需要配置：

```json
{
  "vars": {
    "JWT_SECRET": "你的-jwt-密钥",
    "REPLICATE_API_TOKEN": "你的-replicate-api-token"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "aigen-studio-db",
      "database_id": "你的-数据库-id"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "你的-kv-命名空间-id"
    }
  ]
}
```

### Cloudflare 服务设置

用户需要在 Cloudflare Dashboard 中创建：

1. **D1 数据库**：
   - 名称：`aigen-studio-db`
   - 运行 `schema.sql` 初始化数据库

2. **R2 存储桶**：
   - 名称：`aigen-studio-storage`

3. **KV 命名空间**：
   - 名称：`aigen-studio-cache`

4. **AI 服务**：
   - 启用 Cloudflare AI 服务

## 📚 项目特色

### 🧠 智能 CoT 推理
- 使用 Chain of Thought 技术分析用户输入
- 自动优化提示词生成高质量图像

### 🖼️ FLUX 图像生成
- 集成 Replicate FLUX 模型
- 支持实时状态监控和进度显示

### 🎨 现代化界面
- 基于 TLDraw 的交互式画布
- 响应式设计，支持多设备

### 💬 智能对话系统
- AI 驱动的聊天界面
- 支持文本和图像生成混合对话

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/AmazingFeature`
3. 提交更改: `git commit -m 'Add some AmazingFeature'`
4. 推送到分支: `git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

**AI Gen Studio** - 让创意无限可能 🚀 