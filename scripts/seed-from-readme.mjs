/*
  Parse prompts from local README_en.md (awesome-nano-banana) and insert into Supabase `templates` table.
  Required ENV:
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY (server-only)

  Run:
  npm run seed:readme
*/
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[seed-from-readme] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const README_PATH = path.resolve(process.cwd(), 'README_en.md')
if (!fs.existsSync(README_PATH)) {
  console.error(`[seed-from-readme] README not found: ${README_PATH}`)
  process.exit(1)
}

const content = fs.readFileSync(README_PATH, 'utf8')
const lines = content.split('\n')

function classifyType(text) {
  const t = (text || '').toLowerCase()
  if (/多图|multi[-\s]?image|multiple images/.test(t)) return 'MULTI_IMAGE_GENERATION'
  if (/上传|参考图片|upload|reference image/.test(t)) return 'SINGLE_IMAGE_GENERATION'
  return 'TEXT_TO_IMAGE'
}

function extractTemplatesFromReadme() {
  const items = []
  let i = 0
  let current = null
  while (i < lines.length) {
    const line = lines[i]
    // Case title: e.g., "### 案例 100：实物与..."
    const mTitle = /^###\s+(.+?)\s*\(/.exec(line)
    if (mTitle) {
      if (current && current.prompt && current.imageUrl) {
        items.push(current)
      }
      current = { name: mTitle[1].trim(), imageUrl: '', prompt: '', raw: [] }
      i++; continue
    }

    if (current) {
      // Gemini image line: prefer the first <img ... Gemini>
      const mImg = /<img[^>]*src="(https?:[^"\s]+)"[^>]*alt="[^"]*\(Gemini/.exec(line)
      if (mImg && !current.imageUrl) {
        current.imageUrl = mImg[1]
      }
      // Detect "提示词" header
      const isPromptHeader = /\*\*提示词\*\*|\*\*Prompts?\*\*/i.test(line)
      if (isPromptHeader) {
        // Next code fence is the prompt
        // Find starting ```
        let j = i + 1
        while (j < lines.length && !/^```/.test(lines[j])) j++
        if (j < lines.length && /^```/.test(lines[j])) {
          j++
          const buf = []
          while (j < lines.length && !/^```/.test(lines[j])) {
            buf.push(lines[j])
            j++
          }
          current.prompt = buf.join('\n').trim()
          i = j
        }
      }
    }

    i++
  }
  if (current && current.prompt && current.imageUrl) items.push(current)

  // Finalize: classify type
  return items.map((it) => ({
    name: it.name,
    image_url: it.imageUrl,
    prompt: it.prompt,
    type: classifyType(it.prompt),
  }))
}

async function upsertTemplates(rows) {
  if (!rows.length) {
    console.warn('[seed-from-readme] No templates extracted.')
    return
  }
  // Batch to avoid payload limits; also provide better diagnostics
  const chunkSize = 50
  for (let i = 0; i < rows.length; i += chunkSize) {
    const batch = rows.slice(i, i + chunkSize)
    const { error, status, statusText, data } = await supabase
      .from('templates')
      .upsert(batch, { onConflict: 'name' })
    if (error) {
      console.error('[seed-from-readme] upsert error:', JSON.stringify(error, null, 2))
      console.error('[seed-from-readme] status:', status, statusText)
      // Helpful hints
      console.error('[seed-from-readme] Hints: 1) Ensure table public.templates exists and has unique index on name. 2) Disable RLS or use Service Role Key. 3) Columns: name(text), image_url(text), prompt(text), type(text).')
      // Persist batch for manual import
      const dumpPath = path.resolve(process.cwd(), `templates-batch-${i}.json`)
      fs.writeFileSync(dumpPath, JSON.stringify(batch, null, 2))
      throw error
    } else {
      console.log(`[seed-from-readme] upserted ${batch.length} rows (batch ${i / chunkSize + 1})`)
    }
  }
}

;(async () => {
  try {
    const rows = extractTemplatesFromReadme()
    console.log(`[seed-from-readme] Extracted ${rows.length} templates from README_en.md`)
    await upsertTemplates(rows)
    console.log('[seed-from-readme] Upsert completed.')
  } catch (e) {
    console.error('[seed-from-readme] Failed:', e)
    process.exit(1)
  }
})()


