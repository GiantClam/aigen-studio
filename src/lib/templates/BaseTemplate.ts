import * as fabric from 'fabric'

/**
 * 模板类型枚举
 */
export enum TemplateType {
  TEXT_TO_IMAGE = 'text-to-image',
  SINGLE_IMAGE_TO_IMAGE = 'single-image-to-image',
  MULTI_IMAGE_TO_IMAGE = 'multi-image-to-image'
}

/**
 * 模板配置接口
 */
export interface TemplateConfig {
  type: TemplateType
  name: string
  description: string
  version: string
}

/**
 * 模板生成选项
 */
export interface TemplateGenerationOptions {
  left?: number
  top?: number
  width?: number
  height?: number
  [key: string]: any
}

/**
 * AI生成回调接口
 */
export interface AIGenerationCallbacks {
  onGenerateStart?: (prompt: string) => void
  onGenerateSuccess?: (imageUrl: string) => void
  onGenerateError?: (error: Error) => void
}

/**
 * 模板基类 - 所有模板的抽象基类
 */
export abstract class BaseTemplate {
  protected canvas: fabric.Canvas
  protected config: TemplateConfig
  protected group: fabric.Group | null = null
  protected callbacks: AIGenerationCallbacks

  constructor(
    canvas: fabric.Canvas,
    config: TemplateConfig,
    callbacks: AIGenerationCallbacks = {}
  ) {
    this.canvas = canvas
    this.config = config
    this.callbacks = callbacks
  }

  /**
   * 获取模板配置
   */
  getConfig(): TemplateConfig {
    return this.config
  }

  /**
   * 获取模板组对象
   */
  getGroup(): fabric.Group | null {
    return this.group
  }

  /**
   * 创建模板 - 抽象方法，子类必须实现
   */
  abstract create(options?: TemplateGenerationOptions): Promise<void>

  /**
   * 销毁模板
   */
  destroy(): void {
    if (this.group) {
      this.canvas.remove(this.group)
      this.group = null
    }
  }

  /**
   * 序列化模板数据
   */
  serialize(): any {
    if (!this.group) return null
    return this.group.toJSON()
  }

  /**
   * 反序列化模板数据
   */
  deserialize(data: any): void {
    if (!data) return
    // 子类可以重写此方法来实现自定义反序列化逻辑
    // 暂时简化实现，避免类型错误
    console.log('反序列化模板数据:', data)
  }

  /**
   * 检查模板是否有效
   */
  isValid(): boolean {
    return this.group !== null && this.canvas.getObjects().includes(this.group)
  }

  /**
   * 获取模板边界
   */
  getBounds(): any {
    if (!this.group) return null
    return this.group.getBoundingRect()
  }

  /**
   * 设置模板位置
   */
  setPosition(left: number, top: number): void {
    if (this.group) {
      this.group.set({ left, top })
      this.safeRenderAll()
    }
  }

  /**
   * 设置模板大小
   */
  setSize(width: number, height: number): void {
    if (this.group) {
      this.group.set({ width, height })
      this.safeRenderAll()
    }
  }

  /**
   * 触发AI生成开始回调
   */
  protected triggerGenerateStart(prompt: string): void {
    this.callbacks.onGenerateStart?.(prompt)
  }

  /**
   * 触发AI生成成功回调
   */
  protected triggerGenerateSuccess(imageUrl: string): void {
    this.callbacks.onGenerateSuccess?.(imageUrl)
  }

  /**
   * 触发AI生成错误回调
   */
  protected triggerGenerateError(error: Error): void {
    this.callbacks.onGenerateError?.(error)
  }

  /**
   * 查找组内指定角色的对象
   */
  protected findObjectByRole(role: string): fabric.Object | null {
    if (!this.group) return null
    
    const findInGroup = (obj: fabric.Object): fabric.Object | null => {
      if ((obj as any).templateRole === role) return obj
      if (obj.type === 'group' && (obj as fabric.Group)._objects) {
        for (const child of (obj as fabric.Group)._objects) {
          const found = findInGroup(child)
          if (found) return found
        }
      }
      return null
    }
    
    return findInGroup(this.group)
  }

  /**
   * 更新组内指定角色对象的状态
   */
  protected updateObjectByRole(role: string, updates: any): void {
    const obj = this.findObjectByRole(role)
    if (obj) {
      obj.set(updates)
      this.safeRenderAll()
    }
  }

  /**
   * 检查 canvas 是否已完全初始化（context 是否存在）
   * 简化检查逻辑，只检查 canvas 对象是否存在
   */
  protected checkCanvasReady(): boolean {
    try {
      if (!this.canvas) {
        return false
      }
      
      // 简化检查：只检查 canvas 对象是否存在
      // Fabric.js 5.3.0 在初始化时会自动创建 lowerCanvasEl 和 upperCanvasEl
      // 如果 canvas 对象存在，就认为可以尝试渲染
      // 让 Fabric.js 内部处理 context 的获取和错误处理
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * 安全渲染 - 在渲染前检查 canvas 是否已准备好
   * 使用静态标志防止递归调用
   * Fabric.js 5.3.0 使用 renderAll()，6.0+ 才支持 requestRenderAll
   */
  private static _isRendering = false
  
  protected safeRenderAll(): void {
    // 防止递归调用
    if (BaseTemplate._isRendering) {
      return
    }
    
    // 简化检查：只检查 canvas 对象是否存在
    if (!this.checkCanvasReady()) {
      return
    }
    
    try {
      BaseTemplate._isRendering = true
      
      // Fabric.js 5.3.0 直接使用 renderAll()
      // requestRenderAll 是 6.0+ 才有的方法
      this.canvas.renderAll()
    } catch (error: any) {
      // 检查是否是 context 相关的错误
      if (error?.message?.includes('clearRect') || error?.message?.includes('null')) {
        // 静默处理 context 错误，这通常发生在组件卸载时
        // 不需要打印警告，因为这是正常情况
      } else {
        console.warn('⚠️ Render error:', error)
      }
    } finally {
      BaseTemplate._isRendering = false
    }
  }
}
