#!/bin/bash

echo "🚀 开始部署到 Vercel..."

# 检查环境变量
if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
  echo "❌ 错误: GOOGLE_CLOUD_PROJECT 环境变量未设置"
  echo "请在 Vercel 项目设置中添加以下环境变量:"
  echo "- GOOGLE_CLOUD_PROJECT"
  echo "- GOOGLE_CLOUD_LOCATION"
  echo "- GOOGLE_SERVICE_ACCOUNT_KEY"
  exit 1
fi

# 检查是否安装了必要的依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ 构建成功！"

  # 部署到 Vercel
  echo "🌐 部署到 Vercel..."
  npx vercel --prod

  echo "✅ 部署完成！"
else
  echo "❌ 构建失败，请检查错误信息"
  exit 1
fi
