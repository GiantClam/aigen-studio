import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Client } from 'pg'

export const revalidate = 3600 // ISR：1小时

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
      .from('nanobanana_template_categories')
      .select('id,name,description,icon,color,order_index')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      try {
        const conn = process.env.POSTGRES_PRISMA_URL
        if (!conn) {
          return NextResponse.json([], { status: 200 })
        }
        const pg = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } })
        await pg.connect()
        const rs = await pg.query(
          'select id,name,description,icon,color,order_index from nanobanana_template_categories where is_active = true order by order_index asc'
        )
        await pg.end()
        return NextResponse.json(rs.rows || [])
      } catch (e) {
        console.error('PG error:', e)
        return NextResponse.json([], { status: 200 })
      }
    }

    return NextResponse.json(data || [])
  } catch (e: any) {
    console.error('API error:', e)
    try {
      const conn = process.env.POSTGRES_PRISMA_URL
      if (!conn) {
        return NextResponse.json([], { status: 200 })
      }
      const pg = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } })
      await pg.connect()
      const rs = await pg.query(
        'select id,name,description,icon,color,order_index from nanobanana_template_categories where is_active = true order by order_index asc'
      )
      await pg.end()
      return NextResponse.json(rs.rows || [])
    } catch (ee) {
      console.error('PG error:', ee)
      return NextResponse.json([], { status: 200 })
    }
  }
}
