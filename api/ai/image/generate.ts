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
    const { 
      prompt, 
      model = 'gemini-2.5-flash-image-preview',
      width = 1024,
      height = 1024
    } = req.body

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'prompt is required'
      })
    }

    // 增强提示词
    const enhancedPrompt = `Create a high-quality image: ${prompt}. Style: professional, detailed, vibrant colors, good composition.`

    // 初始化 Vertex AI 服务
    const vertexAI = new VertexAIService(getEnv())

    // 检查 Vertex AI 是否可用
    if (!vertexAI.isAvailable()) {
      return res.status(500).json({
        success: false,
        error: 'Vertex AI is not configured. Please set GOOGLE_CLOUD_PROJECT and GOOGLE_SERVICE_ACCOUNT_KEY environment variables.'
      })
    }

    console.log('Using Vertex AI Gemini 2.5 Flash Image Preview for image generation')
    
    const result = await vertexAI.generateImage(enhancedPrompt)
    
    if (result.success && result.data.generatedImageUrl) {
      return res.status(200).json({
        success: true,
        data: {
          imageUrl: result.data.generatedImageUrl,
          originalPrompt: prompt,
          enhancedPrompt: enhancedPrompt,
          model: model,
          dimensions: { width, height },
          textResponse: result.data.textResponse,
          timestamp: result.data.timestamp,
          provider: 'vertex-ai'
        }
      })
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate image with Vertex AI'
      })
    }
  } catch (error) {
    console.error('Image generation error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
