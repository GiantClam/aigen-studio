import * as fabric from 'fabric'
import { BaseTemplate, TemplateType, TemplateConfig, TemplateGenerationOptions, AIGenerationCallbacks } from './BaseTemplate'
import { TextToImageTemplate, TextToImageTemplateConfig } from './TextToImageTemplate'
import { SingleImageToImageTemplate, SingleImageToImageTemplateConfig } from './SingleImageToImageTemplate'
import { MultiImageToImageTemplate, MultiImageToImageTemplateConfig } from './MultiImageToImageTemplate'
import { TemplateManager } from './TemplateManager'

/**
 * 模板工厂配置
 */
export interface TemplateFactoryConfig {
  canvas: fabric.Canvas
  callbacks?: AIGenerationCallbacks
}

/**
 * 模板创建选项
 */
export interface CreateTemplateOptions {
  type: TemplateType
  position?: { left: number; top: number }
  size?: { width: number; height: number }
  config?: any
}

/**
 * 模板工厂 - 用于创建和管理模板实例
 */
export class TemplateFactory {
  private manager: TemplateManager

  constructor(config: TemplateFactoryConfig) {
    this.manager = new TemplateManager(config.canvas, config.callbacks)
  }

  /**
   * 创建文生图模板
   */
  async createTextToImageTemplate(options: {
    position?: { left: number; top: number }
    config?: Partial<TextToImageTemplateConfig>
  } = {}): Promise<TextToImageTemplate | null> {
    const { position = { left: 100, top: 100 }, config = {} } = options

    // 将 position 对象转换为 TemplateGenerationOptions 格式
    const generationOptions: TemplateGenerationOptions = {
      left: position.left,
      top: position.top
    }

    const template = await this.manager.createTemplate(
      TemplateType.TEXT_TO_IMAGE,
      generationOptions,
      config
    ) as unknown as TextToImageTemplate

    return template
  }

  /**
   * 创建单图+文本框生图模板
   */
  async createSingleImageToImageTemplate(options: {
    position?: { left: number; top: number }
    config?: Partial<SingleImageToImageTemplateConfig>
  } = {}): Promise<SingleImageToImageTemplate | null> {
    const { position = { left: 100, top: 100 }, config = {} } = options

    // 将 position 对象转换为 TemplateGenerationOptions 格式
    const generationOptions: TemplateGenerationOptions = {
      left: position.left,
      top: position.top
    }

    const template = await this.manager.createTemplate(
      TemplateType.SINGLE_IMAGE_TO_IMAGE,
      generationOptions,
      config
    ) as unknown as SingleImageToImageTemplate

    return template
  }

  /**
   * 创建多图+文本框生图模板
   */
  async createMultiImageToImageTemplate(options: {
    position?: { left: number; top: number }
    config?: Partial<MultiImageToImageTemplateConfig>
  } = {}): Promise<MultiImageToImageTemplate | null> {
    const { position = { left: 100, top: 100 }, config = {} } = options

    // 将 position 对象转换为 TemplateGenerationOptions 格式
    const generationOptions: TemplateGenerationOptions = {
      left: position.left,
      top: position.top
    }

    const template = await this.manager.createTemplate(
      TemplateType.MULTI_IMAGE_TO_IMAGE,
      generationOptions,
      config
    ) as unknown as MultiImageToImageTemplate

    return template
  }

  /**
   * 通用模板创建方法
   */
  async createTemplate(options: CreateTemplateOptions): Promise<BaseTemplate | null> {
    const { type, position = { left: 100, top: 100 }, size, config } = options

    const generationOptions: TemplateGenerationOptions = {
      left: position.left,
      top: position.top,
      ...(size && { width: size.width, height: size.height })
    }

    return await this.manager.createTemplate(type, generationOptions, config)
  }

  /**
   * 获取模板管理器
   */
  getManager(): TemplateManager {
    return this.manager
  }

  /**
   * 销毁指定类型的模板
   */
  destroyTemplate(type: TemplateType): boolean {
    return this.manager.destroyTemplate(type)
  }

  /**
   * 销毁所有模板
   */
  destroyAllTemplates(): void {
    this.manager.destroyAllTemplates()
  }

  /**
   * 获取指定类型的模板
   */
  getTemplate(type: TemplateType): BaseTemplate | null {
    return this.manager.getTemplate(type)
  }

  /**
   * 检查模板是否存在
   */
  hasTemplate(type: TemplateType): boolean {
    return this.manager.hasTemplate(type)
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): Map<string, BaseTemplate> {
    return this.manager.getAllTemplates()
  }

  /**
   * 更新回调函数
   */
  updateCallbacks(callbacks: AIGenerationCallbacks): void {
    this.manager.updateCallbacks(callbacks)
  }

  /**
   * 序列化所有模板
   */
  serializeAll(): Record<string, any> {
    return this.manager.serializeAll()
  }

  /**
   * 反序列化所有模板
   */
  async deserializeAll(data: Record<string, any>): Promise<void> {
    return this.manager.deserializeAll(data)
  }

  /**
   * 清理工厂
   */
  cleanup(): void {
    this.manager.cleanup()
  }
}
