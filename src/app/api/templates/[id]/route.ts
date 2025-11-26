import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase 配置缺失' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase
      .from('nanobanana_templates')
      .select('*')
      .eq('id', id)
      .eq('isvalid', true)
      .single()

    if (error) {
      return NextResponse.json({ error: '模板不存在' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('获取模板失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase 配置缺失' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 先获取模板信息，以便删除关联的图片
    const { data: template, error: fetchError } = await supabase
      .from('nanobanana_templates')
      .select('image_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: '模板不存在' }, { status: 404 })
    }

    // 删除数据库记录
    const { error: deleteError } = await supabase
      .from('nanobanana_templates')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: '删除失败' }, { status: 500 })
    }

    // 尝试删除存储中的图片（可选，因为图片可能被其他模板使用）
    if (template.image_url) {
      try {
        const fileName = template.image_url.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('nanobanana_templates')
            .remove([`templates/${fileName}`])
        }
      } catch (storageError) {
        console.warn('删除存储图片失败:', storageError)
        // 不抛出错误，因为数据库记录已经删除
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除模板失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}