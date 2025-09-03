import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateIndexPage } from '../src/frontend/pages.js'

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

  // 返回首页内容
  try {
    const env = {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      API_BASE_URL: process.env.API_BASE_URL || '/api'
    }

    const html = generateIndexPage(undefined, env)

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.status(200).send(html)
  } catch (error) {
    console.error('Error generating index page:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
