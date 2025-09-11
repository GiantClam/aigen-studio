import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/services/supabase'
import { generateSlug } from '@/lib/slug-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { slug } = await params

    // 获取所有模板
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
      .eq('isvalid', true)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      )
    }

    // 根据slug查找匹配的模板
    const matchedTemplate = templates?.find((template) => {
      const templateSlug = generateSlug(template.name)
      return templateSlug === slug
    })

    if (!matchedTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(matchedTemplate)
  } catch (error) {
    console.error('Error fetching template by slug:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
