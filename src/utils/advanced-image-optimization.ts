/**
 * 高级图片优化解决方案
 * 结合多种技术处理大图片
 */

export interface OptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'avif'
  progressive?: boolean
  maxSizeKB?: number
}

/**
 * 智能图片优化
 */
export class ImageOptimizer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
  }

  /**
   * 检测浏览器支持的格式
   */
  private async detectSupportedFormats(): Promise<string[]> {
    const formats = ['webp', 'avif', 'jpeg', 'png']
    const supported: string[] = []

    for (const format of formats) {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      
      try {
        const dataURL = canvas.toDataURL(`image/${format}`)
        if (dataURL.startsWith(`data:image/${format}`)) {
          supported.push(format)
        }
      } catch (e) {
        // 格式不支持
      }
    }

    return supported
  }

  /**
   * 计算最佳压缩参数
   */
  private calculateOptimalParams(
    originalSize: number,
    targetSize: number,
    dimensions: { width: number; height: number }
  ): OptimizationOptions {
    const compressionRatio = targetSize / originalSize
    const quality = Math.max(0.1, Math.min(0.9, compressionRatio))
    
    // 计算目标尺寸
    const scale = Math.sqrt(compressionRatio)
    const maxWidth = Math.floor(dimensions.width * scale)
    const maxHeight = Math.floor(dimensions.height * scale)

    return {
      maxWidth,
      maxHeight,
      quality,
      format: 'webp', // 优先使用 WebP
      progressive: true
    }
  }

  /**
   * 渐进式压缩
   */
  async progressiveCompress(
    file: File,
    targetSizeKB: number = 1024
  ): Promise<Blob> {
    const originalSizeKB = file.size / 1024
    const img = await this.loadImage(file)
    
    // 如果已经足够小，直接返回
    if (originalSizeKB <= targetSizeKB) {
      return file
    }

    const dimensions = { width: img.width, height: img.height }
    const params = this.calculateOptimalParams(originalSizeKB, targetSizeKB, dimensions)
    
    return this.compressImage(img, params)
  }

  /**
   * 多格式优化
   */
  async optimizeForWeb(
    file: File,
    options: OptimizationOptions = {}
  ): Promise<{ blob: Blob; format: string; size: number }> {
    const img = await this.loadImage(file)
    const supportedFormats = await this.detectSupportedFormats()
    
    // 优先使用现代格式
    const preferredFormats = ['avif', 'webp', 'jpeg', 'png']
    const bestFormat = preferredFormats.find(f => supportedFormats.includes(f)) || 'jpeg'
    
    const params: OptimizationOptions = {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      format: bestFormat as any,
      progressive: true,
      ...options
    }

    const blob = await this.compressImage(img, params)
    
    return {
      blob,
      format: bestFormat,
      size: blob.size
    }
  }

  /**
   * 生成响应式图片集
   */
  async generateResponsiveImages(
    file: File,
    sizes: number[] = [320, 640, 1024, 1920]
  ): Promise<Array<{ blob: Blob; width: number; size: number }>> {
    const img = await this.loadImage(file)
    const results = []

    for (const width of sizes) {
      if (width > img.width) continue

      const height = Math.floor((img.height * width) / img.width)
      const blob = await this.compressImage(img, {
        maxWidth: width,
        maxHeight: height,
        quality: 0.8,
        format: 'webp'
      })

      results.push({
        blob,
        width,
        size: blob.size
      })
    }

    return results
  }

  /**
   * 压缩图片
   */
  private async compressImage(
    img: HTMLImageElement,
    options: OptimizationOptions
  ): Promise<Blob> {
    const { maxWidth, maxHeight, quality, format, progressive } = options

    // 计算目标尺寸
    let { width, height } = img
    if (maxWidth && width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }
    if (maxHeight && height > maxHeight) {
      width = (width * maxHeight) / height
      height = maxHeight
    }

    // 设置画布尺寸
    this.canvas.width = width
    this.canvas.height = height

    // 绘制图片
    this.ctx.drawImage(img, 0, 0, width, height)

    // 转换为 Blob
    return new Promise((resolve) => {
      this.canvas.toBlob(
        (blob) => resolve(blob!),
        `image/${format}`,
        quality
      )
    })
  }

  /**
   * 加载图片
   */
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 清理资源
   */
  dispose() {
    this.canvas.width = 0
    this.canvas.height = 0
  }
}

/**
 * 使用 Web Workers 进行后台压缩
 */
export class WorkerImageOptimizer {
  private worker: Worker

  constructor() {
    this.worker = new Worker('/workers/image-compression.worker.js')
  }

  async compressInWorker(
    file: File,
    options: OptimizationOptions
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.worker.postMessage({ file, options })
      
      this.worker.onmessage = (e) => {
        if (e.data.error) {
          reject(new Error(e.data.error))
        } else {
          resolve(e.data.blob)
        }
      }
    })
  }

  dispose() {
    this.worker.terminate()
  }
}

/**
 * 懒加载图片优化
 */
export class LazyImageLoader {
  private observer: IntersectionObserver

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target as HTMLImageElement)
            this.observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '50px' }
    )
  }

  observe(img: HTMLImageElement) {
    this.observer.observe(img)
  }

  private async loadImage(img: HTMLImageElement) {
    const src = img.dataset.src
    if (!src) return

    try {
      // 预加载图片
      const response = await fetch(src)
      const blob = await response.blob()
      
      // 优化图片
      const optimizer = new ImageOptimizer()
      const optimized = await optimizer.optimizeForWeb(blob as any)
      
      // 设置优化后的图片
      img.src = URL.createObjectURL(optimized.blob)
      img.classList.add('loaded')
      
      optimizer.dispose()
    } catch (error) {
      console.error('Lazy loading failed:', error)
      img.src = src // 回退到原始图片
    }
  }

  dispose() {
    this.observer.disconnect()
  }
}
