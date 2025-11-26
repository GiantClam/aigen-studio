'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/services/supabase'
import TemplateCard from '@/components/templates/TemplateCard'

type TemplateItem = {
  id: string
  name: string
  slug?: string
  image_url: string
  prompt: string
  type: 'single-image' | 'multi-image' | 'text-to-image'
  created_at: string
  updated_at: string
}

export default function TemplatesGrid() {
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
        
        if (!supabaseUrl || !supabaseAnonKey) {
          console.warn('[TemplatesGrid] Supabase environment variables not configured')
          setTemplates([])
          setLoading(false)
          return
        }
        
        // 使用单例 supabase 客户端，避免创建多个 GoTrueClient 实例
        const { data, error } = await supabase
          .from('nanobanana_templates')
          .select('id,name,slug,image_url,prompt,type,created_at,updated_at')
          .eq('isvalid', true)
          .order('updated_at', { ascending: false })
          .limit(8)
        
        if (error) {
          // 详细记录错误信息
          const errorInfo = {
            message: error.message || 'Unknown error',
            details: error.details || null,
            hint: error.hint || null,
            code: error.code || null,
          }
          console.error('[TemplatesGrid] Supabase query error:', errorInfo)
          console.error('[TemplatesGrid] Full error object:', error)
          setTemplates([])
        } else {
          setTemplates(data || [])
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorStack = error instanceof Error ? error.stack : undefined
        console.error('[TemplatesGrid] Exception while fetching templates:', {
          message: errorMessage,
          stack: errorStack,
        })
        setTemplates([])
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-64"></div>
        ))}
      </div>
    )
  }

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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          viewMode="grid"
        />
      ))}
    </div>
  )
}
