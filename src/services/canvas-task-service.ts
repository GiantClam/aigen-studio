import { supabaseServer } from '@/lib/supabase-server'

export type CanvasTaskStatus = 'pending' | 'in_progress' | 'failed' | 'succeeded'

export async function createCanvasTask(canvasId: string, payload?: any) {
  const taskId = crypto.randomUUID()
  const { data, error } = await supabaseServer
    .from('nanobanana_canvas_task')
    .insert({ canvas_id: canvasId, task_id: taskId, status: 'in_progress', payload })
    .select('*')
    .single()
  if (error) {
    console.error('[canvas_task] create error', error)
    return { taskId, error }
  }
  return { taskId, data }
}

export async function updateCanvasTaskStatus(taskId: string, status: CanvasTaskStatus, statusCode?: string, payload?: any) {
  const { error } = await supabaseServer
    .from('nanobanana_canvas_task')
    .update({ status, status_code: statusCode, payload })
    .eq('task_id', taskId)
  if (error) {
    console.error('[canvas_task] update error', error)
  }
}


