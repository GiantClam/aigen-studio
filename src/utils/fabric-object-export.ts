/**
 * Fabric.js 对象导出工具 - 使用官方推荐的成熟解决方案
 * 
 * 基于 Fabric.js 官方文档和社区最佳实践
 * 解决视窗变换、边界处理和对象渲染的问题
 */

import { Canvas, FabricObject } from 'fabric'

export interface ObjectExportResult {
  imageData: string
  bounds: {
    left: number
    top: number
    width: number
    height: number
    originalBounds: {
      minX: number
      minY: number
      maxX: number
      maxY: number
    }
  }
}

/**
 * 方案1: 使用 Fabric.js 内置的对象导出功能
 * 这是官方推荐的方法，可以正确处理视窗变换和边界问题
 */
export async function exportSelectedObjectsNative(
  canvas: Canvas,
  options: {
    format?: 'png' | 'jpeg'
    quality?: number
    multiplier?: number
    padding?: number
  } = {}
): Promise<ObjectExportResult | null> {
  const activeObjects = canvas.getActiveObjects()
  if (activeObjects.length === 0) return null

  const {
    format = 'png',
    quality = 1,
    multiplier = 2,
    padding = 20
  } = options

  try {
    console.log('🎯 Using Fabric.js native object export method')

    // 方法1: 使用 getBoundingRect() 获取对象边界
    // 在 Fabric.js 6.0+ 中，getBoundingRect() 已经返回正确的坐标
    const bounds = activeObjects.reduce((acc, obj) => {
      const objBounds = obj.getBoundingRect()
      return {
        left: Math.min(acc.left, objBounds.left),
        top: Math.min(acc.top, objBounds.top),
        right: Math.max(acc.right, objBounds.left + objBounds.width),
        bottom: Math.max(acc.bottom, objBounds.top + objBounds.height)
      }
    }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity })

    const captureArea = {
      left: bounds.left - padding,
      top: bounds.top - padding,
      width: bounds.right - bounds.left + padding * 2,
      height: bounds.bottom - bounds.top + padding * 2
    }

    console.log('📏 Native bounds calculation:', {
      objectBounds: bounds,
      captureArea,
      method: 'getBoundingRect(true)'
    })

    // 使用 Fabric.js 的 toDataURL 方法，它会正确处理坐标系
    const imageData = canvas.toDataURL({
      left: captureArea.left,
      top: captureArea.top,
      width: captureArea.width,
      height: captureArea.height,
      format,
      quality,
      multiplier
    })

    return {
      imageData,
      bounds: {
        left: captureArea.left,
        top: captureArea.top,
        width: captureArea.width,
        height: captureArea.height,
        originalBounds: {
          minX: bounds.left,
          minY: bounds.top,
          maxX: bounds.right,
          maxY: bounds.bottom
        }
      }
    }
  } catch (error) {
    console.error('❌ Native export failed:', error)
    return null
  }
}

/**
 * 方案2: 使用临时画布渲染选中对象
 * 当对象超出画布边界时使用此方法
 */
export async function exportSelectedObjectsToTempCanvas(
  canvas: Canvas,
  options: {
    format?: 'png' | 'jpeg'
    quality?: number
    multiplier?: number
    padding?: number
    backgroundColor?: string
  } = {}
): Promise<ObjectExportResult | null> {
  const activeObjects = canvas.getActiveObjects()
  if (activeObjects.length === 0) return null

  const {
    format = 'png',
    quality = 1,
    multiplier = 2,
    padding = 20,
    backgroundColor = 'white'
  } = options

  try {
    console.log('🎨 Using temporary canvas export method')

    // 计算对象边界
    const bounds = activeObjects.reduce((acc, obj) => {
      const objBounds = obj.getBoundingRect()
      return {
        left: Math.min(acc.left, objBounds.left),
        top: Math.min(acc.top, objBounds.top),
        right: Math.max(acc.right, objBounds.left + objBounds.width),
        bottom: Math.max(acc.bottom, objBounds.top + objBounds.height)
      }
    }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity })

    const captureWidth = bounds.right - bounds.left + padding * 2
    const captureHeight = bounds.bottom - bounds.top + padding * 2

    // 创建临时画布
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!
    
    tempCanvas.width = captureWidth * multiplier
    tempCanvas.height = captureHeight * multiplier

    // 设置背景
    tempCtx.fillStyle = backgroundColor
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

    // 缩放上下文
    tempCtx.scale(multiplier, multiplier)

    // 平移上下文，使对象居中
    tempCtx.translate(-bounds.left + padding, -bounds.top + padding)

    // 渲染每个选中的对象
    for (const obj of activeObjects) {
      obj.render(tempCtx)
    }

    const imageData = tempCanvas.toDataURL(`image/${format}`, quality)

    console.log('✅ Temporary canvas export completed:', {
      bounds,
      captureSize: { width: captureWidth, height: captureHeight },
      multiplier,
      imageSize: imageData.length
    })

    return {
      imageData,
      bounds: {
        left: bounds.left - padding,
        top: bounds.top - padding,
        width: captureWidth,
        height: captureHeight,
        originalBounds: {
          minX: bounds.left,
          minY: bounds.top,
          maxX: bounds.right,
          maxY: bounds.bottom
        }
      }
    }
  } catch (error) {
    console.error('❌ Temporary canvas export failed:', error)
    return null
  }
}

/**
 * 智能导出函数 - 自动选择最佳方法
 * 根据对象是否超出画布边界来选择合适的导出方法
 */
export async function exportSelectedObjectsSmart(
  canvas: Canvas,
  options: {
    format?: 'png' | 'jpeg'
    quality?: number
    multiplier?: number
    padding?: number
    backgroundColor?: string
  } = {}
): Promise<ObjectExportResult | null> {
  const activeObjects = canvas.getActiveObjects()
  if (activeObjects.length === 0) return null

  try {
    // 检查对象是否超出画布边界
    const canvasWidth = canvas.getWidth()
    const canvasHeight = canvas.getHeight()
    
    const bounds = activeObjects.reduce((acc, obj) => {
      const objBounds = obj.getBoundingRect()
      return {
        left: Math.min(acc.left, objBounds.left),
        top: Math.min(acc.top, objBounds.top),
        right: Math.max(acc.right, objBounds.left + objBounds.width),
        bottom: Math.max(acc.bottom, objBounds.top + objBounds.height)
      }
    }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity })

    const isOutOfBounds = bounds.left < 0 || bounds.top < 0 || 
                          bounds.right > canvasWidth || bounds.bottom > canvasHeight

    console.log('🤖 Smart export analysis:', {
      bounds,
      canvasSize: { width: canvasWidth, height: canvasHeight },
      isOutOfBounds,
      method: isOutOfBounds ? 'temporary_canvas' : 'native_export'
    })

    if (isOutOfBounds) {
      // 对象超出边界，使用临时画布方法
      return await exportSelectedObjectsToTempCanvas(canvas, options)
    } else {
      // 对象在边界内，使用原生方法
      return await exportSelectedObjectsNative(canvas, options)
    }
  } catch (error) {
    console.error('❌ Smart export failed:', error)
    return null
  }
}

/**
 * 获取对象的最佳分辨率倍数
 * 基于对象中图像的原始分辨率
 */
export function calculateOptimalMultiplier(objects: FabricObject[]): number {
  let maxMultiplier = 2 // 默认2倍

  for (const obj of objects) {
    if (obj.type === 'image') {
      const img = obj as any
      if (img._originalElement && img.width && img.height) {
        const originalWidth = img._originalElement.naturalWidth || img._originalElement.width
        const originalHeight = img._originalElement.naturalHeight || img._originalElement.height
        
        if (originalWidth && originalHeight) {
          const scaleX = img.scaleX || 1
          const scaleY = img.scaleY || 1
          
          const currentWidth = img.width * scaleX
          const currentHeight = img.height * scaleY
          
          const widthRatio = originalWidth / currentWidth
          const heightRatio = originalHeight / currentHeight
          
          const suggestedMultiplier = Math.min(widthRatio, heightRatio, 4) // 最大4倍
          maxMultiplier = Math.max(maxMultiplier, suggestedMultiplier)
        }
      }
    }
  }

  return Math.min(Math.max(Math.floor(maxMultiplier), 1), 4)
}
