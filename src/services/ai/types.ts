export enum AIProvider {
  GEMINI = 'gemini',
  NANOBANANA_1 = 'nanobanana-1',
  NANOBANANA_2 = 'nanobanana-2'
}

export enum ImageGenerationType {
  TEXT_TO_IMAGE = 'text-to-image',
  SINGLE_IMAGE_TO_IMAGE = 'single-image-to-image',
  MULTI_IMAGE_TO_IMAGE = 'multi-image-to-image',
  IMAGE_EDIT = 'image-edit'
}

export interface ImageGenerationRequest {
  type: ImageGenerationType
  prompt: string
  model?: AIProvider
  images?: string[]
  maskData?: string
  parameters?: {
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
    quality?: 'low' | 'medium' | 'high'
    style?: string
    negativePrompt?: string
    seed?: number
    guidanceScale?: number
    numInferenceSteps?: number
  }
  metadata?: {
    canvasId?: string
    taskId?: string
    userId?: string
  }
}

export interface ImageGenerationResponse {
  success: boolean
  data?: {
    imageUrl: string
    imageData?: string
    width?: number
    height?: number
    metadata?: any
  }
  error?: string
  provider?: AIProvider
}

export interface AIServiceConfig {
  provider: AIProvider
  apiKey?: string
  endpoint?: string
  defaultParameters?: {
    aspectRatio?: string
    quality?: string
    temperature?: number
  }
}

export interface IAIImageService {
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>
  editImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>
  analyzeImage(imageData: string, prompt: string): Promise<ImageGenerationResponse>
  isAvailable(): boolean
}
