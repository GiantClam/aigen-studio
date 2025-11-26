/**
 * Cloudflare R2 存储服务
 * 替换原有的 Supabase Storage
 */

import type { StorageConfig, UploadResult } from '../types'

// 动态导入 AWS SDK（避免在客户端打包）
let S3Client: any
let PutObjectCommand: any
let GetObjectCommand: any
let DeleteObjectCommand: any
let HeadObjectCommand: any
let getSignedUrl: any

// 仅在服务器端加载
if (typeof window === 'undefined') {
  const s3Module = require('@aws-sdk/client-s3')
  const presignerModule = require('@aws-sdk/s3-request-presigner')
  S3Client = s3Module.S3Client
  PutObjectCommand = s3Module.PutObjectCommand
  GetObjectCommand = s3Module.GetObjectCommand
  DeleteObjectCommand = s3Module.DeleteObjectCommand
  HeadObjectCommand = s3Module.HeadObjectCommand
  getSignedUrl = presignerModule.getSignedUrl
}

export class R2StorageService {
  private s3Client: any
  private bucketName: string
  private publicUrl?: string

  constructor(config: StorageConfig) {
    this.bucketName = config.bucketName
    this.publicUrl = config.publicUrl

    // 仅在服务器端初始化
    if (typeof window === 'undefined' && S3Client) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      })
    }
  }

  /**
   * 上传文件到 R2
   */
  async uploadFile(
    file: File | Buffer | Uint8Array,
    fileName: string,
    folder: string = 'uploads',
    contentType?: string
  ): Promise<UploadResult> {
    if (typeof window !== 'undefined') {
      throw new Error('R2StorageService can only be used on the server side')
    }

    if (!this.s3Client || !PutObjectCommand) {
      throw new Error('AWS SDK not initialized. This service must be used on the server side.')
    }

    try {
      const key = `${folder}/${fileName}`
      const body = file instanceof File ? await file.arrayBuffer() : file
      const fileSize = file instanceof File ? file.size : (file as Buffer).length

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType || (file instanceof File ? file.type : 'application/octet-stream'),
        CacheControl: 'public, max-age=31536000',
      })

      await this.s3Client.send(command)

      // 生成公开 URL
      const url = this.publicUrl
        ? `${this.publicUrl}/${key}`
        : `https://${this.bucketName}.r2.cloudflarestorage.com/${key}`

      return {
        url,
        path: key,
        size: fileSize,
        contentType: contentType || (file instanceof File ? file.type : undefined),
      }
    } catch (error) {
      console.error('R2 upload error:', error)
      throw new Error(`Failed to upload to R2: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 上传 Base64 数据到 R2
   */
  async uploadBase64(
    base64Data: string,
    fileName: string,
    folder: string = 'uploads',
    mimeType: string = 'image/png'
  ): Promise<UploadResult> {
    try {
      // 移除 data URL 前缀
      const base64Content = base64Data.replace(/^data:[^;]+;base64,/, '')
      const buffer = Buffer.from(base64Content, 'base64')

      return await this.uploadFile(buffer, fileName, folder, mimeType)
    } catch (error) {
      console.error('R2 base64 upload error:', error)
      throw new Error(`Failed to upload base64 to R2: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取文件的预签名 URL（用于下载/临时访问）
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (typeof window !== 'undefined') {
      throw new Error('R2StorageService can only be used on the server side')
    }

    if (!this.s3Client || !GetObjectCommand || !getSignedUrl) {
      throw new Error('AWS SDK not initialized. This service must be used on the server side.')
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })

      return await getSignedUrl(this.s3Client, command, { expiresIn })
    } catch (error) {
      console.error('R2 presigned URL error:', error)
      throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 生成预签名上传 URL（用于前端直接上传）
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string = 'application/octet-stream',
    fileSize?: number,
    expiresIn: number = 3600
  ): Promise<string> {
    if (typeof window !== 'undefined') {
      throw new Error('R2StorageService can only be used on the server side')
    }

    if (!this.s3Client || !PutObjectCommand || !getSignedUrl) {
      throw new Error('AWS SDK not initialized. This service must be used on the server side.')
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        ...(fileSize && { ContentLength: fileSize }),
      })

      return await getSignedUrl(this.s3Client, command, { expiresIn })
    } catch (error) {
      console.error('R2 presigned upload URL error:', error)
      throw new Error(`Failed to generate presigned upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取公开 URL
   */
  getPublicUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`
    }
    // 如果没有配置公开 URL，返回 R2 的默认 URL（需要配置 CORS 和公开访问）
    return `https://${this.bucketName}.r2.cloudflarestorage.com/${key}`
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(key: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      throw new Error('R2StorageService can only be used on the server side')
    }

    if (!this.s3Client || !HeadObjectCommand) {
      throw new Error('AWS SDK not initialized. This service must be used on the server side.')
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })

      await this.s3Client.send(command)
      return true
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false
      }
      throw error
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(key: string): Promise<void> {
    if (typeof window !== 'undefined') {
      throw new Error('R2StorageService can only be used on the server side')
    }

    if (!this.s3Client || !DeleteObjectCommand) {
      throw new Error('AWS SDK not initialized. This service must be used on the server side.')
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })

      await this.s3Client.send(command)
    } catch (error) {
      console.error('R2 delete error:', error)
      throw new Error(`Failed to delete from R2: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 生成唯一文件名
   */
  generateFileName(originalName?: string, prefix: string = ''): string {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 10)
    const ext = originalName?.split('.').pop()?.toLowerCase() || 'bin'
    return `${prefix}${timestamp}_${randomId}.${ext}`
  }
}

