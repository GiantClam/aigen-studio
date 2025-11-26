import { AIProvider, ImageGenerationRequest, ImageGenerationResponse, IAIImageService, AIServiceConfig } from './types'

export class NanobananaService implements IAIImageService {
  private config: AIServiceConfig
  private version: 1 | 2

  constructor(version: 1 | 2 = 1, config?: Partial<AIServiceConfig>) {
    this.version = version
    this.config = {
      provider: version === 1 ? AIProvider.NANOBANANA_1 : AIProvider.NANOBANANA_2,
      endpoint: process.env.NANOBANANA_ENDPOINT || 'https://api.nanobanana.ai/v1',
      apiKey: process.env.NANOBANANA_API_KEY,
      defaultParameters: {
        aspectRatio: '1:1',
        quality: 'high'
      },
      ...config
    }
  }

  isAvailable(): boolean {
    return !!this.config.apiKey && !!this.config.endpoint
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Nanobanana service is not configured',
        provider: this.config.provider
      }
    }

    try {
      const { prompt, images = [], parameters = {} } = request
      const endpoint = this.getEndpoint(request)

      const requestBody = {
        prompt,
        model: this.version === 1 ? 'nanobanana-1' : 'nanobanana-2',
        ...this.config.defaultParameters,
        ...parameters
      }

      if (images.length > 0) {
        Object.assign(requestBody, {
          images: images,
          mode: images.length === 1 ? 'single-image' : 'multi-image'
        })
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`HTTP ${response.status}: ${error}`)
      }

      const data = await response.json()

      return {
        success: true,
        data: {
          imageUrl: data.imageUrl || data.url,
          imageData: data.imageData || data.base64,
          width: data.width,
          height: data.height,
          metadata: {
            model: data.model,
            seed: data.seed,
            parameters: data.parameters
          }
        },
        provider: this.config.provider
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.config.provider
      }
    }
  }

  async editImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Nanobanana service is not configured',
        provider: this.config.provider
      }
    }

    try {
      const { prompt, images = [], maskData, parameters = {} } = request

      if (images.length === 0) {
        return {
          success: false,
          error: 'At least one image is required for editing',
          provider: this.config.provider
        }
      }

      const endpoint = `${this.config.endpoint}/edit`

      const requestBody = {
        prompt,
        image: images[0],
        mask: maskData,
        model: this.version === 1 ? 'nanobanana-1' : 'nanobanana-2',
        ...this.config.defaultParameters,
        ...parameters
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`HTTP ${response.status}: ${error}`)
      }

      const data = await response.json()

      return {
        success: true,
        data: {
          imageUrl: data.imageUrl || data.url,
          imageData: data.imageData || data.base64,
          width: data.width,
          height: data.height,
          metadata: {
            model: data.model,
            seed: data.seed
          }
        },
        provider: this.config.provider
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.config.provider
      }
    }
  }

  async analyzeImage(imageData: string, prompt: string): Promise<ImageGenerationResponse> {
    return {
      success: false,
      error: 'Image analysis is not supported by Nanobanana',
      provider: this.config.provider
    }
  }

  private getEndpoint(request: ImageGenerationRequest): string {
    const { images = [] } = request
    const base = this.config.endpoint

    if (images.length === 0) {
      return `${base}/generate`
    } else if (images.length === 1) {
      return `${base}/image-to-image`
    } else {
      return `${base}/multi-image-to-image`
    }
  }
}
