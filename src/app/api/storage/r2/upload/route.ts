/**
 * R2 存储上传 API
 * 替换原有的 Supabase Storage
 */

import { NextRequest, NextResponse } from 'next/server'
import { R2StorageService } from '@/lib/common-components'

const getR2Storage = () => {
  const config = {
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID!,
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
  }

  if (!config.accountId || !config.accessKeyId || !config.secretAccessKey || !config.bucketName) {
    throw new Error('R2 storage configuration is missing')
  }

  return new R2StorageService(config)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 检查文件大小
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 100MB' },
        { status: 413 }
      )
    }

    const storage = getR2Storage()
    const fileName = storage.generateFileName(file.name)
    const result = await storage.uploadFile(file, fileName, folder)

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        path: result.path,
        size: result.size,
        contentType: result.contentType,
      },
    })
  } catch (error) {
    console.error('R2 upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { base64Data, fileName, folder = 'uploads', mimeType = 'image/png' } = await request.json()

    if (!base64Data) {
      return NextResponse.json({ error: 'No base64 data provided' }, { status: 400 })
    }

    const storage = getR2Storage()
    const uniqueFileName = fileName || storage.generateFileName(undefined, 'img_')
    const result = await storage.uploadBase64(base64Data, uniqueFileName, folder, mimeType)

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        path: result.path,
        size: result.size,
        contentType: result.contentType,
      },
    })
  } catch (error) {
    console.error('R2 base64 upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload base64 data',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 })
    }

    const storage = getR2Storage()
    await storage.deleteFile(path)

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })
  } catch (error) {
    console.error('R2 delete error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete file',
      },
      { status: 500 }
    )
  }
}

