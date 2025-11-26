/**
 * Canvas 分辨率工具函数
 * 确保正确展示和导出 1K、2K、4K 分辨率的图片
 */

/**
 * 检测图片分辨率类别
 */
export function detectImageResolution(width: number, height: number): '1K' | '2K' | '4K' | 'other' {
  const maxDimension = Math.max(width, height)
  
  if (maxDimension <= 1024) {
    return '1K'
  } else if (maxDimension <= 2048) {
    return '2K'
  } else if (maxDimension <= 4096) {
    return '4K'
  }
  return 'other'
}

/**
 * 计算导出时需要的 multiplier，以保持原始分辨率
 */
export function calculateExportMultiplier(
  originalWidth: number,
  originalHeight: number,
  displayWidth: number,
  displayHeight: number
): number {
  if (!originalWidth || !originalHeight || !displayWidth || !displayHeight) {
    return 1 // 默认值
  }

  const widthRatio = originalWidth / displayWidth
  const heightRatio = originalHeight / displayHeight
  
  // 使用较小的比例，确保不会超出原始尺寸
  const multiplier = Math.min(widthRatio, heightRatio, 4) // 限制最大 4 倍
  
  return Math.max(1, multiplier) // 至少 1 倍
}

/**
 * 从 Fabric.js 图片对象获取原始尺寸
 */
export function getOriginalImageSize(img: any): { width: number; height: number } | null {
  if (!img) return null

  // 方法1: 从 _originalElement 获取
  if (img._originalElement) {
    const naturalWidth = img._originalElement.naturalWidth
    const naturalHeight = img._originalElement.naturalHeight
    if (naturalWidth && naturalHeight) {
      return { width: naturalWidth, height: naturalHeight }
    }
  }

  // 方法2: 从 _element 获取
  if (img._element) {
    const naturalWidth = img._element.naturalWidth
    const naturalHeight = img._element.naturalHeight
    if (naturalWidth && naturalHeight) {
      return { width: naturalWidth, height: naturalHeight }
    }
  }

  // 方法3: 从自定义属性获取（如果之前保存过）
  if (img._originalWidth && img._originalHeight) {
    return { width: img._originalWidth, height: img._originalHeight }
  }

  // 方法4: 从 img.width 和 img.height 获取（Fabric.js 加载后的尺寸）
  if (img.width && img.height) {
    // 需要结合 scaleX 和 scaleY 来计算原始尺寸
    const scaleX = img.scaleX || 1
    const scaleY = img.scaleY || 1
    return {
      width: img.width / scaleX,
      height: img.height / scaleY
    }
  }

  return null
}

/**
 * 保存图片的原始尺寸到 Fabric.js 对象
 */
export function saveOriginalImageSize(img: any, originalWidth: number, originalHeight: number): void {
  if (!img) return

  // 保存到自定义属性
  img._originalWidth = originalWidth
  img._originalHeight = originalHeight

  // 同时保存分辨率类别
  img._resolutionCategory = detectImageResolution(originalWidth, originalHeight)
}

/**
 * 计算画布中所有图片的最佳导出 multiplier
 */
export function calculateOptimalCanvasMultiplier(canvas: any): number {
  if (!canvas) return 2 // 默认 2 倍

  let maxMultiplier = 1
  const objects = canvas.getObjects()

  objects.forEach((obj: any) => {
    if (obj.type === 'image') {
      const originalSize = getOriginalImageSize(obj)
      if (originalSize) {
        const currentWidth = obj.getScaledWidth()
        const currentHeight = obj.getScaledHeight()
        
        if (currentWidth && currentHeight) {
          const multiplier = calculateExportMultiplier(
            originalSize.width,
            originalSize.height,
            currentWidth,
            currentHeight
          )
          maxMultiplier = Math.max(maxMultiplier, multiplier)
        }
      }
    }
  })

  // 限制最大 multiplier 为 4（支持 4K）
  return Math.min(maxMultiplier, 4)
}

/**
 * 导出画布为指定分辨率
 */
export function exportCanvasAtResolution(
  canvas: any,
  targetResolution: '1K' | '2K' | '4K' | 'original' = 'original',
  options: {
    format?: 'png' | 'jpeg'
    quality?: number
  } = {}
): string | null {
  if (!canvas) return null

  const { format = 'png', quality = 1.0 } = options

  try {
    let multiplier = 2 // 默认值

    if (targetResolution === 'original') {
      // 使用原始分辨率
      multiplier = calculateOptimalCanvasMultiplier(canvas)
    } else {
      // 使用指定分辨率
      const canvasWidth = canvas.getWidth()
      const canvasHeight = canvas.getHeight()
      const maxDimension = Math.max(canvasWidth, canvasHeight)

      let targetMaxDimension: number
      switch (targetResolution) {
        case '1K':
          targetMaxDimension = 1024
          break
        case '2K':
          targetMaxDimension = 2048
          break
        case '4K':
          targetMaxDimension = 4096
          break
        default:
          targetMaxDimension = 2048
      }

      multiplier = targetMaxDimension / maxDimension
      multiplier = Math.min(Math.max(multiplier, 1), 4) // 限制在 1-4 倍之间
    }

    console.log(`📥 Exporting canvas at ${targetResolution} resolution with multiplier: ${multiplier}`)

    const dataURL = canvas.toDataURL({
      format,
      quality,
      multiplier
    })

    return dataURL
  } catch (error) {
    console.error('Failed to export canvas:', error)
    return null
  }
}

/**
 * 下载图片，保持原始分辨率
 */
export function downloadImageAtResolution(
  canvas: any,
  filename: string = `canvas-${Date.now()}.png`,
  targetResolution: '1K' | '2K' | '4K' | 'original' = 'original',
  options: {
    format?: 'png' | 'jpeg'
    quality?: number
  } = {}
): void {
  const dataURL = exportCanvasAtResolution(canvas, targetResolution, options)
  
  if (!dataURL) {
    console.error('Failed to generate image data URL')
    return
  }

  const link = document.createElement('a')
  link.download = filename
  link.href = dataURL
  link.click()
}

