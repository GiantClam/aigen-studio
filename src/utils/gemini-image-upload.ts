/**
 * Gemini 图片上传工具
 * 支持多种上传方式，避免 413 错误
 */

export interface UploadOptions {
  method: 'base64' | 'file' | 'url' | 'auto'
  maxSize?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

export interface UploadResult {
  success: boolean
  data?: {
    editedImageUrl: string
    originalImageUrl: string
    instruction: string
    model: string
    textResponse?: string
    changes: string[]
    confidence: number
    timestamp: string
    provider: string
  }
  error?: string
}

/**
 * 方式1: 直接文件上传 (推荐)
 * 避免 Base64 编码，减少传输大小
 */
export async function uploadFileDirect(
  file: File,
  instruction: string,
  model: string = 'gemini-2.5-flash-image'
): Promise<UploadResult> {
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('instruction', instruction)
    formData.append('model', model)

    const response = await fetch('/api/ai/image/edit-v2', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`)
    }

    return result
  } catch (error) {
    console.error('File upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * 方式2: 云存储 URL (最佳实践)
 * 先上传到云存储，再使用 URL
 */
export async function uploadViaCloudStorage(
  file: File,
  instruction: string,
  model: string = 'gemini-2.5-flash-image'
): Promise<UploadResult> {
  try {
    // 步骤1: 上传到云存储
    const uploadFormData = new FormData()
    uploadFormData.append('image', file)

    const uploadResponse = await fetch('/api/ai/image/edit-v2', {
      method: 'PUT',
      body: uploadFormData
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to cloud storage')
    }

    const uploadResult = await uploadResponse.json()
    const imageUrl = uploadResult.data.imageUrl

    // 步骤2: 使用 URL 进行 AI 处理
    const aiResponse = await fetch('/api/ai/image/edit-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageUrl,
        instruction,
        model
      })
    })

    const result = await aiResponse.json()
    
    if (!aiResponse.ok) {
      throw new Error(result.error || `HTTP ${aiResponse.status}`)
    }

    return result
  } catch (error) {
    console.error('Cloud storage upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cloud storage upload failed'
    }
  }
}

/**
 * 方式3: 优化的 Base64 上传
 * 使用压缩和格式优化
 */
export async function uploadBase64Optimized(
  base64Data: string,
  instruction: string,
  model: string = 'gemini-2.5-flash-image',
  options: { maxSizeKB?: number; quality?: number } = {}
): Promise<UploadResult> {
  try {
    const { maxSizeKB = 2048, quality = 0.8 } = options

    // 检查大小并进行压缩
    const sizeKB = (base64Data.length * 3) / 4 / 1024
    let processedData = base64Data

    if (sizeKB > maxSizeKB) {
      console.log(`🗜️ Compressing image from ${sizeKB.toFixed(1)}KB to target ${maxSizeKB}KB`)
      processedData = await compressBase64Image(base64Data, {
        maxSizeKB,
        quality
      })
    }

    const response = await fetch('/api/ai/image/edit-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageData: processedData,
        instruction,
        model
      })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`)
    }

    return result
  } catch (error) {
    console.error('Base64 upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Base64 upload failed'
    }
  }
}

/**
 * 智能上传 - 自动选择最佳方式
 */
export async function smartUpload(
  input: File | string,
  instruction: string,
  model: string = 'gemini-2.5-flash-image',
  options: UploadOptions = { method: 'auto' }
): Promise<UploadResult> {
  try {
    if (typeof input === 'string') {
      // Base64 数据
      return uploadBase64Optimized(input, instruction, model, {
        maxSizeKB: options.maxSize ? options.maxSize / 1024 : 2048,
        quality: options.quality || 0.8
      })
    } else {
      // 文件对象
      const file = input as File
      
      if (options.method === 'auto') {
        // 自动选择最佳方式
        if (file.size > 5 * 1024 * 1024) { // 大于 5MB
          return uploadViaCloudStorage(file, instruction, model)
        } else {
          return uploadFileDirect(file, instruction, model)
        }
      } else if (options.method === 'file') {
        return uploadFileDirect(file, instruction, model)
      } else if (options.method === 'url') {
        return uploadViaCloudStorage(file, instruction, model)
      } else {
        // 转换为 Base64
        const base64 = await fileToBase64(file)
        return uploadBase64Optimized(base64, instruction, model, {
          maxSizeKB: options.maxSize ? options.maxSize / 1024 : 2048,
          quality: options.quality || 0.8
        })
      }
    }
  } catch (error) {
    console.error('Smart upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Smart upload failed'
    }
  }
}

/**
 * 压缩 Base64 图片
 */
async function compressBase64Image(
  base64Data: string,
  options: { maxSizeKB: number; quality: number }
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    img.onload = () => {
      // 计算压缩比例
      const originalSizeKB = (base64Data.length * 3) / 4 / 1024
      const ratio = options.maxSizeKB / originalSizeKB
      const scale = Math.sqrt(ratio)

      // 设置画布尺寸
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // 转换为 Base64
      const compressedDataURL = canvas.toDataURL('image/jpeg', options.quality)
      resolve(compressedDataURL)
    }

    img.src = base64Data
  })
}

/**
 * 文件转 Base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 批量上传处理
 */
export async function batchUpload(
  files: File[],
  instruction: string,
  model: string = 'gemini-2.5-flash-image'
): Promise<UploadResult[]> {
  const results: UploadResult[] = []
  
  // 并发上传，但限制并发数
  const concurrency = 3
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(file => smartUpload(file, instruction, model))
    )
    results.push(...batchResults)
  }
  
  return results
}
