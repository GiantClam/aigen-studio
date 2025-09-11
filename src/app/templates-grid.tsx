'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/services/supabase'
import TemplateCard from '@/components/templates/TemplateCard'

type TemplateItem = {
  id: string
  name: string
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
          setTemplates([])
          setLoading(false)
          return
        }
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data, error } = await supabase
          .from('templates')
          .select('id,name,image_url,prompt,type,created_at,updated_at')
          .eq('isvalid', true)
          .order('updated_at', { ascending: false })
          .limit(8)
        
        if (error) {
          console.error('Supabase error:', error)
          setTemplates([])
        } else {
          setTemplates(data || [])
        }
      } catch (error) {
        console.error('Error fetching templates:', error)
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