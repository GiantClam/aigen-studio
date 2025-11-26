import * as fabric from 'fabric'
import { BaseTool, ToolType } from './BaseTool'

export class SelectToolNew extends BaseTool {
  getType(): ToolType {
    return ToolType.SELECT
  }

  getName(): string {
    return '选择工具'
  }

  getIcon(): string {
    return 'mouse-pointer'
  }

  protected setupEventListeners(): void {
    this.canvas.selection = true
    this.canvas.forEachObject((obj) => {
      obj.selectable = true
      obj.evented = true
    })
  }

  protected removeEventListeners(): void {
    this.canvas.selection = false
  }

  protected onActivate(): void {
    this.canvas.defaultCursor = 'default'
    this.canvas.hoverCursor = 'move'
  }

  protected onDeactivate(): void {
    this.canvas.discardActiveObject()
    this.canvas.renderAll()
  }
}
