/*
  Translate template names and prompts to English and update Supabase.

  ENV required:
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - GOOGLE_API_KEY  (for @google/genai)

  Run:
  npm run translate:templates
*/
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'node:path'
import fetch from 'node-fetch'
import { GoogleAuth } from 'google-auth-library'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT
const GOOGLE_LOCATION = process.env.GOOGLE_LOCATION || 'us-central1'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[translate-templates] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
// 至少需要一种鉴权：优先 DeepSeek，再到服务账号或 API Key
if (!DEEPSEEK_API_KEY && !GOOGLE_SERVICE_ACCOUNT_KEY && !GOOGLE_API_KEY) {
  console.error('[translate-templates] Missing DEEPSEEK_API_KEY / GOOGLE_SERVICE_ACCOUNT_KEY / GOOGLE_API_KEY. Provide at least one.')
  process.exit(1)
}
if (!DEEPSEEK_API_KEY && GOOGLE_SERVICE_ACCOUNT_KEY && !GOOGLE_PROJECT_ID) {
  console.error('[translate-templates] GOOGLE_PROJECT_ID is required when using GOOGLE_SERVICE_ACCOUNT_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Lightweight language check: detect CJK chars
const hasNonEnglish = (s = '') => /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/.test(s)

async function fetchAllTemplates() {
  const { data, error } = await supabase.from('templates').select('id,name,prompt')
  if (error) throw error
  return data || []
}

// Translation via Gemini
function withTimeout(promiseFactory, ms) {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), ms)
  return Promise.race([
    promiseFactory(ac.signal),
    new Promise((_, rej) => ac.signal.addEventListener('abort', () => rej(new Error('timeout')))),
  ]).finally(() => clearTimeout(t))
}

function truncateItems(items, perItemLimit = 2000, totalLimit = 12000) {
  const truncated = items.map((s = '') => (s.length > perItemLimit ? s.slice(0, perItemLimit) : s))
  let joined = truncated.join('\n\n')
  if (joined.length <= totalLimit) return truncated
  // Reduce further from the end
  let over = joined.length - totalLimit
  for (let i = truncated.length - 1; i >= 0 && over > 0; i--) {
    const cut = Math.min(over, Math.floor(truncated[i].length * 0.5))
    truncated[i] = truncated[i].slice(0, truncated[i].length - cut)
    joined = truncated.join('\n\n')
    over = Math.max(0, joined.length - totalLimit)
  }
  return truncated
}

async function translateToEnglishBatch(texts, { timeoutMs = 60000, retries = 2 } = {}) {
  // Trim overly long inputs to avoid model or network issues
  const safeTexts = truncateItems(texts)
  // Build a single prompt to reduce API calls
  const input = safeTexts.map((t, idx) => `#${idx + 1}\n${t}`).join('\n\n')
  const prompt = `You are a professional translator. Translate each item to concise natural English. Keep formatting, no extra commentary. Output in the same numbered order.\n\n${input}`

  // Highest priority: DeepSeek v3 API
  if (DEEPSEEK_API_KEY) {
    const url = 'https://api.deepseek.com/chat/completions'
    const body = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a professional translator. Keep original structure and numbering. No extra commentary.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    }

    let lastErr
    for (let i = 0; i <= retries; i++) {
      try {
        console.log(`[translate-templates] DeepSeek request try ${i + 1}`)
        const resp = await withTimeout(
          (signal) => fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify(body),
            signal,
          }),
          timeoutMs,
        )
        if (!resp.ok) {
          const txt = await resp.text()
          throw new Error(`DeepSeek HTTP ${resp.status}: ${txt}`)
        }
        const json = await resp.json()
        const textOut = json?.choices?.[0]?.message?.content?.trim() || ''
        return splitByNumberedBlocks(textOut, safeTexts.length)
      } catch (e) {
        lastErr = e
        console.warn('[translate-templates] DeepSeek attempt failed:', e?.message || e)
        await new Promise((r) => setTimeout(r, 500 * (i + 1)))
      }
    }
    // DeepSeek连续失败。若可用，则继续尝试 Vertex/API Key 路径作为后备，而不是直接抛错。
    const msg = (lastErr && (lastErr.message || String(lastErr))) || ''
    if (/Insufficient Balance|HTTP 402/i.test(msg)) {
      console.warn('[translate-templates] DeepSeek balance issue, falling back to Vertex/API Key path...')
    } else {
      console.warn('[translate-templates] DeepSeek failed, trying Vertex/API Key fallback...')
    }
    // 不抛出，向下继续执行 Vertex 或 @google/genai 分支
  }

  // Prefer Vertex AI with Service Account
  if (GOOGLE_SERVICE_ACCOUNT_KEY) {
    const sa = JSON.parse(GOOGLE_SERVICE_ACCOUNT_KEY)
    const auth = new GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/cloud-platform'] })
    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()

    const url = `https://${GOOGLE_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/${GOOGLE_LOCATION}/publishers/google/models/gemini-2.5-flash:generateContent`
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: { temperature: 0.1 },
    }

    let lastErr
    for (let i = 0; i <= retries; i++) {
      try {
        console.log(`[translate-templates] Vertex request try ${i + 1}`)
        const resp = await withTimeout(
          (signal) => fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken.token || accessToken}`,
            },
            body: JSON.stringify(body),
            signal,
          }),
          timeoutMs,
        )
        if (!resp.ok) {
          const txt = await resp.text()
          throw new Error(`Vertex AI HTTP ${resp.status}: ${txt}`)
        }
        const json = await resp.json()
        const textOut = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('')?.trim() || ''
        return splitByNumberedBlocks(textOut, safeTexts.length)
      } catch (e) {
        lastErr = e
        console.warn('[translate-templates] Vertex attempt failed:', e?.message || e)
        await new Promise((r) => setTimeout(r, 500 * (i + 1)))
      }
    }
    throw lastErr
  }

  // Fallback: API Key path (@google/genai)
  const { GoogleGenerativeAI } = await import('@google/genai')
  const genai = new GoogleGenerativeAI(GOOGLE_API_KEY)
  const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })
  console.log('[translate-templates] Using @google/genai API Key path')
  const res = await withTimeout(() => model.generateContent(prompt), timeoutMs)
  const out = (await res.response.text()).trim()
  return splitByNumberedBlocks(out, safeTexts.length)
}

function splitByNumberedBlocks(outText, expected) {
  const lines = outText.split(/\n{2,}/)
  const results = []
  let idx = 0
  for (const block of lines) {
    const cleaned = block.replace(/^#\d+\s*/, '').trim()
    if (cleaned) {
      results.push(cleaned)
      idx++
      if (idx >= expected) break
    }
  }
  if (results.length !== expected) return outText ? Array(expected).fill(outText) : Array(expected).fill('')
  return results
}

async function updateTemplate(id, nameEn, promptEn) {
  const { error } = await supabase.from('templates').update({ name: nameEn, prompt: promptEn }).eq('id', id)
  if (error) throw error
}

;(async () => {
  try {
    const all = await fetchAllTemplates()
    const targets = all.filter((r) => hasNonEnglish(r.name) || hasNonEnglish(r.prompt))
    console.log(`[translate-templates] To translate: ${targets.length} / ${all.length}`)
    if (!targets.length) return

    const batchSize = 3
    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize)
      const names = batch.map((b) => b.name || '')
      const prompts = batch.map((b) => b.prompt || '')

      console.log(`[translate-templates] Translating batch ${i / batchSize + 1} (size ${batch.length})`)
      const [namesEn, promptsEn] = await Promise.all([
        translateToEnglishBatch(names, { timeoutMs: 60000 }),
        translateToEnglishBatch(prompts, { timeoutMs: 60000 }),
      ])

      for (let k = 0; k < batch.length; k++) {
        const row = batch[k]
        const nameEn = namesEn[k] || row.name
        const promptEn = promptsEn[k] || row.prompt
        await updateTemplate(row.id, nameEn, promptEn)
      }
      console.log(`[translate-templates] Updated batch ${i / batchSize + 1} (${batch.length} rows)`) 
    }
    console.log('[translate-templates] Done.')
  } catch (e) {
    console.error('[translate-templates] Failed:', e)
    process.exit(1)
  }
})()


