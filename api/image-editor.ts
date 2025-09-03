import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateImageEditorPage } from '../src/frontend/image-editor-ui.js'

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

  // 设置 HTML 内容类型
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  
  // 返回图像编辑器 HTML
  res.status(200).send(generateImageEditorPage())
}
