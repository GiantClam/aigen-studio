import { NextRequest, NextResponse } from 'next/server'
import { VertexAIService } from '@/services/vertex-ai'
import { createCanvasTask, updateCanvasTaskStatus } from '@/services/canvas-task-service'

export const runtime = 'nodejs'

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
    const body = await request.json()
    const {
      prompt,
      image,
      imageUrl,
      model = 'gemini-2.5-flash-image',
      width = 1024,
      height = 1024,
      canvasId
    } = body

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
    let taskId: string | undefined
    if (canvasId) {
      const t = await createCanvasTask(canvasId, { type: image ? 'edit' : 'generate', prompt })
      taskId = t.taskId
    }

    // If imageUrl provided, fetch and convert to data URL for edit
    let inputForEdit: string | undefined = image
    if (!inputForEdit && imageUrl && typeof imageUrl === 'string') {
      try {
        const res = await fetch(imageUrl)
        if (!res.ok) throw new Error(`Fetch imageUrl failed: ${res.status} ${res.statusText}`)
        const ct = res.headers.get('content-type') || 'image/png'
        const buf = Buffer.from(await res.arrayBuffer())
        const b64 = buf.toString('base64')
        inputForEdit = `data:${ct};base64,${b64}`
      } catch (e) {
        console.warn('Failed to fetch imageUrl, will try generate without edit:', e instanceof Error ? e.message : String(e))
      }
    }

    const result = inputForEdit
      ? await vertexAI.editImage(inputForEdit, enhancedPrompt, model)
      : await vertexAI.generateImage(enhancedPrompt, model)
    
    console.log('Vertex AI result:', result)

    if (result.success && result.data) {
      // 检查不同的可能字段名
      const imageUrl = result.data.imageUrl || result.data.generatedImageUrl

      if (imageUrl) {
        if (taskId) await updateCanvasTaskStatus(taskId, 'succeeded')
        return NextResponse.json({
          success: true,
          data: {
            imageUrl: imageUrl,
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
        console.error('No image URL found in result:', result.data)
        if (taskId) await updateCanvasTaskStatus(taskId, 'failed', 'NO_IMAGE')
        return NextResponse.json({
          success: false,
          error: 'No image generated - missing image URL in response'
        }, { status: 422 })
      }
    } else {
      console.error('Vertex AI generation failed:', result)
      if (taskId) await updateCanvasTaskStatus(taskId, 'failed', 'PROVIDER_ERROR')
      const msg = String(result.error || '')
      const isUnauthorized = msg.includes('401') || msg.toLowerCase().includes('unauthorized')
      const isUnavailable = msg.toLowerCase().includes('not available')
      const status = isUnauthorized ? 401 : (isUnavailable ? 503 : 500)
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to generate image with Vertex AI'
      }, { status })
    }
  } catch (error) {
    console.error('Image generation error:', error)
    // 无法获得 taskId 时忽略状态更新
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
