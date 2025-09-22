import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 模板类型枚举
const TEMPLATE_TYPES = {
  'TEXT_TO_IMAGE': 'TEXT_TO_IMAGE',
  'SINGLE_IMAGE_GENERATION': 'SINGLE_IMAGE_GENERATION', 
  'MULTI_IMAGE_GENERATION': 'MULTI_IMAGE_GENERATION'
} as const

type TemplateType = keyof typeof TEMPLATE_TYPES

// 支持的图片格式
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase 配置缺失' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 解析表单数据
    const formData = await request.formData()
    const name = formData.get('name') as string
    const prompt = formData.get('prompt') as string
    const type = formData.get('type') as string
    const imageFile = formData.get('image') as File

    // 验证必需字段
    if (!name || !prompt || !type || !imageFile) {
      return NextResponse.json(
        { error: '缺少必需字段: name, prompt, type, image' },
        { status: 400 }
      )
    }

    // 验证模板类型
    if (!Object.values(TEMPLATE_TYPES).includes(type as TemplateType)) {
      return NextResponse.json(
        { error: `无效的模板类型。有效类型: ${Object.values(TEMPLATE_TYPES).join(', ')}` },
        { status: 400 }
      )
    }

    // 验证图片文件
    if (!SUPPORTED_IMAGE_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { error: `不支持的图片格式。支持格式: ${SUPPORTED_IMAGE_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `图片文件过大。最大支持: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `templates/${timestamp}_${Math.random().toString(36).substring(2)}.${fileExt}`

    // 上传图片到 Supabase Storage
    const imageBuffer = await imageFile.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('templates')
      .upload(fileName, imageBuffer, {
        contentType: imageFile.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('图片上传失败:', uploadError)
      return NextResponse.json(
        { error: `图片上传失败: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // 获取图片公开 URL
    const { data: urlData } = supabase.storage
      .from('templates')
      .getPublicUrl(fileName)

    // 保存模板到数据库
    const { data: templateData, error: dbError } = await supabase
      .from('templates')
      .insert([{
        name: name.trim(),
        image_url: urlData.publicUrl,
        prompt: prompt.trim(),
        type: type,
        isvalid: true
      }])
      .select()

    if (dbError) {
      console.error('数据库保存失败:', dbError)
      
      // 如果数据库保存失败，尝试删除已上传的图片
      await supabase.storage
        .from('templates')
        .remove([fileName])
      
      return NextResponse.json(
        { error: `数据库保存失败: ${dbError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: templateData[0].id,
        name: templateData[0].name,
        image_url: templateData[0].image_url,
        prompt: templateData[0].prompt,
        type: templateData[0].type,
        created_at: templateData[0].created_at
      }
    })

  } catch (error) {
    console.error('模板上传错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 获取模板类型列表
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      types: Object.entries(TEMPLATE_TYPES).map(([key, value]) => ({
        key,
        value,
        label: key.replace(/_/g, ' ').toLowerCase()
      })),
      supportedImageTypes: SUPPORTED_IMAGE_TYPES,
      maxFileSize: MAX_FILE_SIZE
    }
  })
}
