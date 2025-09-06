'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, Rect, Circle as FabricCircle, IText, FabricImage } from 'fabric'
import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Brush,
  Upload,
  Download,
  Trash2,
  Move,
  MessageCircle,
  Send,
  Minimize2,
  Maximize2,
  X
} from 'lucide-react'

// 消息接口
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function StandardEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [currentTool, setCurrentTool] = useState<'select' | 'move' | 'draw' | 'rectangle' | 'circle' | 'text'>('select')

  // 浮窗状态
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true)
  const [isChatExpanded, setIsChatExpanded] = useState(false)

  // AI聊天状态
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 你好！我是你的AI图像编辑助手。我可以帮你编辑图片、生成图像，或者回答任何关于图像处理的问题。',
      timestamp: new Date().toLocaleTimeString()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 无限画布初始化
  useEffect(() => {
    if (!canvasRef.current) return

    const container = canvasRef.current.parentElement
    const containerWidth = container?.clientWidth || window.innerWidth
    const containerHeight = container?.clientHeight || window.innerHeight

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: '#f8fafc',
      selection: true,
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      enableRetinaScaling: true,
      allowTouchScrolling: false
    })

    // 启用画布缩放
    fabricCanvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY
      let zoom = fabricCanvas.getZoom()
      zoom *= 0.999 ** delta
      if (zoom > 20) zoom = 20
      if (zoom < 0.01) zoom = 0.01
      const pointer = fabricCanvas.getPointer(opt.e)
      fabricCanvas.zoomToPoint(pointer, zoom)
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })

    // 画布拖拽平移
    let isDragging = false
    let lastPosX = 0
    let lastPosY = 0

    fabricCanvas.on('mouse:down', (opt) => {
      const evt = opt.e as MouseEvent
      if (evt.altKey === true || currentTool === 'move') {
        isDragging = true
        fabricCanvas.selection = false
        lastPosX = evt.clientX
        lastPosY = evt.clientY
      }
    })

    fabricCanvas.on('mouse:move', (opt) => {
      if (isDragging) {
        const e = opt.e as MouseEvent
        const vpt = fabricCanvas.viewportTransform
        if (vpt) {
          vpt[4] += e.clientX - lastPosX
          vpt[5] += e.clientY - lastPosY
          fabricCanvas.requestRenderAll()
          lastPosX = e.clientX
          lastPosY = e.clientY
        }
      }
    })

    fabricCanvas.on('mouse:up', () => {
      fabricCanvas.setViewportTransform(fabricCanvas.viewportTransform!)
      isDragging = false
      fabricCanvas.selection = true
    })

    // 窗口大小变化处理
    const handleResize = () => {
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight
      fabricCanvas.setDimensions({ width: newWidth, height: newHeight })
      fabricCanvas.renderAll()
    }

    window.addEventListener('resize', handleResize)

    setCanvas(fabricCanvas)

    return () => {
      window.removeEventListener('resize', handleResize)
      fabricCanvas.dispose()
    }
  }, [])

  // 工具切换 - 使用Fabric.js标准方式
  useEffect(() => {
    if (!canvas) return

    switch (currentTool) {
      case 'select':
        canvas.isDrawingMode = false
        canvas.selection = true
        canvas.defaultCursor = 'default'
        canvas.hoverCursor = 'move'
        break

      case 'move':
        canvas.isDrawingMode = false
        canvas.selection = false
        canvas.defaultCursor = 'grab'
        canvas.hoverCursor = 'grab'
        break

      case 'draw':
        canvas.isDrawingMode = true
        canvas.selection = false
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = 5
          canvas.freeDrawingBrush.color = '#000000'
        }
        break

      case 'rectangle':
      case 'circle':
      case 'text':
        canvas.isDrawingMode = false
        canvas.selection = false
        canvas.defaultCursor = 'crosshair'
        break
    }
  }, [canvas, currentTool])

  // 标准的对象创建
  const createObject = (pointer: { x: number, y: number }) => {
    if (!canvas) return

    let obj = null

    switch (currentTool) {
      case 'rectangle':
        obj = new Rect({
          left: pointer.x - 50,
          top: pointer.y - 30,
          width: 100,
          height: 60,
          fill: 'rgba(59, 130, 246, 0.3)',
          stroke: '#3b82f6',
          strokeWidth: 2
        })
        break

      case 'circle':
        obj = new FabricCircle({
          left: pointer.x - 50,
          top: pointer.y - 50,
          radius: 50,
          fill: 'rgba(16, 185, 129, 0.3)',
          stroke: '#10b981',
          strokeWidth: 2
        })
        break

      case 'text':
        obj = new IText('输入文本', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 20,
          fill: '#000000'
        })
        break
    }

    if (obj) {
      canvas.add(obj)
      canvas.setActiveObject(obj)
      canvas.renderAll()
    }
  }

  // 简单的画布点击处理
  useEffect(() => {
    if (!canvas) return

    const handleMouseDown = (e: any) => {
      if (currentTool === 'select' || currentTool === 'draw' || currentTool === 'move') return

      const pointer = canvas.getPointer(e.e)
      createObject(pointer)
    }

    canvas.on('mouse:down', handleMouseDown)

    return () => {
      canvas.off('mouse:down', handleMouseDown)
    }
  }, [canvas, currentTool])

  // AI聊天功能
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // 模拟AI响应
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `我理解你想要${inputMessage}。让我来帮你实现这个功能！你可以尝试使用左侧的工具栏来编辑图像，或者上传一张图片开始编辑。`,
          timestamp: new Date().toLocaleTimeString()
        }
        setChatMessages(prev => [...prev, aiResponse])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('AI response error:', error)
      setIsLoading(false)
    }
  }

  // 图片上传
  const handleImageUpload = (file: File) => {
    if (!canvas) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imgUrl = e.target?.result as string
      if (imgUrl) {
        const img = await FabricImage.fromURL(imgUrl)
        img.scaleToWidth(200)
        canvas.add(img)
        canvas.renderAll()
      }
    }
    reader.readAsDataURL(file)
  }

  // 标准功能
  const deleteSelected = () => {
    const activeObjects = canvas?.getActiveObjects()
    if (activeObjects) {
      canvas?.remove(...activeObjects)
      canvas?.discardActiveObject()
      canvas?.renderAll()
    }
  }

  const downloadImage = () => {
    if (!canvas) return
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    })
    const link = document.createElement('a')
    link.download = 'canvas-image.png'
    link.href = dataURL
    link.click()
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {/* 无限画布 */}
      <div className="absolute inset-0 w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
        />
      </div>

      {/* 悬浮工具栏 */}
      <div className="absolute top-6 left-6 z-40">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-2">
          <div className="flex items-center space-x-1">
            {/* 工具栏展开/收起按钮 */}
            <button
              onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
              className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
              title={isToolbarExpanded ? '收起工具栏' : '展开工具栏'}
            >
              {isToolbarExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            {isToolbarExpanded && (
              <>
                {/* 选择工具 */}
                <button
                  onClick={() => setCurrentTool('select')}
                  className={`p-3 rounded-xl transition-all ${
                    currentTool === 'select'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="选择工具"
                >
                  <MousePointer2 className="w-5 h-5" />
                </button>

                {/* 移动工具 */}
                <button
                  onClick={() => setCurrentTool('move')}
                  className={`p-3 rounded-xl transition-all ${
                    currentTool === 'move'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="移动画布"
                >
                  <Move className="w-5 h-5" />
                </button>

                <div className="w-px h-8 bg-gray-200 mx-1" />

                {/* 画笔工具 */}
                <button
                  onClick={() => setCurrentTool('draw')}
                  className={`p-3 rounded-xl transition-all ${
                    currentTool === 'draw'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="画笔"
                >
                  <Brush className="w-5 h-5" />
                </button>

                <div className="w-px h-8 bg-gray-200 mx-1" />

                {/* 形状工具 */}
                <button
                  onClick={() => setCurrentTool('rectangle')}
                  className={`p-3 rounded-xl transition-all ${
                    currentTool === 'rectangle'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="矩形"
                >
                  <Square className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setCurrentTool('circle')}
                  className={`p-3 rounded-xl transition-all ${
                    currentTool === 'circle'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="圆形"
                >
                  <Circle className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setCurrentTool('text')}
                  className={`p-3 rounded-xl transition-all ${
                    currentTool === 'text'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="文本"
                >
                  <Type className="w-5 h-5" />
                </button>

                <div className="w-px h-8 bg-gray-200 mx-1" />

                {/* 功能按钮 */}
                <button
                  onClick={deleteSelected}
                  className="p-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                  title="删除选中"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) handleImageUpload(file)
                    }
                    input.click()
                  }}
                  className="p-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg"
                  title="上传图片"
                >
                  <Upload className="w-5 h-5" />
                </button>

                <button
                  onClick={downloadImage}
                  className="p-3 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors shadow-lg"
                  title="下载图片"
                >
                  <Download className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI聊天浮窗 */}
      <div className="absolute top-6 right-6 z-40">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          {/* 聊天框头部 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-gray-800">AI助手</span>
            </div>
            <button
              onClick={() => setIsChatExpanded(!isChatExpanded)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              title={isChatExpanded ? '收起聊天' : '展开聊天'}
            >
              {isChatExpanded ? <Minimize2 className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
            </button>
          </div>

          {/* 聊天内容 */}
          {isChatExpanded && (
            <>
              <div className="h-80 w-80 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 输入框 */}
              <div className="p-4 border-t border-gray-200/50">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="询问AI助手..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 px-4 py-2">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>当前工具: <span className="font-semibold text-gray-800">{
              currentTool === 'select' ? '选择' :
              currentTool === 'move' ? '移动' :
              currentTool === 'draw' ? '画笔' :
              currentTool === 'rectangle' ? '矩形' :
              currentTool === 'circle' ? '圆形' :
              currentTool === 'text' ? '文本' : currentTool
            }</span></span>
            <div className="w-px h-4 bg-gray-300"></div>
            <span>滚轮缩放 | Alt+拖拽平移</span>
          </div>
        </div>
      </div>
    </div>
  )
}
