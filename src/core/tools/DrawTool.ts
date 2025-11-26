import * as fabric from 'fabric';
import { AbstractTool } from './AbstractTool';

export class DrawTool extends AbstractTool {
  private brush: fabric.BaseBrush | undefined;

  getName(): string {
    return 'draw';
  }

  public activate(): void {
    super.activate();
    this.canvas.isDrawingMode = true;
    
    // Initialize brush if not already
    if (!this.canvas.freeDrawingBrush) {
       this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    }
    this.brush = this.canvas.freeDrawingBrush;
    this.brush.width = 5;
    this.brush.color = 'black';
  }

  public deactivate(): void {
    super.deactivate();
    this.canvas.isDrawingMode = false;
  }
}

