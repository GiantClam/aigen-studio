'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as fabric from 'fabric'
import { Toolbar } from '@/components/editor/Toolbar'
import { AIPanel, GenerationSettings } from '@/components/editor/AIPanel'
import { LayersPanel } from '@/components/editor/LayersPanel'
import { ToolManager } from '@/core/tools/ToolManager'
import { ToolType } from '@/core/tools/BaseTool'
import { SelectToolNew } from '@/core/tools/SelectToolNew'
import { BrushToolNew } from '@/core/tools/BrushToolNew'
import { RectangleToolNew } from '@/core/tools/RectangleToolNew'
import { CircleToolNew } from '@/core/tools/CircleToolNew'
import { MoveToolNew } from '@/core/tools/MoveToolNew'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EditorRefactored() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [toolManager, setToolManager] = useState<ToolManager | null>(null)
  const [currentTool, setCurrentTool] = useState<ToolType>(ToolType.SELECT)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasSelection, setHasSelection] = useState(false)
  const [selectedObjectsCount, setSelectedObjectsCount] = useState(0)
  const [availableProviders, setAvailableProviders] = useState<string[]>(['gemini'])
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#f8fafc',
      selection: true,
      preserveObjectStacking: true
    })

    const manager = new ToolManager({
      canvas: fabricCanvas,
      onToolChange: (tool) => {
        console.log('Tool changed to:', tool.getName())
      }
    })

    manager.registerTool(new SelectToolNew(fabricCanvas))
    manager.registerTool(new BrushToolNew(fabricCanvas))
    manager.registerTool(new RectangleToolNew(fabricCanvas))
    manager.registerTool(new CircleToolNew(fabricCanvas))
    manager.registerTool(new MoveToolNew(fabricCanvas))

    manager.setTool(ToolType.SELECT)

    fabricCanvas.on('selection:created', handleSelection)
    fabricCanvas.on('selection:updated', handleSelection)
    fabricCanvas.on('selection:cleared', () => {
      setHasSelection(false)
      setSelectedObjectsCount(0)
    })

    fabricCanvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY
      let newZoom = fabricCanvas.getZoom()
      newZoom *= 0.999 ** delta
      if (newZoom > 20) newZoom = 20
      if (newZoom < 0.01) newZoom = 0.01
      const pointer = fabricCanvas.getPointer(opt.e)
      fabricCanvas.zoomToPoint(pointer, newZoom)
      setZoom(newZoom)
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })

    setCanvas(fabricCanvas)
    setToolManager(manager)

    fetchAvailableProviders()

    return () => {
      manager.cleanup()
      fabricCanvas.dispose()
    }
  }, [])

  const handleSelection = (e: any) => {
    const activeObjects = e.selected || []
    setHasSelection(activeObjects.length > 0)
    setSelectedObjectsCount(activeObjects.length)
  }

  const fetchAvailableProviders = async () => {
    try {
      const response = await fetch('/api/ai/image/generate-v2')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.providers) {
          setAvailableProviders(data.data.providers)
        }
      }
    } catch (error) {
      console.error('Failed to fetch available providers:', error)
    }
  }

  const handleToolChange = useCallback((tool: ToolType) => {
    if (!toolManager) return
    toolManager.setTool(tool)
    setCurrentTool(tool)
  }, [toolManager])

  const handleUpload = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !canvas) return

      const reader = new FileReader()
      reader.onload = async (event) => {
        const img = await fabric.Image.fromURL(event.target?.result as string, {
          crossOrigin: 'anonymous'
        })

        const scale = Math.min(
          300 / (img.width || 1),
          300 / (img.height || 1)
        )
        img.scale(scale)

        const center = canvas.getVpCenter()
        img.set({
          left: center.x - (img.width || 0) * scale / 2,
          top: center.y - (img.height || 0) * scale / 2
        })

        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [canvas])

  const handleDownload = useCallback(() => {
    if (!canvas) return

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    })

    const link = document.createElement('a')
    link.download = `canvas-${Date.now()}.png`
    link.href = dataURL
    link.click()
  }, [canvas])

  const handleDelete = useCallback(() => {
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    activeObjects.forEach(obj => canvas.remove(obj))
    canvas.discardActiveObject()
    canvas.renderAll()
  }, [canvas])

  const handleGenerate = useCallback(async (prompt: string, settings: GenerationSettings) => {
    if (!canvas) return

    setIsGenerating(true)

    try {
      const activeObjects = canvas.getActiveObjects()
      const images: string[] = []

      if (activeObjects.length > 0) {
        for (const obj of activeObjects) {
          if (obj.type === 'image') {
            const imgObj = obj as fabric.Image
            const dataURL = imgObj.toDataURL({})
            images.push(dataURL)
          }
        }
      }

      const response = await fetch('/api/ai/image/generate-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          type: settings.type,
          provider: settings.provider,
          images,
          parameters: {
            aspectRatio: settings.aspectRatio,
            quality: settings.quality,
            imageSize: settings.imageSize,
            modelName: settings.modelName
          }
        })
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const result = await response.json()

      if (result.success && result.data?.imageData) {
        const img = await fabric.Image.fromURL(result.data.imageData, {
          crossOrigin: 'anonymous'
        })

        const center = canvas.getVpCenter()
        const scale = Math.min(400 / (img.width || 1), 400 / (img.height || 1))
        img.scale(scale)
        img.set({
          left: center.x - (img.width || 0) * scale / 2,
          top: center.y - (img.height || 0) * scale / 2
        })

        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
      }
    } catch (error) {
      console.error('Generation error:', error)
      alert('图片生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }, [canvas])

  const handleZoomIn = useCallback(() => {
    if (!canvas) return
    let newZoom = canvas.getZoom() * 1.1
    if (newZoom > 20) newZoom = 20
    canvas.setZoom(newZoom)
    setZoom(newZoom)
    canvas.renderAll()
  }, [canvas])

  const handleZoomOut = useCallback(() => {
    if (!canvas) return
    let newZoom = canvas.getZoom() * 0.9
    if (newZoom < 0.01) newZoom = 0.01
    canvas.setZoom(newZoom)
    setZoom(newZoom)
    canvas.renderAll()
  }, [canvas])

  const handleResetZoom = useCallback(() => {
    if (!canvas) return
    canvas.setZoom(1)
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
    setZoom(1)
    canvas.renderAll()
  }, [canvas])

  return (
    <div className="flex h-screen bg-gray-50">
      <Toolbar
        currentTool={currentTool}
        onToolChange={handleToolChange}
        onUpload={handleUpload}
        onDownload={handleDownload}
        onDelete={handleDelete}
        hasSelection={hasSelection}
      />

      <div className="w-64 h-full overflow-hidden">
        <LayersPanel
          canvas={canvas}
          onLayerSelect={(obj) => {
            if (canvas) {
              canvas.setActiveObject(obj)
              canvas.renderAll()
            }
          }}
        />
      </div>

      <div className="flex-1 flex flex-col relative">
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">AI 图像编辑器</h1>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleResetZoom}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div ref={containerRef} className="flex-1 overflow-hidden">
          <canvas ref={canvasRef} />
        </div>
      </div>

      <div className="w-96 h-full overflow-hidden">
        <AIPanel
          onGenerateAction={handleGenerate}
          isGenerating={isGenerating}
          selectedObjectsCount={selectedObjectsCount}
          availableProviders={availableProviders}
        />
      </div>
    </div>
  )
}
