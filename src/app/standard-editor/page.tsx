'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Canvas, Rect, Circle as FabricCircle, IText, FabricImage, Path } from 'fabric'
import * as fabric from 'fabric'
import { exportSelectedObjectsSmart, calculateOptimalMultiplier, getPreciseBounds } from '@/utils/fabric-object-export'
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
  X,
  ArrowUpRight
} from 'lucide-react'

// Message interface
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// Helper function to create arrow path
function createArrowPath(x1: number, y1: number, x2: number, y2: number): string {
  const headLength = 15 // 箭头头部长度
  const headAngle = Math.PI / 6 // 箭头头部角度

  // 计算箭头方向
  const angle = Math.atan2(y2 - y1, x2 - x1)

  // 箭头头部的两个点
  const arrowHead1X = x2 - headLength * Math.cos(angle - headAngle)
  const arrowHead1Y = y2 - headLength * Math.sin(angle - headAngle)
  const arrowHead2X = x2 - headLength * Math.cos(angle + headAngle)
  const arrowHead2Y = y2 - headLength * Math.sin(angle + headAngle)

  // Build SVG path
  return `M ${x1} ${y1} L ${x2} ${y2} M ${x2} ${y2} L ${arrowHead1X} ${arrowHead1Y} M ${x2} ${y2} L ${arrowHead2X} ${arrowHead2Y}`
}

export default function StandardEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [currentTool, setCurrentTool] = useState<'select' | 'move' | 'draw' | 'rectangle' | 'circle' | 'text' | 'arrow'>('select')

  // Floating window states
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true)
  const [isChatExpanded, setIsChatExpanded] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // 拖拽绘制状态
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentShape, setCurrentShape] = useState<any>(null)

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    selectedObjects: any[]
  }>({
    visible: false,
    x: 0,
    y: 0,
    selectedObjects: []
  })

  // AI对话框状态
  const [aiDialog, setAiDialog] = useState<{
    visible: boolean
    x: number
    y: number
    message: string
    isLoading: boolean
    textareaHeight: number
  }>({
    visible: false,
    x: 0,
    y: 0,
    message: '',
    isLoading: false,
    textareaHeight: 72 // 默认3行高度 (24px * 3)
  })

  // Debug logging helper - only logs in development
  const debugLog = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      if (data) {
        console.log(message, data)
      } else {
        console.log(message)
      }
    }
  }

  // 拖放处理函数
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length > 0) {
      // 处理第一个图片文件
      handleImageUpload(imageFiles[0])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 右键菜单处理函数
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()

    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length === 0) {
      setContextMenu({ visible: false, x: 0, y: 0, selectedObjects: [] })
      return
    }

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      selectedObjects: activeObjects
    })
  }, [canvas])

  // 隐藏右键菜单
  const hideContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, selectedObjects: [] })
  }, [])

  // 显示AI对话框
  const showAiDialog = useCallback((x: number, y: number) => {
    setAiDialog({
      visible: true,
      x,
      y,
      message: '',
      isLoading: false,
      textareaHeight: 72 // 重置为默认高度
    })
    hideContextMenu()
  }, [hideContextMenu])

  // 隐藏AI对话框
  const hideAiDialog = useCallback(() => {
    setAiDialog({
      visible: false,
      x: 0,
      y: 0,
      message: '',
      isLoading: false,
      textareaHeight: 72 // 重置为默认高度
    })
  }, [])

  // 导出选中对象
  const exportSelectedObjects = useCallback(async () => {
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length === 0) return

    try {
      const result = await exportSelectedObjectsSmart(canvas, {
        format: 'png',
        quality: 1,
        multiplier: calculateOptimalMultiplier(activeObjects),
        tightBounds: true,
        padding: 0,
        backgroundColor: 'transparent'
      })

      if (result) {
        // 创建下载链接
        const link = document.createElement('a')
        link.download = `selected-objects-${Date.now()}.png`
        link.href = result.imageData
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }

    hideContextMenu()
  }, [canvas, hideContextMenu])

  // 自动调整textarea高度
  const adjustTextareaHeight = useCallback((value: string) => {
    // 计算文本行数，考虑换行符和自动换行
    const lines = value.split('\n')
    let totalLines = 0

    // 估算每行字符数（基于textarea宽度，约40-50个字符）
    const charsPerLine = 45

    lines.forEach(line => {
      if (line.length === 0) {
        totalLines += 1 // 空行
      } else {
        // 计算自动换行产生的行数
        totalLines += Math.ceil(line.length / charsPerLine)
      }
    })

    // 最少3行，最多10行
    const minLines = 3
    const maxLines = 10
    const actualLines = Math.max(minLines, Math.min(totalLines, maxLines))

    // 每行高度约24px (line-height + padding)
    const lineHeight = 24
    const newHeight = actualLines * lineHeight

    setAiDialog(prev => ({
      ...prev,
      message: value,
      textareaHeight: newHeight
    }))
  }, [])

  // 重置textarea高度到默认值
  const resetTextareaHeight = useCallback(() => {
    setAiDialog(prev => ({
      ...prev,
      message: '',
      textareaHeight: 72 // 3行默认高度
    }))
  }, [])



  // AI chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Hello! I&apos;m your AI image editing assistant. I can help you edit images, generate pictures, or answer any questions about image processing.',
      timestamp: new Date().toLocaleTimeString()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Infinite canvas initialization
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

    // Enable canvas zooming
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

    // Canvas drag panning
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
  }, [currentTool])

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
      case 'arrow':
        canvas.isDrawingMode = false
        canvas.selection = false
        canvas.defaultCursor = 'crosshair'
        break
    }
  }, [canvas, currentTool])

  // 标准的对象创建
  const createObject = useCallback((pointer: { x: number, y: number }) => {
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
        obj = new IText('Enter text', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 20,
          fill: '#000000'
        })
        break

      case 'arrow':
        // 创建箭头（使用路径）
        const arrowPath = createArrowPath(pointer.x, pointer.y, pointer.x + 100, pointer.y - 50)
        obj = new fabric.Path(arrowPath, {
          left: pointer.x,
          top: pointer.y - 50,
          fill: 'transparent',
          stroke: '#ef4444',
          strokeWidth: 3,
          selectable: true,
          evented: true
        })
        break
    }

    if (obj) {
      canvas.add(obj)
      canvas.setActiveObject(obj)
      canvas.renderAll()
    }
  }, [canvas, currentTool])

  // 拖拽绘制图形处理
  useEffect(() => {
    if (!canvas) return

    const handleMouseDown = (e: any) => {
      if (currentTool === 'select' || currentTool === 'draw' || currentTool === 'move') return

      const pointer = canvas.getPointer(e.e)
      setIsDrawing(true)
      setStartPoint(pointer)

      // 创建临时形状
      let shape: any = null
      switch (currentTool) {
        case 'rectangle':
          shape = new Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: 'rgba(59, 130, 246, 0.3)',
            stroke: '#3b82f6',
            strokeWidth: 2,
            selectable: false
          })
          break
        case 'circle':
          shape = new FabricCircle({
            left: pointer.x,
            top: pointer.y,
            radius: 0,
            fill: 'rgba(16, 185, 129, 0.3)',
            stroke: '#10b981',
            strokeWidth: 2,
            selectable: false
          })
          break
        case 'text':
          // 文本工具保持点击创建
          shape = new IText('Enter text', {
            left: pointer.x,
            top: pointer.y,
            fontSize: 20,
            fill: '#000000'
          })
          canvas.add(shape)
          canvas.setActiveObject(shape)
          canvas.renderAll()
          return
        case 'arrow':
          // 箭头保持点击创建
          const arrowPath = createArrowPath(pointer.x, pointer.y, pointer.x + 100, pointer.y - 50)
          shape = new fabric.Path(arrowPath, {
            left: pointer.x,
            top: pointer.y - 50,
            fill: 'transparent',
            stroke: '#ef4444',
            strokeWidth: 3,
            selectable: false
          })
          break
      }

      if (shape) {
        canvas.add(shape)
        setCurrentShape(shape)
        canvas.renderAll()
      }
    }

    const handleMouseMove = (e: any) => {
      if (!isDrawing || !startPoint || !currentShape) return

      const pointer = canvas.getPointer(e.e)

      switch (currentTool) {
        case 'rectangle':
          const width = Math.abs(pointer.x - startPoint.x)
          const height = Math.abs(pointer.y - startPoint.y)
          const left = Math.min(pointer.x, startPoint.x)
          const top = Math.min(pointer.y, startPoint.y)

          currentShape.set({
            left,
            top,
            width,
            height
          })
          break
        case 'circle':
          const radius = Math.sqrt(
            Math.pow(pointer.x - startPoint.x, 2) + Math.pow(pointer.y - startPoint.y, 2)
          ) / 2

          currentShape.set({
            left: startPoint.x - radius,
            top: startPoint.y - radius,
            radius
          })
          break
        case 'arrow':
          // 更新箭头路径
          const newArrowPath = createArrowPath(startPoint.x, startPoint.y, pointer.x, pointer.y)
          currentShape.set({
            path: newArrowPath
          })
          break
      }

      canvas.renderAll()
    }

    const handleMouseUp = () => {
      if (!isDrawing || !currentShape) return

      setIsDrawing(false)
      setStartPoint(null)

      // 使形状可选择
      currentShape.set({ selectable: true })
      canvas.setActiveObject(currentShape)
      setCurrentShape(null)
      canvas.renderAll()
    }

    canvas.on('mouse:down', handleMouseDown)
    canvas.on('mouse:move', handleMouseMove)
    canvas.on('mouse:up', handleMouseUp)

    return () => {
      canvas.off('mouse:down', handleMouseDown)
      canvas.off('mouse:move', handleMouseMove)
      canvas.off('mouse:up', handleMouseUp)
    }
  }, [canvas, currentTool, isDrawing, startPoint, currentShape])

  // 全局点击事件处理
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // 如果点击的不是右键菜单或AI对话框，则隐藏它们
      const target = e.target as Element
      if (!target.closest('[data-context-menu]') && !target.closest('[data-ai-dialog]')) {
        hideContextMenu()
        hideAiDialog()
      }
    }

    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [hideContextMenu, hideAiDialog])

  // 获取选中对象的图片数据 - 使用 Fabric.js 成熟解决方案
const getSelectedObjectsImage = async (): Promise<{ imageData: string; bounds: any } | null> => {
  if (!canvas) return null

  const activeObjects = canvas.getActiveObjects()
  if (activeObjects.length === 0) return null

  try {
    console.log('🎯 === USING FABRIC.JS MATURE SOLUTION ===')
    console.log('📸 Capturing selected objects...', {
      count: activeObjects.length,
      objectTypes: activeObjects.map(obj => obj.type)
    })

    // 使用智能导出函数，自动选择最佳方法
    const optimalMultiplier = calculateOptimalMultiplier(activeObjects)

    const result = await exportSelectedObjectsSmart(canvas, {
      format: 'png',
      quality: 1,
      multiplier: optimalMultiplier,
      tightBounds: true,  // 使用紧密边界，无白边
      padding: 0,         // 无边距
      backgroundColor: 'transparent'  // 透明背景
    })

    if (!result) {
      console.error('❌ Failed to export selected objects')
      return null
    }

    console.log('✅ Fabric.js smart export completed:', {
      imageSize: result.imageData.length,
      bounds: result.bounds,
      multiplier: optimalMultiplier,
      method: 'fabric_smart_export'
    })

    return result
  } catch (error) {
    console.error('❌ Error generating selected objects image:', error)
    return null
  }
}

  // AI聊天功能
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !canvas) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    }

    setChatMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      // 检查是否有选中的对象
      const activeObjects = canvas.getActiveObjects()
      const hasSelectedObjects = activeObjects.length > 0

      console.log('🔍 Checking selected objects:', {
        hasSelectedObjects,
        count: activeObjects.length,
        message: currentMessage
      })

      if (hasSelectedObjects) {
        // 场景1: 有选中对象 - 图像编辑
        console.log('🎨 Scenario 1: Editing selected objects')

        const selectedData = await getSelectedObjectsImage()
        if (!selectedData) {
          throw new Error('Unable to capture selected objects image')
        }

        console.log('🎨 Processing selected objects with Gemini Flash Image...', {
          instruction: currentMessage,
          imageDataLength: selectedData.imageData.length,
          bounds: selectedData.bounds
        })

        // 发送图片和文本到Gemini Flash Image模型
        const response = await fetch('/api/ai/image/edit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: selectedData.imageData,
            instruction: currentMessage,
            model: 'gemini-2.5-flash-image-preview'
          })
        })

        console.log('📡 Edit API Response status:', response.status)
        const result = await response.json()
        console.log('📡 Edit API Response data:', result)

        if (result.success && result.data?.editedImageUrl) {
          // Add generated image to the right of selected objects
          const img = await FabricImage.fromURL(result.data.editedImageUrl)

          // Get current viewport transform for accurate positioning
          const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0]
          const zoom = vpt[0]
          const panX = vpt[4]
          const panY = vpt[5]

          // Calculate placement position considering viewport transform
          // Place image to the right of the capture area, but ensure it's visible in current viewport
          const spacing = 50
          const baseRightX = selectedData.bounds.left + selectedData.bounds.width + spacing

          // Calculate the center of current viewport in canvas coordinates
          const viewportCenterX = (canvas.getWidth() / 2 - panX) / zoom
          const viewportCenterY = (canvas.getHeight() / 2 - panY) / zoom

          // Choose placement strategy based on available space
          let rightX = baseRightX
          let topY = selectedData.bounds.top

          // If the calculated right position would be outside the visible viewport,
          // place it in a more visible location
          const canvasWidth = canvas.getWidth()
          const estimatedImgWidth = 200 // Estimated width after scaling

          if (baseRightX + estimatedImgWidth > viewportCenterX + canvasWidth / (2 * zoom)) {
            // Place image in the center-right of the viewport instead
            rightX = viewportCenterX + 100
            topY = Math.max(selectedData.bounds.top, viewportCenterY - 100)
          }

          console.log('📍 Placement calculation:', {
            viewport: { zoom, panX, panY, centerX: viewportCenterX, centerY: viewportCenterY },
            selectedBounds: selectedData.bounds,
            baseRightX,
            finalPosition: { rightX, topY },
            canvasSize: { width: canvasWidth, height: canvas.getHeight() }
          })

          // 缩放图片
          const maxWidth = 400
          const maxHeight = 400
          if (img.width && img.height) {
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
            img.scale(scale)
          }

          img.set({
            left: rightX,
            top: topY,
            selectable: true,
            evented: true
          })

          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.renderAll()

          console.log('✅ Image placed at:', {
            left: rightX,
            top: topY,
            viewportAware: true,
            originalBounds: selectedData.bounds
          })

          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `✅ I have processed the selected objects according to your request "${currentMessage}" and placed the AI-generated result on the right. You can continue editing or adjust the position.`,
            timestamp: new Date().toLocaleTimeString()
          }
          setChatMessages(prev => [...prev, aiResponse])
        } else {
          throw new Error(result.error || 'AI image processing failed')
        }
      } else {
        // 场景2: 没有选中对象 - 图像生成
        console.log('🎨 Scenario 2: Generating image from text')
        console.log('🎨 Generating image with Gemini Flash Image...', { prompt: currentMessage })

        const response = await fetch('/api/ai/image/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: currentMessage,
            model: 'gemini-2.5-flash-image-preview'
          })
        })

        console.log('📡 Generate API Response status:', response.status)
        const result = await response.json()
        console.log('📡 Generate API Response data:', result)

        if (result.success && result.data?.imageUrl) {
          // 在画布中央添加生成的图像
          const img = await FabricImage.fromURL(result.data.imageUrl)

          // 计算画布中央位置（考虑当前视口）
          const viewport = canvas.viewportTransform || [1, 0, 0, 1, 0, 0]
          const zoom = viewport[0]
          const panX = viewport[4]
          const panY = viewport[5]

          // 计算视口中心在画布坐标系中的位置
          const viewportCenterX = (canvas.getWidth() / 2 - panX) / zoom
          const viewportCenterY = (canvas.getHeight() / 2 - panY) / zoom

          // 缩放图像
          const maxWidth = 400
          const maxHeight = 400
          if (img.width && img.height) {
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
            img.scale(scale)
          }

          // 设置图像位置在视口中央
          img.set({
            left: viewportCenterX - img.getScaledWidth() / 2,
            top: viewportCenterY - img.getScaledHeight() / 2,
            selectable: true,
            evented: true
          })

          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.renderAll()

          console.log('✅ Image placed at center:', {
            left: viewportCenterX - img.getScaledWidth() / 2,
            top: viewportCenterY - img.getScaledHeight() / 2
          })

          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `🎨 I have generated a new image based on your description "${currentMessage}" and placed it in the center of the canvas. You can select it for further editing!`,
            timestamp: new Date().toLocaleTimeString()
          }
          setChatMessages(prev => [...prev, aiResponse])
        } else {
          // 图像生成失败，显示具体错误信息
          console.error('❌ Image generation failed:', result.error)
          throw new Error(result.error || 'Image generation failed, please try again later')
        }
      }
    } catch (error) {
      console.error('❌ AI processing error:', error)

      let errorMessage = 'Unknown error'

      if (error instanceof Error) {
        errorMessage = error.message

        // Special handling for network and configuration errors
        if (error.message.includes('Vertex AI is not')) {
          errorMessage = '🚫 Vertex AI service is not properly configured. Please check environment variables or contact administrator.'
        } else if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
          errorMessage = '🚫 Vertex AI service is currently unavailable. Please check network connection or try again later.'
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
          errorMessage = '🌐 Network connection failed. Please check network connection or VPN configuration.'
        } else if (error.message.includes('timeout')) {
          errorMessage = '⏱️ Request timeout. Please check network connection or try again later.'
        }
      }

      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Error occurred while processing request: ${errorMessage}\n\n💡 Note: This application requires real Vertex AI service and does not support simulation mode.`,
        timestamp: new Date().toLocaleTimeString()
      }

      setChatMessages(prev => [...prev, errorResponse])
    } finally {
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

        // 保存原始尺寸信息用于后续高清导出
        const originalWidth = img.width || 0
        const originalHeight = img.height || 0

        console.log('📸 Uploaded image info:', {
          original: { width: originalWidth, height: originalHeight },
          file: { name: file.name, size: file.size }
        })

        // 智能缩放：保持宽高比，适应画布大小
        const canvasWidth = canvas.getWidth()
        const canvasHeight = canvas.getHeight()
        const maxDisplayWidth = Math.min(400, canvasWidth * 0.4)
        const maxDisplayHeight = Math.min(400, canvasHeight * 0.4)

        if (originalWidth > 0 && originalHeight > 0) {
          const scale = Math.min(
            maxDisplayWidth / originalWidth,
            maxDisplayHeight / originalHeight,
            1 // 不放大，只缩小
          )
          img.scale(scale)

          console.log('📸 Image scaled:', {
            scale: scale,
            display: {
              width: originalWidth * scale,
              height: originalHeight * scale
            }
          })
        }

        // 设置图像位置在画布中央
        img.set({
          left: (canvasWidth - img.getScaledWidth()) / 2,
          top: (canvasHeight - img.getScaledHeight()) / 2,
          selectable: true,
          evented: true
        })

        canvas.add(img)
        canvas.setActiveObject(img)
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

  // Debug functions - only available in development
  const testCoordinateTransform = process.env.NODE_ENV === 'development' ? () => {
    if (!canvas) return

    console.log('🧪 === COORDINATE TRANSFORM TEST ===')
    const activeObjects = canvas.getActiveObjects()
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0]

    if (activeObjects.length > 0) {
      const obj = activeObjects[0]
      const bounds = obj.getBoundingRect()

      // Test if our coordinate understanding is correct
      console.log('Testing coordinate transform for first object:')
      console.log('Canvas bounds (what toDataURL uses):', bounds)
      console.log('Viewport transform:', vpt)

      // Simulate what happens during image capture
      const captureArea = {
        left: bounds.left - 10,
        top: bounds.top - 10,
        width: bounds.width + 20,
        height: bounds.height + 20
      }

      console.log('Simulated capture area:', captureArea)
      console.log('This should contain the object regardless of viewport pan/zoom')
    }
  } : () => {}

  const debugCoordinates = process.env.NODE_ENV === 'development' ? () => {
    if (!canvas) return

    console.log('🐛 === DEBUG COORDINATE SYSTEM ===')
    const activeObjects = canvas.getActiveObjects()
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0]

    console.log('Canvas info:', {
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      viewportTransform: vpt,
      zoom: vpt[0],
      panX: vpt[4],
      panY: vpt[5],
      // Additional transform info
      scaleX: vpt[0],
      scaleY: vpt[3],
      translateX: vpt[4],
      translateY: vpt[5]
    })

    console.log('Selected objects:', activeObjects.length)
    activeObjects.forEach((obj, index) => {
      const bounds = obj.getBoundingRect()

      // Calculate what the viewport coordinates would be
      const viewportX = bounds.left * vpt[0] + vpt[4]
      const viewportY = bounds.top * vpt[3] + vpt[5]

      console.log(`Object ${index} (${obj.type}):`, {
        logicalPosition: { left: obj.left, top: obj.top },
        scale: { x: obj.scaleX, y: obj.scaleY },
        canvasBounds: bounds,
        viewportPosition: { x: viewportX, y: viewportY },
        center: {
          canvas: {
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2
          },
          viewport: {
            x: viewportX + bounds.width / 2,
            y: viewportY + bounds.height / 2
          }
        }
      })
    })
  } : () => {}

  const downloadImage = async () => {
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()

    if (activeObjects.length > 0) {
      // 如果有选中对象，下载选中对象
      await exportSelectedObjects()
    } else {
      // 如果没有选中对象，下载整个画布
      // 计算最佳下载分辨率
      let downloadMultiplier = 2 // 默认2倍分辨率

      // 检查画布中的所有图像对象，使用最高分辨率需求
      canvas.getObjects().forEach(obj => {
        if (obj.type === 'image') {
          const imgObj = obj as any
          if (imgObj._originalElement) {
            const originalWidth = imgObj._originalElement.naturalWidth || imgObj._originalElement.width
            const currentWidth = imgObj.getScaledWidth()
            const imageMultiplier = originalWidth / currentWidth
            downloadMultiplier = Math.max(downloadMultiplier, Math.min(imageMultiplier, 4))
          }
        }
      })

      console.log('📥 Downloading entire canvas with multiplier:', downloadMultiplier)

      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: downloadMultiplier // 使用高分辨率
      })
      const link = document.createElement('a')
      link.download = `canvas-image-${Date.now()}.png`
      link.href = dataURL
      link.click()
    }
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {/* 无限画布 */}
      <div
        className="absolute inset-0 w-full h-full"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onContextMenu={handleContextMenu}
        />

        {/* 拖放提示覆盖层 */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500/20 border-4 border-dashed border-blue-500 flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-8">
              <div className="text-center">
                <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Drop Image Here</h3>
                <p className="text-gray-600">Release to upload image to canvas</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 右键菜单 */}
      {contextMenu.visible && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={hideContextMenu}
          />
          <div
            className="fixed z-50 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 py-2 min-w-48"
            data-context-menu
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              transform: 'translate(-50%, -10px)'
            }}
          >
            <button
              onClick={() => showAiDialog(contextMenu.x, contextMenu.y)}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center space-x-2 text-sm"
            >
              <span className="text-blue-500">🤖</span>
              <span>AI Generate</span>
            </button>
            <button
              onClick={exportSelectedObjects}
              className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center space-x-2 text-sm"
            >
              <Download className="w-4 h-4 text-green-500" />
              <span>Download PNG</span>
            </button>
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={() => {
                if (canvas) {
                  const activeObjects = canvas.getActiveObjects()
                  activeObjects.forEach(obj => canvas.remove(obj))
                  canvas.discardActiveObject()
                  canvas.renderAll()
                }
                hideContextMenu()
              }}
              className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center space-x-2 text-sm text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}

      {/* 竖屏工具栏 - 减少30%宽度 */}
      <div className="absolute top-6 left-4 z-40">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-2 w-14">
          <div className="flex flex-col items-center space-y-1">
            {/* 工具栏展开/收起按钮 */}
            <button
              onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors w-10 h-10 flex items-center justify-center"
              title={isToolbarExpanded ? 'Collapse Toolbar' : 'Expand Toolbar'}
            >
              {isToolbarExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {isToolbarExpanded && (
              <>
                {/* 选择工具 */}
                <button
                  onClick={() => setCurrentTool('select')}
                  className={`p-2 rounded-xl transition-all w-10 h-10 flex items-center justify-center ${
                    currentTool === 'select'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Selection Tool"
                >
                  <MousePointer2 className="w-4 h-4" />
                </button>

                {/* 移动工具 */}
                <button
                  onClick={() => setCurrentTool('move')}
                  className={`p-2 rounded-xl transition-all w-10 h-10 flex items-center justify-center ${
                    currentTool === 'move'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Move Canvas"
                >
                  <Move className="w-4 h-4" />
                </button>

                <div className="h-px w-8 bg-gray-200 my-1" />

                {/* 画笔工具 */}
                <button
                  onClick={() => setCurrentTool('draw')}
                  className={`p-2 rounded-xl transition-all w-10 h-10 flex items-center justify-center ${
                    currentTool === 'draw'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Brush"
                >
                  <Brush className="w-4 h-4" />
                </button>

                <div className="h-px w-8 bg-gray-200 my-1" />

                {/* 形状工具 */}
                <button
                  onClick={() => setCurrentTool('rectangle')}
                  className={`p-2 rounded-xl transition-all w-10 h-10 flex items-center justify-center ${
                    currentTool === 'rectangle'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Rectangle"
                >
                  <Square className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentTool('circle')}
                  className={`p-2 rounded-xl transition-all w-10 h-10 flex items-center justify-center ${
                    currentTool === 'circle'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Circle"
                >
                  <Circle className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentTool('text')}
                  className={`p-2 rounded-xl transition-all w-10 h-10 flex items-center justify-center ${
                    currentTool === 'text'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Text"
                >
                  <Type className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentTool('arrow')}
                  className={`p-2 rounded-xl transition-all w-10 h-10 flex items-center justify-center ${
                    currentTool === 'arrow'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Arrow"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <div className="h-px w-8 bg-gray-200 my-1" />

                {/* 功能按钮 */}
                <button
                  onClick={deleteSelected}
                  className="p-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg w-10 h-10 flex items-center justify-center"
                  title="Delete Selected"
                >
                  <Trash2 className="w-4 h-4" />
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
                  className="p-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg w-10 h-10 flex items-center justify-center"
                  title="Upload Image"
                >
                  <Upload className="w-4 h-4" />
                </button>

                <button
                  onClick={downloadImage}
                  className="p-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors shadow-lg w-10 h-10 flex items-center justify-center"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Debug buttons - only show in development */}
                {process.env.NODE_ENV === 'development' && (
                  <>
                    <button
                      onClick={debugCoordinates}
                      className="p-2 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 transition-colors shadow-lg w-10 h-10 flex items-center justify-center text-xs"
                      title="Debug Coordinates"
                    >
                      🐛
                    </button>
                    <button
                      onClick={testCoordinateTransform}
                      className="p-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg w-10 h-10 flex items-center justify-center text-xs"
                      title="Test Coordinate Transform"
                    >
                      🧪
                    </button>
                  </>
                )}
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
              <span className="font-semibold text-gray-800">AI Assistant</span>
            </div>
            <button
              onClick={() => setIsChatExpanded(!isChatExpanded)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              title={isChatExpanded ? 'Collapse Chat' : 'Expand Chat'}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Ask AI Assistant..."
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

      {/* AI对话框 */}
      {aiDialog.visible && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={hideAiDialog}
          />
          <div
            className="fixed z-50 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-4 w-80"
            data-ai-dialog
            style={{
              left: aiDialog.x,
              top: aiDialog.y,
              transform: 'translate(-50%, 20px)'
            }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-blue-500">🤖</span>
              <h3 className="font-semibold text-gray-800">AI Assistant</h3>
            </div>
            <div className="space-y-3">
              <textarea
                value={aiDialog.message}
                onChange={(e) => adjustTextareaHeight(e.target.value)}
                placeholder="Describe what you want to do with the selected objects..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none transition-all duration-200"
                style={{
                  height: `${aiDialog.textareaHeight}px`,
                  minHeight: '72px', // 最小3行
                  maxHeight: '240px' // 最大10行
                }}
                disabled={aiDialog.isLoading}
              />
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    if (!aiDialog.message.trim() || !canvas) return

                    setAiDialog(prev => ({ ...prev, isLoading: true }))

                    try {
                      // 这里调用现有的AI处理逻辑
                      const result = await getSelectedObjectsImage()
                      if (result) {
                        // 发送AI请求的逻辑...
                        console.log('AI request with message:', aiDialog.message)
                      }
                    } catch (error) {
                      console.error('AI request failed:', error)
                    } finally {
                      setAiDialog(prev => ({ ...prev, isLoading: false }))
                      resetTextareaHeight() // 重置textarea高度
                      hideAiDialog()
                    }
                  }}
                  disabled={!aiDialog.message.trim() || aiDialog.isLoading}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {aiDialog.isLoading ? 'Processing...' : 'Generate'}
                </button>
                <button
                  onClick={hideAiDialog}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 底部状态栏 */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 px-4 py-2">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Current Tool: <span className="font-semibold text-gray-800">{
              currentTool === 'select' ? 'Select' :
              currentTool === 'move' ? 'Move' :
              currentTool === 'draw' ? 'Brush' :
              currentTool === 'rectangle' ? 'Rectangle' :
              currentTool === 'circle' ? 'Circle' :
              currentTool === 'text' ? 'Text' :
              currentTool === 'arrow' ? 'Arrow' : currentTool
            }</span></span>
            <div className="w-px h-4 bg-gray-300"></div>
            <span>Scroll to Zoom | Alt+Drag to Pan</span>
            {/* Environment indicator - only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <div className="w-px h-4 bg-gray-300"></div>
                <span className="text-yellow-600 font-semibold">DEV MODE</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
