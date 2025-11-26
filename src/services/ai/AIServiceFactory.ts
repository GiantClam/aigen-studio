import { AIProvider, IAIImageService, AIServiceConfig } from './types'
import { GeminiService } from './GeminiService'
import { NanobananaService } from './NanobananaService'
import type { Env } from '../../types/env'

export class AIServiceFactory {
  private static instances: Map<AIProvider, IAIImageService> = new Map()
  private static env: Env | null = null

  static initialize(env: Env) {
    this.env = env
  }

  static getService(provider: AIProvider = AIProvider.GEMINI): IAIImageService {
    if (!this.env) {
      throw new Error('AIServiceFactory not initialized. Call initialize() first.')
    }

    if (this.instances.has(provider)) {
      return this.instances.get(provider)!
    }

    let service: IAIImageService

    switch (provider) {
      case AIProvider.GEMINI:
        service = new GeminiService(this.env)
        break
      case AIProvider.NANOBANANA_1:
        service = new NanobananaService(1)
        break
      case AIProvider.NANOBANANA_2:
        service = new NanobananaService(2)
        break
      default:
        service = new GeminiService(this.env)
    }

    this.instances.set(provider, service)
    return service
  }

  static getAvailableProviders(): AIProvider[] {
    if (!this.env) {
      return []
    }

    const providers: AIProvider[] = []

    const gemini = new GeminiService(this.env)
    if (gemini.isAvailable()) {
      providers.push(AIProvider.GEMINI)
    }

    const nanobanana1 = new NanobananaService(1)
    if (nanobanana1.isAvailable()) {
      providers.push(AIProvider.NANOBANANA_1)
    }

    const nanobanana2 = new NanobananaService(2)
    if (nanobanana2.isAvailable()) {
      providers.push(AIProvider.NANOBANANA_2)
    }

    return providers
  }

  static reset() {
    this.instances.clear()
  }
}
