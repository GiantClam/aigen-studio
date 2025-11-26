import { AbstractTool } from './AbstractTool';

export class SelectTool extends AbstractTool {
  getName(): string {
    return 'select';
  }

  public activate(): void {
    super.activate();
    this.canvas.selection = true;
    this.canvas.defaultCursor = 'default';
    
    // Make all objects selectable
    this.canvas.forEachObject((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });
    this.canvas.requestRenderAll();
  }

  public deactivate(): void {
    super.deactivate();
    this.canvas.selection = false;
    this.canvas.discardActiveObject(); // Clear selection on tool change
    this.canvas.requestRenderAll();
  }
}

