import * as fabric from 'fabric'
import { BaseTemplate, TemplateConfig, TemplateGenerationOptions, TemplateType } from './BaseTemplate'

/**
 * 多图生图模板角色常量
 */
export const MITI_ROLES = {
  INPUT_IMAGE_1: 'miti-input-image-1',
  INPUT_IMAGE_2: 'miti-input-image-2',
  INPUT_TEXT: 'miti-input-text',
  GENERATE_BUTTON: 'miti-generate-button',
  GENERATE_TEXT: 'miti-generate-text',
  OUTPUT_IMAGE: 'miti-output',
  GROUP: 'miti-group'
} as const

/**
 * 多图生图模板配置
 */
export interface MultiImageToImageTemplateConfig extends TemplateConfig {
  type: TemplateType.MULTI_IMAGE_TO_IMAGE
  imageBoxWidth: number
  imageBoxHeight: number
  textBoxWidth: number
  textBoxHeight: number
  outputBoxWidth: number
  outputBoxHeight: number
  gap: number
  containerPadding: number
}

/**
 * 多图生图模板类 - 最大限度复用文生图模板代码
 */
export class MultiImageToImageTemplate extends BaseTemplate {
  private inputImage1: fabric.Image | null = null
  private inputImage2: fabric.Image | null = null
  private textBox: fabric.Textbox | null = null
  private generateButton: fabric.Rect | null = null
  private generateText: fabric.Text | null = null
  private outputImage: fabric.Image | null = null
  protected config: MultiImageToImageTemplateConfig

  constructor(
    canvas: fabric.Canvas,
    config: Partial<MultiImageToImageTemplateConfig> = {},
    callbacks: any = {}
  ) {
    const defaultConfig: MultiImageToImageTemplateConfig = {
      type: TemplateType.MULTI_IMAGE_TO_IMAGE,
      name: '多图生图模板',
      description: '上传多张图片并输入描述，生成编辑后的图片',
      version: '1.0.0',
      imageBoxWidth: 200,
      imageBoxHeight: 200,
      textBoxWidth: 200,
      textBoxHeight: 200,
      outputBoxWidth: 200,
      outputBoxHeight: 200,
      gap: 20,
      containerPadding: 24,
      ...config
    }

    super(canvas, defaultConfig, callbacks)
    this.config = defaultConfig
  }

  /**
   * 创建多图生图模板
   */
  async create(options: TemplateGenerationOptions = {}): Promise<void> {
    const {
      left = 100,
      top = 100,
      width = this.config.containerPadding * 2 + this.config.imageBoxWidth + this.config.gap + this.config.imageBoxWidth + this.config.gap + this.config.textBoxWidth + this.config.gap + this.config.outputBoxWidth,
      height = Math.max(this.config.imageBoxHeight * 2 + this.config.gap, this.config.textBoxHeight, this.config.outputBoxHeight) + this.config.containerPadding * 2
    } = options

    // 创建容器背景 - 复用文生图模板的容器样式
    const container = new fabric.Rect({
      left,
      top,
      width,
      height,
      fill: '#f9fafb',
      stroke: '#e5e7eb',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    })

    // 创建左侧第一个图片背景
    const imageBg1 = new fabric.Rect({
      left: left + this.config.containerPadding,
      top: top + this.config.containerPadding,
      width: this.config.imageBoxWidth,
      height: this.config.imageBoxHeight,
      fill: '#e5e7eb',
      stroke: '#d1d5db',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    })

    // 创建左侧第二个图片背景
    const imageBg2 = new fabric.Rect({
      left: left + this.config.containerPadding,
      top: top + this.config.containerPadding + this.config.imageBoxHeight + this.config.gap,
      width: this.config.imageBoxWidth,
      height: this.config.imageBoxHeight,
      fill: '#e5e7eb',
      stroke: '#d1d5db',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    })

    // 创建中间文本框背景 - 复用文生图模板的文本框样式
    const textBg = new fabric.Rect({
      left: left + this.config.containerPadding + this.config.imageBoxWidth + this.config.gap,
      top: top + this.config.containerPadding,
      width: this.config.textBoxWidth,
      height: this.config.textBoxHeight,
      fill: '#e5e7eb',
      stroke: '#d1d5db',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    })

    // 创建第一个输入图片占位符
    this.inputImage1 = await this.createPlaceholderImage(
      left + this.config.containerPadding,
      top + this.config.containerPadding,
      this.config.imageBoxWidth,
      this.config.imageBoxHeight,
      '输入图片1'
    )
    ;(this.inputImage1 as any).templateRole = MITI_ROLES.INPUT_IMAGE_1

    // 创建第二个输入图片占位符
    this.inputImage2 = await this.createPlaceholderImage(
      left + this.config.containerPadding,
      top + this.config.containerPadding + this.config.imageBoxHeight + this.config.gap,
      this.config.imageBoxWidth,
      this.config.imageBoxHeight,
      '输入图片2'
    )
    ;(this.inputImage2 as any).templateRole = MITI_ROLES.INPUT_IMAGE_2

    // 创建文本框 - 复用文生图模板的文本框实现
    this.textBox = new fabric.Textbox('输入图片编辑描述...', {
      left: left + this.config.containerPadding + this.config.imageBoxWidth + this.config.gap + 2,
      top: top + this.config.containerPadding + 2,
      width: this.config.textBoxWidth - 4,
      height: this.config.textBoxHeight - 4,
      fontSize: 16,
      fill: '#000000',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      selectable: true,
      evented: true,
      splitByGrapheme: true,
    } as any)
    // 设置 textBaseline 为有效值，避免 'alphabetical' 警告
    ;(this.textBox as any).textBaseline = 'alphabetic'
    ;(this.textBox as any).templateRole = MITI_ROLES.INPUT_TEXT
    ;(this.textBox as any).fixedWidth = this.config.textBoxWidth - 4
    ;(this.textBox as any).fixedHeight = this.config.textBoxHeight - 4

    // 创建生成按钮 - 复用文生图模板的按钮实现
    this.generateButton = new fabric.Rect({
      left: left + this.config.containerPadding + this.config.imageBoxWidth + this.config.gap + this.config.textBoxWidth + this.config.gap / 2 - 20,
      top: top + height / 2 - 20,
      width: 40,
      height: 40,
      fill: '#e5e7eb',
      stroke: '#d1d5db',
      strokeWidth: 1,
      rx: 8,
      ry: 8,
      selectable: false,
      evented: true,
    })
    ;(this.generateButton as any).templateRole = MITI_ROLES.GENERATE_BUTTON
    ;(this.generateButton as any).isEnabled = false

    // 创建生成按钮文本
    this.generateText = new fabric.Text('＝', {
      left: left + this.config.containerPadding + this.config.imageBoxWidth + this.config.gap + this.config.textBoxWidth + this.config.gap / 2,
      top: top + height / 2,
      fontSize: 28,
      fill: '#6b7280',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    })
    // 设置 textBaseline 为有效值，避免 'alphabetical' 警告
    ;(this.generateText as any).textBaseline = 'alphabetic'
    ;(this.generateText as any).templateRole = MITI_ROLES.GENERATE_TEXT

    // 创建输出图片占位符
    this.outputImage = await this.createPlaceholderImage(
      left + this.config.containerPadding + this.config.imageBoxWidth + this.config.gap + this.config.textBoxWidth + this.config.gap,
      top + this.config.containerPadding,
      this.config.outputBoxWidth,
      this.config.outputBoxHeight,
      '生成结果'
    )
    ;(this.outputImage as any).templateRole = MITI_ROLES.OUTPUT_IMAGE

    // 创建组合对象
    // 注意：不指定 left/top，让 Fabric.js 自动计算 Group 的位置
    this.group = new fabric.Group([
      container,
      imageBg1,
      imageBg2,
      textBg,
      this.inputImage1,
      this.inputImage2,
      this.textBox,
      this.generateButton,
      this.generateText,
      this.outputImage
    ], {
      selectable: true,
      evented: true,
    }) as fabric.Group
    ;(this.group as any).templateRole = MITI_ROLES.GROUP
    this.group.subTargetCheck = true

    // 设置事件监听 - 复用文生图模板的事件处理逻辑
    this.setupEventListeners()

    // 添加到画布
    this.canvas.add(this.group)
    
    // 设置 Group 的目标位置（在添加到画布后设置）
    this.group.set({
      left: left,
      top: top
    })
    
    // 确保 Group 对象正确初始化
    this.group.setCoords()
    
    // 强制更新 Group 的坐标和边界
    this.group.calcOCoords()
    
    // 确保所有子对象都可见并正确配置
    if (this.group._objects && Array.isArray(this.group._objects)) {
      this.group._objects.forEach((obj: any) => {
        if (obj.visible === false) {
          obj.set('visible', true)
        }
        if (obj.opacity === 0 || obj.opacity === undefined) {
          obj.set('opacity', 1)
        }
        if (obj.setCoords) {
          obj.setCoords()
        }
        obj.dirty = true
        if ((obj as any).cacheCanvas) {
          (obj as any).cacheCanvas = null
        }
      })
    }
    
    this.group.dirty = true
    if ((this.group as any).cacheCanvas) {
      (this.group as any).cacheCanvas = null
    }
    
    this.canvas.setActiveObject(this.group)
    
    // 立即渲染 - Fabric.js 5.3.0 使用 renderAll()
    this.canvas.renderAll()
    
    // 使用 requestAnimationFrame 确保在下一帧再次渲染
    requestAnimationFrame(() => {
      if (!this.canvas) {
        return
      }
      this.canvas.renderAll()
      
      // 初始自适应调整
      this.fitTextboxToBounds()
      
      // 自适应调整后再次渲染
      requestAnimationFrame(() => {
        if (!this.canvas) {
          return
        }
        this.canvas.renderAll()
      })
    })
  }

  /**
   * 创建占位符图片 - 复用文生图模板的实现
   */
  private async createPlaceholderImage(left: number, top: number, width: number, height: number, text: string): Promise<fabric.Image> {
    // Fabric.js 6.x: fromURL 返回 Promise
    const img = await fabric.Image.fromURL('/logo.svg')
        if (!img) {
      throw new Error('Failed to load placeholder image')
        }
        img.set({
          left,
          top,
          scaleX: width / (img.width || 1),
          scaleY: height / (img.height || 1),
          selectable: false,
          evented: false,
        })

        // 添加文本标签
        const label = new fabric.Text(text, {
          left: left + width / 2,
          top: top + height / 2,
          fontSize: 14,
          fill: '#6b7280',
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        } as any)
        // 设置 textBaseline 为有效值，避免 'alphabetical' 警告
        ;(label as any).textBaseline = 'alphabetic'

        // 将标签添加到图片上
        const group = new fabric.Group([img, label], {
          left,
          top,
          selectable: false,
          evented: false,
        })
    return group as any as fabric.Image
  }

  /**
   * 设置事件监听器 - 复用文生图模板的事件处理
   */
  private setupEventListeners(): void {
    if (!this.group || !this.textBox || !this.generateButton || !this.generateText) return

    // 文本框自适应调整 - 复用文生图模板的逻辑
    this.textBox.on('changed', () => {
      this.fitTextboxToBounds()
      this.updateButtonState()
    })

    this.textBox.on('editing:exited', () => {
      this.fitTextboxToBounds()
      this.updateButtonState()
    })

    // 组点击事件处理
    this.group.on('mousedown', (e: any) => {
      const target = e?.subTargets?.[0] || e?.target
      
      if (target && target.templateRole === MITI_ROLES.INPUT_TEXT) {
        // 激活文本框编辑
        this.canvas.setActiveObject(target)
        ;(target as any).enterEditing && (target as any).enterEditing()
        this.canvas.renderAll()
        e?.e?.stopPropagation?.()
      } else if (target && target.templateRole === MITI_ROLES.INPUT_IMAGE_1) {
        // 处理第一个图片上传
        this.handleImageUpload(1)
        e?.e?.stopPropagation?.()
      } else if (target && target.templateRole === MITI_ROLES.INPUT_IMAGE_2) {
        // 处理第二个图片上传
        this.handleImageUpload(2)
        e?.e?.stopPropagation?.()
      } else if (target && target.templateRole === MITI_ROLES.GENERATE_BUTTON) {
        // 处理生成按钮点击
        if ((target as any).isEnabled) {
          this.handleGenerateClick()
        }
        e?.e?.stopPropagation?.()
      }
    })
  }

  /**
   * 文本框自适应调整 - 完全复用文生图模板的实现
   */
  private fitTextboxToBounds(): void {
    if (!this.textBox) return

    const fixedWidth = (this.textBox as any).fixedWidth
    const fixedHeight = (this.textBox as any).fixedHeight
    const maxFontSize = 20
    const minFontSize = 6
    const padding = 8

    let bestFontSize = maxFontSize
    let bestText = this.textBox.text || ''

    // 从最大字号开始，逐步减小直到文本适合
    for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize--) {
      this.textBox.set('fontSize', fontSize)
      this.textBox.set('width', fixedWidth)
      this.textBox.set('height', fixedHeight)
      this.textBox.initDimensions()
      this.textBox.setCoords()

      const textHeight = this.textBox.calcTextHeight()
      const textWidth = (this.textBox as any).calcTextWidth()

      if (textHeight <= fixedHeight - padding && textWidth <= fixedWidth - 4) {
        bestFontSize = fontSize
        break
      }
    }

    // 如果最小字号仍然超出，则截断文本
    if (bestFontSize === minFontSize) {
      bestText = this.truncateTextIfNeeded(bestText, fixedWidth - 4, fixedHeight - padding)
    }

    // 应用最佳设置
    this.textBox.set('text', bestText)
    this.textBox.set('fontSize', bestFontSize)
    this.textBox.set('width', fixedWidth)
    this.textBox.set('height', fixedHeight)
    this.textBox.initDimensions()
    this.textBox.setCoords()

    console.log(`🎯 自适应调整完成: 字号=${bestFontSize}, 尺寸=${fixedWidth}x${fixedHeight}, 文本长度=${bestText.length}`)
  }

  /**
   * 文本截断处理 - 复用文生图模板的实现
   */
  private truncateTextIfNeeded(text: string, maxWidth: number, maxHeight: number): string {
    if (!this.textBox) return text

    const lines = text.split('\n')
    const truncatedLines: string[] = []

    for (const line of lines) {
      this.textBox.set('text', line)
      this.textBox.initDimensions()
      
      if (this.textBox.calcTextHeight() <= maxHeight / lines.length) {
        truncatedLines.push(line)
      } else {
        // 逐字符截断
        let truncatedLine = ''
        for (let i = 0; i < line.length; i++) {
          const testLine = truncatedLine + line[i]
          this.textBox.set('text', testLine)
          this.textBox.initDimensions()
          
          if (this.textBox.calcTextHeight() <= maxHeight / lines.length) {
            truncatedLine = testLine
          } else {
            break
          }
        }
        truncatedLines.push(truncatedLine + '...')
      }
    }

    return truncatedLines.join('\n')
  }

  /**
   * 更新按钮状态 - 复用文生图模板的逻辑
   */
  private updateButtonState(): void {
    if (!this.generateButton || !this.generateText || !this.textBox || !this.inputImage1 || !this.inputImage2) return

    const hasText = (this.textBox.text || '').trim().length > 0
    const hasImage1 = this.inputImage1 && (this.inputImage1 as any).imageUrl // 检查是否有上传的图片1
    const hasImage2 = this.inputImage2 && (this.inputImage2 as any).imageUrl // 检查是否有上传的图片2
    const isEnabled = hasText && hasImage1 && hasImage2
    ;(this.generateButton as any).isEnabled = isEnabled

    if (isEnabled) {
      // 启用状态：红色背景，白色文字
      this.generateButton.set({
        fill: '#ef4444',
        stroke: '#dc2626'
      })
      this.generateText.set({
        fill: '#ffffff'
      })
    } else {
      // 禁用状态：灰色背景，灰色文字
      this.generateButton.set({
        fill: '#e5e7eb',
        stroke: '#d1d5db'
      })
      this.generateText.set({
        fill: '#6b7280'
      })
    }
    this.safeRenderAll()
  }

  /**
   * 处理图片上传
   */
  private handleImageUpload(imageIndex: number): void {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        this.uploadImage(file, imageIndex)
      }
    }
    input.click()
  }

  /**
   * 上传并显示图片
   */
  private async uploadImage(file: File, imageIndex: number): Promise<void> {
    const targetImage = imageIndex === 1 ? this.inputImage1 : this.inputImage2
    if (!targetImage) return

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        this.updateInputImage(imageUrl, imageIndex)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('❌ 图片上传失败:', error)
    }
  }

  /**
   * 更新输入图片
   */
  private async updateInputImage(imageUrl: string, imageIndex: number): Promise<void> {
    const targetImage = imageIndex === 1 ? this.inputImage1 : this.inputImage2
    if (!targetImage) return

    try {
      // Fabric.js 6.x: fromURL 返回 Promise
      const img = await fabric.Image.fromURL(imageUrl, { crossOrigin: 'anonymous' })
      if (!img || !targetImage) {
        console.error(`❌ Failed to load input image ${imageIndex}:`, imageUrl)
        this.triggerGenerateError(new Error('Failed to load image'))
        return
      }

      const bounds = targetImage.getBoundingRect()
      img.set({
        left: bounds.left,
        top: bounds.top,
        scaleX: bounds.width / (img.width || 1),
        scaleY: bounds.height / (img.height || 1),
        selectable: false,
        evented: false,
      })

      // 替换组中的图片对象
      ;(this.group as any)?.removeWithUpdate(targetImage)
      ;(this.group as any)?.addWithUpdate(img)
      
      if (imageIndex === 1) {
        this.inputImage1 = img
      } else {
        this.inputImage2 = img
      }
      ;(img as any).imageUrl = imageUrl // 保存图片URL
      this.safeRenderAll()

      // 更新按钮状态
      this.updateButtonState()
    } catch (error) {
      console.error(`❌ Error loading input image ${imageIndex}:`, error)
      this.triggerGenerateError(error instanceof Error ? error : new Error('Failed to load image'))
    }
  }

  /**
   * 处理生成按钮点击
   */
  private handleGenerateClick(): void {
    if (!this.textBox || !this.inputImage1 || !this.inputImage2) return

    const prompt = this.textBox.text || ''
    const imageUrl1 = (this.inputImage1 as any).imageUrl
    const imageUrl2 = (this.inputImage2 as any).imageUrl
    if (!prompt.trim() || !imageUrl1 || !imageUrl2) {
      console.log('⚠️ 生成按钮被点击，但文本或图片为空，无法生成')
      return
    }

    console.log('🎨 生成按钮被点击，开始生成图片')
    this.triggerGenerateStart(prompt)
  }

  /**
   * 更新输出图片
   */
  async updateOutputImage(imageUrl: string): Promise<void> {
    if (!this.outputImage || !this.group) return

    try {
      // Fabric.js 6.x: fromURL 返回 Promise
      const img = await fabric.Image.fromURL(imageUrl, { crossOrigin: 'anonymous' })
      if (!img || !this.group) {
        console.error('❌ Failed to load output image:', imageUrl)
        this.triggerGenerateError(new Error('Failed to load image'))
        return
      }

      const bounds = this.outputImage!.getBoundingRect()
      img.set({
        left: bounds.left,
        top: bounds.top,
        scaleX: bounds.width / (img.width || 1),
        scaleY: bounds.height / (img.height || 1),
        selectable: true,
        evented: true,
      })

      // 替换组中的图片对象
      ;(this.group as any).removeWithUpdate(this.outputImage!)
      ;(this.group as any).addWithUpdate(img)
      this.outputImage = img
      this.safeRenderAll()

      this.triggerGenerateSuccess(imageUrl)
    } catch (error) {
      console.error('❌ Error loading output image:', error)
      this.triggerGenerateError(error instanceof Error ? error : new Error('Failed to load image'))
    }
  }

  /**
   * 获取当前输入的文本
   */
  getInputText(): string {
    return this.textBox?.text || ''
  }

  /**
   * 设置输入文本
   */
  setInputText(text: string): void {
    if (this.textBox) {
      this.textBox.set('text', text)
      this.fitTextboxToBounds()
      this.updateButtonState()
    }
  }

  /**
   * 获取输入图片URL
   */
  getInputImageUrls(): { image1: string | null; image2: string | null } {
    return {
      image1: (this.inputImage1 as any)?.imageUrl || null,
      image2: (this.inputImage2 as any)?.imageUrl || null
    }
  }
}
