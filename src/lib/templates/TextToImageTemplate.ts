import * as fabric from 'fabric'
import { BaseTemplate, TemplateConfig, TemplateGenerationOptions, TemplateType } from './BaseTemplate'

/**
 * 文生图模板角色常量
 */
export const TTI_ROLES = {
  INPUT_TEXT: 'tti-input',
  GENERATE_BUTTON: 'tti-generate-button',
  GENERATE_TEXT: 'tti-generate-text',
  OUTPUT_IMAGE: 'tti-output',
  GROUP: 'tti-group'
} as const

/**
 * 文生图模板配置
 */
export interface TextToImageTemplateConfig extends TemplateConfig {
  type: TemplateType.TEXT_TO_IMAGE
  textBoxWidth: number
  textBoxHeight: number
  imageBoxWidth: number
  imageBoxHeight: number
  gap: number
  containerPadding: number
}

/**
 * 文生图模板类
 */
export class TextToImageTemplate extends BaseTemplate {
  private textBox: fabric.Textbox | null = null
  private generateButton: fabric.Rect | null = null
  private generateText: fabric.Text | null = null
  private outputImage: fabric.Image | null = null
  protected config: TextToImageTemplateConfig

  constructor(
    canvas: fabric.Canvas,
    config: Partial<TextToImageTemplateConfig> = {},
    callbacks: any = {}
  ) {
    const defaultConfig: TextToImageTemplateConfig = {
      type: TemplateType.TEXT_TO_IMAGE,
      name: '文生图模板',
      description: '输入文本描述，生成对应图片',
      version: '1.0.0',
      textBoxWidth: 200,
      textBoxHeight: 240,
      imageBoxWidth: 200,
      imageBoxHeight: 240,
      gap: 20,
      containerPadding: 24,
      ...config
    }

    super(canvas, defaultConfig, callbacks)
    this.config = defaultConfig
  }

  /**
   * 创建文生图模板
   */
  async create(options: TemplateGenerationOptions = {}): Promise<void> {
    const {
      left = 100,
      top = 100,
      width = this.config.textBoxWidth + this.config.gap + this.config.imageBoxWidth + this.config.containerPadding * 2,
      height = Math.max(this.config.textBoxHeight, this.config.imageBoxHeight) + this.config.containerPadding * 2
    } = options

    // 创建子对象时使用相对坐标（相对于 Group 的 (0,0)）
    // 这是 Fabric.js Group 的正确用法：子对象使用相对坐标，Group 使用绝对坐标
    const container = new fabric.Rect({
      left: 0,  // 相对于 Group 的 (0,0)
      top: 0,   // 相对于 Group 的 (0,0)
      width,
      height,
      fill: '#f9fafb',
      stroke: '#e5e7eb',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    })

    // 创建文本框背景
    const textBg = new fabric.Rect({
      left: this.config.containerPadding,  // 相对于 Group
      top: this.config.containerPadding,    // 相对于 Group
      width: this.config.textBoxWidth,
      height: this.config.textBoxHeight,
      fill: '#e5e7eb',
      stroke: '#d1d5db',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    })

    // 创建文本框
    this.textBox = new fabric.Textbox('说出想法,提示词专家帮你精心设计提示词.\n\n帮我设计一个利用发音联想\n我能快速背英语单词的提示词.\n\n帮我设计一个撰写外卖好评\n这样我可以领代金券。', {
      left: this.config.containerPadding + 2,  // 相对于 Group
      top: this.config.containerPadding + 2,    // 相对于 Group
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
    ;(this.textBox as any).templateRole = TTI_ROLES.INPUT_TEXT
    ;(this.textBox as any).fixedWidth = this.config.textBoxWidth - 4
    ;(this.textBox as any).fixedHeight = this.config.textBoxHeight - 4

    // 创建生成按钮
    this.generateButton = new fabric.Rect({
      left: this.config.containerPadding + this.config.textBoxWidth + this.config.gap / 2 - 20,  // 相对于 Group
      top: height / 2 - 20,  // 相对于 Group
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
    ;(this.generateButton as any).templateRole = TTI_ROLES.GENERATE_BUTTON
    ;(this.generateButton as any).isEnabled = false

    // 创建生成按钮文本
    this.generateText = new fabric.Text('＝', {
      left: this.config.containerPadding + this.config.textBoxWidth + this.config.gap / 2,  // 相对于 Group
      top: height / 2,  // 相对于 Group
      fontSize: 28,
      fill: '#6b7280',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    })
    // 设置 textBaseline 为有效值，避免 'alphabetical' 警告
    ;(this.generateText as any).textBaseline = 'alphabetic'
    ;(this.generateText as any).templateRole = TTI_ROLES.GENERATE_TEXT

    // 创建输出图片占位符（使用相对坐标）
    this.outputImage = await this.createPlaceholderImage(
      this.config.containerPadding + this.config.textBoxWidth + this.config.gap,  // 相对于 Group
      this.config.containerPadding  // 相对于 Group
    )
    ;(this.outputImage as any).templateRole = TTI_ROLES.OUTPUT_IMAGE

    // 创建组合对象
    // 关键修复：子对象使用相对坐标（从0开始），Group 直接指定 left/top
    // 这是 Fabric.js Group 的正确用法
    this.group = new fabric.Group([
      container,
      textBg,
      this.textBox,
      this.generateButton,
      this.generateText,
      this.outputImage
    ], {
      left: left,  // Group 的绝对位置
      top: top,     // Group 的绝对位置
      selectable: true,
      evented: true,
    })
    ;(this.group as any).templateRole = TTI_ROLES.GROUP
    this.group.subTargetCheck = true
    
    // 添加到画布
    this.canvas.add(this.group)
    
    // 强制更新 Group 的坐标和尺寸
    this.group.setCoords()
    
    // 注意：不要调用 calcOffset()，因为子对象已经使用了相对坐标（从0开始）
    // calcOffset() 会重新计算偏移，可能导致子对象坐标变成负数
    
    // 验证并修复子对象坐标（确保都是正数或0，相对于 Group）
    const groupObjects = this.group._objects
    if (!groupObjects || groupObjects.length === 0) {
      return // 如果没有子对象，跳过验证
    }
    
    let hasNegativeCoords = false
    
    // 检查所有子对象的坐标
    groupObjects.forEach((obj: any, index: number) => {
      if (obj.left < -10 || obj.top < -10) {
        hasNegativeCoords = true
        console.warn(`⚠️ Child object ${index} has negative coordinates:`, {
          type: obj.type,
          left: obj.left,
          top: obj.top,
          originalLeft: obj.left,
          originalTop: obj.top
        })
      }
    })
    
    // 如果发现负坐标，修复它们
    if (hasNegativeCoords) {
      // 计算最小偏移量
      const minLeft = Math.min(...groupObjects.map((o: any) => o.left || 0))
      const minTop = Math.min(...groupObjects.map((o: any) => o.top || 0))
      
      // 如果最小坐标是负数，调整所有子对象的坐标
      if (minLeft < 0 || minTop < 0) {
        const offsetX = minLeft < 0 ? -minLeft : 0
        const offsetY = minTop < 0 ? -minTop : 0
        
        console.log('🔧 Fixing negative coordinates with offset:', { offsetX, offsetY })
        
        groupObjects.forEach((o: any) => {
          o.set({
            left: (o.left || 0) + offsetX,
            top: (o.top || 0) + offsetY
          })
        })
        
        // 调整 Group 的位置以补偿偏移
        this.group.set({
          left: (this.group.left || 0) - offsetX,
          top: (this.group.top || 0) - offsetY
        })
        
        // 重新计算 Group 的边界
        this.group.setCoords()
      }
    }
    
    // 验证第一个子对象的坐标
    const firstChild = groupObjects[0] as any
    if (firstChild) {
      console.log('🔍 Group created with relative coordinates:', {
        groupLeft: this.group.left,
        groupTop: this.group.top,
        firstChildLeft: firstChild.left,
        firstChildTop: firstChild.top,
        firstChildType: firstChild.type,
        // 计算绝对坐标（应该等于 container 的原始 left/top，即 left/top）
        absoluteLeft: (this.group.left || 0) + (firstChild.left || 0),
        absoluteTop: (this.group.top || 0) + (firstChild.top || 0),
        expectedAbsolute: { x: left, y: top },
        hasNegativeCoords
      })
      
      // 如果修复后仍有负数坐标，记录错误但不抛出异常
      if (hasNegativeCoords && (firstChild.left < -10 || firstChild.top < -10)) {
        console.error('❌ Child object still has invalid negative coordinates after fix!', {
          childLeft: firstChild.left,
          childTop: firstChild.top,
          expectedRange: '0 to ' + width + ' / 0 to ' + height
        })
      }
    }

    // 设置事件监听
    this.setupEventListeners()
    
    // Group 已经在上面添加到画布并设置了位置
    // 这里只需要确保坐标正确
    
    // 调试信息：检查 Group 的位置和可见性
    console.log('🔍 Group created:', {
      left: this.group.left,
      top: this.group.top,
      width: this.group.width,
      height: this.group.height,
      visible: this.group.visible,
      opacity: this.group.opacity,
      canvasObjects: this.canvas.getObjects().length,
      bounds: this.group.getBoundingRect(),
      groupObjects: this.group._objects?.length || 0,
      // 检查子对象的坐标
      childObjects: this.group._objects?.map((obj: any, idx: number) => ({
        index: idx,
        type: obj.type,
        left: obj.left,
        top: obj.top,
        visible: obj.visible,
        opacity: obj.opacity
      })) || []
    })
    
    // 确保所有子对象都可见并正确配置
    if (this.group._objects && Array.isArray(this.group._objects)) {
      this.group._objects.forEach((obj: any) => {
        if (obj.visible === false) {
          obj.set('visible', true)
        }
        if (obj.opacity === 0 || obj.opacity === undefined) {
          obj.set('opacity', 1)
        }
        // 确保子对象坐标正确
        if (obj.setCoords) {
          obj.setCoords()
        }
        // 确保 strokeWidth 不为 0（如果对象有 stroke）
        if (obj.stroke && !obj.strokeWidth) {
          obj.set('strokeWidth', 1)
        }
        // 标记子对象需要重新渲染
        obj.dirty = true
        // 强制清除缓存（Fabric.js 5.3.0 可能需要）
        if ((obj as any).cacheCanvas) {
          (obj as any).cacheCanvas = null
        }
      })
    }
    
    // 标记 Group 需要重新渲染
    this.group.dirty = true
    // 强制清除 Group 的缓存
    if ((this.group as any).cacheCanvas) {
      (this.group as any).cacheCanvas = null
    }
    
    // 再次确保坐标正确（在设置所有属性后）
    this.group.setCoords()
    if (typeof (this.group as any).calcOffset === 'function') {
      (this.group as any).calcOffset()
    }
    
    this.canvas.setActiveObject(this.group)
    
    // 立即渲染 - Fabric.js 5.3.0 使用 renderAll()
    // 确保在渲染前 Group 的坐标已更新
    this.canvas.renderAll()
    
    // 调试：检查渲染后的状态
    console.log('🔍 After first render:', {
      groupLeft: this.group.left,
      groupTop: this.group.top,
      groupWidth: this.group.width,
      groupHeight: this.group.height,
      bounds: this.group.getBoundingRect(),
      canvasObjects: this.canvas.getObjects().length,
      viewportTransform: this.canvas.viewportTransform
    })
    
    // 使用 requestAnimationFrame 确保在下一帧再次渲染
    requestAnimationFrame(() => {
      if (!this.canvas) {
        return // 静默跳过，canvas 可能已被销毁
      }
      
      // 再次渲染
      this.canvas.renderAll()
      
      // 初始自适应调整
      this.fitTextboxToBounds()
      
      // 自适应调整后再次渲染
      requestAnimationFrame(() => {
        if (!this.canvas) {
          return // 静默跳过
        }
        this.canvas.renderAll()
        console.log('✅ Template rendered after fitTextboxToBounds')
      })
    })
  }

  /**
   * 创建占位符图片
   * @param left 相对于 Group 的 left 坐标
   * @param top 相对于 Group 的 top 坐标
   */
  private async createPlaceholderImage(left: number, top: number): Promise<fabric.Image> {
    // Fabric.js 6.x: fromURL 返回 Promise
    const img = await fabric.Image.fromURL('/logo.svg')
        if (!img) {
      throw new Error('Failed to load placeholder image')
        }
        img.set({
          left,  // 相对于 Group 的坐标
          top,   // 相对于 Group 的坐标
          scaleX: this.config.imageBoxWidth / (img.width || 1),
          scaleY: this.config.imageBoxHeight / (img.height || 1),
          selectable: false,
          evented: false,
        })
    return img
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.group || !this.textBox || !this.generateButton || !this.generateText) return

    // 文本框自适应调整
    this.textBox.on('changed', () => {
      this.fitTextboxToBounds()
      this.updateButtonState()
    })

    this.textBox.on('editing:exited', () => {
      this.fitTextboxToBounds()
      this.updateButtonState()
    })

    // 组点击事件处理
    // 注意：对象级别的 'mousedown' 事件不会阻止画布级别的 'mouse:down' 事件
    // 这两个事件系统是独立的，所以这里不需要担心阻止画布事件
    this.group.on('mousedown', (e: any) => {
      const target = e?.subTargets?.[0] || e?.target
      
      console.log('🎯 Template Group mousedown event (object-level):', {
        targetType: target?.type,
        targetRole: target?.templateRole,
        isInputText: target?.templateRole === TTI_ROLES.INPUT_TEXT,
        isGenerateButton: target?.templateRole === TTI_ROLES.GENERATE_BUTTON,
        note: 'This is object-level event, canvas-level mouse:down will still fire'
      })
      
      if (target && target.templateRole === TTI_ROLES.INPUT_TEXT) {
        // 激活文本框编辑
        this.canvas.setActiveObject(target)
        ;(target as any).enterEditing && (target as any).enterEditing()
        this.canvas.renderAll()
        // 注意：对象级别的事件 stopPropagation 不会影响画布级别的事件
        if (e?.e) {
          console.log('🛑 Template Group: Stopping object-level event propagation for input text')
          e.e.stopPropagation()
        }
      } else if (target && target.templateRole === TTI_ROLES.GENERATE_BUTTON) {
        // 处理生成按钮点击
        if ((target as any).isEnabled) {
          this.handleGenerateClick()
        }
        // 注意：对象级别的事件 stopPropagation 不会影响画布级别的事件
        if (e?.e) {
          console.log('🛑 Template Group: Stopping object-level event propagation for generate button')
          e.e.stopPropagation()
        }
      } else {
        // 其他情况（点击在 Group 的空白区域或其他子对象）
        // 对象级别的事件不会阻止画布级别的 mouse:down 事件
        console.log('✅ Template Group: Object-level event handled, canvas-level mouse:down should still fire')
      }
    })
  }

  /**
   * 文本框自适应调整
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
   * 文本截断处理
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
   * 更新按钮状态
   */
  private updateButtonState(): void {
    if (!this.generateButton || !this.generateText || !this.textBox) return

    const hasText = (this.textBox.text || '').trim().length > 0
    ;(this.generateButton as any).isEnabled = hasText

    if (hasText) {
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
   * 处理生成按钮点击
   */
  private handleGenerateClick(): void {
    if (!this.textBox) return

    const prompt = this.textBox.text || ''
    if (!prompt.trim()) {
      console.log('⚠️ 生成按钮被点击，但文本为空，无法生成')
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
}
