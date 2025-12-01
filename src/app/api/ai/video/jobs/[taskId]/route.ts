import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { GoogleAuth } from 'google-auth-library'
import { R2StorageService } from '@/lib/common-components'

export const runtime = 'nodejs'

const getR2 = () => ({
  accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID!,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
  publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
})

export async function GET(request: NextRequest, context: any) {
  const { taskId } = context?.params || {}
  const { data } = await supabaseServer.from('nanobanana_canvas_task').select('*').eq('task_id', taskId).maybeSingle()
  if (!data) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
  const status = data.status as string
  if (status === 'succeeded' || status === 'failed') {
    const payload = (data.payload || {}) as any
    const videoUrl = typeof payload.videoUrl === 'string' ? payload.videoUrl : undefined
    return NextResponse.json({ success: true, data: { status, payload, statusCode: data.status_code, ...(videoUrl ? { videoUrl } : {}) } })
  }
  console.log('[video.jobs] start processing', { taskId })
  await supabaseServer.from('nanobanana_canvas_task').update({ status: 'in_progress' }).eq('task_id', taskId)
  const payload = (data.payload || {}) as any
  const project = process.env.GOOGLE_CLOUD_PROJECT
  const defaultLocation = process.env.GOOGLE_CLOUD_LOCATION || 'us-east5'
  const videoLocationOverride = process.env.VIDEO_CLOUD_LOCATION || 'us-central1'
  const location = String(payload.model || '').startsWith('veo') ? videoLocationOverride : defaultLocation
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!project || !key) return NextResponse.json({ success: false, error: 'Vertex AI not configured' }, { status: 503 })
  const credentials = typeof key === 'string' ? JSON.parse(key) : key
  const auth = new GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/cloud-platform'], projectId: project })
  const client = await auth.getClient()
  const access = await client.getAccessToken()
  if (!access.token) return NextResponse.json({ success: false, error: 'Failed to get access token' }, { status: 500 })

  const parts: any[] = []
  parts.push({ text: String(payload.prompt || '').replace(/model:[^\s]+\s*/g, '').trim() })
  if (payload.imageDataBase64) {
    parts.unshift({ inlineData: { mimeType: 'image/png', data: payload.imageDataBase64.includes(',') ? payload.imageDataBase64.split(',')[1] : payload.imageDataBase64 } })
  } else if (payload.imageUrl && typeof payload.imageUrl === 'string') {
    try {
      const resImg = await fetch(payload.imageUrl)
      if (resImg.ok) {
        const ct = resImg.headers.get('content-type') || 'image/png'
        const buf = Buffer.from(await resImg.arrayBuffer())
        const b64 = buf.toString('base64')
        parts.unshift({ inlineData: { mimeType: ct, data: b64 } })
      }
    } catch {}
  }

  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${payload.model || 'veo-2.0-generate-001'}:generateContent`
  console.log('[video.jobs] vertex call', { url, location, project, model: payload.model })
  const call = async (): Promise<Response> => fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${access.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [ { role: 'user', parts } ],
      generationConfig: { maxOutputTokens: 8192, temperature: 0.4, topP: 0.95 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
      ]
    })
  })

  let resp = await call()
  if (!resp.ok && resp.status === 429) {
    console.warn('[video.jobs] rate limited 429, retrying')
    await new Promise(r => setTimeout(r, 2000))
    resp = await call()
    if (!resp.ok && resp.status === 429) {
      console.warn('[video.jobs] rate limited again, backing off')
      await new Promise(r => setTimeout(r, 5000))
      resp = await call()
    }
  }
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '')
    console.error('[video.jobs] vertex error', { status: resp.status, statusText: resp.statusText, txt })
    await supabaseServer.from('nanobanana_canvas_task').update({ status: 'failed', status_code: String(resp.status), payload: { error: txt } }).eq('task_id', taskId)
    return NextResponse.json({ success: false, error: `Vertex error: ${resp.status} ${resp.statusText}`, data: { status: 'failed' } }, { status: resp.status })
  }
  const json = await resp.json() as any
  let inlineVideoBase64: string | undefined
  let mimeType: string | undefined
  let uri: string | undefined
  if (json.candidates && json.candidates[0]?.content?.parts) {
    for (const part of json.candidates[0].content.parts) {
      if (part.inlineData && String(part.inlineData.mimeType || '').startsWith('video/')) {
        inlineVideoBase64 = part.inlineData.data
        mimeType = part.inlineData.mimeType
      } else if (part.fileData && typeof part.fileData.uri === 'string') {
        uri = part.fileData.uri
      }
    }
  }
  const r2 = new R2StorageService(getR2())
  let savedUrl: string | undefined
  if (inlineVideoBase64) {
    console.log('[video.jobs] got inline video data, saving to R2')
    const saved = await r2.uploadBase64(inlineVideoBase64, r2.generateFileName(undefined, 'video_'), payload.folder || 'videos', mimeType || 'video/mp4')
    savedUrl = saved.url
  } else if (uri) {
    console.log('[video.jobs] got fileData uri, fetching', { uri })
    const res = await fetch(uri, { headers: { 'Authorization': `Bearer ${access.token}` } })
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      await supabaseServer.from('nanobanana_canvas_task').update({ status: 'failed', status_code: String(res.status), payload: { error: txt } }).eq('task_id', taskId)
      return NextResponse.json({ success: false, error: `Fetch generated uri failed: ${res.status} ${res.statusText}`, data: { status: 'failed' } }, { status: res.status })
    }
    const ab = await res.arrayBuffer()
    const name = r2.generateFileName(undefined, 'video_')
    const type = res.headers.get('content-type') || 'video/mp4'
    if (typeof File === 'function') {
      const blob = new Blob([ab], { type })
      const file = new File([blob], name, { type })
      const saved = await r2.uploadFile(file, file.name, payload.folder || 'videos')
      savedUrl = saved.url
    } else {
      const buf = Buffer.from(ab)
      const saved = await r2.uploadFile(buf, name, payload.folder || 'videos', type)
      savedUrl = saved.url
    }
  } else {
    await supabaseServer.from('nanobanana_canvas_task').update({ status: 'failed', status_code: 'no_content', payload: { error: 'No video content returned' } }).eq('task_id', taskId)
    return NextResponse.json({ success: false, error: 'No video content returned', data: { status: 'failed' } }, { status: 502 })
  }
  console.log('[video.jobs] saved to R2', { taskId, savedUrl })
  await supabaseServer.from('nanobanana_canvas_task').update({ status: 'succeeded', payload: { videoUrl: savedUrl } }).eq('task_id', taskId)
  return NextResponse.json({ success: true, data: { status: 'succeeded', videoUrl: savedUrl } })
}
