import * as fabric from 'fabric'

export enum ToolType {
  SELECT = 'select',
  MOVE = 'move',
  BRUSH = 'brush',
  ERASER = 'eraser',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  TEXT = 'text',
  LINE = 'line',
  POLYGON = 'polygon'
}

export interface ToolConfig {
  color?: string
  strokeWidth?: number
  opacity?: number
  fillColor?: string
  fontSize?: number
}

export abstract class BaseTool {
  protected canvas: fabric.Canvas
  protected config: ToolConfig
  protected isActive: boolean = false
  protected listeners: Map<string, any> = new Map()

  constructor(canvas: fabric.Canvas, config: ToolConfig = {}) {
    this.canvas = canvas
    this.config = {
      color: '#000000',
      strokeWidth: 2,
      opacity: 1,
      fillColor: 'transparent',
      fontSize: 20,
      ...config
    }
  }

  abstract getType(): ToolType
  abstract getName(): string
  abstract getIcon(): string

  activate(): void {
    this.isActive = true
    this.setupEventListeners()
    this.onActivate()
  }

  deactivate(): void {
    this.isActive = false
    this.removeEventListeners()
    this.onDeactivate()
  }

  updateConfig(config: Partial<ToolConfig>): void {
    this.config = { ...this.config, ...config }
    this.onConfigUpdate()
  }

  getConfig(): ToolConfig {
    return { ...this.config }
  }

  protected abstract setupEventListeners(): void
  protected abstract removeEventListeners(): void

  protected onActivate(): void {}
  protected onDeactivate(): void {}
  protected onConfigUpdate(): void {}

  protected addListener(event: string, handler: any): void {
    this.listeners.set(event, handler)
    this.canvas.on(event as any, handler)
  }

  protected removeListener(event: string): void {
    const handler = this.listeners.get(event)
    if (handler) {
      this.canvas.off(event as any, handler)
      this.listeners.delete(event)
    }
  }
}
