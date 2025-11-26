import * as fabric from 'fabric'
import { BaseTool, ToolType } from './BaseTool'

export class CircleToolNew extends BaseTool {
  private isDrawing = false
  private startPoint: { x: number; y: number } | null = null
  private activeShape: fabric.Circle | null = null

  getType(): ToolType {
    return ToolType.CIRCLE
  }

  getName(): string {
    return '圆形工具'
  }

  getIcon(): string {
    return 'circle'
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

  private handleMouseDown(e: fabric.TEvent): void {
    if (!e.e) return

    const pointer = this.canvas.getPointer(e.e)
    this.isDrawing = true
    this.startPoint = pointer

    this.activeShape = new fabric.Circle({
      left: pointer.x,
      top: pointer.y,
      radius: 0,
      fill: this.config.fillColor,
      stroke: this.config.color,
      strokeWidth: this.config.strokeWidth,
      opacity: this.config.opacity,
      selectable: false,
      evented: false,
      originX: 'center',
      originY: 'center'
    })

    this.canvas.add(this.activeShape)
  }

  private handleMouseMove(e: fabric.TEvent): void {
    if (!this.isDrawing || !this.startPoint || !this.activeShape || !e.e) return

    const pointer = this.canvas.getPointer(e.e)
    const dx = pointer.x - this.startPoint.x
    const dy = pointer.y - this.startPoint.y
    const radius = Math.sqrt(dx * dx + dy * dy)

    this.activeShape.set({
      radius: radius
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
