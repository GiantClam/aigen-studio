import { AIProvider, ImageGenerationRequest, ImageGenerationResponse, IAIImageService, AIServiceConfig } from './types'
import { VertexAIService } from '../vertex-ai'
import type { Env } from '../../types/env'

export class GeminiService implements IAIImageService {
  private vertexAI: VertexAIService
  private config: AIServiceConfig

  constructor(env: Env, config?: Partial<AIServiceConfig>) {
    this.vertexAI = new VertexAIService(env)
    this.config = {
      provider: AIProvider.GEMINI,
      defaultParameters: {
        aspectRatio: '1:1',
        quality: 'high',
        temperature: 1
      },
      ...config
    }
  }

  isAvailable(): boolean {
    try {
      return this.vertexAI.isAvailable()
    } catch {
      return false
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Gemini service is not available',
        provider: AIProvider.GEMINI
      }
    }

    try {
      const { prompt, images = [], parameters = {} } = request

      let result
      const modelName = parameters.modelName || undefined
      const opts = {
        aspectRatio: parameters.aspectRatio,
        imageSize: parameters.imageSize
      }

      if (images.length === 0) {
        result = await this.vertexAI.generateImage(prompt, modelName, opts as any)
      } else if (images.length === 1) {
        result = await this.vertexAI.editImage(images[0], prompt, modelName, opts as any)
      } else {
        result = await this.vertexAI.editImage(images[0], prompt, modelName, opts as any)
      }

      if (result.success && result.data) {
        return {
          success: true,
          data: {
            imageUrl: result.data.imageUrl || '',
            imageData: result.data.imageData,
            width: result.data.width,
            height: result.data.height,
            metadata: result.data.metadata
          },
          provider: AIProvider.GEMINI
        }
      }

      return {
        success: false,
        error: result.error || 'Image generation failed',
        provider: AIProvider.GEMINI
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: AIProvider.GEMINI
      }
    }
  }

  async editImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Gemini service is not available',
        provider: AIProvider.GEMINI
      }
    }

    try {
      const { prompt, images = [], maskData, parameters = {} } = request

      if (images.length === 0) {
        return {
          success: false,
          error: 'At least one image is required for editing',
          provider: AIProvider.GEMINI
        }
      }

      const modelName = parameters.modelName || undefined
      const opts = {
        aspectRatio: parameters.aspectRatio,
        imageSize: parameters.imageSize
      }
      const result = await this.vertexAI.editImage(images[0], prompt, modelName, opts as any)

      if (result.success && result.data) {
        return {
          success: true,
          data: {
            imageUrl: result.data.imageUrl || '',
            imageData: result.data.imageData,
            width: result.data.width,
            height: result.data.height,
            metadata: result.data.metadata
          },
          provider: AIProvider.GEMINI
        }
      }

      return {
        success: false,
        error: result.error || 'Image edit failed',
        provider: AIProvider.GEMINI
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: AIProvider.GEMINI
      }
    }
  }

  async analyzeImage(imageData: string, prompt: string): Promise<ImageGenerationResponse> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Gemini service is not available',
        provider: AIProvider.GEMINI
      }
    }

    try {
      const result = await this.vertexAI.analyzeImage(imageData, prompt)

      if (result.success) {
        return {
          success: true,
          data: {
            imageUrl: '',
            metadata: result.data
          },
          provider: AIProvider.GEMINI
        }
      }

      return {
        success: false,
        error: result.error || 'Image analysis failed',
        provider: AIProvider.GEMINI
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: AIProvider.GEMINI
      }
    }
  }
}
