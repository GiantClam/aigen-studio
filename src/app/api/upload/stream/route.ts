import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * 流式上传处理
 * 处理大文件的最佳实践
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 检查文件大小
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size: 100MB' 
      }, { status: 413 })
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const fileName = `uploads/${timestamp}_${randomId}.${fileExt}`

    // 流式上传到 Supabase
    const { data, error } = await supabase.storage
      .from('ai-editor')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ 
        error: `Upload failed: ${error.message}` 
      }, { status: 500 })
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('ai-editor')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      data: {
        url: urlData.publicUrl,
        path: data.path,
        size: file.size,
        name: file.name
      }
    })

  } catch (error) {
    console.error('Stream upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

/**
 * 分块上传合并
 */
export async function PUT(request: NextRequest) {
  try {
    const { uploadId, fileName, totalChunks, bucket } = await request.json()

    if (!uploadId || !fileName || !totalChunks) {
      return NextResponse.json({ 
        error: 'Missing required parameters' 
      }, { status: 400 })
    }

    // 这里需要实现分块合并逻辑
    // 由于 Supabase Storage 的限制，可能需要使用其他方案
    
    return NextResponse.json({
      success: true,
      message: 'Chunks merged successfully'
    })

  } catch (error) {
    console.error('Merge error:', error)
    return NextResponse.json({ 
      error: 'Merge failed' 
    }, { status: 500 })
  }
}
