import * as fabric from 'fabric'
import { BaseTool, ToolType } from './BaseTool'

export interface ToolManagerConfig {
  canvas: fabric.Canvas
  onToolChange?: (tool: BaseTool) => void
}

export class ToolManager {
  private canvas: fabric.Canvas
  private tools: Map<ToolType, BaseTool> = new Map()
  private currentTool: BaseTool | null = null
  private onToolChange?: (tool: BaseTool) => void

  constructor(config: ToolManagerConfig) {
    this.canvas = config.canvas
    this.onToolChange = config.onToolChange
  }

  registerTool(tool: BaseTool): void {
    this.tools.set(tool.getType(), tool)
  }

  setTool(toolType: ToolType): void {
    if (this.currentTool) {
      this.currentTool.deactivate()
    }

    const tool = this.tools.get(toolType)
    if (!tool) {
      console.warn(`Tool ${toolType} not found`)
      return
    }

    this.currentTool = tool
    this.currentTool.activate()

    if (this.onToolChange) {
      this.onToolChange(this.currentTool)
    }
  }

  getCurrentTool(): BaseTool | null {
    return this.currentTool
  }

  getToolByType(toolType: ToolType): BaseTool | undefined {
    return this.tools.get(toolType)
  }

  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values())
  }

  cleanup(): void {
    if (this.currentTool) {
      this.currentTool.deactivate()
    }
    this.tools.clear()
    this.currentTool = null
  }
}
