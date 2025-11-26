import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing canvas id' }, { status: 400 })
    }
    const body = await request.json()
    const canvasJson = body?.canvasJson
    if (!canvasJson) {
      return NextResponse.json({ success: false, error: 'Missing canvasJson' }, { status: 400 })
    }

    const { error } = await supabaseServer
      .from('nanobanana_user_canvas')
      .update({ canvas_json: canvasJson, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('[canvas.save] update error', error)
      return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[canvas.save] exception', e)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}


