/**
 * R2 预签名 URL API
 * 用于前端直接上传大文件到 R2
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

/**
 * 生成预签名上传 URL
 * POST /api/storage/r2/presigned
 * Body: { fileName, folder, contentType, fileSize }
 */
export async function POST(request: NextRequest) {
  try {
    const { fileName, folder = 'uploads', contentType = 'application/octet-stream', fileSize } = await request.json()

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 })
    }

    const storage = getR2Storage()
    
    // 如果没有提供文件名，生成一个
    const finalFileName = fileName || storage.generateFileName(undefined, 'file_')
    const key = `${folder}/${finalFileName}`

    // 生成预签名上传 URL（有效期 1 小时）
    const uploadUrl = await storage.getPresignedUploadUrl(key, contentType, fileSize)

    // 返回上传 URL 和文件路径
    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        key,
        fileName: finalFileName,
        publicUrl: storage.getPublicUrl(key),
      },
    })
  } catch (error) {
    console.error('R2 presigned URL error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate presigned URL',
      },
      { status: 500 }
    )
  }
}

/**
 * 生成预签名下载 URL
 * GET /api/storage/r2/presigned?key=xxx&expiresIn=3600
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600')

    if (!key) {
      return NextResponse.json({ error: 'key parameter is required' }, { status: 400 })
    }

    const storage = getR2Storage()
    const downloadUrl = await storage.getPresignedUrl(key, expiresIn)

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl,
        expiresIn,
      },
    })
  } catch (error) {
    console.error('R2 presigned download URL error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate presigned URL',
      },
      { status: 500 }
    )
  }
}

