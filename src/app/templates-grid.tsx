import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

type TemplateItem = {
  id: string
  name: string
  image_url: string
  prompt: string
  type: 'SINGLE_IMAGE_GENERATION' | 'MULTI_IMAGE_GENERATION' | 'TEXT_TO_IMAGE'
}

async function fetchTemplates(): Promise<TemplateItem[]> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined
    if (!url || !anon) return []

    const supabase = createClient(url, anon)
    const { data, error } = await supabase
      .from('templates')
      .select('id,name,image_url,prompt,type')
      .order('updated_at', { ascending: false })
      .limit(60)
    if (error) return []
    return (data as any) || []
  } catch {
    // 网络/SSL等异常时，返回空数组以保证页面渲染
    return []
  }
}

function typeBadge(type: TemplateItem['type']) {
  const map = {
    SINGLE_IMAGE_GENERATION: { label: 'Single-image', cls: 'bg-blue-100 text-blue-700' },
    MULTI_IMAGE_GENERATION: { label: 'Multi-image', cls: 'bg-emerald-100 text-emerald-700' },
    TEXT_TO_IMAGE: { label: 'Text-to-image', cls: 'bg-indigo-100 text-indigo-700' },
  } as const
  return map[type] || map.TEXT_TO_IMAGE
}

export default async function TemplatesGrid() {
  const templates = await fetchTemplates()
  if (!templates?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center bg-white">
        <div className="text-5xl mb-4">🗂️</div>
        <h4 className="text-lg font-semibold text-gray-900">No templates yet</h4>
        <p className="mt-2 text-sm text-gray-600">Seed templates or check Supabase configuration.</p>
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>1) Ensure env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
          <p>2) Seed: npm run seed:templates</p>
          <p>3) Supabase RLS: allow anon select on table public.templates</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => {
        const badge = typeBadge(t.type)
        return (
          <div key={t.id} className="group bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all border border-gray-100">
            <div className="relative h-44">
              {/* 使用原生 img 以避免远程域名未配置 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.image_url} alt={t.name} className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 line-clamp-1">{t.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{t.prompt}</p>
              <div className="mt-4 flex items-center justify-between">
                <button className="text-sm text-indigo-600 hover:text-indigo-700">Use Template</button>
                <button className="text-sm text-gray-600 hover:text-gray-800">View Prompt</button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}


