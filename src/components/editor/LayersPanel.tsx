'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Lock, Unlock, Trash2, Copy, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import * as fabric from 'fabric'

export interface LayersPanelProps {
  canvas: fabric.Canvas | null
  onLayerSelect?: (object: fabric.Object) => void
  onLayersChange?: () => void
}

interface LayerItem {
  id: string
  name: string
  type: string
  visible: boolean
  locked: boolean
  object: fabric.Object
}

export function LayersPanel({ canvas, onLayerSelect, onLayersChange }: LayersPanelProps) {
  const [layers, setLayers] = useState<LayerItem[]>([])
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)

  useEffect(() => {
    if (!canvas) return

    const updateLayers = () => {
      const objects = canvas.getObjects()
      const layerItems: LayerItem[] = objects.map((obj, index) => {
        const objAny = obj as any
        return {
          id: objAny.id || `layer-${index}`,
          name: objAny.name || `${getObjectTypeName(obj.type || 'object')} ${index + 1}`,
          type: obj.type || 'object',
          visible: obj.visible !== false,
          locked: obj.selectable === false,
          object: obj
        }
      }).reverse()

      setLayers(layerItems)
    }

    updateLayers()

    canvas.on('object:added', updateLayers)
    canvas.on('object:removed', updateLayers)
    canvas.on('object:modified', updateLayers)
    canvas.on('selection:created', handleSelection)
    canvas.on('selection:updated', handleSelection)
    canvas.on('selection:cleared', () => setSelectedLayerId(null))

    return () => {
      canvas.off('object:added', updateLayers)
      canvas.off('object:removed', updateLayers)
      canvas.off('object:modified', updateLayers)
      canvas.off('selection:created', handleSelection)
      canvas.off('selection:updated', handleSelection)
    }
  }, [canvas])

  const handleSelection = (e: any) => {
    const selected = e.selected?.[0]
    if (selected) {
      const objAny = selected as any
      setSelectedLayerId(objAny.id || null)
    }
  }

  const getObjectTypeName = (type: string): string => {
    const typeNames: Record<string, string> = {
      rect: '矩形',
      circle: '圆形',
      path: '路径',
      image: '图片',
      text: '文本',
      line: '线条',
      polygon: '多边形'
    }
    return typeNames[type] || type
  }

  const handleLayerClick = (layer: LayerItem) => {
    if (!canvas) return

    canvas.setActiveObject(layer.object)
    canvas.renderAll()
    setSelectedLayerId(layer.id)
    onLayerSelect?.(layer.object)
  }

  const toggleVisibility = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canvas) return

    layer.object.set({ visible: !layer.visible })
    canvas.renderAll()
    setLayers(prev =>
      prev.map(l =>
        l.id === layer.id ? { ...l, visible: !l.visible } : l
      )
    )
    onLayersChange?.()
  }

  const toggleLock = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canvas) return

    const newLocked = !layer.locked
    layer.object.set({
      selectable: !newLocked,
      evented: !newLocked
    })
    canvas.renderAll()
    setLayers(prev =>
      prev.map(l =>
        l.id === layer.id ? { ...l, locked: newLocked } : l
      )
    )
    onLayersChange?.()
  }

  const duplicateLayer = async (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canvas) return

    try {
      const cloned = await layer.object.clone()
      cloned.set({
        left: (layer.object.left || 0) + 10,
        top: (layer.object.top || 0) + 10
      })
      canvas.add(cloned)
      canvas.setActiveObject(cloned)
      canvas.renderAll()
      onLayersChange?.()
    } catch (error) {
      console.error('Failed to duplicate layer:', error)
    }
  }

  const deleteLayer = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canvas) return

    canvas.remove(layer.object)
    canvas.renderAll()
    onLayersChange?.()
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <Layers className="w-5 h-5 text-gray-600" />
        <h2 className="font-semibold text-gray-900">图层</h2>
        <span className="ml-auto text-sm text-gray-500">{layers.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <Layers className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">暂无图层</p>
            <p className="text-xs text-gray-400 mt-1">添加图形或上传图片</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {layers.map((layer) => (
              <div
                key={layer.id}
                onClick={() => handleLayerClick(layer)}
                className={`
                  flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
                  ${selectedLayerId === layer.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                  }
                `}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {layer.name}
                  </p>
                  <p className="text-xs text-gray-500">{getObjectTypeName(layer.type)}</p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => toggleVisibility(layer, e)}
                    className="h-7 w-7 p-0"
                  >
                    {layer.visible ? (
                      <Eye className="w-4 h-4 text-gray-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => toggleLock(layer, e)}
                    className="h-7 w-7 p-0"
                  >
                    {layer.locked ? (
                      <Lock className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Unlock className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => duplicateLayer(layer, e)}
                    className="h-7 w-7 p-0"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => deleteLayer(layer, e)}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
