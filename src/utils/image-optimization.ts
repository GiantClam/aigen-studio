/**
 * 图片优化工具
 * 实现展示小尺寸、导出原始尺寸的方案
 */

import { getImageUrlForPurpose, detectImageUrlType } from './cloudflare-image-utils'

export interface ImageOptimizationOptions {
  displayMaxSize?: number // 展示时的最大尺寸
  thumbnailSize?: number // 缩略图尺寸
  quality?: number // 图片质量
  useCloudflareImages?: boolean // 是否使用 Cloudflare Images
}

/**
 * 优化的图片加载器
 * 展示时使用小尺寸，导出时使用原始尺寸
 */
export class OptimizedImageLoader {
  private originalUrl: string
  private displayUrl: string | null = null
  private thumbnailUrl: string | null = null
  private originalSize: { width: number; height: number } | null = null
  private displaySize: { width: number; height: number } | null = null

  constructor(
    originalUrl: string,
    options: ImageOptimizationOptions = {}
  ) {
    this.originalUrl = originalUrl
    this.initializeUrls(options)
  }

  private initializeUrls(options: ImageOptimizationOptions) {
    const {
      displayMaxSize = 800,
      thumbnailSize = 200,
      quality = 85,
    } = options

    // 生成不同用途的 URL
    this.displayUrl = getImageUrlForPurpose(this.originalUrl, 'display', displayMaxSize)
    this.thumbnailUrl = getImageUrlForPurpose(this.originalUrl, 'thumbnail', thumbnailSize)
  }

  /**
   * 获取用于展示的图片 URL（小尺寸）
   */
  getDisplayUrl(): string {
    return this.displayUrl || this.originalUrl
  }

  /**
   * 获取用于导出的图片 URL（原始尺寸）
   */
  getExportUrl(): string {
    return this.originalUrl
  }

  /**
   * 获取缩略图 URL
   */
  getThumbnailUrl(): string {
    return this.thumbnailUrl || this.originalUrl
  }

  /**
   * 预加载原始图片尺寸（用于导出时计算）
   */
  async preloadOriginalSize(): Promise<{ width: number; height: number }> {
    if (this.originalSize) {
      return this.originalSize
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        this.originalSize = {
          width: img.naturalWidth,
          height: img.naturalHeight,
        }
        resolve(this.originalSize)
      }
      
      img.onerror = reject
      img.src = this.originalUrl
    })
  }

  /**
   * 预加载显示图片尺寸
   */
  async preloadDisplaySize(): Promise<{ width: number; height: number }> {
    if (this.displaySize) {
      return this.displaySize
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        this.displaySize = {
          width: img.naturalWidth,
          height: img.naturalHeight,
        }
        resolve(this.displaySize)
      }
      
      img.onerror = reject
      img.src = this.getDisplayUrl()
    })
  }

  /**
   * 计算导出时需要的 multiplier
   */
  async calculateExportMultiplier(): Promise<number> {
    await Promise.all([
      this.preloadOriginalSize(),
      this.preloadDisplaySize(),
    ])

    if (!this.originalSize || !this.displaySize) {
      return 1
    }

    const widthRatio = this.originalSize.width / this.displaySize.width
    const heightRatio = this.originalSize.height / this.displaySize.height
    
    return Math.min(Math.max(widthRatio, heightRatio), 4) // 限制最大 4 倍
  }
}

/**
 * 为 Fabric.js 创建优化的图片对象
 * 展示时使用小尺寸，导出时使用原始尺寸
 */
export async function createOptimizedFabricImage(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): Promise<{
  fabricImage: any
  originalSize: { width: number; height: number }
  displaySize: { width: number; height: number }
  exportMultiplier: number
}> {
  const loader = new OptimizedImageLoader(originalUrl, options)
  
  // 预加载尺寸信息
  const [originalSize, displaySize] = await Promise.all([
    loader.preloadOriginalSize(),
    loader.preloadDisplaySize(),
  ])

  // 使用小尺寸 URL 加载到 Fabric.js（减少内存）
  const displayUrl = loader.getDisplayUrl()
  
    // 动态导入 fabric（如果还没有加载）
    if (typeof window === 'undefined') {
    throw new Error('Fabric.js can only be used in browser')
    }

    const fabric = (window as any).fabric
    if (!fabric) {
    throw new Error('Fabric.js is not loaded')
    }

  // Fabric.js 6.x: fromURL 返回 Promise
  const img = await fabric.Image.fromURL(displayUrl, {
    crossOrigin: 'anonymous',
  })

      if (!img) {
    throw new Error('Failed to load image')
      }

      // 保存原始尺寸信息
      img._originalWidth = originalSize.width
      img._originalHeight = originalSize.height
      img._originalUrl = originalUrl // 保存原始 URL 用于导出
      img._displayUrl = displayUrl // 保存显示 URL
      
      // 计算导出 multiplier
      const exportMultiplier = Math.min(
        Math.max(
          originalSize.width / displaySize.width,
          originalSize.height / displaySize.height
        ),
        4
      )
      img._exportMultiplier = exportMultiplier

      // 检测分辨率类别
      const maxDimension = Math.max(originalSize.width, originalSize.height)
      let resolutionCategory = 'other'
      if (maxDimension <= 1024) resolutionCategory = '1K'
      else if (maxDimension <= 2048) resolutionCategory = '2K'
      else if (maxDimension <= 4096) resolutionCategory = '4K'
      img._resolutionCategory = resolutionCategory

  return {
        fabricImage: img,
        originalSize,
        displaySize,
        exportMultiplier,
  }
}

/**
 * 导出时使用原始尺寸
 */
export async function exportImageAtOriginalResolution(
  canvas: any,
  imageObject: any
): Promise<string> {
  if (!imageObject._originalUrl) {
    // 如果没有原始 URL，使用当前显示尺寸导出
    return canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: imageObject._exportMultiplier || 1,
    })
  }

  // 如果有原始 URL，需要重新加载原始图片并导出
  // 这里可以使用两种方案：
  // 1. 使用 multiplier 导出（当前实现）
  // 2. 临时替换图片源为原始 URL 后导出（更准确但更复杂）

  const multiplier = imageObject._exportMultiplier || 1
  
  return canvas.toDataURL({
    format: 'png',
    quality: 1.0,
    multiplier: Math.min(multiplier, 4), // 限制最大 4 倍
  })
}

