import * as fabric from 'fabric';
import { AbstractTool } from '../tools/AbstractTool';

export interface CanvasOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export class CanvasManager {
  public canvas: fabric.Canvas;
  private container: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private activeTool: AbstractTool | null = null;

  constructor(canvasEl: HTMLCanvasElement, options: CanvasOptions = {}) {
    console.log('🚀 Initializing CanvasManager with Fabric.js 6.9.0');
    
    this.canvas = new fabric.Canvas(canvasEl, {
      width: options.width || window.innerWidth,
      height: options.height || window.innerHeight,
      backgroundColor: options.backgroundColor || '#f3f4f6', // bg-gray-100
      selection: true, // Enable group selection by default
      preserveObjectStacking: true, // Keep object stack order when selecting
      uniformScaling: true,
      stopContextMenu: true, // Prevent default context menu
      fireRightClick: true, // Enable right click events
    });

    // Set up responsive resizing
    const parentElement = canvasEl.parentElement;
    if (parentElement) {
      this.container = parentElement;
      this.setupResponsiveResize();
    }

    this.setupLifecycle();
    this.setupEventDispatcher();
  }

  private setupLifecycle() {
    // Basic lifecycle events if needed
    this.canvas.on('after:render', () => {
      // console.log('Canvas rendered');
    });
  }

  private setupResponsiveResize() {
    if (!this.container) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Only resize if dimensions actually changed
        if (this.canvas.width !== width || this.canvas.height !== height) {
          this.canvas.setDimensions({ width, height });
          this.requestRender();
        }
      }
    });

    this.resizeObserver.observe(this.container);
  }

  private setupEventDispatcher() {
    this.canvas.on('mouse:down', (e: any) => {
      if (this.activeTool) this.activeTool.onMouseDown(e);
    });
    this.canvas.on('mouse:move', (e: any) => {
      if (this.activeTool) this.activeTool.onMouseMove(e);
    });
    this.canvas.on('mouse:up', (e: any) => {
      if (this.activeTool) this.activeTool.onMouseUp(e);
    });
  }

  /**
   * Enable mouse wheel zooming and panning (Alt + Wheel)
   */
  public enableZoom() {
    this.canvas.on('mouse:wheel', (opt) => {
      const evt = opt.e;
      evt.preventDefault();
      evt.stopPropagation();

      if (evt.ctrlKey || evt.metaKey) {
        // ZOOM
        const delta = evt.deltaY;
        let zoom = this.canvas.getZoom();
        zoom *= 0.999 ** delta;
        
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        
        this.canvas.zoomToPoint(new fabric.Point(evt.offsetX, evt.offsetY), zoom);
      } else {
        // PAN
        const vpt = this.canvas.viewportTransform;
        if (!vpt) return;
        
        if (evt.shiftKey) {
          vpt[4] -= evt.deltaY;
        } else {
          vpt[5] -= evt.deltaY;
        }
        this.canvas.requestRenderAll();
      }
    });
  }

  /**
   * Switch active tool
   */
  public setTool(tool: AbstractTool) {
    if (this.activeTool) {
      this.activeTool.deactivate();
    }
    this.activeTool = tool;
    this.activeTool.activate();
    console.log(`🛠️ Switched to tool: ${tool.getName()}`);
  }

  /**
   * Unified render request for Fabric 6.x
   */
  public requestRender() {
    this.canvas.requestRenderAll();
  }

  /**
   * Cleanup resources
   */
  public dispose() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.canvas.dispose();
  }
}
