import { supabase } from '@/services/supabase'

export interface WorkspaceRecord {
  id: string
  user_id: string | null
  title: string | null
  created_at: string
  updated_at: string
}

export interface UserCanvasRecord {
  id: string
  user_id: string | null
  workspace_id: string | null
  canvas_title: string | null
  canvas_json: any | null
  created_at: string
  updated_at: string
}

export type CanvasTaskRow = {
  id: string
  canvas_id: string
  task_id: string
  status: 'pending' | 'in_progress' | 'failed' | 'succeeded'
  status_code: string | null
  created_at: string
}

export async function getOrCreateWorkspaceForUser(userId: string): Promise<WorkspaceRecord | null> {
  // 查找用户已有 workspace
  const { data: existing, error: qErr } = await supabase
    .from('nanobanana_workspace')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()
  if (qErr) {
    console.warn('[workspace] query error', qErr)
  }
  if (existing) return existing as WorkspaceRecord

  // 创建新的 workspace
  const { data: created, error: cErr } = await supabase
    .from('nanobanana_workspace')
    .insert({ user_id: userId, title: '我的工作区' })
    .select('*')
    .single()
  if (cErr) {
    console.error('[workspace] create error', cErr)
    return null
  }
  return created as WorkspaceRecord
}

export async function listUserCanvases(userId: string): Promise<UserCanvasRecord[]> {
  const { data, error } = await supabase
    .from('nanobanana_user_canvas')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) {
    console.warn('[canvas] list error', error)
    return []
  }
  return (data || []) as UserCanvasRecord[]
}

export async function fetchLastTaskStatusByCanvasIds(canvasIds: string[]): Promise<Record<string, CanvasTaskRow | undefined>> {
  if (canvasIds.length === 0) return {}
  const { data, error } = await supabase
    .from('nanobanana_canvas_task')
    .select('*')
    .in('canvas_id', canvasIds)
    .order('created_at', { ascending: false })
  if (error) {
    console.warn('[task] query error', error)
    return {}
  }
  const map: Record<string, CanvasTaskRow | undefined> = {}
  for (const row of (data || []) as CanvasTaskRow[]) {
    if (!map[row.canvas_id]) map[row.canvas_id] = row
  }
  return map
}

export async function createCanvasForUser(params: {
  userId: string
  title: string
  type: string
}): Promise<UserCanvasRecord | null> {
  const ws = await getOrCreateWorkspaceForUser(params.userId)
  if (!ws) return null
  const { data, error } = await supabase
    .from('nanobanana_user_canvas')
    .insert({
      user_id: params.userId,
      workspace_id: ws.id,
      canvas_title: params.title,
      canvas_json: { type: params.type, objects: [] },
    })
    .select('*')
    .single()
  if (error) {
    console.error('[canvas] create error', error)
    return null
  }
  return data as UserCanvasRecord
}

export async function updateCanvasTitle(canvasId: string, title: string): Promise<boolean> {
  const { error } = await supabase
    .from('nanobanana_user_canvas')
    .update({ canvas_title: title })
    .eq('id', canvasId)
  if (error) {
    console.error('[canvas] rename error', error)
    return false
  }
  return true
}

export async function deleteCanvas(canvasId: string): Promise<boolean> {
  const { error } = await supabase
    .from('nanobanana_user_canvas')
    .delete()
    .eq('id', canvasId)
  if (error) {
    console.error('[canvas] delete error', error)
    return false
  }
  return true
}


