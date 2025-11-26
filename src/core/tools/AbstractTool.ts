import * as fabric from 'fabric';
import { CanvasManager } from '../canvas/CanvasManager';

export abstract class AbstractTool {
  protected manager: CanvasManager;
  protected canvas: fabric.Canvas;

  constructor(manager: CanvasManager) {
    this.manager = manager;
    this.canvas = manager.canvas;
  }

  abstract getName(): string;

  /**
   * Called when the tool is selected
   */
  public activate(): void {
    // Default activation logic
    console.log(`🔧 Tool activated: ${this.getName()}`);
  }

  /**
   * Called when the tool is deselected
   */
  public deactivate(): void {
    // Default deactivation logic
    console.log(`🔧 Tool deactivated: ${this.getName()}`);
  }

  // Event handlers to be implemented by subclasses
  public onMouseDown(e: fabric.TEvent<MouseEvent>): void {}
  public onMouseMove(e: fabric.TEvent<MouseEvent>): void {}
  public onMouseUp(e: fabric.TEvent<MouseEvent>): void {}
}

