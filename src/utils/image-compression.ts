/**
 * 图片压缩工具函数
 * 用于减少 Base64 图片数据的大小，避免 413 错误
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
  maxSizeKB?: number
}

/**
 * 压缩 Base64 图片数据
 */
export async function compressImage(
  base64Data: string,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8,
    format = 'jpeg',
    maxSizeKB = 2048 // 2MB
  } = options

  try {
    // 创建图片对象
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // 计算压缩后的尺寸
          let { width, height } = img
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width *= ratio
            height *= ratio
          }

          // 设置画布尺寸
          canvas.width = width
          canvas.height = height

          // 绘制压缩后的图片
          ctx.drawImage(img, 0, 0, width, height)

          // 转换为 Base64
          const compressedDataURL = canvas.toDataURL(`image/${format}`, quality)
          
          // 检查压缩后的大小
          const sizeKB = (compressedDataURL.length * 3) / 4 / 1024
          
          if (sizeKB > maxSizeKB) {
            // 如果还是太大，进一步降低质量
            const newQuality = Math.max(0.1, quality * (maxSizeKB / sizeKB))
            const finalDataURL = canvas.toDataURL(`image/${format}`, newQuality)
            resolve(finalDataURL)
          } else {
            resolve(compressedDataURL)
          }
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = base64Data
    })
  } catch (error) {
    console.error('Image compression failed:', error)
    return base64Data // 返回原始数据
  }
}

/**
 * 检查 Base64 数据大小
 */
export function getBase64Size(base64Data: string): number {
  // Base64 编码会增加约 33% 的大小
  return (base64Data.length * 3) / 4
}

/**
 * 检查 Base64 数据大小（KB）
 */
export function getBase64SizeKB(base64Data: string): number {
  return getBase64Size(base64Data) / 1024
}

/**
 * 检查 Base64 数据大小（MB）
 */
export function getBase64SizeMB(base64Data: string): number {
  return getBase64Size(base64Data) / (1024 * 1024)
}

/**
 * 智能压缩图片 - 根据原始大小自动选择压缩参数
 */
export async function smartCompressImage(
  base64Data: string,
  targetSizeKB: number = 1024
): Promise<string> {
  const originalSizeKB = getBase64SizeKB(base64Data)
  
  if (originalSizeKB <= targetSizeKB) {
    return base64Data // 不需要压缩
  }

  // 根据原始大小计算压缩参数
  const compressionRatio = targetSizeKB / originalSizeKB
  const quality = Math.max(0.1, Math.min(0.9, compressionRatio))
  
  // 计算目标尺寸
  const img = new Image()
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const scale = Math.sqrt(compressionRatio)
      const maxWidth = Math.floor(img.width * scale)
      const maxHeight = Math.floor(img.height * scale)
      
      compressImage(base64Data, {
        maxWidth,
        maxHeight,
        quality,
        format: 'jpeg',
        maxSizeKB: targetSizeKB
      }).then(resolve).catch(reject)
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = base64Data
  })
}
