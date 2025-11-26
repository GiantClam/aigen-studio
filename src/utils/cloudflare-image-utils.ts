/**
 * Cloudflare Images 工具函数
 * 用于生成不同尺寸的图片 URL，优化内存使用
 */

/**
 * Cloudflare Images URL 格式
 * https://imagedelivery.net/<account-hash>/<image-id>/<variant-name>
 */

export interface CloudflareImageConfig {
  accountHash: string
  defaultVariant?: string
}

/**
 * 生成 Cloudflare Images URL
 */
export function getCloudflareImageUrl(
  imageId: string,
  variant: string = 'public',
  accountHash?: string
): string {
  // 如果已经是完整 URL，直接返回
  if (imageId.startsWith('http://') || imageId.startsWith('https://')) {
    return imageId
  }

  // 如果配置了 accountHash，使用 Cloudflare Images
  if (accountHash) {
    return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`
  }

  // 否则返回原 URL
  return imageId
}

/**
 * 生成不同尺寸的图片 URL
 * 用于展示时使用小尺寸，导出时使用原始尺寸
 */
export function getImageUrlForDisplay(
  originalUrl: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  // 如果是 Cloudflare Images URL
  if (originalUrl.includes('imagedelivery.net')) {
    // Cloudflare Images 支持 URL 参数转换
    const url = new URL(originalUrl)
    if (width) url.searchParams.set('w', width.toString())
    if (height) url.searchParams.set('h', height.toString())
    url.searchParams.set('q', quality.toString())
    return url.toString()
  }

  // 如果是 R2 或其他存储，可以使用 Cloudflare Workers 的图片转换
  // 或者使用图片代理服务
  if (originalUrl.includes('r2.dev') || originalUrl.includes('r2.cloudflarestorage.com')) {
    // 可以通过 Cloudflare Workers 添加图片转换
    // 这里返回一个转换后的 URL
    let proxyUrl = `/api/image/proxy?url=${encodeURIComponent(originalUrl)}`
    if (width) proxyUrl += `&w=${width}`
    if (height) proxyUrl += `&h=${height}`
    proxyUrl += `&q=${quality}`
    return proxyUrl
  }

  // 默认返回原 URL
  return originalUrl
}

/**
 * 根据用途获取图片 URL
 */
export function getImageUrlForPurpose(
  originalUrl: string,
  purpose: 'display' | 'export' | 'thumbnail',
  maxDisplaySize: number = 800
): string {
  switch (purpose) {
    case 'display':
      // 展示时使用中等尺寸
      return getImageUrlForDisplay(originalUrl, maxDisplaySize, maxDisplaySize, 85)
    
    case 'thumbnail':
      // 缩略图使用小尺寸
      return getImageUrlForDisplay(originalUrl, 200, 200, 75)
    
    case 'export':
      // 导出时使用原始尺寸
      return originalUrl
    
    default:
      return originalUrl
  }
}

/**
 * 检测图片 URL 类型
 */
export function detectImageUrlType(url: string): 'cloudflare-images' | 'r2' | 'supabase' | 'other' {
  if (url.includes('imagedelivery.net')) {
    return 'cloudflare-images'
  }
  if (url.includes('r2.dev') || url.includes('r2.cloudflarestorage.com')) {
    return 'r2'
  }
  if (url.includes('supabase.co') || url.includes('supabase.in')) {
    return 'supabase'
  }
  return 'other'
}

