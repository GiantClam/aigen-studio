/**
 * 图片代理和转换 API
 * 使用 Cloudflare Workers 的图片转换功能
 * 或者通过 Next.js Image Optimization
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    const width = searchParams.get('w')
    const height = searchParams.get('h')
    const quality = searchParams.get('q') || '85'
    const format = searchParams.get('f') || 'auto'

    if (!imageUrl) {
      return NextResponse.json({ error: 'url parameter is required' }, { status: 400 })
    }

    // 解码 URL
    const decodedUrl = decodeURIComponent(imageUrl)

    // 如果是 Cloudflare Images，直接使用其转换功能
    if (decodedUrl.includes('imagedelivery.net')) {
      const url = new URL(decodedUrl)
      if (width) url.searchParams.set('w', width)
      if (height) url.searchParams.set('h', height)
      if (quality) url.searchParams.set('q', quality)
      
      // 重定向到转换后的 URL
      return NextResponse.redirect(url.toString())
    }

    // 对于其他 URL，使用 Next.js Image Optimization
    // 或者使用 Cloudflare Workers 的图片转换
    const transformUrl = new URL('/api/image/transform', request.url)
    transformUrl.searchParams.set('url', imageUrl)
    if (width) transformUrl.searchParams.set('w', width)
    if (height) transformUrl.searchParams.set('h', height)
    if (quality) transformUrl.searchParams.set('q', quality)
    if (format) transformUrl.searchParams.set('f', format)

    // 代理请求到图片转换服务
    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status }
      )
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // 如果指定了尺寸，可以使用 sharp 或其他库进行转换
    // 这里简化处理，直接返回原图
    // 实际项目中可以使用 sharp 进行图片转换

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    )
  }
}

