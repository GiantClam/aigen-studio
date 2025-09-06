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
    const {
      prompt,
      image,
      model = 'gemini-2.5-flash-002',
      width = 1024,
      height = 1024
    } = await request.json()

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'prompt is required'
      }, { status: 400 })
    }

    // 增强提示词
    const enhancedPrompt = `Create a high-quality image: ${prompt}. Style: professional, detailed, vibrant colors, good composition.`

    // 初始化 Vertex AI 服务 - 严格模式，不允许降级
    const vertexAI = new VertexAIService(getEnv())

    try {
      // 严格检查 Vertex AI 可用性，如果不可用会抛出错误
      vertexAI.isAvailable()
    } catch (error) {
      console.error('❌ Vertex AI not available:', error instanceof Error ? error.message : String(error))
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Vertex AI is not available'
      }, { status: 503 }) // 503 Service Unavailable
    }

    console.log('Using Vertex AI Gemini 2.5 Flash Image Preview for image generation')

    // 如果有图像输入，使用图像编辑功能
    const result = image
      ? await vertexAI.editImage(enhancedPrompt, image)
      : await vertexAI.generateImage(enhancedPrompt)
    
    if (result.success && result.data.generatedImageUrl) {
      return NextResponse.json({
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
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to generate image with Vertex AI'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Image generation error:', error)
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
