/**
 * 通用组件库类型定义
 */

export interface StorageConfig {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicUrl?: string
}

export interface StripeConfig {
  publishableKey: string
  secretKey: string
  webhookSecret?: string
}

export interface RunningHubConfig {
  apiKey: string
  baseUrl: string
}

export interface UploadResult {
  url: string
  path: string
  size: number
  contentType?: string
}

export interface ImageTask {
  id: string
  type: 'generate' | 'edit' | 'analyze'
  prompt: string
  model: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: {
    imageUrl?: string
    textResponse?: string
    error?: string
  }
  createdAt: string
  updatedAt: string
}

export interface PaymentResult {
  success: boolean
  sessionId?: string
  clientSecret?: string
  error?: string
}

