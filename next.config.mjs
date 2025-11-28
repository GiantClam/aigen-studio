const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['google-auth-library'],
  outputFileTracingRoot: process.cwd(),
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      '@nanocanvas': path.join(process.cwd(), 'src/external/nanocanvas')
    }
    return config
  },
  env: {
    GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
    GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION,
    GOOGLE_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ]
  }
}

export default nextConfig
