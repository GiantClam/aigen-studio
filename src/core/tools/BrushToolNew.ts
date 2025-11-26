import * as fabric from 'fabric'
import { BaseTool, ToolType } from './BaseTool'

export class BrushToolNew extends BaseTool {
  private brush: fabric.PencilBrush | null = null

  getType(): ToolType {
    return ToolType.BRUSH
  }

  getName(): string {
    return '画笔工具'
  }

  getIcon(): string {
    return 'brush'
  }

  protected setupEventListeners(): void {
    this.brush = new fabric.PencilBrush(this.canvas)
    this.brush.color = this.config.color || '#000000'
    this.brush.width = this.config.strokeWidth || 2
    this.canvas.isDrawingMode = true
    this.canvas.freeDrawingBrush = this.brush
    this.canvas.selection = false
  }

  protected removeEventListeners(): void {
    this.canvas.isDrawingMode = false
    this.brush = null
  }

  protected onConfigUpdate(): void {
    if (this.brush) {
      this.brush.color = this.config.color || '#000000'
      this.brush.width = this.config.strokeWidth || 2
    }
  }
}
