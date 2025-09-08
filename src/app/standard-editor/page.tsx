'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, Rect, Circle as FabricCircle, IText, FabricImage, Path } from 'fabric'
import * as fabric from 'fabric'
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
      case 'arrow':
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

  // 获取选中对象的图片数据
  const getSelectedObjectsImage = async (): Promise<{ imageData: string; bounds: any } | null> => {
    if (!canvas) return null

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length === 0) return null

    try {
      console.log('� === STARTING OBJECT CAPTURE ===')
      console.log('�📸 Capturing selected objects...', {
        count: activeObjects.length,
        objectTypes: activeObjects.map(obj => obj.type)
      })

      // Force re-render canvas to ensure all object positions are correct
      canvas.renderAll()

      // Get current viewport transform matrix
      const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0]
      const zoom = vpt[0]
      const panX = vpt[4]
      const panY = vpt[5]

      console.log('� Current viewport transform:', {
        zoom,
        panX,
        panY,
        fullTransform: vpt
      })

      // Calculate all selected objects' precise bounding box in canvas coordinates
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

      activeObjects.forEach((obj, index) => {
        // Force update object coordinates for all object types
        obj.setCoords()

        // CRITICAL FIX: getBoundingRect() already returns CANVAS coordinates!
        // The previous assumption was wrong - no coordinate transformation needed.
        // toDataURL() expects canvas coordinates, which is exactly what getBoundingRect() provides.

        const bounds = obj.getBoundingRect()

        console.log(`🔍 Object ${index} (${obj.type}) bounds (canvas coordinates):`, {
          left: bounds.left,
          top: bounds.top,
          width: bounds.width,
          height: bounds.height,
          right: bounds.left + bounds.width,
          bottom: bounds.top + bounds.height,
          area: bounds.width * bounds.height
        })

        console.log(`📍 Viewport info for reference:`, {
          zoom, panX, panY,
          note: "getBoundingRect() returns canvas coordinates regardless of viewport transform"
        })

        // Use the bounds directly - they are already in canvas coordinate system
        minX = Math.min(minX, bounds.left)
        minY = Math.min(minY, bounds.top)
        maxX = Math.max(maxX, bounds.left + bounds.width)
        maxY = Math.max(maxY, bounds.top + bounds.height)
      })

      // 计算实际内容区域（不添加过多padding）
      const contentWidth = maxX - minX
      const contentHeight = maxY - minY

      // 动态计算padding，避免过大的白边
      const paddingRatio = 0.05 // 5%的边距
      const minPadding = 10
      const maxPadding = 50

      const dynamicPadding = Math.max(
        minPadding,
        Math.min(
          maxPadding,
          Math.max(contentWidth * paddingRatio, contentHeight * paddingRatio)
        )
      )

      const captureArea = {
        left: minX - dynamicPadding,
        top: minY - dynamicPadding,
        width: contentWidth + dynamicPadding * 2,
        height: contentHeight + dynamicPadding * 2
      }

      // 确保捕获区域在画布范围内
      const canvasWidth = canvas.getWidth()
      const canvasHeight = canvas.getHeight()

      console.log('🔧 Before boundary fix:', {
        captureArea: { ...captureArea },
        canvas: { width: canvasWidth, height: canvasHeight },
        objectBounds: { minX, minY, maxX, maxY }
      })

      // 🧪 边界情况分析
      const boundaryAnalysis = {
        leftOverflow: captureArea.left < 0,
        rightOverflow: captureArea.left + captureArea.width > canvasWidth,
        topOverflow: captureArea.top < 0,
        bottomOverflow: captureArea.top + captureArea.height > canvasHeight,
        completelyOutside:
          captureArea.left >= canvasWidth ||
          captureArea.top >= canvasHeight ||
          captureArea.left + captureArea.width <= 0 ||
          captureArea.top + captureArea.height <= 0
      }

      console.log('🔍 Boundary analysis:', boundaryAnalysis)

      // CRITICAL FIX: 正确处理无限画布的边界裁剪
      // 无限画布意味着对象可能在任意方向超出画布边界

      // 保存原始捕获区域用于计算
      const originalLeft = captureArea.left
      const originalTop = captureArea.top
      const originalRight = captureArea.left + captureArea.width
      const originalBottom = captureArea.top + captureArea.height

      // 计算与画布的交集区域
      const clampedLeft = Math.max(0, originalLeft)
      const clampedTop = Math.max(0, originalTop)
      const clampedRight = Math.min(canvasWidth, originalRight)
      const clampedBottom = Math.min(canvasHeight, originalBottom)

      // 检查是否有有效的交集
      const hasValidIntersection = clampedLeft < clampedRight && clampedTop < clampedBottom

      if (hasValidIntersection) {
        // 有有效交集，使用交集区域
        captureArea.left = clampedLeft
        captureArea.top = clampedTop
        captureArea.width = clampedRight - clampedLeft
        captureArea.height = clampedBottom - clampedTop
      } else {
        // 没有交集（对象完全在画布外），创建最小有效区域
        console.warn('⚠️ Object completely outside canvas, creating minimal capture area')
        captureArea.left = Math.max(0, Math.min(canvasWidth - 1, originalLeft))
        captureArea.top = Math.max(0, Math.min(canvasHeight - 1, originalTop))
        captureArea.width = 1
        captureArea.height = 1
      }

      console.log('🔧 After boundary fix:', {
        captureArea: { ...captureArea },
        originalBounds: {
          left: originalLeft,
          top: originalTop,
          right: originalRight,
          bottom: originalBottom
        },
        clampedBounds: {
          left: clampedLeft,
          top: clampedTop,
          right: clampedRight,
          bottom: clampedBottom
        },
        hasValidIntersection,
        intersectionArea: hasValidIntersection ?
          (clampedRight - clampedLeft) * (clampedBottom - clampedTop) : 0
      })

      console.log('� Bounding box calculation:', {
        objectBounds: { minX, minY, maxX, maxY },
        contentSize: { width: contentWidth, height: contentHeight },
        dynamicPadding: dynamicPadding
      })

      console.log('�📸 Capture area calculation:', {
        viewport: { zoom, panX, panY },
        content: { width: contentWidth, height: contentHeight },
        padding: dynamicPadding,
        beforeClamp: {
          left: minX - dynamicPadding,
          top: minY - dynamicPadding,
          width: contentWidth + dynamicPadding * 2,
          height: contentHeight + dynamicPadding * 2
        },
        finalArea: captureArea,
        canvas: { width: canvasWidth, height: canvasHeight }
      })

      // 计算最佳的multiplier以保持高清晰度
      // 检查选中对象中是否有图像，如果有，使用其原始分辨率
      let bestMultiplier = 2 // 默认2倍分辨率

      activeObjects.forEach(obj => {
        if (obj.type === 'image') {
          const imgObj = obj as any
          if (imgObj._originalElement) {
            const originalWidth = imgObj._originalElement.naturalWidth || imgObj._originalElement.width
            const originalHeight = imgObj._originalElement.naturalHeight || imgObj._originalElement.height
            const currentWidth = imgObj.getScaledWidth()
            const currentHeight = imgObj.getScaledHeight()

            // 计算原始图像与当前显示尺寸的比例
            const widthRatio = originalWidth / currentWidth
            const heightRatio = originalHeight / currentHeight
            const imageMultiplier = Math.max(widthRatio, heightRatio)

            // 使用最高的分辨率需求，但限制在合理范围内
            bestMultiplier = Math.max(bestMultiplier, Math.min(imageMultiplier, 4))

            console.log('📸 Image resolution analysis:', {
              original: { width: originalWidth, height: originalHeight },
              current: { width: currentWidth, height: currentHeight },
              ratio: { width: widthRatio, height: heightRatio },
              suggestedMultiplier: imageMultiplier
            })
          }
        }
      })

      console.log('📸 Using multiplier:', bestMultiplier)

      // Validate capture area before export
      if (captureArea.left < 0 || captureArea.top < 0 ||
          captureArea.left + captureArea.width > canvasWidth ||
          captureArea.top + captureArea.height > canvasHeight) {
        console.warn('⚠️ Capture area extends beyond canvas bounds, adjusting...')
        captureArea.left = Math.max(0, captureArea.left)
        captureArea.top = Math.max(0, captureArea.top)
        captureArea.width = Math.min(captureArea.width, canvasWidth - captureArea.left)
        captureArea.height = Math.min(captureArea.height, canvasHeight - captureArea.top)
      }

      console.log('📸 Final validated capture area:', captureArea)

      // Use precise capture area for image export
      const imageData = canvas.toDataURL({
        left: captureArea.left,
        top: captureArea.top,
        width: captureArea.width,
        height: captureArea.height,
        format: 'png',
        quality: 1,
        multiplier: bestMultiplier // Use calculated optimal resolution
      })

      // Validate that all objects are within capture area
      const validationResults = activeObjects.map((obj, index) => {
        const bounds = obj.getBoundingRect()
        const inBounds = bounds.left >= captureArea.left &&
                        bounds.top >= captureArea.top &&
                        bounds.left + bounds.width <= captureArea.left + captureArea.width &&
                        bounds.top + bounds.height <= captureArea.top + captureArea.height

        console.log(`✅ Object ${index} (${obj.type}) validation:`, {
          bounds: bounds,
          captureArea: captureArea,
          inBounds: inBounds,
          overlap: {
            left: Math.max(bounds.left, captureArea.left),
            top: Math.max(bounds.top, captureArea.top),
            right: Math.min(bounds.left + bounds.width, captureArea.left + captureArea.width),
            bottom: Math.min(bounds.top + bounds.height, captureArea.top + captureArea.height)
          }
        })

        return { index, type: obj.type, inBounds }
      })

      console.log('🎯 === CAPTURE COMPLETE ===')
      console.log('📸 Image captured successfully:', {
        dataSize: imageData.length,
        captureArea: captureArea,
        multiplier: bestMultiplier,
        viewportTransform: vpt,
        allObjectsInBounds: validationResults.every(r => r.inBounds),
        validationResults: validationResults
      })

      return {
        imageData,
        bounds: {
          left: captureArea.left,
          top: captureArea.top,
          width: captureArea.width,
          height: captureArea.height,
          originalBounds: {
            minX, minY, maxX, maxY,
            contentWidth, contentHeight
          }
        }
      }
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

  const downloadImage = () => {
    if (!canvas) return

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

    console.log('📥 Downloading with multiplier:', downloadMultiplier)

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
              title={isToolbarExpanded ? 'Collapse Toolbar' : 'Expand Toolbar'}
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
                  title="Selection Tool"
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
                  title="Move Canvas"
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
                  title="Brush"
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
                  title="Rectangle"
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
                  title="Circle"
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
                  title="Text"
                >
                  <Type className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setCurrentTool('arrow')}
                  className={`p-3 rounded-xl transition-all ${
                    currentTool === 'arrow'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Arrow"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </button>

                <div className="w-px h-8 bg-gray-200 mx-1" />

                {/* 功能按钮 */}
                <button
                  onClick={deleteSelected}
                  className="p-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                  title="Delete Selected"
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
                  title="Upload Image"
                >
                  <Upload className="w-5 h-5" />
                </button>

                <button
                  onClick={downloadImage}
                  className="p-3 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors shadow-lg"
                  title="Download Image"
                >
                  <Download className="w-5 h-5" />
                </button>

                {/* Debug buttons - only show in development */}
                {process.env.NODE_ENV === 'development' && (
                  <>
                    <button
                      onClick={debugCoordinates}
                      className="p-3 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 transition-colors shadow-lg"
                      title="Debug Coordinates"
                    >
                      🐛
                    </button>
                    <button
                      onClick={testCoordinateTransform}
                      className="p-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg"
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
