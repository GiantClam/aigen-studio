import { NextRequest, NextResponse } from 'next/server'
import { R2StorageService } from '@/lib/common-components'
import { GoogleAuth } from 'google-auth-library'

export const runtime = 'nodejs'

const getR2 = () => {
  const cfg = {
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID!,
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
  }
  if (!cfg.accountId || !cfg.accessKeyId || !cfg.secretAccessKey || !cfg.bucketName) {
    throw new Error('R2 storage configuration is missing')
  }
  return new R2StorageService(cfg)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, model = 'veo-2.0-generate-001', videoUrl, videoDataBase64, imageDataUrl, imageUrl, folder = 'videos', contentType = 'video/mp4' } = body

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'prompt is required' }, { status: 400 })
    }

    const r2 = getR2()

    // If client already has a video URL (external), fetch and store into R2
    if (videoUrl && typeof videoUrl === 'string') {
      const res = await fetch(videoUrl)
      if (!res.ok) {
        return NextResponse.json({ success: false, error: `Failed to fetch videoUrl: ${res.status} ${res.statusText}` }, { status: 502 })
      }
      const blob = await res.blob()
      const file = new File([blob], r2.generateFileName(undefined, 'video_'), { type: blob.type || contentType })
      const saved = await r2.uploadFile(file, file.name, folder)
      return NextResponse.json({ success: true, data: { videoUrl: saved.url, path: saved.path, contentType: saved.contentType } })
    }

    // If client passes base64 video content, store it directly
    if (videoDataBase64 && typeof videoDataBase64 === 'string') {
      const saved = await r2.uploadBase64(videoDataBase64, r2.generateFileName(undefined, 'video_'), folder, contentType)
      return NextResponse.json({ success: true, data: { videoUrl: saved.url, path: saved.path, contentType: saved.contentType } })
    }

    // If neither external URL nor base64 is provided, attempt Vertex AI Veo generation
    if (!videoUrl && !videoDataBase64) {
      // Attempt Vertex AI Veo generation via REST
      const project = process.env.GOOGLE_CLOUD_PROJECT
      const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-east5'
      const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
      if (!project || !key) {
        return NextResponse.json({ success: false, error: 'Vertex AI not configured' }, { status: 503 })
      }
      const credentials = typeof key === 'string' ? JSON.parse(key) : key
      const auth = new GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/cloud-platform'], projectId: project })
      const client = await auth.getClient()
      const access = await client.getAccessToken()
      if (!access.token) return NextResponse.json({ success: false, error: 'Failed to get access token' }, { status: 500 })

      const parts: any[] = []
      parts.push({ text: prompt.replace(/model:[^\s]+\s*/g, '').trim() })
      if (imageDataUrl) {
        const b64 = imageDataUrl.includes(',') ? imageDataUrl.split(',')[1] : imageDataUrl
        const mimeType = imageDataUrl.includes('data:') ? imageDataUrl.split(';')[0].replace('data:', '') : 'image/png'
        parts.unshift({ inlineData: { mimeType, data: b64 } })
      } else if (imageUrl && typeof imageUrl === 'string') {
        try {
          const resImg = await fetch(imageUrl)
          if (resImg.ok) {
            const ct = resImg.headers.get('content-type') || 'image/png'
            const buf = Buffer.from(await resImg.arrayBuffer())
            const b64 = buf.toString('base64')
            parts.unshift({ inlineData: { mimeType: ct, data: b64 } })
          }
        } catch {}
      }

      const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`
      const resp = await fetch(url, {
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
      if (!resp.ok) {
        const txt = await resp.text()
        return NextResponse.json({ success: false, error: `Vertex error: ${resp.status} ${resp.statusText} - ${txt}` }, { status: 502 })
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
      if (inlineVideoBase64) {
        const saved = await r2.uploadBase64(inlineVideoBase64, r2.generateFileName(undefined, 'video_'), folder, mimeType || contentType)
        return NextResponse.json({ success: true, data: { videoUrl: saved.url, path: saved.path, contentType: saved.contentType } })
      }
      if (uri) {
        const res = await fetch(uri)
        if (!res.ok) {
          return NextResponse.json({ success: false, error: `Fetch generated uri failed: ${res.status} ${res.statusText}` }, { status: 502 })
        }
        const blob = await res.blob()
        const file = new File([blob], r2.generateFileName(undefined, 'video_'), { type: blob.type || contentType })
        const saved = await r2.uploadFile(file, file.name, folder)
        return NextResponse.json({ success: true, data: { videoUrl: saved.url, path: saved.path, contentType: saved.contentType } })
      }
      return NextResponse.json({ success: false, error: 'No video content returned from Vertex' }, { status: 502 })
    }

    // Fallback explicit message (should not reach)
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Video generate/save error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
