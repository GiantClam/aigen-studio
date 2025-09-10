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

// Load environment variables from .env.local if present
dotenv.config({ path: new URL('../.env.local', import.meta.url).pathname })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[seed] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// runtime configs
const TIMEOUT_MS = parseInt(process.env.SEED_FETCH_TIMEOUT_MS || '20000', 10)
const RETRIES = parseInt(process.env.SEED_FETCH_RETRIES || '3', 10)
const DISABLE_ZHIHU = /^true$/i.test(process.env.SEED_DISABLE_ZHIHU || '')

const sources = [
  !DISABLE_ZHIHU && { type: 'zhihu', urls: ['https://zhuanlan.zhihu.com/p/1945925457871640231'] },
  {
    type: 'github',
    urls: [
      'https://raw.githubusercontent.com/JimmyLv/awesome-nano-banana/refs/heads/main/README.md',
      // mirrors/fallbacks
      'https://raw.fastgit.org/JimmyLv/awesome-nano-banana/refs/heads/main/README.md',
      'https://cdn.jsdelivr.net/gh/JimmyLv/awesome-nano-banana@main/README.md',
    ].filter(Boolean),
  },
].filter(Boolean)

function withTimeout(promise, ms) {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), ms)
  return Promise.race([
    promise(ac.signal),
    new Promise((_, rej) => ac.signal.addEventListener('abort', () => rej(new Error('timeout')))),
  ]).finally(() => clearTimeout(t))
}

async function fetchWithRetry(url, { timeoutMs = TIMEOUT_MS, retries = RETRIES } = {}) {
  let lastErr
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await withTimeout((signal) => fetch(url, { headers: { 'User-Agent': 'seed-script' }, signal }), timeoutMs)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (e) {
      lastErr = e
      await new Promise((r) => setTimeout(r, Math.min(500 * (i + 1), 2000)))
    }
  }
  throw lastErr
}

function normalizeType(label) {
  if (!label) return 'TEXT_TO_IMAGE'
  if (/多图|multi/i.test(label)) return 'MULTI_IMAGE_GENERATION'
  if (/单图|single/i.test(label)) return 'SINGLE_IMAGE_GENERATION'
  if (/text\s*-?\s*to\s*-?\s*image|文生图/i.test(label)) return 'TEXT_TO_IMAGE'
  return 'TEXT_TO_IMAGE'
}

async function parseZhihu(html) {
  const items = []
  const imgRegex = new RegExp('<img[^>]*src=\\"(https:[^\\"]+)\\"[^>]*>', 'g')
  const titleRegex = new RegExp('<h[12][^>]*>(.*?)<\\/h[12]>', 'g')
  let m
  const titles = []
  while ((m = titleRegex.exec(html))) titles.push(m[1].replace(/<[^>]+>/g, '').trim())
  let i = 0
  while ((m = imgRegex.exec(html)) && i < titles.length) {
    items.push({
      name: titles[i] || `Zhihu Template ${i + 1}`,
      imageUrl: m[1],
      prompt: titles[i] || 'High-quality example',
      type: 'TEXT_TO_IMAGE',
    })
    i++
  }
  return items.slice(0, 30)
}

async function parseGithubMarkdown(md) {
  const lines = md.split('\n')
  const items = []
  for (const line of lines) {
    // Example: - [Name](url) - prompt / type
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
  return items.slice(0, 80)
}

async function fetchAll() {
  const results = []
  for (const s of sources) {
    let content = null
    for (const u of s.urls) {
      try {
        content = await fetchWithRetry(u)
        break
      } catch (e) {
        console.warn(`[seed] fetch failed for ${u}:`, e?.message || e)
      }
    }
    if (!content) {
      console.warn(`[seed] skip ${s.type} due to network errors.`)
      continue
    }
    if (s.type === 'zhihu') results.push(...(await parseZhihu(content)))
    if (s.type === 'github') results.push(...(await parseGithubMarkdown(content)))
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
    console.log(`[seed] Imported ${items.length} templates.`)
  } catch (e) {
    console.error('[seed] Failed:', e)
    process.exit(1)
  }
})()


