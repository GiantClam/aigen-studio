import * as fabric from 'fabric';
import { AbstractTool } from './AbstractTool';
import { SelectTool } from './SelectTool';

export class RectangleTool extends AbstractTool {
  private isDrawing = false;
  private startPoint: fabric.Point | null = null;
  private rect: fabric.Rect | null = null;

  getName(): string {
    return 'rectangle';
  }

  public activate(): void {
    super.activate();
    this.canvas.defaultCursor = 'crosshair';
    this.canvas.selection = false;
    // Prevent selecting other objects while drawing
    this.canvas.forEachObject(o => { o.selectable = false; o.evented = false; });
  }

  public deactivate(): void {
    super.deactivate();
    this.canvas.defaultCursor = 'default';
  }

  public onMouseDown(opt: fabric.TEvent<MouseEvent>): void {
    if (!opt.e) return;
    
    this.isDrawing = true;
    const pointer = this.canvas.getPointer(opt.e);
    this.startPoint = new fabric.Point(pointer.x, pointer.y);

    this.rect = new fabric.Rect({
      left: this.startPoint.x,
      top: this.startPoint.y,
      width: 0,
      height: 0,
      fill: 'transparent', 
      stroke: 'black',
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });

    this.canvas.add(this.rect);
  }

  public onMouseMove(opt: fabric.TEvent<MouseEvent>): void {
    if (!this.isDrawing || !this.rect || !this.startPoint) return;
    
    const pointer = this.canvas.getPointer(opt.e);
    
    // Calculate dimensions allowing for negative width/height logic
    const width = Math.abs(pointer.x - this.startPoint.x);
    const height = Math.abs(pointer.y - this.startPoint.y);
    
    const left = Math.min(pointer.x, this.startPoint.x);
    const top = Math.min(pointer.y, this.startPoint.y);

    this.rect.set({ left, top, width, height });
    this.canvas.requestRenderAll();
  }

  public onMouseUp(opt: fabric.TEvent<MouseEvent>): void {
    if (this.isDrawing && this.rect) {
        this.rect.setCoords();
        this.rect.selectable = true;
        this.rect.evented = true;
        
        // Switch back to select tool for better UX
        this.manager.setTool(new SelectTool(this.manager));
    }
    this.isDrawing = false;
    this.rect = null;
    this.startPoint = null;
  }
}

