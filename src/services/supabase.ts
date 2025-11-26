import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // 在构建或运行时给出友好提示，但不抛错以便页面仍可渲染
  console.warn('[supabase] 缺少环境变量 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export { createClient }

export function getOrCreateAnonymousWorkspaceId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'anon_workspace_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export async function upsertWorkspaceForUser(userId: string | null) {
  if (!supabaseUrl || !supabaseAnonKey) return { data: null, error: null }
  const id = userId ?? getOrCreateAnonymousWorkspaceId()
  const { data, error } = await supabase
    .from('nanobanana_workspace')
    .upsert({ id, user_id: userId }, { onConflict: 'id' })
    .select()
    .single()
  return { data, error }
}


