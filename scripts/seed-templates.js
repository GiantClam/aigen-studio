/*
  从知乎专栏与 awesome-nano-banana 仓库抓取模板数据，写入 Supabase 表 `templates`。
  需要环境变量：
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY （服务端写权限）
*/
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('缺少必要环境变量 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const sources = [
  {
    type: 'zhihu',
    url: 'https://zhuanlan.zhihu.com/p/1945925457871640231',
  },
  {
    type: 'github',
    url: 'https://raw.githubusercontent.com/JimmyLv/awesome-nano-banana/refs/heads/main/README.md',
  },
]

function normalizeType(label) {
  if (/多图|multi/i.test(label)) return 'MULTI_IMAGE_GENERATION'
  if (/单图|single/i.test(label)) return 'SINGLE_IMAGE_GENERATION'
  return 'TEXT_TO_IMAGE'
}

async function parseZhihu(html) {
  // 简化解析：提取常见图片和标题、提示词示例（真实生产可用 Cheerio 更稳健）
  const items = []
  const imgRegex = /<img[^>]*src="(https:[^"]+)"[^>]*>/g
  const titleRegex = /<h[12][^>]*>(.*?)<\/h[12]>/g
  let m
  const titles = []
  while ((m = titleRegex.exec(html))) titles.push(m[1].replace(/<[^>]+>/g, '').trim())
  let i = 0
  while ((m = imgRegex.exec(html)) && i < titles.length) {
    items.push({
      name: titles[i] || `知乎模板 ${i + 1}`,
      imageUrl: m[1],
      prompt: titles[i] || '高质量示例',
      type: 'TEXT_TO_IMAGE',
    })
    i++
  }
  return items.slice(0, 20)
}

async function parseGithubMarkdown(md) {
  const lines = md.split('\n')
  const items = []
  for (const line of lines) {
    // 形如：- [模板名](图片/链接) - 提示词/类型
    const m = /^-\s*\[(.+?)\]\((.+?)\)\s*-\s*(.+)$/i.exec(line)
    if (m) {
      const name = m[1].trim()
      const link = m[2].trim()
      const hint = m[3].trim()
      items.push({
        name,
        imageUrl: link,
        prompt: hint,
        type: normalizeType(hint),
      })
    }
  }
  return items.slice(0, 50)
}

async function fetchAll() {
  const results = []
  for (const s of sources) {
    const res = await fetch(s.url, { headers: { 'User-Agent': 'seed-script' } })
    const text = await res.text()
    if (s.type === 'zhihu') results.push(...(await parseZhihu(text)))
    if (s.type === 'github') results.push(...(await parseGithubMarkdown(text)))
  }
  return results
}

async function upsertTemplates(items) {
  if (!items.length) return
  const payload = items.map((t) => ({
    name: t.name,
    image_url: t.imageUrl,
    prompt: t.prompt,
    type: t.type,
  }))
  const { error } = await supabase.from('templates').upsert(payload, { onConflict: 'name' })
  if (error) throw error
}

;(async () => {
  try {
    const items = await fetchAll()
    await upsertTemplates(items)
    console.log(`导入完成，共 ${items.length} 条`)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()


