import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, model, imageUrl, imageDataBase64, canvasId, folder = 'videos' } = body
    const taskId = crypto.randomUUID()
    const payload = { prompt, model, imageUrl, imageDataBase64, folder }
    const { error } = await supabaseServer
      .from('nanobanana_canvas_task')
      .insert({ canvas_id: canvasId || null, task_id: taskId, status: 'pending', payload })
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    console.log('[video.jobs] created', { taskId, hasImageUrl: !!imageUrl, hasBase64: !!imageDataBase64, model })
    return NextResponse.json({ success: true, data: { taskId } })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal error' }, { status: 500 })
  }
}
