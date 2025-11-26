import * as fabric from 'fabric'
import { BaseTool, ToolType } from './BaseTool'

export class MoveToolNew extends BaseTool {
  private isDragging = false
  private lastPosX = 0
  private lastPosY = 0

  getType(): ToolType {
    return ToolType.MOVE
  }

  getName(): string {
    return '移动工具'
  }

  getIcon(): string {
    return 'move'
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
  }

  private handleMouseDown(e: fabric.TEvent): void {
    if (!e.e) return

    const evt = e.e as MouseEvent
    this.isDragging = true
    this.canvas.selection = false
    this.lastPosX = evt.clientX
    this.lastPosY = evt.clientY
    this.canvas.defaultCursor = 'grabbing'
  }

  private handleMouseMove(e: fabric.TEvent): void {
    if (!this.isDragging || !e.e) return

    const evt = e.e as MouseEvent
    const vpt = this.canvas.viewportTransform
    if (!vpt) return

    vpt[4] += evt.clientX - this.lastPosX
    vpt[5] += evt.clientY - this.lastPosY

    this.canvas.requestRenderAll()
    this.lastPosX = evt.clientX
    this.lastPosY = evt.clientY
  }

  private handleMouseUp(): void {
    this.isDragging = false
    this.canvas.selection = true
    this.canvas.defaultCursor = 'grab'
  }

  protected onActivate(): void {
    this.canvas.defaultCursor = 'grab'
  }

  protected onDeactivate(): void {
    this.canvas.defaultCursor = 'default'
  }
}
