import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 60 // ISR：1 分钟

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // 构建或运行时如未配置 ENV，返回空数据以保证不会阻断构建
    if (!url || !anon) {
      return NextResponse.json([])
    }

    const supabase = createClient(url, anon)

    const { data, error } = await supabase
      .from('templates')
      .select('id,name,image_url,prompt,type,updated_at')
      .eq('isvalid', true)
      .order('updated_at', { ascending: false })

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


