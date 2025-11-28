const path = require('path')

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
      '@nanocanvas': path.join(__dirname, 'src/external/nanocanvas')
    }

    // 优化模块解析
    config.resolve.modules = ['node_modules']

    // 修复 ChunkLoadError - 优化代码分割
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // 确保关键组件不被分割
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
            // 将 Next.js 相关代码保持在一起
            nextjs: {
              test: /[\\/]node_modules[\\/](next|react|react-dom)[\\/]/,
              name: 'nextjs',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      }
    }

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

  // 添加编译时配置来避免 ChunkLoadError
  compiler: {
    // 移除 console.log 在生产环境中
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 优化构建输出
  generateEtags: false,
  
  // 确保正确的文件哈希
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
}

module.exports = nextConfig
