/**
 * R2 直接上传工具函数
 * 使用预签名 URL 实现前端直接上传大文件到 R2
 */

export interface PresignedUploadResult {
  uploadUrl: string
  key: string
  fileName: string
  publicUrl: string
}

export interface DirectUploadResult {
  url: string
  path: string
  size: number
  contentType?: string
}

/**
 * 获取预签名上传 URL
 */
export async function getPresignedUploadUrl(
  fileName: string,
  folder: string = 'uploads',
  contentType?: string,
  fileSize?: number
): Promise<PresignedUploadResult> {
  try {
    const response = await fetch('/api/storage/r2/presigned', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        folder,
        contentType,
        fileSize,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to get presigned URL: ${response.status}`)
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error('Get presigned URL failed:', error)
    throw error
  }
}

/**
 * 使用预签名 URL 直接上传文件到 R2
 * 适用于大文件，不经过 Next.js 服务器
 */
export async function uploadFileDirectToR2(
  file: File,
  folder: string = 'uploads',
  onProgress?: (progress: number) => void
): Promise<DirectUploadResult> {
  try {
    // 1. 获取预签名上传 URL
    const presigned = await getPresignedUploadUrl(
      file.name,
      folder,
      file.type,
      file.size
    )

    // 2. 使用预签名 URL 直接上传到 R2
    const uploadResponse = await fetch(presigned.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Content-Length': file.size.toString(),
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`)
    }

    return {
      url: presigned.publicUrl,
      path: presigned.key,
      size: file.size,
      contentType: file.type,
    }
  } catch (error) {
    console.error('Direct upload to R2 failed:', error)
    throw error
  }
}

/**
 * 分块上传大文件到 R2
 * 适用于超大文件（>100MB）
 * 注意：这是一个简化版本，对于真正的超大文件，应该使用 R2 的 Multipart Upload API
 */
export async function uploadFileChunkedToR2(
  file: File,
  folder: string = 'uploads',
  chunkSize: number = 10 * 1024 * 1024, // 10MB per chunk
  onProgress?: (progress: number) => void
): Promise<DirectUploadResult> {
  try {
    const totalChunks = Math.ceil(file.size / chunkSize)
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const finalFileName = `${uploadId}.${fileExt}`

    // 对于超大文件，我们使用流式上传
    // 先获取最终文件的预签名 URL
    const finalPresigned = await getPresignedUploadUrl(
      finalFileName,
      folder,
      file.type,
      file.size
    )

    // 如果文件太大，使用 ReadableStream 分块上传
    // 注意：R2 的预签名 URL 支持流式上传
    const reader = file.stream().getReader()
    const chunks: Uint8Array[] = []
    let uploadedBytes = 0

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        chunks.push(value)
        uploadedBytes += value.length

        // 更新进度
        if (onProgress) {
          const progress = (uploadedBytes / file.size) * 100
          onProgress(Math.min(progress, 99)) // 保留 1% 给最终上传
        }
      }

      // 合并所有块并上传
      const mergedBlob = new Blob(chunks as BlobPart[], { type: file.type })
      
      const finalResponse = await fetch(finalPresigned.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'Content-Length': mergedBlob.size.toString(),
        },
        body: mergedBlob,
      })

      if (!finalResponse.ok) {
        const errorText = await finalResponse.text()
        throw new Error(`Final upload failed: ${finalResponse.status} ${errorText}`)
      }

      if (onProgress) {
        onProgress(100)
      }

      return {
        url: finalPresigned.publicUrl,
        path: finalPresigned.key,
        size: file.size,
        contentType: file.type,
      }
    } finally {
      reader.releaseLock()
    }
  } catch (error) {
    console.error('Chunked upload to R2 failed:', error)
    throw error
  }
}

/**
 * 智能上传 - 根据文件大小自动选择上传方式
 */
export async function smartUploadToR2Direct(
  file: File,
  folder: string = 'uploads',
  onProgress?: (progress: number) => void
): Promise<DirectUploadResult> {
  const largeFileThreshold = 100 * 1024 * 1024 // 100MB

  if (file.size > largeFileThreshold) {
    // 大文件使用分块上传
    return uploadFileChunkedToR2(file, folder, undefined, onProgress)
  } else {
    // 小文件直接上传
    return uploadFileDirectToR2(file, folder, onProgress)
  }
}

