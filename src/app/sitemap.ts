import type { MetadataRoute } from 'next'
import { createClient } from '@/services/supabase'
import { generateSlug } from '@/lib/slug-utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.gemini-image-edit.com'
  
  // 获取模板数据以生成动态路由
  let templateUrls: MetadataRoute.Sitemap = []
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { data: templates } = await supabase
        .from('nanobanana_templates')
        .select('slug, name, updated_at')
        .eq('isvalid', true)
        .order('updated_at', { ascending: false })

      templateUrls = templates?.map((template) => ({
        url: `${base}/templates/${template.slug || generateSlug(template.name)}`,
        lastModified: new Date(template.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })) || []
    }
  } catch (error) {
    console.error('Error generating template URLs for sitemap:', error)
  }

  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/templates`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/standard-editor`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/standard-editor`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...templateUrls,
  ]
}

