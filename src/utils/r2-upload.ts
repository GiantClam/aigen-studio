/**
 * R2 上传工具函数
 * 替换原有的 Supabase Storage 上传
 * 
 * 注意：对于大文件（>10MB），建议使用 r2-direct-upload.ts 中的直接上传方法
 */

export interface UploadResult {
  url: string
  path: string
  size: number
  contentType?: string
}

/**
 * 直接上传文件到 R2（通过 Next.js API）
 * 适用于小文件（<10MB）
 */
export async function uploadFileToR2(
  file: File,
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const response = await fetch('/api/storage/r2/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Upload failed: ${response.status}`)
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error('R2 upload failed:', error)
    throw error
  }
}

/**
 * 上传 Base64 数据到 R2（通过 Next.js API）
 */
export async function uploadBase64ToR2(
  base64Data: string,
  fileName?: string,
  folder: string = 'uploads',
  mimeType: string = 'image/png'
): Promise<UploadResult> {
  try {
    const response = await fetch('/api/storage/r2/upload', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Data,
        fileName,
        folder,
        mimeType,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Upload failed: ${response.status}`)
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error('R2 base64 upload failed:', error)
    throw error
  }
}

/**
 * 智能上传 - 自动选择最佳方式
 * 小文件（<10MB）：通过 Next.js API
 * 大文件（>=10MB）：使用预签名 URL 直接上传
 */
export async function smartUploadToR2(
  input: File | string,
  fileName?: string,
  folder: string = 'uploads',
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  if (typeof input === 'string') {
    // Base64 数据，使用 API 上传
    return uploadBase64ToR2(input, fileName, folder)
  } else {
    // 文件对象
    const file = input as File
    const largeFileThreshold = 10 * 1024 * 1024 // 10MB

    if (file.size >= largeFileThreshold) {
      // 大文件：使用预签名 URL 直接上传（动态导入避免打包问题）
      const { smartUploadToR2Direct } = await import('./r2-direct-upload')
      return smartUploadToR2Direct(file, folder, onProgress)
    } else {
      // 小文件：通过 API 上传
      return uploadFileToR2(file, folder)
    }
  }
}

/**
 * 删除 R2 文件
 */
export async function deleteFileFromR2(path: string): Promise<void> {
  try {
    const response = await fetch(`/api/storage/r2/upload?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Delete failed: ${response.status}`)
    }
  } catch (error) {
    console.error('R2 delete failed:', error)
    throw error
  }
}
