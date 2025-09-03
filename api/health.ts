import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: 'vercel',
    service: 'ai-image-editor'
  })
}
