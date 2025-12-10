import { supabase } from '@/services/supabase'

export interface Template {
  id: string
  name: string
  image_url: string
  prompt: string
  type: string
  description?: string
  category_id?: string
  tags?: string[]
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
  estimated_time?: number
  parameters?: Record<string, any>
  preview_images?: string[]
  is_featured?: boolean
  is_premium?: boolean
  usage_count?: number
  rating?: number
  rating_count?: number
  author_id?: string
  author_name?: string
  isvalid?: boolean
  created_at: string
  updated_at: string
}

export interface TemplateCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  order_index: number
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface TemplateWithCategory extends Template {
  category?: TemplateCategory
  is_favorited?: boolean
  user_rating?: number
}

export interface TemplatesResponse {
  data: Template[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

/**
 * 获取所有有效的模板 (支持分页)
 */
export async function fetchTemplates(page = 1, limit = 50): Promise<TemplatesResponse> {
  try {
    const res = await fetch(`/api/templates?page=${page}&limit=${limit}`)
    if (!res.ok) return { data: [], total: 0, page, limit, hasMore: false }
    const result = await res.json()
    // 兼容旧 API 返回数组的情况 (如果 API 尚未部署)
    if (Array.isArray(result)) {
      return {
        data: result,
        total: result.length,
        page: 1,
        limit: result.length,
        hasMore: false
      }
    }
    return result
  } catch (error) {
    try {
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      const { data, count, error: err } = await supabase
        .from('nanobanana_templates')
        .select('id,name,slug,image_url,prompt,type,description,category_id,tags,difficulty_level,estimated_time,parameters,preview_images,is_featured,is_premium,usage_count,rating,rating_count,author_name,created_at,updated_at', { count: 'exact' })
        .eq('isvalid', true)
        .order('updated_at', { ascending: false })
        .range(from, to)

      if (err) {
        return { data: [], total: 0, page, limit, hasMore: false }
      }
      return {
        data: (data as any[]) || [],
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > to + 1
      }
    } catch {
      return { data: [], total: 0, page, limit, hasMore: false }
    }
  }
}

/**
 * 获取推荐模板
 */
export async function fetchFeaturedTemplates(): Promise<Template[]> {
  try {
    const res = await fetch('/api/templates?featured=true&limit=12')
    if (!res.ok) return []
    const result = await res.json()
    if (result.data && Array.isArray(result.data)) {
      return result.data
    }
    return Array.isArray(result) ? result : []
  } catch (error) {
    console.error('获取推荐模板错误:', error)
    return []
  }
}

/**
 * 获取模板分类
 */
export async function fetchTemplateCategories(): Promise<TemplateCategory[]> {
  try {
    const res = await fetch('/api/templates/categories')
    if (!res.ok) return []
    const data = await res.json()
    return data || []
  } catch (error) {
    try {
      const { data, error: err } = await supabase
        .from('nanobanana_template_categories')
        .select('id,name,description,icon,color,order_index,is_active,created_at,updated_at')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
      if (err) {
        return []
      }
      return (data as any[]) || []
    } catch {
      return []
    }
  }
}

/**
 * 获取模板详情（包含分类信息）
 */
export async function fetchTemplateWithCategory(id: string): Promise<TemplateWithCategory | null> {
  try {
    const { data, error } = await supabase
      .from('nanobanana_templates')
      .select(`
        *,
        category:category_id(
          id,
          name,
          description,
          icon,
          color,
          order_index,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('获取模板详情失败:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('获取模板详情错误:', error)
    return null
  }
}

/**
 * 根据分类获取模板
 */
export async function fetchTemplatesByCategory(categoryId: string): Promise<Template[]> {
  try {
    const res = await fetch(`/api/templates?category=${encodeURIComponent(categoryId)}`)
    if (!res.ok) return []
    const result = await res.json()
    if (result.data && Array.isArray(result.data)) {
      return result.data
    }
    return Array.isArray(result) ? result : []
  } catch (error) {
    console.error('获取分类模板错误:', error)
    return []
  }
}

/**
 * 根据类型获取模板
 */
export async function fetchTemplatesByType(type: string): Promise<Template[]> {
  try {
    const res = await fetch(`/api/templates?type=${encodeURIComponent(type)}`)
    if (!res.ok) return []
    const result = await res.json()
    if (result.data && Array.isArray(result.data)) {
      return result.data
    }
    return Array.isArray(result) ? result : []
  } catch (error) {
    console.error('获取类型模板错误:', error)
    return []
  }
}

/**
 * 搜索模板
 */
export async function searchTemplates(query: string): Promise<Template[]> {
  try {
    const res = await fetch(`/api/templates?search=${encodeURIComponent(query)}`)
    if (!res.ok) return []
    const result = await res.json()
    if (result.data && Array.isArray(result.data)) {
      return result.data
    }
    return Array.isArray(result) ? result : []
  } catch (error) {
    console.error('搜索模板错误:', error)
    return []
  }
}

/**
 * 获取模板数量统计
 */
export async function fetchTemplateCounts(): Promise<{ all: number, 'single-image': number, 'multi-image': number, 'text-to-image': number }> {
  try {
    const res = await fetch('/api/templates/counts')
    if (!res.ok) {
      return { all: 0, 'single-image': 0, 'multi-image': 0, 'text-to-image': 0 }
    }
    return await res.json()
  } catch (error) {
    console.error('获取模板统计错误:', error)
    return { all: 0, 'single-image': 0, 'multi-image': 0, 'text-to-image': 0 }
  }
}

/**
 * 记录模板使用历史
 */
export async function recordTemplateUsage(userId: string, templateId: string, canvasId?: string, usageType: 'view' | 'use' | 'favorite' | 'share' = 'view'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('nanobanana_template_usage_history')
      .insert({
        user_id: userId,
        template_id: templateId,
        canvas_id: canvasId,
        usage_type: usageType
      })

    if (error) {
      console.error('记录模板使用历史失败:', error)
      return false
    }

    // 更新模板使用次数（使用 RPC 保证原子性）
    if (usageType === 'use') {
      await supabase.rpc('increment_template_usage', { tpl_id: templateId, inc: 1 })
    }

    return true
  } catch (error) {
    console.error('记录模板使用历史错误:', error)
    return false
  }
}

/**
 * 获取用户收藏的模板
 */
export async function fetchUserFavoriteTemplates(userId: string): Promise<Template[]> {
  try {
    const { data, error } = await supabase
      .from('nanobanana_template_favorites')
      .select(`
        template:template_id(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取用户收藏模板失败:', error)
      return []
    }

    return (data?.map((item: any) => item.template) as Template[]) || []
  } catch (error) {
    console.error('获取用户收藏模板错误:', error)
    return []
  }
}

/**
 * 收藏/取消收藏模板
 */
export async function toggleTemplateFavorite(userId: string, templateId: string): Promise<boolean> {
  try {
    // 检查是否已经收藏
    const { data: existing } = await supabase
      .from('nanobanana_template_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single()

    if (existing) {
      // 取消收藏
      const { error } = await supabase
        .from('nanobanana_template_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('template_id', templateId)

      if (error) {
        console.error('取消收藏模板失败:', error)
        return false
      }
    } else {
      // 添加收藏
      const { error } = await supabase
        .from('nanobanana_template_favorites')
        .insert({
          user_id: userId,
          template_id: templateId
        })

      if (error) {
        console.error('收藏模板失败:', error)
        return false
      }

      // 记录收藏行为
      await recordTemplateUsage(userId, templateId, undefined, 'favorite')
    }

    return true
  } catch (error) {
    console.error('收藏模板错误:', error)
    return false
  }
}

/**
 * 为模板评分
 */
export async function rateTemplate(userId: string, templateId: string, rating: number, review?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('nanobanana_template_ratings')
      .upsert({
        user_id: userId,
        template_id: templateId,
        rating: rating,
        review: review
      }, {
        onConflict: 'user_id,template_id'
      })

    if (error) {
      console.error('评分模板失败:', error)
      return false
    }

    // 更新模板平均评分
    const { data: ratings } = await supabase
      .from('nanobanana_template_ratings')
      .select('rating')
      .eq('template_id', templateId)

    if (ratings && ratings.length > 0) {
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      await supabase
        .from('nanobanana_templates')
        .update({
          rating: avgRating,
          rating_count: ratings.length
        })
        .eq('id', templateId)
    }

    return true
  } catch (error) {
    console.error('评分模板错误:', error)
    return false
  }
}

/**
 * 创建新模板（管理员功能）
 */
export async function createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template | null> {
  try {
    const templateData = {
      ...template,
      id: `tpl_${Date.now()}`,
      isvalid: template.isvalid ?? true,
      usage_count: template.usage_count ?? 0,
      rating: template.rating ?? 0.0,
      rating_count: template.rating_count ?? 0
    }

    const { data, error } = await supabase
      .from('nanobanana_templates')
      .insert(templateData)
      .select()
      .single()

    if (error) {
      console.error('创建模板失败:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('创建模板错误:', error)
    return null
  }
}

/**
 * 更新模板（管理员功能）
 */
export async function updateTemplate(id: string, updates: Partial<Template>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('nanobanana_templates')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('更新模板失败:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('更新模板错误:', error)
    return false
  }
}

/**
 * 删除模板（管理员功能）
 */
export async function deleteTemplate(id: string): Promise<boolean> {
  try {
    // 软删除，将 isvalid 设置为 false
    const { error } = await supabase
      .from('nanobanana_templates')
      .update({ isvalid: false })
      .eq('id', id)

    if (error) {
      console.error('删除模板失败:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('删除模板错误:', error)
    return false
  }
}
