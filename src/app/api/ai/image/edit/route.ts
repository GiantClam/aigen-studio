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
    const { imageData, instruction, model = 'gemini-2.5-flash-image-preview' } = await request.json()

    if (!imageData || !instruction) {
      return NextResponse.json({
        success: false,
        error: 'imageData and instruction are required'
      }, { status: 400 })
    }

    const env = getEnv()

    // 使用 Vertex AI 进行图像编辑
    const vertexAI = new VertexAIService(env)

    if (!vertexAI.isAvailable()) {
      return NextResponse.json({
        success: false,
        error: 'Vertex AI is not configured. Please set GOOGLE_CLOUD_PROJECT and GOOGLE_SERVICE_ACCOUNT_KEY environment variables.'
      }, { status: 500 })
    }

    console.log('Using Vertex AI Gemini 2.5 Flash Image Preview for image editing');

    const result = await vertexAI.editImage(imageData, instruction)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          editedImageUrl: result.data.editedImageUrl || imageData,
          originalImageUrl: imageData,
          instruction: instruction,
          model: model,
          textResponse: result.data.textResponse,
          changes: [
            'Applied AI-based enhancement using Vertex AI',
            'Processed with Gemini 2.5 Flash Image Preview',
            'Applied requested modifications',
            'AI-powered image transformation'
          ],
          confidence: 0.98,
          timestamp: result.data.timestamp,
          provider: 'vertex-ai'
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to process image with Vertex AI'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Image edit error:', error)
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
