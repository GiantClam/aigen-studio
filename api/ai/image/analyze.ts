import type { VercelRequest, VercelResponse } from '@vercel/node'
import { VertexAIService } from '../../../src/services/vertex-ai.js'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: '.env.local' })

// 环境变量适配器
const getEnv = () => ({
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
  GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION || 'global',
  GOOGLE_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  JWT_SECRET: process.env.JWT_SECRET || '',
  REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
  // 添加 Cloudflare Workers 兼容的空对象
  AI: {} as any,
  DB: {} as any,
  STORAGE: {} as any,
  FILES: {} as any
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { imageData, prompt = 'Analyze this image and describe what you see' } = req.body

    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: 'imageData is required'
      })
    }

    // 初始化 Vertex AI 服务
    const vertexAI = new VertexAIService(getEnv())

    // 检查 Vertex AI 是否可用
    if (!vertexAI.isAvailable()) {
      return res.status(500).json({
        success: false,
        error: 'Vertex AI is not configured. Please set GOOGLE_CLOUD_PROJECT and GOOGLE_SERVICE_ACCOUNT_KEY environment variables.'
      })
    }

    console.log('Using Vertex AI Gemini for image analysis')
    
    const result = await vertexAI.analyzeImage(imageData, prompt)
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: {
          analysis: result.data.analysis,
          model: result.data.model,
          prompt: result.data.prompt,
          timestamp: result.data.timestamp,
          provider: 'vertex-ai'
        }
      })
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to analyze image with Vertex AI'
      })
    }
  } catch (error) {
    console.error('Image analysis error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
