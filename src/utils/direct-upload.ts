/**
 * 直接上传到云存储的解决方案
 * 避免 413 错误的最佳实践
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface UploadResult {
  url: string
  path: string
  size: number
}

/**
 * 直接上传文件到 Supabase Storage
 */
export async function uploadFileDirect(
  file: File,
  bucket: string = 'ai-editor',
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    // 生成唯一文件名
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const fileName = `${folder}/${timestamp}_${randomId}.${fileExt}`
    
    // 直接上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }
    
    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)
    
    return {
      url: urlData.publicUrl,
      path: data.path,
      size: file.size
    }
  } catch (error) {
    console.error('Direct upload failed:', error)
    throw error
  }
}

/**
 * 上传 Base64 数据到云存储
 */
export async function uploadBase64Direct(
  base64Data: string,
  fileName: string,
  bucket: string = 'ai-editor',
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    // 将 Base64 转换为 Blob
    const response = await fetch(base64Data)
    const blob = await response.blob()
    
    // 生成唯一文件名
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileExt = fileName.split('.').pop()?.toLowerCase() || 'png'
    const uniqueFileName = `${folder}/${timestamp}_${randomId}.${fileExt}`
    
    // 直接上传
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, blob, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }
    
    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uniqueFileName)
    
    return {
      url: urlData.publicUrl,
      path: data.path,
      size: blob.size
    }
  } catch (error) {
    console.error('Base64 upload failed:', error)
    throw error
  }
}

/**
 * 分块上传大文件
 */
export async function uploadFileChunked(
  file: File,
  chunkSize: number = 1024 * 1024, // 1MB chunks
  bucket: string = 'ai-editor',
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    const chunks = Math.ceil(file.size / chunkSize)
    const uploadId = `${Date.now()}_${Math.random().toString(36).substring(2)}`
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin'
    
    // 上传所有块
    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)
      
      const chunkFileName = `${folder}/${uploadId}_chunk_${i}.${fileExt}`
      
      const { error } = await supabase.storage
        .from(bucket)
        .upload(chunkFileName, chunk, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) {
        throw new Error(`Chunk ${i} upload failed: ${error.message}`)
      }
    }
    
    // 合并所有块（这里需要服务端支持）
    const finalFileName = `${folder}/${uploadId}.${fileExt}`
    
    // 调用合并 API
    const mergeResponse = await fetch('/api/upload/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uploadId,
        fileName: finalFileName,
        totalChunks: chunks,
        bucket
      })
    })
    
    if (!mergeResponse.ok) {
      throw new Error('Merge failed')
    }
    
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(finalFileName)
    
    return {
      url: urlData.publicUrl,
      path: finalFileName,
      size: file.size
    }
  } catch (error) {
    console.error('Chunked upload failed:', error)
    throw error
  }
}

/**
 * 智能选择上传方式
 */
export async function smartUpload(
  file: File | string,
  fileName?: string,
  maxDirectSize: number = 5 * 1024 * 1024 // 5MB
): Promise<UploadResult> {
  if (typeof file === 'string') {
    // Base64 数据
    return uploadBase64Direct(file, fileName || 'image.png')
  } else {
    // 文件对象
    if (file.size <= maxDirectSize) {
      return uploadFileDirect(file)
    } else {
      return uploadFileChunked(file)
    }
  }
}
