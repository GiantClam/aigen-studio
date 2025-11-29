/**
 * Cloudflare Images 上传 API
 * 用于上传图片到 Cloudflare Images 并获取优化后的 URL
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'images'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN
    const accountHash = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: 'Cloudflare Images not configured. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_IMAGES_API_TOKEN' },
        { status: 500 }
      )
    }

    if (!accountHash) {
      return NextResponse.json(
        { error: 'Cloudflare Images Account Hash not configured. Please set CLOUDFLARE_IMAGES_ACCOUNT_HASH' },
        { status: 500 }
      )
    }

    // 上传到 Cloudflare Images
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    
    // 可选：添加元数据
    if (folder) {
      uploadFormData.append('metadata', JSON.stringify({ folder }))
    }

    console.log('Cloudflare Images upload start', { name: file.name, size: (file as any).size, type: (file as any).type, folder })
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
        body: uploadFormData,
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Cloudflare Images upload error:', errorData)
      throw new Error(`Failed to upload to Cloudflare Images: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.success || !data.result) {
      throw new Error('Invalid response from Cloudflare Images')
    }

    const imageId = data.result.id
    const filename = data.result.filename || file.name

    const cfVariants: string[] = Array.isArray(data.result.variants) ? data.result.variants : []
    const primaryVariant = cfVariants[0] || `https://imagedelivery.net/${accountHash}/${imageId}/public`
    console.log('Cloudflare Images upload success', { imageId, filename, variantsCount: cfVariants.length, primaryVariant })
    const variants = {
      original: primaryVariant,
      display: primaryVariant,
      thumbnail: primaryVariant,
      large: primaryVariant,
      all: cfVariants
    }

    return NextResponse.json({
      success: true,
      data: {
        imageId,
        filename,
        url: primaryVariant,
        variants,
        metadata: data.result.metadata || {},
        uploaded: data.result.uploaded,
      },
    })
  } catch (error) {
    console.error('Cloudflare Images upload error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * 获取图片信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN
    const accountHash = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH

    if (!accountId || !apiToken || !accountHash) {
      return NextResponse.json(
        { error: 'Cloudflare Images not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch image info')
    }

    const data = await response.json()
    
    if (!data.success || !data.result) {
      throw new Error('Invalid response from Cloudflare Images')
    }

    const result = data.result
    const baseUrl = `https://imagedelivery.net/${accountHash}/${imageId}/public`

    return NextResponse.json({
      success: true,
      data: {
        imageId: result.id,
        filename: result.filename,
        url: baseUrl,
        variants: {
          original: baseUrl,
          display: `${baseUrl}?w=800&q=85`,
          thumbnail: `${baseUrl}?w=200&q=75`,
        },
        metadata: result.metadata || {},
        uploaded: result.uploaded,
        requireSignedURLs: result.requireSignedURLs,
      },
    })
  } catch (error) {
    console.error('Cloudflare Images get error:', error)
    return NextResponse.json(
      { error: 'Failed to get image info' },
      { status: 500 }
    )
  }
}

/**
 * 删除图片
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: 'Cloudflare Images not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to delete image')
    }

    const data = await response.json()

    return NextResponse.json({
      success: data.success,
      data: {
        imageId,
        deleted: data.success,
      },
    })
  } catch (error) {
    console.error('Cloudflare Images delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}
