import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateSlug } from '@/lib/slug-utils'

export const revalidate = 60 // ISR：1 分钟

export async function GET(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // 构建或运行时如未配置 ENV，返回空数据以保证不会阻断构建
    if (!url || !anon) {
      return NextResponse.json([])
    }

    const supabase = createClient(url, anon)
    
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    let query = supabase
      .from('nanobanana_templates')
      .select(`
        id,
        name,
        slug,
        image_url,
        prompt,
        type,
        description,
        category_id,
        tags,
        difficulty_level,
        estimated_time,
        parameters,
        preview_images,
        is_featured,
        is_premium,
        usage_count,
        rating,
        rating_count,
        author_name,
        created_at,
        updated_at
      `)
      .eq('isvalid', true)

    // 应用过滤器
    if (category) {
      query = query.eq('category_id', category)
    }
    
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }
    
    if (type) {
      query = query.eq('type', type)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,prompt.ilike.%${search}%,tags.cs.{${search}}`)
    }

    // 排序
    if (featured === 'true') {
      query = query.order('rating', { ascending: false })
    } else {
      query = query.order('updated_at', { ascending: false })
    }

    // 限制数量
    query = query.limit(limit)

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json([], { status: 200 }) // 返回空数组而不是错误
    }

    return NextResponse.json(data || [])
  } catch (e: any) {
    console.error('API error:', e)
    return NextResponse.json([], { status: 200 }) // 返回空数组而不是错误
  }
}

export async function POST(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anon) {
      return NextResponse.json({ error: '配置错误' }, { status: 500 })
    }

    const supabase = createClient(url, anon)
    const body = await request.json()
    
    // 验证必要字段
    if (!body.name || !body.image_url || !body.prompt || !body.type) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 })
    }

    const templateData = {
      name: body.name,
      image_url: body.image_url,
      prompt: body.prompt,
      type: body.type,
      description: body.description || '',
      category_id: body.category_id || null,
      tags: body.tags || [],
      difficulty_level: body.difficulty_level || 'beginner',
      estimated_time: body.estimated_time || 15,
      parameters: body.parameters || {},
      preview_images: body.preview_images || [],
      is_featured: body.is_featured || false,
      is_premium: body.is_premium || false,
      author_name: body.author_name || 'AI设计师',
      slug: generateSlug(body.name || ''),
      isvalid: true
    }

    const { data, error } = await supabase
      .from('nanobanana_templates')
      .insert(templateData)
      .select()
      .single()

    if (error) {
      console.error('创建模板失败:', error)
      return NextResponse.json({ error: '创建模板失败' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    console.error('API error:', e)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
