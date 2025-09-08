'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, Rect, Circle as FabricCircle, IText, FabricImage } from 'fabric'
import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Upload,
  ImageIcon,
  Brush,
  Eraser,
  Sparkles,
  MessageCircle,
  Send,
  Minus,
  Plus,
  RotateCcw,
  Download,
  Palette,
  Move,
  ZoomIn,
  ZoomOut,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react'

// 消息接口
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [currentTool, setCurrentTool] = useState<'select' | 'move' | 'rectangle' | 'circle' | 'text' | 'brush' | 'eraser'>('select')
  const [isDragOver, setIsDragOver] = useState(false)
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true)
  const [isChatExpanded, setIsChatExpanded] = useState(false)
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
  const initRef = useRef(false)

  // 无限画布初始化
  useEffect(() => {
    if (!canvasRef.current || initRef.current) return

    console.log('🎨 Initializing infinite canvas...')
    initRef.current = true

    try {
      const container = canvasRef.current.parentElement
      const containerWidth = container?.clientWidth || window.innerWidth
      const containerHeight = container?.clientHeight || window.innerHeight

      // 创建无限画布
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: containerWidth,
        height: containerHeight,
        backgroundColor: '#f8fafc', // 浅灰色背景
        selection: true,
        preserveObjectStacking: true,
        renderOnAddRemove: true,
        enableRetinaScaling: true,
        allowTouchScrolling: false
      })

      console.log('✅ Infinite canvas created:', containerWidth, 'x', containerHeight)

      // 启用画布平移和缩放
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

      // 将事件处理状态存储在canvas上，这样可以在外部访问
      const canvasWithState = fabricCanvas as any
      canvasWithState.toolState = {
        isDragging: false,
        isDrawing: false,
        lastPosX: 0,
        lastPosY: 0,
        startPointer: { x: 0, y: 0 },
        activeShape: null
      }

      // 统一的鼠标按下事件
      fabricCanvas.on('mouse:down', (e) => {
        if (!e.e) return

        console.log('🖱️ Mouse down event triggered, current tool:', canvasRef.current?.getAttribute('data-current-tool'))

        const evt = e.e as MouseEvent
        const pointer = fabricCanvas.getPointer(e.e)
        const toolState = (fabricCanvas as any).toolState
        const currentToolValue = canvasRef.current?.getAttribute('data-current-tool') || 'select'

        // 检查是否是画布平移操作
        if (evt.altKey === true || currentToolValue === 'move') {
          toolState.isDragging = true
          fabricCanvas.selection = false
          toolState.lastPosX = evt.clientX
          toolState.lastPosY = evt.clientY
          console.log('🔄 Started canvas panning')
          return
        }

        // 工具绘制逻辑
        toolState.startPointer = pointer

        switch (currentToolValue) {
          case 'select':
            console.log('👆 Select tool - letting Fabric.js handle selection')
            break

          case 'rectangle':
            if (!e.target) {
              toolState.isDrawing = true
              toolState.activeShape = new Rect({
                left: pointer.x,
                top: pointer.y,
                width: 0,
                height: 0,
                fill: 'rgba(59, 130, 246, 0.3)',
                stroke: '#3b82f6',
                strokeWidth: 2,
                selectable: false,
                evented: false
              })
              fabricCanvas.add(toolState.activeShape)
              console.log('🎨 Started drawing rectangle at:', pointer)
            }
            break

          case 'circle':
            if (!e.target) {
              toolState.isDrawing = true
              toolState.activeShape = new FabricCircle({
                left: pointer.x,
                top: pointer.y,
                radius: 0,
                fill: 'rgba(16, 185, 129, 0.3)',
                stroke: '#10b981',
                strokeWidth: 2,
                selectable: false,
                evented: false
              })
              fabricCanvas.add(toolState.activeShape)
              console.log('🎨 Started drawing circle at:', pointer)
            }
            break

          case 'text':
            if (!e.target) {
              const textObj = new IText('点击编辑文本', {
                left: pointer.x,
                top: pointer.y,
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 18,
                fill: '#1f2937',
                selectable: true,
                evented: true
              })
              fabricCanvas.add(textObj)
              fabricCanvas.setActiveObject(textObj)
              fabricCanvas.renderAll()

              console.log('🎨 Created text object at:', pointer)

              // 立即进入编辑模式
              setTimeout(() => {
                textObj.enterEditing()
                textObj.selectAll()
              }, 100)
            }
            break

          default:
            console.log('❓ Unknown tool:', currentToolValue)
        }
      })

      // 统一的鼠标移动事件
      fabricCanvas.on('mouse:move', (e) => {
        if (!e.e) return

        const toolState = (fabricCanvas as any).toolState
        const currentToolValue = canvasRef.current?.getAttribute('data-current-tool') || 'select'

        // 处理画布平移
        if (toolState.isDragging) {
          const evt = e.e as MouseEvent
          const vpt = fabricCanvas.viewportTransform
          if (vpt) {
            vpt[4] += evt.clientX - toolState.lastPosX
            vpt[5] += evt.clientY - toolState.lastPosY
            fabricCanvas.requestRenderAll()
            toolState.lastPosX = evt.clientX
            toolState.lastPosY = evt.clientY
          }
          return
        }

        // 处理形状绘制
        if (!toolState.isDrawing || !toolState.activeShape) return

        const pointer = fabricCanvas.getPointer(e.e)

        switch (currentToolValue) {
          case 'rectangle':
            const width = Math.abs(pointer.x - toolState.startPointer.x)
            const height = Math.abs(pointer.y - toolState.startPointer.y)
            const left = Math.min(toolState.startPointer.x, pointer.x)
            const top = Math.min(toolState.startPointer.y, pointer.y)

            toolState.activeShape.set({
              left: left,
              top: top,
              width: width,
              height: height
            })
            break

          case 'circle':
            const radius = Math.sqrt(
              Math.pow(pointer.x - toolState.startPointer.x, 2) +
              Math.pow(pointer.y - toolState.startPointer.y, 2)
            ) / 2

            toolState.activeShape.set({
              left: toolState.startPointer.x - radius,
              top: toolState.startPointer.y - radius,
              radius: radius
            })
            break
        }

        fabricCanvas.renderAll()
      })

      // 统一的鼠标松开事件
      fabricCanvas.on('mouse:up', () => {
        const toolState = (fabricCanvas as any).toolState
        const currentToolValue = canvasRef.current?.getAttribute('data-current-tool') || 'select'

        // 结束画布平移
        if (toolState.isDragging) {
          fabricCanvas.setViewportTransform(fabricCanvas.viewportTransform!)
          toolState.isDragging = false
          fabricCanvas.selection = true
          console.log('🔄 Ended canvas panning')
          return
        }

        // 结束形状绘制
        if (toolState.isDrawing && toolState.activeShape) {
          // 完成绘制，使对象可选择
          toolState.activeShape.set({
            selectable: true,
            evented: true
          })

          // 如果形状太小，删除它
          if (currentToolValue === 'rectangle') {
            if (toolState.activeShape.width < 5 || toolState.activeShape.height < 5) {
              fabricCanvas.remove(toolState.activeShape)
              console.log('❌ Rectangle too small, removed')
            } else {
              console.log('✅ Rectangle created successfully')
            }
          } else if (currentToolValue === 'circle') {
            if (toolState.activeShape.radius < 5) {
              fabricCanvas.remove(toolState.activeShape)
              console.log('❌ Circle too small, removed')
            } else {
              console.log('✅ Circle created successfully')
            }
          }

          fabricCanvas.renderAll()
        }

        toolState.isDrawing = false
        toolState.activeShape = null
      })

      // 画布初始化完成

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
      }

      setCanvas(fabricCanvas)

    } catch (error) {
      console.error('❌ Canvas initialization error:', error)
      initRef.current = false
    }

    return () => {
      if (canvas) {
        canvas.dispose()
      }
      initRef.current = false
    }
  }, [])

  // 监听工具变化，更新画布交互模式
  useEffect(() => {
    if (!canvas || !canvasRef.current) return

    // 更新DOM属性，供事件处理器使用
    canvasRef.current.setAttribute('data-current-tool', currentTool)
    console.log('🔧 Tool changed to:', currentTool)

    const updateCanvasMode = () => {
      if (currentTool === 'select') {
        canvas.selection = true
        canvas.defaultCursor = 'default'
        canvas.hoverCursor = 'move'
        canvas.moveCursor = 'move'
        // 使所有对象可选择
        canvas.forEachObject((obj) => {
          obj.selectable = true
          obj.evented = true
        })
        console.log('✅ Select mode enabled')
      } else {
        canvas.selection = false
        canvas.defaultCursor = 'crosshair'
        canvas.hoverCursor = 'crosshair'
        canvas.moveCursor = 'crosshair'
        // 禁用对象选择（除了select工具）
        canvas.forEachObject((obj) => {
          obj.selectable = false
          obj.evented = false
        })
        canvas.discardActiveObject()
        canvas.renderAll()
        console.log('✅ Drawing mode enabled for:', currentTool)
      }
    }

    updateCanvasMode()
  }, [canvas, currentTool])

  // AI聊天功能
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const currentMessage = inputMessage.trim()
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date().toLocaleTimeString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      console.log('🤖 Processing AI request:', currentMessage)

      // 检查是否有选中的对象
      const selectedObjects = canvas?.getActiveObjects() || []
      const hasSelectedObjects = selectedObjects.length > 0

      console.log('Checking selected objects:', {
        hasSelectedObjects,
        count: selectedObjects.length,
        message: currentMessage
      })

      if (hasSelectedObjects) {
        // 场景1：编辑选中的对象
        console.log('🎨 Scenario 1: Editing selected objects')
        console.log('🖼️ Editing image with Gemini Flash Image...', {
          prompt: currentMessage,
          objectCount: selectedObjects.length
        })

        // 获取画布数据
        const canvasDataURL = canvas!.toDataURL({
          format: 'png',
          quality: 1.0,
          multiplier: 1
        })

        const response = await fetch('/api/ai/image/edit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: canvasDataURL,
            instruction: currentMessage,
            model: 'gemini-2.5-flash-002'
          })
        })

        console.log('📡 Edit API Response status:', response.status)
        const result = await response.json()
        console.log('📡 Edit API Response data:', result)

        if (result.success && result.data?.generatedImageUrl) {
          // 创建新的图像对象并添加到画布
          const editedImg = await FabricImage.fromURL(result.data.generatedImageUrl)
          editedImg.set({
            left: 50,
            top: 50,
            scaleX: 0.5,
            scaleY: 0.5
          })
          canvas!.add(editedImg)
          canvas!.renderAll()

          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `✅ 已根据你的要求"${currentMessage}"编辑了图像！编辑后的图像已添加到画布上。`,
            timestamp: new Date().toLocaleTimeString()
          }
          setChatMessages(prev => [...prev, aiResponse])
        } else {
          throw new Error(result.error || 'Failed to edit image')
        }
      } else {
        // 场景2：生成新图像
        console.log('🎨 Scenario 2: Generating image from text')
        console.log('🎨 Generating image with Gemini Flash Image...', { prompt: currentMessage })

        const response = await fetch('/api/ai/image/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: currentMessage,
            model: 'gemini-2.5-flash-002'
          })
        })

        console.log('📡 Generate API Response status:', response.status)
        const result = await response.json()
        console.log('📡 Generate API Response data:', result)

        if (result.success && result.data?.imageUrl) {
          // 创建新的图像对象并添加到画布
          const generatedImg = await FabricImage.fromURL(result.data.imageUrl)
          generatedImg.set({
            left: 100,
            top: 100,
            scaleX: 0.8,
            scaleY: 0.8
          })
          canvas!.add(generatedImg)
          canvas!.renderAll()

          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `🎨 已为你生成了"${currentMessage}"的图像！图像已添加到画布上，你可以移动、缩放或进一步编辑它。`,
            timestamp: new Date().toLocaleTimeString()
          }
          setChatMessages(prev => [...prev, aiResponse])
        } else {
          console.log('⚠️ Image generation failed, falling back to chat')
          // 如果图像生成失败，回退到普通聊天
          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `抱歉，图像生成遇到了问题：${result.error || '未知错误'}。请尝试重新描述你想要的图像，或者检查网络连接。`,
            timestamp: new Date().toLocaleTimeString()
          }
          setChatMessages(prev => [...prev, aiResponse])
        }
      }
    } catch (error) {
      console.error('❌ AI processing error:', error)
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ AI处理出错: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: new Date().toLocaleTimeString()
      }
      setChatMessages(prev => [...prev, aiResponse])
    } finally {
      setIsLoading(false)
    }
  }

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    if (!canvas) return

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imgUrl = e.target?.result as string
        if (imgUrl) {
          const img = await FabricImage.fromURL(imgUrl)
          
          // 缩放图片适应画布
          const canvasWidth = canvas.getWidth()
          const canvasHeight = canvas.getHeight()
          const maxWidth = canvasWidth * 0.6
          const maxHeight = canvasHeight * 0.6
          
          if (img.width && img.height) {
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
            img.scale(scale)
          }
          
          img.set({
            left: 50,
            top: 50,
            selectable: true,
            evented: true
          })

          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.renderAll()
          
          console.log('✅ Image added successfully')
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('❌ Image upload error:', error)
    }
  }

  // 拖放处理
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleImageUpload(imageFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {/* 无限画布 */}
      <div
        className="absolute inset-0 w-full h-full"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
        />

        {/* 拖放提示 */}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm z-50">
            <div className="text-center bg-white/95 rounded-2xl p-8 shadow-2xl border border-blue-200">
              <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <p className="text-xl font-bold text-blue-700">拖放图片到画布</p>
              <p className="text-sm text-gray-600 mt-2">支持 JPG, PNG, GIF 格式</p>
            </div>
          </div>
        )}
      </div>

      {/* 悬浮工具栏 */}
      <div className="absolute top-6 left-6 z-40">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-2">
          <div className="flex items-center space-x-1">
            {/* 工具栏展开/收起按钮 */}
            <button
              onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
              className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
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

                {/* 绘画工具 */}
                <button
                  onClick={() => setCurrentTool('brush')}
                  className={`p-3 rounded-xl transition-all ${
                    currentTool === 'brush'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="画笔"
                >
                  <Brush className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setCurrentTool('eraser')}
                  className={`p-3 rounded-xl transition-all ${
                    currentTool === 'eraser'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="橡皮擦"
                >
                  <Eraser className="w-5 h-5" />
                </button>

                <div className="w-px h-8 bg-gray-200 mx-1" />

                {/* 上传按钮 */}
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
                  <ImageIcon className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI聊天框 */}
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
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
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
              currentTool === 'rectangle' ? '矩形' :
              currentTool === 'circle' ? '圆形' :
              currentTool === 'text' ? '文本' :
              currentTool === 'brush' ? '画笔' :
              currentTool === 'eraser' ? '橡皮擦' : currentTool
            }</span></span>
            <div className="w-px h-4 bg-gray-300"></div>
            <span>滚轮缩放 | Alt+拖拽平移</span>
          </div>
        </div>
      </div>
    </div>
  )
}
