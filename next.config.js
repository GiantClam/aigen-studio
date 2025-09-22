/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用严格模式
  reactStrictMode: true,

  // 注意：Next.js 15 不再支持 api 配置
  // 请求体大小限制现在通过 Vercel 配置或中间件处理

  // 优化webpack配置
  webpack: (config, { dev, isServer }) => {
    // 处理Fabric.js的特殊需求
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    }

    // 确保模块解析正确
    config.resolve.alias = {
      ...config.resolve.alias,
    }

    // 优化模块解析
    config.resolve.modules = ['node_modules']

    return config
  },

  // 服务器外部包配置
  serverExternalPackages: ['fabric'],

  // 图片优化配置
  images: {
    domains: ['localhost'],
    unoptimized: true
  },

  // 输出文件跟踪根目录
  outputFileTracingRoot: __dirname,

  // 实验性功能
  experimental: {
    // 优化包导入
    optimizePackageImports: ['lucide-react'],
  },

  // 禁用有问题的开发工具 (修复 Next.js 15.5.2 的 devtools bug)
  devIndicators: {
    position: 'bottom-right',
  },
}

module.exports = nextConfig
