import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 60 // ISR：1 分钟

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // 构建或运行时如未配置 ENV，返回空数据以保证不会阻断构建
    if (!url || !anon) {
      return NextResponse.json({ templates: [] }, { status: 200 })
    }

    const supabase = createClient(url, anon)

    const { data, error } = await supabase
      .from('templates')
      .select('id,name,image_url,prompt,type')
      .order('updated_at', { ascending: false })
      .limit(60)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ templates: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


