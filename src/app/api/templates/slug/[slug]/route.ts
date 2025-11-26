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

    const { data: bySlug, error: slugError } = await supabase
      .from('nanobanana_templates')
      .select('*')
      .eq('slug', slug)
      .eq('isvalid', true)
      .limit(1)

    if (slugError) {
      console.error('Supabase error:', slugError)
      return NextResponse.json(
        { error: 'Failed to fetch template' },
        { status: 500 }
      )
    }

    if (bySlug && bySlug.length > 0) {
      return NextResponse.json(bySlug[0])
    }

    const { data: templates, error } = await supabase
      .from('nanobanana_templates')
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

    const matchedTemplate = templates?.find((template) => generateSlug(template.name) === slug)

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
