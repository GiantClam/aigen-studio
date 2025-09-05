import { NextRequest, NextResponse } from 'next/server'
import { VertexAIService } from '@/services/vertex-ai'

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

export async function POST(request: NextRequest) {
  try {
    const { imageData, prompt = 'Analyze this image and describe what you see' } = await request.json()

    if (!imageData) {
      return NextResponse.json({
        success: false,
        error: 'imageData is required'
      }, { status: 400 })
    }

    // 初始化 Vertex AI 服务
    const vertexAI = new VertexAIService(getEnv())

    // 检查 Vertex AI 是否可用
    if (!vertexAI.isAvailable()) {
      return NextResponse.json({
        success: false,
        error: 'Vertex AI is not configured. Please set GOOGLE_CLOUD_PROJECT and GOOGLE_SERVICE_ACCOUNT_KEY environment variables.'
      }, { status: 500 })
    }

    console.log('Using Vertex AI Gemini for image analysis')
    
    const result = await vertexAI.analyzeImage(imageData, prompt)
    
    if (result.success) {
      return NextResponse.json({
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
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to analyze image with Vertex AI'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Image analysis error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
