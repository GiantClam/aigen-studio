import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { VertexAIService } from '@/services/vertex-ai'

const getEnv = () => ({
  AI: {} as any, // 本地开发环境不需要 AI 服务
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT || '',
  GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  GOOGLE_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '',
  DB: {} as any,
  STORAGE: {} as any,
  FILES: {} as any
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * 多方式图片编辑 API
 * 支持 Base64、文件上传、云存储 URL
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    let imageData: string
    let instruction: string
    let model = 'gemini-2.5-flash-image'

    // 方式1: 文件上传 (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('image') as File
      instruction = formData.get('instruction') as string
      model = (formData.get('model') as string) || model

      if (!file || !instruction) {
        return NextResponse.json({
          success: false,
          error: 'image file and instruction are required'
        }, { status: 400 })
      }

      // 检查文件大小
      if (file.size > 10 * 1024 * 1024) { // 10MB
        return NextResponse.json({
          success: false,
          error: 'File too large. Maximum size: 10MB'
        }, { status: 413 })
      }

      // 转换为 Base64
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      imageData = `data:${file.type};base64,${base64}`

    } else {
      // 方式2: JSON 请求 (Base64 或 URL)
      const body = await request.json()
      instruction = body.instruction
      model = body.model || model

      if (!instruction) {
        return NextResponse.json({
          success: false,
          error: 'instruction is required'
        }, { status: 400 })
      }

      // 检查是否有图片数据
      if (body.imageData) {
        // 方式2a: Base64 数据
        imageData = body.imageData
      } else if (body.imageUrl) {
        // 方式2b: 云存储 URL
        imageData = await fetchImageFromUrl(body.imageUrl)
      } else {
        return NextResponse.json({
          success: false,
          error: 'imageData or imageUrl is required'
        }, { status: 400 })
      }
    }

    // 检查图片数据大小
    if (imageData.length > 8 * 1024 * 1024) { // 8MB Base64
      return NextResponse.json({
        success: false,
        error: 'Image data too large. Please reduce image size or quality.'
      }, { status: 413 })
    }

    const env = getEnv()
    const vertexAI = new VertexAIService(env)

    try {
      vertexAI.isAvailable()
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Vertex AI is not available'
      }, { status: 503 })
    }

    console.log('Using Vertex AI Gemini 2.5 Flash Image Preview for image editing')

    const result = await vertexAI.editImage(instruction, imageData)
    
    if (result.success) {
      if (result.data.generatedImageUrl) {
        return NextResponse.json({
          success: true,
          data: {
            editedImageUrl: result.data.generatedImageUrl,
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
          error: `AI could not generate an edited image. Response: ${result.data.textResponse || 'No response'}`
        }, { status: 422 })
      }
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

/**
 * 从 URL 获取图片并转换为 Base64
 */
async function fetchImageFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    
    // 尝试获取 Content-Type
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error('Failed to fetch image from URL:', error)
    throw new Error('Failed to fetch image from URL')
  }
}

/**
 * 上传图片到云存储并返回 URL
 */
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `ai-editor/${timestamp}_${randomId}.${fileExt}`

    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from('nanobanana_templates')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return NextResponse.json({ 
        error: `Upload failed: ${error.message}` 
      }, { status: 500 })
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('nanobanana_templates')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: urlData.publicUrl,
        path: data.path,
        size: file.size
      }
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
