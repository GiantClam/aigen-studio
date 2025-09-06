import sharp from 'sharp'

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

export class ImageProcessor {
  private static cache = new Map<string, string>()

  /**
   * 优化图像大小和质量
   */
  static async optimizeImage(
    imageData: string,
    options: ImageOptimizationOptions = {}
  ): Promise<string> {
    const {
      width = 1024,
      height = 1024,
      quality = 80,
      format = 'jpeg'
    } = options

    // 生成缓存键
    const cacheKey = `${imageData.slice(0, 50)}-${width}-${height}-${quality}-${format}`
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // 解析 base64 数据
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')

      // 使用 Sharp 优化图像
      let sharpInstance = sharp(buffer)

      // 调整大小（保持宽高比）
      sharpInstance = sharpInstance.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })

      // 设置格式和质量
      switch (format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality })
          break
        case 'png':
          sharpInstance = sharpInstance.png({ quality })
          break
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality })
          break
      }

      const optimizedBuffer = await sharpInstance.toBuffer()
      const optimizedBase64 = `data:image/${format};base64,${optimizedBuffer.toString('base64')}`

      // 缓存结果（限制缓存大小）
      if (this.cache.size > 100) {
        const firstKey = this.cache.keys().next().value
        if (firstKey) {
          this.cache.delete(firstKey)
        }
      }
      this.cache.set(cacheKey, optimizedBase64)

      return optimizedBase64
    } catch (error) {
      console.error('Image optimization failed:', error)
      return imageData // 返回原始数据作为后备
    }
  }

  /**
   * 生成缩略图
   */
  static async generateThumbnail(imageData: string, size: number = 200): Promise<string> {
    return this.optimizeImage(imageData, {
      width: size,
      height: size,
      quality: 60,
      format: 'jpeg'
    })
  }

  /**
   * 检查图像大小
   */
  static getImageSize(imageData: string): number {
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
    return Buffer.from(base64Data, 'base64').length
  }

  /**
   * 压缩大图像
   */
  static async compressLargeImage(imageData: string, maxSizeMB: number = 5): Promise<string> {
    const currentSizeMB = this.getImageSize(imageData) / (1024 * 1024)
    
    if (currentSizeMB <= maxSizeMB) {
      return imageData
    }

    // 计算压缩比例
    const compressionRatio = Math.sqrt(maxSizeMB / currentSizeMB)
    const newWidth = Math.floor(1024 * compressionRatio)
    const newHeight = Math.floor(1024 * compressionRatio)
    const newQuality = Math.max(30, Math.floor(80 * compressionRatio))

    return this.optimizeImage(imageData, {
      width: newWidth,
      height: newHeight,
      quality: newQuality,
      format: 'jpeg'
    })
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    this.cache.clear()
  }
}
