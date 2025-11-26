import * as fabric from 'fabric'
import { BaseTemplate, TemplateType, TemplateConfig, TemplateGenerationOptions, AIGenerationCallbacks } from './BaseTemplate'
import { TextToImageTemplate } from './TextToImageTemplate'
import { SingleImageToImageTemplate } from './SingleImageToImageTemplate'
import { MultiImageToImageTemplate } from './MultiImageToImageTemplate'

/**
 * 模板注册表
 */
export interface TemplateRegistry {
  [key: string]: new (canvas: fabric.Canvas, config?: any, callbacks?: AIGenerationCallbacks) => BaseTemplate
}

/**
 * 模板管理器 - 统一管理所有模板
 */
export class TemplateManager {
  private canvas: fabric.Canvas
  private templates: Map<string, BaseTemplate> = new Map()
  private registry: TemplateRegistry = {}
  private callbacks: AIGenerationCallbacks

  constructor(canvas: fabric.Canvas, callbacks: AIGenerationCallbacks = {}) {
    this.canvas = canvas
    this.callbacks = callbacks
    this.registerDefaultTemplates()
  }

  /**
   * 注册默认模板
   */
  private registerDefaultTemplates(): void {
    this.registerTemplate(TemplateType.TEXT_TO_IMAGE, TextToImageTemplate)
    this.registerTemplate(TemplateType.SINGLE_IMAGE_TO_IMAGE, SingleImageToImageTemplate)
    this.registerTemplate(TemplateType.MULTI_IMAGE_TO_IMAGE, MultiImageToImageTemplate)
  }

  /**
   * 注册模板类
   */
  registerTemplate(type: TemplateType, templateClass: new (canvas: fabric.Canvas, config?: any, callbacks?: AIGenerationCallbacks) => BaseTemplate): void {
    this.registry[type] = templateClass
  }

  /**
   * 创建模板
   */
  async createTemplate(
    type: TemplateType,
    options: TemplateGenerationOptions = {},
    config?: any
  ): Promise<BaseTemplate | null> {
    try {
      const TemplateClass = this.registry[type]
      if (!TemplateClass) {
        console.error(`❌ 未找到模板类型: ${type}`)
        return null
      }

      // 销毁同类型的现有模板
      this.destroyTemplate(type)

      // 创建新模板
      const template = new TemplateClass(this.canvas, config, this.callbacks)
      await template.create(options)

      // 注册模板
      this.templates.set(type, template)

      console.log(`✅ 模板创建成功: ${type}`)
      return template
    } catch (error) {
      console.error(`❌ 模板创建失败: ${type}`, error)
      return null
    }
  }

  /**
   * 获取模板
   */
  getTemplate(type: TemplateType): BaseTemplate | null {
    return this.templates.get(type) || null
  }

  /**
   * 销毁模板
   */
  destroyTemplate(type: TemplateType): boolean {
    const template = this.templates.get(type)
    if (template) {
      template.destroy()
      this.templates.delete(type)
      console.log(`🗑️ 模板已销毁: ${type}`)
      return true
    }
    return false
  }

  /**
   * 销毁所有模板
   */
  destroyAllTemplates(): void {
    for (const [type, template] of this.templates) {
      template.destroy()
      console.log(`🗑️ 模板已销毁: ${type}`)
    }
    this.templates.clear()
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): Map<string, BaseTemplate> {
    return new Map(this.templates)
  }

  /**
   * 检查模板是否存在
   */
  hasTemplate(type: TemplateType): boolean {
    return this.templates.has(type)
  }

  /**
   * 获取模板数量
   */
  getTemplateCount(): number {
    return this.templates.size
  }

  /**
   * 序列化所有模板
   */
  serializeAll(): Record<string, any> {
    const data: Record<string, any> = {}
    for (const [type, template] of this.templates) {
      data[type] = template.serialize()
    }
    return data
  }

  /**
   * 反序列化所有模板
   */
  async deserializeAll(data: Record<string, any>): Promise<void> {
    for (const [type, templateData] of Object.entries(data)) {
      const template = this.templates.get(type as TemplateType)
      if (template) {
        template.deserialize(templateData)
      }
    }
  }

  /**
   * 更新回调函数
   */
  updateCallbacks(callbacks: AIGenerationCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * 获取注册的模板类型
   */
  getRegisteredTypes(): TemplateType[] {
    return Object.keys(this.registry) as TemplateType[]
  }

  /**
   * 检查模板类型是否已注册
   */
  isTypeRegistered(type: TemplateType): boolean {
    return type in this.registry
  }

  /**
   * 清理管理器
   */
  cleanup(): void {
    this.destroyAllTemplates()
    this.registry = {}
  }
}
