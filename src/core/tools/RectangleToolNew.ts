import * as fabric from 'fabric'
import { BaseTool, ToolType } from './BaseTool'

export class RectangleToolNew extends BaseTool {
  private isDrawing = false
  private startPoint: { x: number; y: number } | null = null
  private activeShape: fabric.Rect | null = null

  getType(): ToolType {
    return ToolType.RECTANGLE
  }

  getName(): string {
    return '矩形工具'
  }

  getIcon(): string {
    return 'square'
  }

  protected setupEventListeners(): void {
    this.canvas.selection = false
    this.addListener('mouse:down', this.handleMouseDown.bind(this))
    this.addListener('mouse:move', this.handleMouseMove.bind(this))
    this.addListener('mouse:up', this.handleMouseUp.bind(this))
  }

  protected removeEventListeners(): void {
    this.removeListener('mouse:down')
    this.removeListener('mouse:move')
    this.removeListener('mouse:up')
    if (this.activeShape) {
      this.canvas.remove(this.activeShape)
      this.activeShape = null
    }
  }

  private handleMouseDown(e: any): void {
    if (!e.e || e.target) return

    const pointer = this.canvas.getPointer(e.e)
    this.isDrawing = true
    this.startPoint = pointer

    this.activeShape = new fabric.Rect({
      left: pointer.x,
      top: pointer.y,
      width: 0,
      height: 0,
      fill: this.config.fillColor,
      stroke: this.config.color,
      strokeWidth: this.config.strokeWidth,
      opacity: this.config.opacity,
      selectable: false,
      evented: false
    })

    this.canvas.add(this.activeShape)
  }

  private handleMouseMove(e: any): void {
    if (!this.isDrawing || !this.startPoint || !this.activeShape || !e.e) return

    const pointer = this.canvas.getPointer(e.e)
    const width = pointer.x - this.startPoint.x
    const height = pointer.y - this.startPoint.y

    if (width < 0) {
      this.activeShape.set({ left: pointer.x })
    }
    if (height < 0) {
      this.activeShape.set({ top: pointer.y })
    }

    this.activeShape.set({
      width: Math.abs(width),
      height: Math.abs(height)
    })

    this.canvas.renderAll()
  }

  private handleMouseUp(): void {
    if (!this.isDrawing || !this.activeShape) return

    this.isDrawing = false
    this.startPoint = null

    this.activeShape.set({
      selectable: true,
      evented: true
    })

    this.activeShape = null
  }
}
