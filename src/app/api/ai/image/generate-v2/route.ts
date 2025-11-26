import { NextRequest, NextResponse } from 'next/server'
import { AIServiceFactory, AIProvider, ImageGenerationType } from '@/services/ai'
import { updateCanvasTaskStatus } from '@/services/canvas-task-service'

const getEnv = () => ({
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
  GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION || 'global',
  GOOGLE_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  JWT_SECRET: process.env.JWT_SECRET || '',
  NANOBANANA_API_KEY: process.env.NANOBANANA_API_KEY,
  NANOBANANA_ENDPOINT: process.env.NANOBANANA_ENDPOINT,
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
      type = ImageGenerationType.TEXT_TO_IMAGE,
      provider = AIProvider.GEMINI,
      images = [],
      maskData,
      parameters = {},
      metadata = {}
    } = body

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 })
    }

    const env = getEnv()
    AIServiceFactory.initialize(env)

    const service = AIServiceFactory.getService(provider)

    if (!service.isAvailable()) {
      const availableProviders = AIServiceFactory.getAvailableProviders()
      return NextResponse.json({
        success: false,
        error: `${provider} is not available. Available providers: ${availableProviders.join(', ') || 'none'}`,
        availableProviders
      }, { status: 503 })
    }

    const { taskId } = metadata

    if (taskId) {
      await updateCanvasTaskStatus(taskId, 'in_progress')
    }

    let result
    if (type === ImageGenerationType.IMAGE_EDIT) {
      result = await service.editImage({
        type,
        prompt,
        images,
        maskData,
        parameters,
        metadata
      })
    } else {
      result = await service.generateImage({
        type,
        prompt,
        images,
        parameters,
        metadata
      })
    }

    if (result.success) {
      if (taskId) {
        await updateCanvasTaskStatus(taskId, 'succeeded')
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        provider: result.provider
      })
    } else {
      if (taskId) {
        await updateCanvasTaskStatus(taskId, 'failed', 'GENERATION_ERROR')
      }

      return NextResponse.json({
        success: false,
        error: result.error || 'Image generation failed',
        provider: result.provider
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const env = getEnv()
    AIServiceFactory.initialize(env)

    const availableProviders = AIServiceFactory.getAvailableProviders()

    return NextResponse.json({
      success: true,
      data: {
        providers: availableProviders,
        supportedTypes: Object.values(ImageGenerationType)
      }
    })
  } catch (error) {
    console.error('Get providers error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}
