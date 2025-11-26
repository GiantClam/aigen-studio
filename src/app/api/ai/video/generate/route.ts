import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { GoogleAuth } from 'google-auth-library'
const getEnv = () => ({
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
  GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION || 'global',
  GOOGLE_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, image, model = 'veo-2.0-generate-preview' } = await request.json()

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'prompt is required' }, { status: 400 })
    }

    const env = getEnv()
    if (!env.GOOGLE_CLOUD_PROJECT || !env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return NextResponse.json({ success: false, error: 'Vertex AI is not properly configured' }, { status: 503 })
    }

    const genAI = new GoogleGenAI({ vertexai: true, project: env.GOOGLE_CLOUD_PROJECT!, location: env.GOOGLE_CLOUD_LOCATION! })

    const config: any = { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    let operation: any

    if (image) {
      const base64 = (image as string).includes(',') ? (image as string).split(',')[1] : (image as string)
      const mimeType = (image as string).includes('data:') ? (image as string).split(';')[0].replace('data:', '') : 'image/png'
      operation = await genAI.models.generateVideos({ model, prompt, image: { imageBytes: base64, mimeType }, config })
    } else {
      operation = await genAI.models.generateVideos({ model, prompt, config })
    }

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000))
      operation = await genAI.operations.getVideosOperation({ operation })
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri
    if (!uri) {
      return NextResponse.json({ success: false, error: 'No video URI returned' }, { status: 500 })
    }

    const auth = new GoogleAuth({ credentials: JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_KEY!), scopes: ['https://www.googleapis.com/auth/cloud-platform'] })
    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()

    const download = await fetch(`${uri}`, { headers: { Authorization: `Bearer ${accessToken.token}` } })
    if (!download.ok) {
      const errText = await download.text()
      return NextResponse.json({ success: false, error: `Download failed: ${download.status} ${errText}` }, { status: 500 })
    }

    const arrayBuffer = await download.arrayBuffer()
    const base64Video = Buffer.from(new Uint8Array(arrayBuffer)).toString('base64')
    const dataUrl = `data:video/mp4;base64,${base64Video}`

    return NextResponse.json({ success: true, data: { videoUrl: dataUrl, model } })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
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
