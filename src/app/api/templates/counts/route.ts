import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 60 // ISR: 1 minute

export async function GET(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anon) {
      return NextResponse.json({
        all: 0,
        'single-image': 0,
        'multi-image': 0,
        'text-to-image': 0
      })
    }

    const supabase = createClient(url, anon)

    // We can't easily do a single query for multiple counts with Supabase client directly 
    // without writing raw SQL or multiple queries.
    // Multiple queries is safer and easier to maintain.
    
    // 1. Get total count
    const allPromise = supabase
      .from('nanobanana_templates')
      .select('*', { count: 'exact', head: true })
      .eq('isvalid', true)

    // 2. Get single-image count
    const singlePromise = supabase
      .from('nanobanana_templates')
      .select('*', { count: 'exact', head: true })
      .eq('isvalid', true)
      .eq('type', 'single-image')

    // 3. Get multi-image count
    const multiPromise = supabase
      .from('nanobanana_templates')
      .select('*', { count: 'exact', head: true })
      .eq('isvalid', true)
      .eq('type', 'multi-image')

    // 4. Get text-to-image count
    const textPromise = supabase
      .from('nanobanana_templates')
      .select('*', { count: 'exact', head: true })
      .eq('isvalid', true)
      .eq('type', 'text-to-image')

    const [allRes, singleRes, multiRes, textRes] = await Promise.all([
      allPromise,
      singlePromise,
      multiPromise,
      textPromise
    ])

    return NextResponse.json({
      all: allRes.count || 0,
      'single-image': singleRes.count || 0,
      'multi-image': multiRes.count || 0,
      'text-to-image': textRes.count || 0
    })

  } catch (e: any) {
    console.error('API error:', e)
    return NextResponse.json({
      all: 0,
      'single-image': 0,
      'multi-image': 0,
      'text-to-image': 0
    }, { status: 500 })
  }
}
