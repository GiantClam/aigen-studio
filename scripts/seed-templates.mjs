/*
  Seed templates from Zhihu and awesome-nano-banana into Supabase `templates` table.
  Required ENV:
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY (server-only)

  Run:
  NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:templates
*/
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables from .env.local if present
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[seed] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Fine-grained categories from NanoCanvas
const FINE_GRAINED_CATEGORIES = [
  { id: 'sci-fi', name: '科幻', icon: 'sparkles', color: '#0ea5e9', order_index: 1 },
  { id: '3d-art', name: '3D 艺术', icon: 'box', color: '#a855f7', order_index: 2 },
  { id: 'design', name: '设计', icon: 'zap', color: '#f59e0b', order_index: 3 },
  { id: 'photography', name: '摄影', icon: 'camera', color: '#22c55e', order_index: 4 },
  { id: 'anime', name: '动漫', icon: 'sparkles', color: '#ef4444', order_index: 5 },
  { id: 'artistic', name: '艺术', icon: 'palette', color: '#eab308', order_index: 6 },
  { id: 'manipulation', name: '合成/融合', icon: 'blend', color: '#06b6d4', order_index: 7 },
  { id: 'utility', name: '工具', icon: 'scissors', color: '#64748b', order_index: 8 },
  { id: 'material', name: '材质', icon: 'layers', color: '#14b8a6', order_index: 9 },
  { id: 'video', name: '视频', icon: 'film', color: '#8b5cf6', order_index: 10 },
]

async function ensureCategories() {
  for (const c of FINE_GRAINED_CATEGORIES) {
    const { error } = await supabase
      .from('nanobanana_template_categories')
      .upsert({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        order_index: c.order_index,
        is_active: true,
      }, { onConflict: 'id' })
    if (error) {
      console.error('[seed] category upsert error:', error)
    }
  }
}

function mapCategory({ name = '', prompt = '', type = '' }) {
  const text = `${name} ${prompt} ${type}`.toLowerCase()
  if (/anime|二次元|漫画|manga|吉卜力/.test(text)) return 'anime'
  if (/logo|品牌|icon|矢量|vector|设计/.test(text)) return 'design'
  if (/摄影|photo|摄影棚|grade|胶片|相机|portrait|风景|landscape/.test(text)) return 'photography'
  if (/3d|像素|pixel|渲染|render|unreal|blender/.test(text)) return '3d-art'
  if (/科幻|赛博|cyberpunk|未来|neon|sci[- ]?fi/.test(text)) return 'sci-fi'
  if (/艺术|油画|水彩|art|painting|brush|palette/.test(text)) return 'artistic'
  if (/融合|blend|合成|混合|composite/.test(text)) return 'manipulation'
  if (/抠图|去背景|matting|remove|剪切|isolate|utility/.test(text)) return 'utility'
  if (/材质|material|金属|木头|gold|wood|texture/.test(text)) return 'material'
  if (/视频|video|动画|animate|镜头|zoom/.test(text)) return 'video'
  // fallback by type
  if (/single|edit/i.test(type)) return 'utility'
  return 'artistic'
}

async function loadLocalTemplates() {
  try {
    const filePath = path.join(process.cwd(), 'templates-batch-0.json')
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    }
    return []
  } catch (e) {
    console.error('[seed] Failed to load local templates:', e)
    return []
  }
}

async function upsertTemplates(items) {
  if (!items.length) return
  const payload = items.map((t) => ({
    id: t.id,
    name: t.name,
    image_url: t.image_url || t.imageUrl,
    prompt: t.prompt,
    type: t.type,
    description: t.prompt, // Use prompt as description
    isvalid: true,
    is_featured: Math.random() > 0.8, // 20% chance to be featured
    usage_count: Math.floor(Math.random() * 1000),
    rating: (4 + Math.random()).toFixed(1),
    rating_count: Math.floor(Math.random() * 100),
    difficulty_level: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
    estimated_time: Math.floor(Math.random() * 60) + 5,
    author_name: 'NanoBanana',
    tags: ['ai', 'creative', t.type ? t.type.toLowerCase() : 'text_to_image'],
    category_id: mapCategory({ name: t.name, prompt: t.prompt, type: t.type }),
  }))
  
  // Batch insert to avoid payload too large
  const batchSize = 50
  for (let i = 0; i < payload.length; i += batchSize) {
    const batch = payload.slice(i, i + batchSize)
    const { error } = await supabase.from('nanobanana_templates').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error(`[seed] Error inserting batch ${i}:`, error)
    } else {
      console.log(`[seed] Inserted batch ${i} - ${i + batch.length}`)
    }
  }
}

;(async () => {
  try {
    await ensureCategories()
    const localItemsRaw = await loadLocalTemplates()
    const localItems = localItemsRaw.map((t, idx) => ({ ...t, id: `tpl_local_${String(idx + 1).padStart(3, '0')}` }))

    // Parse NanoCanvas constants.tsx
    const ncPath = path.join(process.cwd(), 'external', 'nanocanvas', 'constants.tsx')
    let nanoItems = []
    if (fs.existsSync(ncPath)) {
      const content = fs.readFileSync(ncPath, 'utf-8')
      const start = content.indexOf('export const TEMPLATES')
      if (start !== -1) {
        const arrStart = content.indexOf('[', start)
        const arrEnd = content.indexOf(']\n', arrStart) !== -1 ? content.indexOf(']\n', arrStart) : content.indexOf(']', arrStart)
        const arrayText = content.slice(arrStart, arrEnd + 1)
        const objRegex = /\{[\s\S]*?id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?description:\s*'([^']+)'[\s\S]*?promptTemplate:\s*'([^']+)'[\s\S]*?type:\s*'([^']+)'[\s\S]*?category:\s*'([^']+)'[\s\S]*?\}/g
        let m
        while ((m = objRegex.exec(arrayText))) {
          const [_, id, name, description, promptTemplate, type, categoryName] = m
          const typeMap = { create: 'TEXT_TO_IMAGE', edit: 'SINGLE_IMAGE_EDIT', video: 'VIDEO_GENERATION' }
          const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z\-]/g, '')
          nanoItems.push({
            id: `tpl_nc_${id}`,
            name,
            image_url: '',
            prompt: promptTemplate,
            type: typeMap[type] || 'TEXT_TO_IMAGE',
            description,
            category_id: categoryId,
          })
        }
      }
    }

    if (localItems.length > 0) {
      console.log(`[seed] Found ${localItems.length} templates in local file.`)
      await upsertTemplates(localItems)
    } else {
      console.log('[seed] No local templates found.')
    }

    if (nanoItems.length > 0) {
      console.log(`[seed] Found ${nanoItems.length} NanoCanvas templates.`)
      await upsertTemplates(nanoItems)
    }
    console.log('[seed] Done.')
  } catch (e) {
    console.error('[seed] Failed:', e)
    process.exit(1)
  }
})()
