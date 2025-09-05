'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Canvas, FabricImage, IText, Rect, Circle } from 'fabric'
import {
  Upload, Download, Wand2, Sparkles, Image as ImageIcon, MessageSquare,
  Home, Layers, Type, Square, Circle, Palette, RotateCcw, ZoomIn, ZoomOut,
  Move, Trash2, Copy, Save, X
} from 'lucide-react'
import { LoginButton } from '@/components/auth/LoginButton'
import { ProjectManager } from '@/components/projects/ProjectManager'
import { MobileToolbar } from '@/components/mobile/MobileToolbar'
import { DeviceDetector } from '@/lib/device-utils'
import { ImageProcessor } from '@/lib/image-utils'

export default function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, image?: string}>>([
    {
      role: 'assistant',
      content: '你好！我是你的AI图像编辑助手。选择画布中的对象，然后告诉我你想要如何编辑它们，我会为你生成新的图像。'
    }
  ])
  const [showChat, setShowChat] = useState(false)
  const [isChatPanelCollapsed, setIsChatPanelCollapsed] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'rectangle' | 'circle'>('select')
  const [brushColor, setBrushColor] = useState('#000000')
  const [deviceInfo, setDeviceInfo] = useState(DeviceDetector.getDeviceInfo())
  const [currentImageData, setCurrentImageData] = useState<string>('')
  const [currentCanvasData, setCurrentCanvasData] = useState<string>('')

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const optimalSize = DeviceDetector.getOptimalCanvasSize()
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: optimalSize.width,
        height: optimalSize.height,
        backgroundColor: '#ffffff'
      })

      setCanvas(fabricCanvas)

      // 监听画布变化
      fabricCanvas.on('path:created', updateCanvasData)
      fabricCanvas.on('object:added', updateCanvasData)
      fabricCanvas.on('object:removed', updateCanvasData)
      fabricCanvas.on('object:modified', updateCanvasData)

      // 添加安全的鼠标事件处理器
      fabricCanvas.on('mouse:down', (e) => {
        if (!e.e) return

        try {
          if (selectedTool === 'text') {
            const pointer = fabricCanvas.getPointer(e.e)
            if (pointer) {
              addTextAtPosition(pointer.x, pointer.y)
            }
          } else if (selectedTool === 'rectangle') {
            const pointer = fabricCanvas.getPointer(e.e)
            if (pointer) {
              addRectangleAtPosition(pointer.x, pointer.y)
            }
          } else if (selectedTool === 'circle') {
            const pointer = fabricCanvas.getPointer(e.e)
            if (pointer) {
              addCircleAtPosition(pointer.x, pointer.y)
            }
          }
        } catch (error) {
          console.error('Error handling mouse down:', error)
        }
      })

      return () => {
        fabricCanvas.dispose()
      }
    }
  }, [canvas])

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      DeviceDetector.resetDeviceInfo()
      setDeviceInfo(DeviceDetector.getDeviceInfo())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const updateCanvasData = () => {
    if (canvas) {
      const canvasData = JSON.stringify(canvas.toJSON())
      setCurrentCanvasData(canvasData)

      // 更新图像数据
      const imageData = canvas.toDataURL()
      setCurrentImageData(imageData)
    }
  }

  // 获取选中对象的图像
  const getSelectedObjectImage = () => {
    if (!canvas) return null

    const activeObject = canvas.getActiveObject()
    if (!activeObject) {
      // 如果没有选中对象，返回整个画布
      return canvas.toDataURL({
        format: 'png',
        quality: 1
      })
    }

    // 创建临时画布来渲染选中的对象
    const tempCanvas = new Canvas(document.createElement('canvas'), {
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      backgroundColor: '#ffffff'
    })

    // 克隆选中的对象
    activeObject.clone((cloned: any) => {
      tempCanvas.add(cloned)
      tempCanvas.renderAll()
    })

    const imageData = tempCanvas.toDataURL({
      format: 'png',
      quality: 1
    })

    tempCanvas.dispose()
    return imageData
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && canvas) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imgUrl = e.target?.result as string

        try {
          // 优化图像
          const optimizedImageData = await ImageProcessor.compressLargeImage(imgUrl, 5)

          FabricImage.fromURL(optimizedImageData).then((img) => {
            const canvasWidth = canvas.getWidth()
            const canvasHeight = canvas.getHeight()

            // 智能缩放以适应画布
            const scale = Math.min(
              (canvasWidth * 0.8) / img.width!,
              (canvasHeight * 0.8) / img.height!
            )

            img.scale(scale)
            canvas.add(img)
            canvas.centerObject(img)
            canvas.renderAll()
            updateCanvasData()
          })
        } catch (error) {
          console.error('Image processing failed:', error)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !canvas) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const imgUrl = e.target?.result as string
      if (imgUrl) {
        FabricImage.fromURL(imgUrl).then((img) => {
          const canvasWidth = canvas.getWidth()
          const canvasHeight = canvas.getHeight()
          const maxWidth = canvasWidth * 0.8
          const maxHeight = canvasHeight * 0.8

          if (img.width! > maxWidth || img.height! > maxHeight) {
            const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!)
            img.scale(scale)
          }

          img.set({
            left: (canvasWidth - img.getScaledWidth()) / 2,
            top: (canvasHeight - img.getScaledHeight()) / 2
          })

          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.renderAll()
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const generateImage = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)

    // 获取选中对象的图像
    const selectedImage = getSelectedObjectImage()

    // 添加用户消息
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: prompt,
      image: selectedImage || undefined
    }])

    try {
      const response = await fetch('/api/ai/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          image: selectedImage,
          width: 800,
          height: 600
        })
      })

      const result = await response.json()

      if (result.success && result.data.imageUrl && canvas) {
        FabricImage.fromURL(result.data.imageUrl).then((img) => {
          img.scaleToWidth(400)
          canvas.add(img)
          canvas.centerObject(img)
          canvas.renderAll()
        })

        setChatMessages(prev => [
          ...prev,
          { role: 'assistant', content: '图像已生成并添加到画布中！', image: result.data.imageUrl }
        ])
      }
    } catch (error) {
      console.error('Error generating image:', error)
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: '抱歉，生成图像时出现错误。请稍后再试。' }
      ])
    } finally {
      setIsLoading(false)
      setPrompt('')
    }
  }

  const editImage = async () => {
    if (!prompt.trim() || !canvas) return
    
    const imageData = canvas.toDataURL()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/ai/image/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: imageData,
          instruction: prompt
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setChatMessages(prev => [
          ...prev,
          { type: 'user', content: `Edit: ${prompt}` },
          { type: 'ai', content: result.data.textResponse || 'Image edited successfully!' }
        ])
      }
    } catch (error) {
      console.error('Error editing image:', error)
      setChatMessages(prev => [
        ...prev,
        { type: 'user', content: `Edit: ${prompt}` },
        { type: 'ai', content: 'Failed to edit image. Please try again.' }
      ])
    } finally {
      setIsLoading(false)
      setPrompt('')
    }
  }

  const downloadImage = () => {
    if (canvas) {
      const link = document.createElement('a')
      link.download = 'edited-image.png'
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const addText = () => {
    if (canvas && canvas.getElement()) {
      try {
        const text = new IText('Click to edit', {
          left: 100,
          top: 100,
          fontFamily: 'Arial',
          fontSize: 20,
          fill: brushColor
        })
        canvas.add(text)
        canvas.setActiveObject(text)
        canvas.renderAll()
      } catch (error) {
        console.error('Error adding text:', error)
      }
    }
  }

  const addRectangle = () => {
    if (canvas && canvas.getElement()) {
      try {
        const rect = new Rect({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: brushColor,
          stroke: '#000',
          strokeWidth: 2
        })
        canvas.add(rect)
        canvas.setActiveObject(rect)
        canvas.renderAll()
      } catch (error) {
        console.error('Error adding rectangle:', error)
      }
    }
  }

  const addCircle = () => {
    if (canvas && canvas.getElement()) {
      try {
        const circle = new Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: brushColor,
          stroke: '#000',
          strokeWidth: 2
        })
        canvas.add(circle)
        canvas.setActiveObject(circle)
        canvas.renderAll()
      } catch (error) {
        console.error('Error adding circle:', error)
      }
    }
  }

  // 在指定位置添加文本
  const addTextAtPosition = (x: number, y: number) => {
    if (canvas && canvas.getElement()) {
      try {
        const text = new IText('Click to edit', {
          left: x - 50,
          top: y - 10,
          fontFamily: 'Arial',
          fontSize: 20,
          fill: brushColor,
          editable: true
        })
        canvas.add(text)
        canvas.setActiveObject(text)
        text.enterEditing()
        canvas.renderAll()
      } catch (error) {
        console.error('Error adding text at position:', error)
      }
    }
  }

  // 在指定位置添加矩形
  const addRectangleAtPosition = (x: number, y: number) => {
    if (canvas && canvas.getElement()) {
      try {
        const rect = new Rect({
          left: x - 50,
          top: y - 30,
          width: 100,
          height: 60,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 2
        })
        canvas.add(rect)
        canvas.setActiveObject(rect)
        canvas.renderAll()
      } catch (error) {
        console.error('Error adding rectangle at position:', error)
      }
    }
  }

  // 在指定位置添加圆形
  const addCircleAtPosition = (x: number, y: number) => {
    if (canvas && canvas.getElement()) {
      try {
        const circle = new Circle({
          left: x - 40,
          top: y - 40,
          radius: 40,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 2
        })
        canvas.add(circle)
        canvas.setActiveObject(circle)
        canvas.renderAll()
      } catch (error) {
        console.error('Error adding circle at position:', error)
      }
    }
  }

  const deleteSelected = () => {
    if (canvas) {
      const activeObjects = canvas.getActiveObjects()
      canvas.remove(...activeObjects)
      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }

  const clearCanvas = () => {
    if (canvas) {
      canvas.clear()
      canvas.backgroundColor = '#ffffff'
      canvas.renderAll()
    }
  }

  const zoomIn = () => {
    if (canvas) {
      const zoom = canvas.getZoom()
      canvas.setZoom(zoom * 1.1)
    }
  }

  const zoomOut = () => {
    if (canvas) {
      const zoom = canvas.getZoom()
      canvas.setZoom(zoom * 0.9)
    }
  }

  const loadProject = (project: any) => {
    if (!canvas) return

    try {
      // 清空画布
      canvas.clear()

      // 加载画布数据
      if (project.canvasData) {
        canvas.loadFromJSON(JSON.parse(project.canvasData), () => {
          canvas.renderAll()
          updateCanvasData()
        })
      } else if (project.imageData) {
        // 如果没有画布数据，只加载图像
        FabricImage.fromURL(project.imageData).then((img) => {
          const canvasWidth = canvas.getWidth()
          const canvasHeight = canvas.getHeight()

          const scale = Math.min(
            (canvasWidth * 0.8) / img.width!,
            (canvasHeight * 0.8) / img.height!
          )

          img.scale(scale)
          canvas.add(img)
          canvas.centerObject(img)
          canvas.renderAll()
          updateCanvasData()
        })
      }
    } catch (error) {
      console.error('Failed to load project:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <span>←</span>
            <span>返回首页</span>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-xl font-semibold text-gray-900">AI 图像编辑器</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            <span>导出</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Save className="w-4 h-4" />
            <span>保存</span>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex relative">
        {/* Left Tools Panel - Floating */}
        <div className="fixed top-32 left-5 z-40 bg-white rounded-2xl shadow-xl border border-gray-200 p-3">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setSelectedTool('select')}
              className={`p-3 rounded-xl transition-colors ${
                selectedTool === 'select'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="选择工具"
            >
              <Move className="w-5 h-5" />
            </button>

            <button
              onClick={() => setSelectedTool('text')}
              className={`p-3 rounded-xl transition-colors ${
                selectedTool === 'text'
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="文本工具"
            >
              <Type className="w-5 h-5" />
            </button>

            <button
              onClick={() => setSelectedTool('rectangle')}
              className={`p-3 rounded-xl transition-colors ${
                selectedTool === 'rectangle'
                  ? 'bg-green-100 text-green-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="矩形工具"
            >
              <Square className="w-5 h-5" />
            </button>

            <button
              onClick={() => setSelectedTool('circle')}
              className={`p-3 rounded-xl transition-colors ${
                selectedTool === 'circle'
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="圆形工具"
            >
              <Circle className="w-5 h-5" />
            </button>

            <label className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer" title="上传图片">
              <Upload className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                const activeObject = canvas?.getActiveObject()
                if (activeObject) {
                  canvas?.remove(activeObject)
                  canvas?.renderAll()
                }
              }}
              className="p-3 rounded-xl text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
              title="删除选中对象"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div
          className="flex-1 flex items-center justify-center relative"
          style={{
            background: `
              radial-gradient(circle at 20px 20px, #e5e7eb 2px, transparent 2px),
              radial-gradient(circle at 20px 20px, #e5e7eb 2px, transparent 2px)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
          }}
        >
          <canvas
            ref={canvasRef}
            className="block w-full h-full"
          />

          {/* Canvas Controls */}
          <div className="absolute bottom-5 right-5 flex items-center space-x-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
            <button
              onClick={() => {
                if (canvas) {
                  const newZoom = Math.max(0.1, zoom / 1.2)
                  const center = canvas.getCenter()
                  canvas.zoomToPoint({ x: center.left, y: center.top }, newZoom)
                  setZoom(newZoom)
                }
              }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="缩小"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => {
                if (canvas) {
                  const newZoom = Math.min(5, zoom * 1.2)
                  const center = canvas.getCenter()
                  canvas.zoomToPoint({ x: center.left, y: center.top }, newZoom)
                  setZoom(newZoom)
                }
              }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="放大"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (canvas) {
                  canvas.setZoom(1)
                  canvas.absolutePan({ x: 0, y: 0 })
                  setZoom(1)
                }
              }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="重置缩放"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right AI Chat Panel */}
        <div className={`fixed top-20 right-5 z-40 bg-white rounded-2xl shadow-xl border border-gray-200 transition-all duration-300 ${
          isChatPanelCollapsed ? 'w-12 h-12' : 'w-80 h-96'
        }`}>
          <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                {!isChatPanelCollapsed && <span className="font-medium text-gray-900">AI Assistant</span>}
              </div>
              <button
                onClick={() => setIsChatPanelCollapsed(!isChatPanelCollapsed)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isChatPanelCollapsed ? <MessageSquare className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </button>
            </div>

            {!isChatPanelCollapsed && (
              <>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.content}
                        {message.image && (
                          <img
                            src={message.image}
                            alt="Generated"
                            className="mt-2 rounded-lg max-w-full h-auto"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg text-sm">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && generateImage()}
                      placeholder="描述你想要的图像编辑..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                    <button
                      onClick={generateImage}
                      disabled={isLoading || !prompt.trim()}
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Wand2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


