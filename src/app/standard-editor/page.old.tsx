 'use client'

 import { useEffect, useRef, useState, useCallback } from 'react'
 import { useSearchParams } from 'next/navigation'
 import { useSession } from 'next-auth/react'
 import LoginDialog from '@/components/LoginDialog'
 import * as fabric from 'fabric'
 import { exportSelectedObjectsSmart, calculateOptimalMultiplier, getPreciseBounds } from '@/utils/fabric-object-export'
 import { smartCompressImage, getBase64SizeMB } from '@/utils/image-compression'
 import { usePoints, usePointsCheck } from '@/hooks/usePoints'
 import PointsDisplay from '@/components/PointsDisplay'
 import OnboardingGuide from '@/components/OnboardingGuide'
 import EmptyState from '@/components/EmptyState'
 import TemplateSelector from '@/components/TemplateSelector'
 import { useFirstVisit } from '@/hooks/useFirstVisit'
 import { TemplateFactory, TemplateType, AIGenerationCallbacks, TextToImageTemplate } from '@/lib/templates'
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
  const searchParams = useSearchParams()
  const { status } = useSession()
  const isAuthed = status === 'authenticated'
  const [loginOpen, setLoginOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  // 初始化保护与调试日志
  const canvasInitRef = useRef(false)
  const [currentTool, setCurrentTool] = useState<'select' | 'move' | 'draw' | 'rectangle' | 'circle' | 'text' | 'arrow'>('select')
  
  // 同步 currentTool 到 ref，避免闭包问题
  useEffect(() => {
    currentToolRef.current = currentTool
    // 同时更新 DOM 属性，供事件处理器使用
    if (canvasRef.current) {
      canvasRef.current.setAttribute('data-current-tool', currentTool)
    }
  }, [currentTool])
  
  // 安全渲染函数 - 适配 Fabric.js 6.9.0
  // Fabric.js 6.0+ 推荐使用 requestRenderAll()，它会优化渲染性能
  const safeRenderAll = useCallback((targetCanvas: fabric.Canvas | null) => {
    if (!targetCanvas) return
    
    try {
      // Fabric.js 6.0+ 使用 requestRenderAll() 进行异步渲染优化
      if (typeof (targetCanvas as any).requestRenderAll === 'function') {
        (targetCanvas as any).requestRenderAll()
      } else if (typeof targetCanvas.renderAll === 'function') {
        // 降级到 renderAll() 如果 requestRenderAll 不可用
        targetCanvas.renderAll()
      }
    } catch (error: any) {
      // 静默处理 context 错误，这通常发生在组件卸载时
      // 不需要打印警告，因为这是正常情况
      if (!error?.message?.includes('clearRect') && !error?.message?.includes('null')) {
        console.warn('⚠️ Render error:', error)
      }
    }
  }, [])

  // Floating window states
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true)
  const [isChatExpanded, setIsChatExpanded] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const dragDepthRef = useRef(0)

  // 拖拽绘制状态 - 使用 ref 避免闭包问题
  const isDrawingRef = useRef(false)
  const startPointRef = useRef<{ x: number; y: number } | null>(null)
  const currentShapeRef = useRef<any>(null)
  const currentToolRef = useRef<'select' | 'move' | 'draw' | 'rectangle' | 'circle' | 'text' | 'arrow'>('select')
  
  // 同步 ref 和 state（用于 UI 显示）
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentShape, setCurrentShape] = useState<any>(null)

  // 积分系统
  const { deductPoints, loading: pointsLoading, error: pointsError } = usePoints()
  const { points, checkPoints, hasEnoughPoints } = usePointsCheck()

  // 首次访问和引导系统
  const { isFirstVisit, hasSeenOnboarding, markEditorVisited, markOnboardingSeen, shouldShowOnboarding } = useFirstVisit()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showEmptyState, setShowEmptyState] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  // AI Edit 快捷按钮状态
  const [aiEditButton, setAiEditButton] = useState<{
    visible: boolean
    x: number
    y: number
  }>({
    visible: false,
    x: 0,
    y: 0
  })

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

  // AI模型选择
  const [selectedModel, setSelectedModel] = useState<'gemini-2.5-flash-image-preview' | 'gemini-3-pro-image-preview'>('gemini-2.5-flash-image-preview')

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

  // 模板系统状态
  const [templateFactory, setTemplateFactory] = useState<TemplateFactory | null>(null)

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

  // 首次访问检测和引导逻辑
  // 注意：这个 useEffect 不应该使用 canvasInitRef，因为它是用于画布初始化的
  // 使用单独的 ref 来跟踪首次访问检测
  const firstVisitCheckRef = useRef(false)
  useEffect(() => {
    if (firstVisitCheckRef.current) {
      return
    }
    firstVisitCheckRef.current = true
    console.log('🟢 Running first visit check')
    if (isFirstVisit) {
      markEditorVisited()
      setShowEmptyState(true)
    }
  }, [isFirstVisit, markEditorVisited])

  // 检查是否应该显示引导
  useEffect(() => {
    if (shouldShowOnboarding()) {
      setShowOnboarding(true)
    }
  }, [shouldShowOnboarding])

  // 检查画布是否为空
  const checkCanvasEmpty = useCallback(() => {
    if (!canvas) return true
    const objects = canvas.getObjects()
    return objects.length === 0
  }, [canvas])

  // 监听画布变化，更新空状态显示
  useEffect(() => {
    if (!canvas) return

    const updateEmptyState = () => {
      const isEmpty = checkCanvasEmpty()
      setShowEmptyState(isEmpty && isFirstVisit)
    }

    // 监听画布对象变化
    canvas.on('object:added', updateEmptyState)
    canvas.on('object:removed', updateEmptyState)
    canvas.on('object:modified', updateEmptyState)

    return () => {
      canvas.off('object:added', updateEmptyState)
      canvas.off('object:removed', updateEmptyState)
      canvas.off('object:modified', updateEmptyState)
    }
  }, [canvas, checkCanvasEmpty, isFirstVisit])

  // 拖放处理函数
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
    setIsDragOver(true)
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current += 1
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current = 0
    setIsDragOver(false)

    console.log('🎯 Drop event triggered')

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    console.log('📁 Files dropped:', files.length, 'Images:', imageFiles.length)

    if (imageFiles.length === 0) {
      console.warn('⚠️ No image files found in drop')
      return
    }

    // 处理多个图片文件 - 基于 Fabric.js 社区最佳实践
    handleMultipleImageUpload(imageFiles)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent default browser behavior (file open/navigation) on Windows Chrome
  useEffect(() => {
    const prevent = (ev: DragEvent) => {
      ev.preventDefault()
      ev.stopPropagation()
    }
    window.addEventListener('dragover', prevent)
    window.addEventListener('drop', prevent)
    return () => {
      window.removeEventListener('dragover', prevent)
      window.removeEventListener('drop', prevent)
    }
  }, [])

  // 带位置参数的图片上传 - 基于 Fabric.js 社区最佳实践
  const handleImageUploadWithPosition = useCallback((file: File, position: { x: number, y: number }) => {
    // 通过全局变量获取当前画布实例，避免闭包问题
    const currentCanvas = canvasRef.current ?
      (window as any).fabricCanvasInstance || canvas : null

    if (!currentCanvas) {
      console.error('❌ Canvas not available for image upload')
      return
    }

    console.log('📸 Starting positioned image upload:', file.name, 'at position:', position)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const imgUrl = e.target?.result as string
        if (!imgUrl) {
          console.error('❌ Failed to read image file')
          return
        }

        console.log('📸 Creating Fabric image from URL...')
        // Fabric.js 6.x: fromURL 返回 Promise
        const img = await fabric.Image.fromURL(imgUrl, { crossOrigin: 'anonymous' })

        // 保存原始尺寸信息用于后续高清导出
        const originalWidth = img.width || 0
        const originalHeight = img.height || 0

        console.log('📸 Uploaded image info:', {
          original: { width: originalWidth, height: originalHeight },
          file: { name: file.name, size: file.size },
          position: position
        })

        // 智能缩放：保持宽高比，适应多图布局
        const maxDisplayWidth = 250 // 多图模式下使用较小的尺寸
        const maxDisplayHeight = 250

        if (originalWidth > 0 && originalHeight > 0) {
          const scale = Math.min(
            maxDisplayWidth / originalWidth,
            maxDisplayHeight / originalHeight,
            1 // 不放大，只缩小
          )
          img.scale(scale)

          console.log('📸 Image scaled for multi-upload:', {
            scale: scale,
            display: {
              width: originalWidth * scale,
              height: originalHeight * scale
            }
          })
        }

        // 设置图像位置到指定坐标
        img.set({
          left: position.x,
          top: position.y,
          selectable: true,
          evented: true
        })

        console.log('📸 Adding positioned image to canvas...')
        currentCanvas.add(img)
        safeRenderAll(currentCanvas)

        console.log('✅ Positioned image upload completed successfully')
      } catch (error) {
        console.error('❌ Failed to upload positioned image:', error)
      }
    }

    reader.onerror = () => {
      console.error('❌ Failed to read file')
    }

    reader.readAsDataURL(file)
  }, [canvas])

  // 多图片上传处理 - 基于 Fabric.js 社区最佳实践
  const handleMultipleImageUpload = useCallback((files: File[]) => {
    console.log(`📸 Starting multiple image upload: ${files.length} files`)

    // 智能布局参数
    const GRID_SPACING = 20 // 图片间距
    const MAX_COLUMNS = 3 // 最大列数
    const START_X = 50 // 起始X坐标
    const START_Y = 50 // 起始Y坐标

    files.forEach((file, index) => {
      // 计算网格位置
      const column = index % MAX_COLUMNS
      const row = Math.floor(index / MAX_COLUMNS)
      const offsetX = column * (300 + GRID_SPACING) // 假设每个图片最大宽度300px
      const offsetY = row * (300 + GRID_SPACING) // 假设每个图片最大高度300px

      console.log(`📸 Processing image ${index + 1}/${files.length}: ${file.name}`)
      console.log(`📍 Grid position: column=${column}, row=${row}, offset=(${offsetX}, ${offsetY})`)

      // 为每个图片添加位置偏移
      handleImageUploadWithPosition(file, {
        x: START_X + offsetX,
        y: START_Y + offsetY
      })
    })
  }, [handleImageUploadWithPosition])

  // 处理文件输入上传 - 基于 Fabric.js 社区最佳实践
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      console.warn('⚠️ No files selected')
      return
    }

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    console.log('📁 Files selected:', files.length, 'Images:', imageFiles.length)

    if (imageFiles.length === 0) {
      console.warn('⚠️ No image files found in selection')
      return
    }

    // 处理多个图片文件
    handleMultipleImageUpload(imageFiles)

    // 清空文件输入，允许重复选择相同文件
    e.target.value = ''
  }, [handleMultipleImageUpload])

  // React 右键菜单处理函数 - 作为备用方案
  const handleReactContextMenu = useCallback((e: React.MouseEvent) => {
    // 阻止默认右键菜单，但让 Fabric.js 事件处理
    e.preventDefault()
  }, [])

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
      // 临时重置视口平移/缩放以避免导出偏移（Windows/Chrome 下尤为明显）
      const originalVpt = canvas.viewportTransform ? [...canvas.viewportTransform] as number[] : null
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
      safeRenderAll(canvas)

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
      // 恢复视口
      if (originalVpt && originalVpt.length === 6) {
        const vptTuple = originalVpt as unknown as [number, number, number, number, number, number]
        canvas.setViewportTransform(vptTuple)
        safeRenderAll(canvas)
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      // 双保险恢复视口
      if (canvas) {
        safeRenderAll(canvas)
      }
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

  // 获取选中对象的图片数据 - 使用 Fabric.js 成熟解决方案
  const getSelectedObjectsImage = useCallback(async (): Promise<{ imageData: string; bounds: any } | null> => {
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
        format: 'jpeg',  // 使用 JPEG 格式减少文件大小
        quality: 0.8,    // 降低质量到 80% 以减少文件大小
        multiplier: Math.min(optimalMultiplier, 2), // 限制最大倍数为 2
        tightBounds: true,  // 使用紧密边界，无白边
        padding: 0,         // 无边距
        backgroundColor: 'white'  // 使用白色背景（JPEG 不支持透明）
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

      // 检查图片大小并进行智能压缩
      const originalSizeMB = getBase64SizeMB(result.imageData)
      console.log('📏 Original image size:', originalSizeMB.toFixed(2), 'MB')

      if (originalSizeMB > 5) { // 如果超过 5MB，进行压缩
        console.log('🗜️ Image too large, compressing...')
        try {
          const compressedData = await smartCompressImage(result.imageData, 2048) // 压缩到 2MB
          const compressedSizeMB = getBase64SizeMB(compressedData)
          console.log('✅ Image compressed:', compressedSizeMB.toFixed(2), 'MB')
          
          return {
            ...result,
            imageData: compressedData
          }
        } catch (error) {
          console.warn('⚠️ Image compression failed, using original:', error)
        }
      }

      return result
    } catch (error) {
      console.error('❌ Error generating selected objects image:', error)
      return null
    }
  }, [canvas])

  // 添加AI生成的图片到画布
  const addAiGeneratedImage = useCallback(async (imageUrl: string, bounds?: any) => {
    if (!canvas) return

    try {
      console.log('🖼️ Adding AI generated image to canvas', { imageUrl, bounds })

      // 创建图片对象
      // Fabric.js 6.x: fromURL 返回 Promise
      const img = await fabric.Image.fromURL(imageUrl, { crossOrigin: 'anonymous' })

      // 保存原始尺寸信息（用于导出时保持分辨率）
      const originalWidth = img.width || 0
      const originalHeight = img.height || 0
      
      // 保存到图片对象中
      const imgAny = img as any
      if (imgAny._originalElement) {
        imgAny._originalWidth = imgAny._originalElement.naturalWidth || originalWidth
        imgAny._originalHeight = imgAny._originalElement.naturalHeight || originalHeight
      } else {
        imgAny._originalWidth = originalWidth
        imgAny._originalHeight = originalHeight
      }

      // 检测分辨率类别
      const maxDimension = Math.max(originalWidth, originalHeight)
      let resolutionCategory = 'other'
      if (maxDimension <= 1024) resolutionCategory = '1K'
      else if (maxDimension <= 2048) resolutionCategory = '2K'
      else if (maxDimension <= 4096) resolutionCategory = '4K'
      imgAny._resolutionCategory = resolutionCategory

      console.log('AI generated image resolution:', {
        original: { width: originalWidth, height: originalHeight },
        category: resolutionCategory
      })

      // 设置图片位置和大小
      if (bounds) {
        // 如果有边界信息，在原位置右侧添加编辑后的图片
        const offsetX = bounds.width + 20 // 在原图右侧20px处

        img.set({
          left: bounds.left + offsetX,
          top: bounds.top,
          scaleX: bounds.width / (originalWidth || 1),
          scaleY: bounds.height / (originalHeight || 1),
        })

        console.log('📍 Positioned edited image next to original', {
          originalBounds: bounds,
          newPosition: { left: bounds.left + offsetX, top: bounds.top }
        })
      } else {
        // 如果没有边界信息，添加到画布中心
        const viewport = canvas.getVpCenter()
        const scale = Math.min(300 / (img.width || 1), 300 / (img.height || 1))

        img.set({
          left: viewport.x - (img.width || 0) * scale / 2,
          top: viewport.y - (img.height || 0) * scale / 2,
          scaleX: scale,
          scaleY: scale,
        })

        console.log('📍 Positioned generated image at viewport center', {
          viewport,
          scale,
          imageSize: { width: img.width, height: img.height }
        })
      }

      img.set({
        selectable: true,
        evented: true
      })

      // 添加到画布
      canvas.add(img)
      canvas.setActiveObject(img)
      safeRenderAll(canvas)

      console.log('✅ AI generated image added successfully')
    } catch (error) {
      console.error('❌ Failed to add AI generated image:', error)
      throw error
    }
  }, [canvas])

  // 处理AI请求 - 使用选中的模型
  const processAiRequest = useCallback(async (message: string) => {
    if (!canvas) {
      console.error('Canvas not available')
      return
    }
    // 登录校验
    if (!isAuthed) {
      setLoginOpen(true)
      throw new Error('AUTH_REQUIRED')
    }

    // 检查积分是否足够
    if (!hasEnoughPoints(5)) {
      throw new Error('积分不足，需要 5 积分才能使用 AI 生成功能')
    }

    console.log('🤖 Processing AI request:', message)

    try {
      // 先扣除积分
      const pointsResult = await deductPoints()
      if (!pointsResult.success) {
        throw new Error(pointsResult.message)
      }
      console.log('✅ 积分扣除成功:', pointsResult.message)

      // 获取选中对象的图片数据
      const result = await getSelectedObjectsImage()

      if (result) {
        // 场景1: 有选中对象 - 图像编辑
        console.log('📸 Selected objects image captured, performing image editing')
        console.log('🎨 Processing selected objects with Gemini Flash Image...', {
          instruction: message,
          imageDataLength: result.imageData.length,
          bounds: result.bounds
        })

        // 发送图片和文本到Gemini Flash Image模型
        const response = await fetch('/api/ai/image/edit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: result.imageData,
            instruction: message,
            model: selectedModel
          })
        })

        console.log('📡 Edit API Response status:', response.status)
        const apiResult = await response.json()

        if (!response.ok) {
          throw new Error(apiResult.error || `API request failed: ${response.status}`)
        }

        console.log('✅ AI edit response received:', apiResult)

        // 处理AI响应 - 添加编辑后的图片到画布
        if (apiResult.success && apiResult.data.editedImageUrl) {
          await addAiGeneratedImage(apiResult.data.editedImageUrl, result.bounds)
          console.log('🎨 AI-edited image added to canvas')
        } else {
          throw new Error(apiResult.error || 'No edited image received')
        }

      } else {
        // 场景2: 没有选中对象 - 图像生成
        console.log('📝 No objects selected, performing image generation')
        console.log('🎨 Generating image with Gemini Flash Image...', { prompt: message })

        const response = await fetch('/api/ai/image/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: message,
            model: selectedModel
          })
        })

        console.log('📡 Generate API Response status:', response.status)
        const apiResult = await response.json()

        if (!response.ok) {
          throw new Error(apiResult.error || `API request failed: ${response.status}`)
        }

        console.log('✅ AI generation response received:', apiResult)

        // 处理AI响应 - 添加生成的图片到画布
        if (apiResult.success && apiResult.data.imageUrl) {
          await addAiGeneratedImage(apiResult.data.imageUrl)
          console.log('🎨 AI-generated image added to canvas')
        } else {
          throw new Error(apiResult.error || 'No generated image received')
        }
      }

      // 刷新积分信息
      await checkPoints()

    } catch (error) {
      console.error('❌ AI request failed:', error)
      throw error
    }
  }, [canvas, isAuthed, hasEnoughPoints, deductPoints, getSelectedObjectsImage, checkPoints, addAiGeneratedImage, selectedModel])


  // 刷新 AI Edit 按钮位置 - 移到外部避免闭包问题
  const refreshAiEditButtonPosition = useCallback(() => {
    if (currentTool !== 'select') {
      setAiEditButton({ visible: false, x: 0, y: 0 })
      return
    }

    const currentCanvas = (window as any).fabricCanvasInstance || canvas
    if (!currentCanvas) return

    const activeObjects = currentCanvas.getActiveObjects()
    if (!activeObjects || activeObjects.length === 0) {
      setAiEditButton({ visible: false, x: 0, y: 0 })
      return
    }

    let bounds: any | null = null
    try {
      bounds = getPreciseBounds ? getPreciseBounds(activeObjects) : null
    } catch (_) {
      bounds = null
    }
    if (!bounds) {
      const selection: any = currentCanvas.getActiveObject()
      bounds = selection?.getBoundingRect ? selection.getBoundingRect() : null
    }
    if (!bounds) {
      setAiEditButton({ visible: false, x: 0, y: 0 })
      return
    }

    const vpt = currentCanvas.viewportTransform || [1, 0, 0, 1, 0, 0]
    const scaleX = vpt[0]
    const scaleY = vpt[3]
    const translateX = vpt[4]
    const translateY = vpt[5]
    const rect = canvasRef.current?.getBoundingClientRect()

    const right = bounds.left + bounds.width
    const bottom = bounds.top + bounds.height
    const viewportX = right * scaleX + translateX
    const viewportY = bottom * scaleY + translateY

    const clientX = (rect?.left || 0) + viewportX
    const clientY = (rect?.top || 0) + viewportY

    setAiEditButton({ visible: true, x: clientX - 10, y: clientY - 10 })
  }, [canvas, currentTool])

  // 键盘删除功能 - 基于 Fabric.js 社区最佳实践
  const handleKeyboardDelete = useCallback((event: KeyboardEvent) => {
    // 检查是否按下了 Delete 键或 Backspace 键
    if (event.key !== 'Delete' && event.key !== 'Backspace') {
      return
    }

    // 检查是否在输入框中，如果是则不处理
    const target = event.target as HTMLElement
    if (target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('.js-ai-dialog') // 在AI对话框中时不处理
    )) {
      return
    }

    // 通过 ref 获取当前画布实例，避免闭包问题
    const currentCanvas = canvasRef.current ?
      (window as any).fabricCanvasInstance || canvas : null

    if (!currentCanvas) {
      console.warn('⚠️ Canvas not available for keyboard delete')
      return
    }

    // 获取当前选中的对象
    const activeObjects = currentCanvas.getActiveObjects()

    if (activeObjects.length === 0) {
      console.log('ℹ️ No objects selected for deletion')
      return
    }

    console.log(`🗑️ Deleting ${activeObjects.length} selected objects via keyboard`)

    // 阻止默认行为（如浏览器的后退）
    event.preventDefault()
    event.stopPropagation()

    try {
      // 删除所有选中的对象
      activeObjects.forEach((obj: any) => {
        currentCanvas.remove(obj)
      })

      // 清除选择状态
      currentCanvas.discardActiveObject()

      // 重新渲染画布
      safeRenderAll(currentCanvas)

      console.log(`✅ Successfully deleted ${activeObjects.length} objects`)
    } catch (error) {
      console.error('❌ Failed to delete objects:', error)
    }
  }, [canvas])



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

  // 画布初始化 - 只在组件挂载时执行一次
  useEffect(() => {
    // 检查是否已经初始化过（使用 ref 而不是 state，避免闭包问题）
    if (canvasInitRef.current) {
      console.warn('🟡 Canvas initialization attempted again - ignored', {
        hasCanvas: !!canvas,
        hasCanvasRef: !!canvasRef.current,
        hasWindowCanvas: !!(window as any).fabricCanvasInstance
      })
      return
    }
    
    if (!canvasRef.current) {
      console.warn('⚠️ Canvas ref not available yet, will retry...', {
        timestamp: Date.now()
      })
      // 延迟重试
      const retryTimer = setTimeout(() => {
        if (canvasRef.current && !canvasInitRef.current) {
          console.log('🔄 Retrying canvas initialization...')
          // 这里不能直接调用，需要触发重新渲染
          // 暂时返回，等待下次 useEffect 执行
        }
      }, 100)
      return () => clearTimeout(retryTimer)
    }
    
    // 如果已经有 canvas state 或 window.fabricCanvasInstance，说明已经初始化过了
    if (canvas || (window as any).fabricCanvasInstance) {
      console.log('ℹ️ Canvas already initialized (from state or window)', {
        hasCanvas: !!canvas,
        hasWindowCanvas: !!(window as any).fabricCanvasInstance
      })
      canvasInitRef.current = true
      return
    }
    
    // 标记为已初始化（在创建之前标记，防止重复）
    canvasInitRef.current = true
    
    console.log('🎨 Initializing new canvas instance', {
      canvasRefExists: !!canvasRef.current,
      canvasRefId: canvasRef.current?.id,
      canvasRefClassName: canvasRef.current?.className,
      parentElement: canvasRef.current?.parentElement?.tagName
    })

    // Canvas 初始化 - 不需要保存状态，因为这是首次创建
    console.log('ℹ️ Initializing new canvas (first time or after cleanup)')

    const container = canvasRef.current.parentElement
    const containerWidth = container?.clientWidth || window.innerWidth
    const containerHeight = container?.clientHeight || window.innerHeight

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: '#f8fafc',
      selection: true,
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      enableRetinaScaling: true,
      allowTouchScrolling: false
    })
    
    // 立即设置到 state 和 window，确保模板创建时能找到 canvas
    setCanvas(fabricCanvas)
    ;(window as any).fabricCanvasInstance = fabricCanvas
    console.log('🔗 Stored fabricCanvasInstance to window (immediately after creation)')
    
    // Fabric.js 6.0+ 使用 requestRenderAll() 进行渲染优化
    // 不需要包装 renderAll，直接使用 requestRenderAll 即可
    
    // 验证画布是否正确初始化
    console.log('✅ Canvas created:', {
      width: fabricCanvas.getWidth(),
      height: fabricCanvas.getHeight(),
      backgroundColor: fabricCanvas.backgroundColor,
      hasLowerCanvas: !!(fabricCanvas as any).lowerCanvasEl,
      hasUpperCanvas: !!(fabricCanvas as any).upperCanvasEl
    })
    
    // Fabric.js 6.0+ 使用 requestRenderAll() 进行异步渲染
    // 不需要 requestAnimationFrame，requestRenderAll 内部已经优化
      safeRenderAll(fabricCanvas)
      console.log('✅ Canvas background rendered')

    // Enable canvas zooming - 使用 Fabric.js 的 mouse:wheel 事件
    // 这样可以避免添加额外的 DOM 监听器，减少非 passive 监听器警告
    // 注意：Fabric.js 内部仍然会添加 wheel 监听器，但这是库的行为，我们无法完全控制
    // 警告可能仍然存在，但这是 Fabric.js 库的限制
    const handleZoomWheel = (opt: any) => {
      const e = opt.e
      const delta = e.deltaY
      
      // 计算新的缩放级别
      let zoom = fabricCanvas.getZoom()
      zoom *= 0.999 ** delta
      if (zoom > 20) zoom = 20
      if (zoom < 0.01) zoom = 0.01
      
      // 获取鼠标指针位置并应用缩放
      const pointer = fabricCanvas.getPointer(e)
      fabricCanvas.zoomToPoint(pointer, zoom)
      
      // 阻止默认滚动行为
      e.preventDefault()
      e.stopPropagation()
    }
    fabricCanvas.on('mouse:wheel', handleZoomWheel)

    // Canvas drag panning
    let isDragging = false
    let lastPosX = 0
    let lastPosY = 0

    // 画布拖拽事件处理器 - 只在 move 工具或按住 Alt 键时启用
    // 注意：这个事件处理器应该在其他工具的事件处理器之后注册，避免干扰
    // 使用 DOM 属性来获取最新的工具状态，避免闭包问题
    const handleCanvasMouseDown = (opt: any) => {
      const evt = opt?.e as MouseEvent
      
      if (!evt) {
        return
      }
      
      // 从 DOM 属性获取最新的工具状态
      const tool = canvasRef.current?.getAttribute('data-current-tool') || 'select'
      
      console.log('🖱️ handleCanvasMouseDown called:', { 
        tool, 
        altKey: evt.altKey,
        target: opt?.target?.type || 'canvas',
        targetRole: (opt?.target as any)?.templateRole
      })
      
      // 只在 move 工具或按住 Alt 键时启用画布拖拽
      // 其他工具时直接返回，不处理，让其他事件处理器继续处理
      if (evt.altKey === true || tool === 'move') {
        console.log('🖱️ handleCanvasMouseDown: Starting canvas drag')
        isDragging = true
        fabricCanvas.selection = false
        lastPosX = evt.clientX
        lastPosY = evt.clientY
        // 阻止事件继续传播，避免干扰其他工具
        evt.stopPropagation()
      } else {
        // 不是拖拽模式，不处理，让其他事件处理器处理
        // 重要：这里不调用 stopPropagation，让事件继续传播到绘制工具的事件处理器
        console.log('🖱️ handleCanvasMouseDown: Not handling (tool:', tool, ', altKey:', evt.altKey, '), allowing event to propagate')
      }
    }

    // 注意：Fabric.js 的事件处理器按注册顺序的逆序执行（后注册的先执行）
    // 所以我们需要先注册画布拖拽事件（低优先级），后注册绘制工具事件（高优先级）
    // 这样绘制工具的事件会先执行，如果处理了事件，画布拖拽事件就不会执行
    console.log('📝 Registering canvas drag mouse:down event handler (low priority, will execute last)')
    fabricCanvas.on('mouse:down', handleCanvasMouseDown)

    // 画布拖拽移动事件处理器
    const handleCanvasMouseMove = (opt: any) => {
      if (isDragging) {
        const e = opt.e as MouseEvent
        const vpt = fabricCanvas.viewportTransform
        if (vpt) {
          vpt[4] += e.clientX - lastPosX
          vpt[5] += e.clientY - lastPosY
          fabricCanvas.requestRenderAll()
          lastPosX = e.clientX
          lastPosY = e.clientY
          requestAnimationFrame(() => refreshAiEditButtonPosition())
        }
      }
    }

    // 画布拖拽结束事件处理器
    const handleCanvasMouseUp = () => {
      if (isDragging) {
        fabricCanvas.setViewportTransform(fabricCanvas.viewportTransform!)
        isDragging = false
        fabricCanvas.selection = true
        refreshAiEditButtonPosition()
      }
    }

    fabricCanvas.on('mouse:move', handleCanvasMouseMove)
    fabricCanvas.on('mouse:up', handleCanvasMouseUp)

    // refreshAiEditButtonPosition 已在外部使用 useCallback 定义，这里直接使用

    // 窗口大小变化处理
    const handleResize = () => {
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight
      fabricCanvas.setDimensions({ width: newWidth, height: newHeight })
      safeRenderAll(fabricCanvas)
      refreshAiEditButtonPosition()
    }

    window.addEventListener('resize', handleResize)

    // 初始化画笔 - 基于 Fabric.js 社区最佳实践
    console.log('🖌️ Initializing free drawing brush...')
    try {
      // 确保画笔对象存在
      if (!fabricCanvas.freeDrawingBrush) {
        // 手动创建画笔对象
        fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas)
        console.log('🖌️ Created new PencilBrush')
      }

      // 设置画笔属性（默认绿色）
      fabricCanvas.freeDrawingBrush.width = 5
      fabricCanvas.freeDrawingBrush.color = '#16a34a'

      console.log('✅ Free drawing brush initialized successfully:', {
        width: fabricCanvas.freeDrawingBrush.width,
        color: fabricCanvas.freeDrawingBrush.color,
        type: fabricCanvas.freeDrawingBrush.constructor.name
      })
    } catch (error) {
      console.error('❌ Failed to initialize free drawing brush:', error)
    }

    // 绑定右键菜单事件 - 使用 DOM 事件避免干扰绘制功能
    console.log('🖱️ Binding right-click context menu events...')

    const contextMenuHandler = (e: MouseEvent) => {
      e.preventDefault()

      const activeObjects = fabricCanvas.getActiveObjects()
      console.log('🖱️ DOM right click detected. Active objects:', activeObjects.length)

      // 总是显示右键菜单，但根据是否有选中对象显示不同选项
      if (activeObjects.length === 0) {
        console.log('✅ Showing context menu for canvas (no objects selected)')
      } else {
        console.log('✅ Showing context menu for', activeObjects.length, 'selected objects')
      }

      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        selectedObjects: activeObjects
      })
    }

    // Fabric.js 6.0 可能不再使用 upperCanvasEl，尝试多种方式获取 canvas
    try {
      const canvasElement = (fabricCanvas as any).upperCanvasEl || 
                           (fabricCanvas as any).lowerCanvasEl || 
                           (fabricCanvas as any).getElement?.() || 
                           canvasRef.current
      if (canvasElement) {
        canvasElement.addEventListener('contextmenu', contextMenuHandler)
      }
    } catch (error) {
      console.warn('⚠️ Failed to attach contextmenu handler:', error)
      // 降级到使用 canvasRef
      if (canvasRef.current) {
        canvasRef.current.addEventListener('contextmenu', contextMenuHandler)
      }
    }

    // 绑定键盘删除事件 - 基于 Fabric.js 社区最佳实践
    console.log('⌨️ Binding keyboard delete events...')
    document.addEventListener('keydown', handleKeyboardDelete)

    // 监听对象选择变化，显示/隐藏 AI Edit 按钮（仅在 Select 工具下）
    const handleSelectionCreated = () => {
      refreshAiEditButtonPosition()
    }

    // 监听选择更新事件（同样需要检查工具）
    const handleSelectionUpdated = () => {
      refreshAiEditButtonPosition()
    }

    const handleSelectionCleared = () => {
      setAiEditButton({ visible: false, x: 0, y: 0 })
    }

    fabricCanvas.on('selection:created', handleSelectionCreated)
    fabricCanvas.on('selection:updated', handleSelectionUpdated)
    fabricCanvas.on('selection:cleared', handleSelectionCleared)

    // 对象移动/缩放/旋转/修改后刷新
    const handleObjectChange = () => requestAnimationFrame(() => refreshAiEditButtonPosition())
    fabricCanvas.on('object:moving', handleObjectChange)
    fabricCanvas.on('object:scaling', handleObjectChange)
    fabricCanvas.on('object:rotating', handleObjectChange)
    fabricCanvas.on('object:modified', handleObjectChange)

    // 缩放滚轮后刷新
    const wheelHandler = () => requestAnimationFrame(() => refreshAiEditButtonPosition())
    fabricCanvas.on('mouse:wheel', wheelHandler)

    // Canvas 已经在创建后立即设置到 state 和 window，这里不需要重复设置
    // 但确保 window 上的实例是最新的
    ;(window as any).fabricCanvasInstance = fabricCanvas
    console.log('🔗 Synced fabricCanvasInstance to window (from state)')

    // 初始化模板工厂
    const callbacks: AIGenerationCallbacks = {
      onGenerateStart: (prompt: string) => {
        console.log('🎨 模板AI生成开始:', prompt)
      },
      onGenerateSuccess: (imageUrl: string) => {
        console.log('✅ 模板AI生成成功:', imageUrl)
      },
      onGenerateError: (error: Error) => {
        console.error('❌ 模板AI生成失败:', error)
      }
    }

    const factory = new TemplateFactory({ canvas: fabricCanvas, callbacks })
    setTemplateFactory(factory)

    console.log('✅ Canvas initialized successfully')

    return () => {
      window.removeEventListener('resize', handleResize)
      
      // Fabric.js 6.0 可能不再使用 upperCanvasEl，尝试多种方式获取 canvas
      try {
        const canvasElement = (fabricCanvas as any).upperCanvasEl || 
                             (fabricCanvas as any).lowerCanvasEl || 
                             (fabricCanvas as any).getElement?.() || 
                             canvasRef.current
        if (canvasElement) {
          canvasElement.removeEventListener('contextmenu', contextMenuHandler)
        }
      } catch (error) {
        // 降级到使用 canvasRef
        if (canvasRef.current) {
          canvasRef.current.removeEventListener('contextmenu', contextMenuHandler)
        }
      }
      // 安全地移除事件监听器
      if (handleKeyboardDelete) {
        document.removeEventListener('keydown', handleKeyboardDelete)
      }
      fabricCanvas.off('selection:created', handleSelectionCreated)
      fabricCanvas.off('selection:updated', handleSelectionUpdated)
      fabricCanvas.off('selection:cleared', handleSelectionCleared)
      fabricCanvas.off('object:moving', handleObjectChange)
      fabricCanvas.off('object:scaling', handleObjectChange)
      fabricCanvas.off('object:rotating', handleObjectChange)
      fabricCanvas.off('object:modified', handleObjectChange)
      fabricCanvas.off('mouse:wheel', wheelHandler)
      fabricCanvas.off('mouse:wheel', handleZoomWheel)
      fabricCanvas.off('mouse:down', handleCanvasMouseDown)
      fabricCanvas.off('mouse:move', handleCanvasMouseMove)
      fabricCanvas.off('mouse:up', handleCanvasMouseUp)
      // 清除全局画布实例
      ;(window as any).fabricCanvasInstance = null
      fabricCanvas.dispose()
    }
  }, [handleKeyboardDelete, refreshAiEditButtonPosition, currentTool]) // 添加 currentTool 到依赖项

  // 自动加载模板（基于 URL 参数）
  useEffect(() => {
    // 尝试从 window 获取画布实例（如果 React state 还没更新）
    const currentCanvas = canvas || (window as any).fabricCanvasInstance
    const currentFactory = templateFactory
    
    if (!currentCanvas || !currentFactory) {
      console.log('⏳ Waiting for canvas and templateFactory...', { 
        hasCanvas: !!currentCanvas, 
        hasFactory: !!currentFactory,
        hasWindowCanvas: !!(window as any).fabricCanvasInstance
      })
      return
    }
    
    const tplParam = searchParams?.get('tpl')
    console.log('🔍 Checking URL parameter for template:', tplParam)
    
    if (tplParam === 'tti') {
      // 延迟加载，确保画布完全初始化
      const timer = setTimeout(async () => {
        try {
          // 确保使用正确的画布实例
          const activeCanvas = currentCanvas
          if (!activeCanvas) {
            console.error('❌ Canvas instance not available')
            return
          }
          
          const canvasWidth = activeCanvas.getWidth()
          const canvasHeight = activeCanvas.getHeight()
          
          // 获取画布的视口中心点（考虑视口变换）
          const vpt = activeCanvas.viewportTransform || [1, 0, 0, 1, 0, 0]
          const viewportCenterX = (canvasWidth / 2 - vpt[4]) / vpt[0]
          const viewportCenterY = (canvasHeight / 2 - vpt[5]) / vpt[3]
          
          console.log('🔄 Auto-loading text-to-image template from URL parameter', {
            canvasSize: { width: canvasWidth, height: canvasHeight },
            viewportTransform: vpt,
            viewportCenter: { x: viewportCenterX, y: viewportCenterY },
            position: { left: viewportCenterX - 250, top: viewportCenterY - 150 },
            canvasInstance: activeCanvas === (window as any).fabricCanvasInstance ? 'window' : 'state'
          })
          const template = await currentFactory.createTextToImageTemplate({
            position: { left: viewportCenterX - 250, top: viewportCenterY - 150 }
          })
          
          if (template) {
            console.log('✅ Auto-loaded template successfully')
            // 确保模板在视口内可见
            const objects = activeCanvas.getObjects()
            if (objects.length > 0) {
              const templateGroup = objects[objects.length - 1] as any
              
              // 强制刷新 Group 的坐标和尺寸
              templateGroup.setCoords()
              // 注意：不要调用 calcOffset()，因为子对象已经使用了相对坐标
              // calcOffset() 会重新计算偏移，可能导致子对象坐标变成负数
              
              // 获取模板的实际边界框（考虑 Group 的坐标系统）
              const bounds = templateGroup.getBoundingRect()
              
              // 调试：检查 Group 的实际状态
              console.log('🔍 Template Group state:', {
                left: templateGroup.left,
                top: templateGroup.top,
                width: templateGroup.width,
                height: templateGroup.height,
                bounds: bounds,
                visible: templateGroup.visible,
                opacity: templateGroup.opacity,
                childrenCount: templateGroup._objects?.length || 0,
                // 检查第一个子对象
                firstChild: templateGroup._objects?.[0] ? {
                  type: templateGroup._objects[0].type,
                  left: templateGroup._objects[0].left,
                  top: templateGroup._objects[0].top,
                  visible: templateGroup._objects[0].visible
                } : null
              })
              const templateCenterX = bounds.left + bounds.width / 2
              const templateCenterY = bounds.top + bounds.height / 2
              
              console.log('📦 Template group info:', {
                left: templateGroup.left,
                top: templateGroup.top,
                width: templateGroup.width,
                height: templateGroup.height,
                visible: templateGroup.visible,
                opacity: templateGroup.opacity,
                bounds: bounds,
                center: { x: templateCenterX, y: templateCenterY }
              })
              
              // 将视口移动到模板位置，确保模板可见
              // 计算新的视口变换，使模板中心位于画布中心
              const currentZoom = vpt[0] // 缩放值
              const newVptX = canvasWidth / 2 - templateCenterX * currentZoom
              const newVptY = canvasHeight / 2 - templateCenterY * currentZoom
              
              const newVpt: [number, number, number, number, number, number] = [currentZoom, vpt[1], vpt[2], currentZoom, newVptX, newVptY]
              activeCanvas.setViewportTransform(newVpt)
              
              // 验证计算：模板中心在视口中的位置应该是画布中心
              const verifyX = templateCenterX * currentZoom + newVptX
              const verifyY = templateCenterY * currentZoom + newVptY
              
              console.log('📍 Viewport moved to template position:', {
                oldVpt: vpt,
                newVpt: newVpt,
                templateCenter: { x: templateCenterX, y: templateCenterY },
                canvasCenter: { x: canvasWidth / 2, y: canvasHeight / 2 },
                verification: { 
                  calculatedViewportX: verifyX, 
                  calculatedViewportY: verifyY,
                  shouldBe: { x: canvasWidth / 2, y: canvasHeight / 2 },
                  match: Math.abs(verifyX - canvasWidth / 2) < 1 && Math.abs(verifyY - canvasHeight / 2) < 1
                }
              })
              
              // 确保模板对象可见
              if (templateGroup.visible === false) {
                console.warn('⚠️ Template group is not visible, setting to visible')
                templateGroup.set('visible', true)
              }
              if (templateGroup.opacity === 0 || !templateGroup.opacity) {
                console.warn('⚠️ Template group opacity is 0 or undefined, setting to 1')
                templateGroup.set('opacity', 1)
              }
              
              // 确保 Group 内的所有子对象也可见
              if (templateGroup._objects && Array.isArray(templateGroup._objects)) {
                templateGroup._objects.forEach((obj: any, index: number) => {
                  if (obj.visible === false) {
                    console.warn(`⚠️ Template child object ${index} (${obj.type}) is not visible, setting to visible`)
                    obj.set('visible', true)
                  }
                  if (obj.opacity === 0 || !obj.opacity) {
                    console.warn(`⚠️ Template child object ${index} (${obj.type}) opacity is 0 or undefined, setting to 1`)
                    obj.set('opacity', 1)
                  }
                })
                console.log(`✅ Checked ${templateGroup._objects.length} child objects for visibility`)
              }
              
              // 强制重新计算坐标
              templateGroup.setCoords()
              
              // 标记所有对象需要重新渲染
              templateGroup.dirty = true
              if (templateGroup._objects) {
                templateGroup._objects.forEach((obj: any) => {
                  obj.dirty = true
                  if (obj.setCoords) obj.setCoords()
                })
              }
              
              // 强制重新渲染 - 使用 requestAnimationFrame 确保在正确的时机渲染
              requestAnimationFrame(() => {
                safeRenderAll(activeCanvas)
                
                // 双重保险：再次渲染
                requestAnimationFrame(() => {
                  safeRenderAll(activeCanvas)
                  console.log('✅ Template rendered after viewport move')
                })
              })
              
              // 再次验证对象是否在画布上
              const finalBounds = templateGroup.getBoundingRect()
              const finalVpt = activeCanvas.viewportTransform || [1, 0, 0, 1, 0, 0]
              const finalViewportX = finalBounds.left * finalVpt[0] + finalVpt[4]
              const finalViewportY = finalBounds.top * finalVpt[3] + finalVpt[5]
              
              // 检查画布DOM元素（安全地获取）
              let canvasElement: HTMLCanvasElement | null = null
              let canvasContainer: HTMLElement | null = null
              try {
                canvasElement = activeCanvas.getElement()
                canvasContainer = canvasElement?.parentElement || null
              } catch (error) {
                console.warn('⚠️ Failed to get canvas element:', error)
                // 如果 getElement 失败，尝试直接从 DOM 获取
                canvasElement = document.querySelector('canvas')
                canvasContainer = canvasElement?.parentElement || null
              }
              
              console.log('🔍 Final verification:', {
                bounds: finalBounds,
                viewportPos: { x: finalViewportX, y: finalViewportY },
                canvasSize: { width: activeCanvas.getWidth(), height: activeCanvas.getHeight() },
                inViewport: finalViewportX >= -100 && finalViewportX <= activeCanvas.getWidth() + 100 && 
                           finalViewportY >= -100 && finalViewportY <= activeCanvas.getHeight() + 100,
                groupVisible: templateGroup.visible,
                groupOpacity: templateGroup.opacity,
                childrenCount: templateGroup._objects?.length || 0,
                canvasElement: {
                  exists: !!canvasElement,
                  width: canvasElement?.width,
                  height: canvasElement?.height,
                  style: canvasElement ? window.getComputedStyle(canvasElement) : null,
                  display: canvasElement ? window.getComputedStyle(canvasElement).display : null,
                  visibility: canvasElement ? window.getComputedStyle(canvasElement).visibility : null,
                  opacity: canvasElement ? window.getComputedStyle(canvasElement).opacity : null,
                  zIndex: canvasElement ? window.getComputedStyle(canvasElement).zIndex : null
                },
                canvasContainer: {
                  exists: !!canvasContainer,
                  width: canvasContainer?.clientWidth,
                  height: canvasContainer?.clientHeight,
                  style: canvasContainer ? window.getComputedStyle(canvasContainer) : null,
                  overflow: canvasContainer ? window.getComputedStyle(canvasContainer).overflow : null
                }
              })
              
              // 尝试直接检查画布上是否有渲染内容
              if (canvasElement) {
                const ctx = canvasElement.getContext('2d')
                if (ctx) {
                  const imageData = ctx.getImageData(0, 0, Math.min(100, canvasElement.width), Math.min(100, canvasElement.height))
                  const hasContent = imageData.data.some((pixel: number, index: number) => {
                    // 检查alpha通道（每4个值中的第4个）
                    return index % 4 === 3 && pixel > 0
                  })
                  console.log('🎨 Canvas content check:', {
                    hasContent: hasContent,
                    sampleSize: { width: Math.min(100, canvasElement.width), height: Math.min(100, canvasElement.height) }
                  })
                }
              }
            }
            safeRenderAll(activeCanvas)
            console.log('✅ Canvas rendered, objects count:', activeCanvas.getObjects().length)
            
            // 额外检查：验证对象是否真的在画布上
            setTimeout(() => {
              const allObjects = activeCanvas.getObjects()
              const vpt = activeCanvas.viewportTransform || [1, 0, 0, 1, 0, 0]
              
              console.log('🔍 Post-render check:', {
                objectsCount: allObjects.length,
                viewportTransform: vpt,
                canvasSize: { width: activeCanvas.getWidth(), height: activeCanvas.getHeight() },
                objects: allObjects.map((obj: any) => {
                  const bounds = obj.getBoundingRect()
                  // 计算对象在视口中的实际位置
                  const viewportX = bounds.left * vpt[0] + vpt[4]
                  const viewportY = bounds.top * vpt[3] + vpt[5]
                  
                  return {
                    type: obj.type,
                    logicalPos: { left: obj.left, top: obj.top },
                    bounds: bounds,
                    viewportPos: { x: viewportX, y: viewportY },
                    visible: obj.visible,
                    opacity: obj.opacity,
                    inViewport: viewportX >= 0 && viewportX <= activeCanvas.getWidth() && 
                               viewportY >= 0 && viewportY <= activeCanvas.getHeight()
                  }
                })
              })
              
              // 尝试强制重新渲染
              safeRenderAll(activeCanvas)
              console.log('🔄 Force re-rendered canvas')
            }, 100)
          } else {
            console.error('❌ Failed to auto-load template')
          }
        } catch (error) {
          console.error('❌ Error auto-loading template:', error)
        }
      }, 200)
      
      return () => clearTimeout(timer)
    }
  }, [canvas, templateFactory, searchParams])
  
  // 确保 window.fabricCanvasInstance 与 React state 同步
  useEffect(() => {
    if (canvas) {
      (window as any).fabricCanvasInstance = canvas
      console.log('🔗 Synced fabricCanvasInstance to window (from state)')
    }
  }, [canvas])

  // 工具切换 - 使用Fabric.js标准方式
  useEffect(() => {
    if (!canvas) return

    switch (currentTool) {
      case 'select':
        canvas.isDrawingMode = false
        canvas.selection = true
        canvas.selectionFullyContained = false
        canvas.defaultCursor = 'default'
        canvas.hoverCursor = 'move'
        // 放宽命中条件，优先使用包围盒命中，便于选中细线段
        canvas.perPixelTargetFind = false
        canvas.targetFindTolerance = 12
        // 允许命中检测与对象交互
        canvas.skipTargetFind = false
        // 恢复对象可选择（不强制重置每个对象的 selectable，交由 Fabric 默认行为）
        break

      case 'move':
        canvas.isDrawingMode = false
        canvas.selection = false
        canvas.defaultCursor = 'grab'
        canvas.hoverCursor = 'grab'
        // 禁止对象命中，启用画布平移体验
        canvas.skipTargetFind = true
        canvas.discardActiveObject()
        canvas.requestRenderAll()
        // 隐藏 AI Edit 按钮
        setAiEditButton({ visible: false, x: 0, y: 0 })
        break

      case 'draw':
        console.log('🖌️ Enabling brush drawing mode')
        canvas.isDrawingMode = true
        canvas.selection = false
        canvas.defaultCursor = 'crosshair'

        // 确保画笔设置正确 - 基于 Fabric.js 社区最佳实践
        if (!canvas.freeDrawingBrush) {
          console.log('🖌️ Creating missing freeDrawingBrush...')
          try {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
            console.log('✅ Created new PencilBrush on demand')
          } catch (error) {
            console.error('❌ Failed to create PencilBrush:', error)
            break
          }
        }

        // 配置画笔属性（改为绿色）
        canvas.freeDrawingBrush.width = 5
        canvas.freeDrawingBrush.color = '#16a34a'

        console.log('✅ Brush drawing mode enabled:', {
          isDrawingMode: canvas.isDrawingMode,
          brushWidth: canvas.freeDrawingBrush.width,
          brushColor: canvas.freeDrawingBrush.color,
          brushType: canvas.freeDrawingBrush.constructor.name
        })
        // 禁止对象命中，避免拖动对象
        canvas.skipTargetFind = true
        canvas.discardActiveObject()
        canvas.requestRenderAll()
        // 隐藏 AI Edit 按钮
        setAiEditButton({ visible: false, x: 0, y: 0 })
        break

      case 'rectangle':
      case 'circle':
      case 'text':
      case 'arrow':
        canvas.isDrawingMode = false
        canvas.selection = false
        canvas.defaultCursor = 'crosshair'
        // 允许对象命中，但禁用选择，这样工具可以正常工作
        canvas.skipTargetFind = false
        canvas.discardActiveObject()
        canvas.requestRenderAll()
        // 隐藏 AI Edit 按钮
        setAiEditButton({ visible: false, x: 0, y: 0 })
        break
    }
  }, [canvas, currentTool])

  // 标准的对象创建
  const createObject = useCallback((pointer: { x: number, y: number }) => {
    if (!canvas) return

    let obj = null

    switch (currentTool) {
      case 'rectangle':
        obj = new fabric.Rect({
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
        obj = new fabric.Circle({
          left: pointer.x - 50,
          top: pointer.y - 50,
          radius: 50,
          fill: 'rgba(16, 185, 129, 0.3)',
          stroke: '#10b981',
          strokeWidth: 2
        })
        break

      case 'text':
        obj = new fabric.IText('请输入文字', {
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
      // 文字创建后自动进入编辑
      if (obj instanceof fabric.IText) {
        (obj as fabric.IText).enterEditing()
        ;(obj as fabric.IText).selectAll()
      }
      safeRenderAll(canvas)
    }
  }, [canvas, currentTool])

  // 绘制工具事件处理 - 基于 Fabric.js 最佳实践
  // 使用统一的 Fabric.js 事件系统，避免混用 DOM 事件
  useEffect(() => {
    if (!canvas) {
      console.log('⚠️ Canvas not available for drawing tool events')
      return
    }

    // 验证画布是否完全初始化
    // Fabric.js 6.0+ 使用 getElement() 获取 canvas 元素
    // lowerCanvasEl 和 upperCanvasEl 在 6.x 中仍然可用，但推荐使用 getElement()
    let canvasElement: HTMLCanvasElement | null = null
    try {
      canvasElement = (canvas as any).getElement ? (canvas as any).getElement() : null
    } catch {}
    const lowerCanvas = (canvas as any).lowerCanvasEl || null
    const upperCanvas = (canvas as any).upperCanvasEl || null
    const container = (canvas as any).containerClass || null
    
    console.log('✅ Registering drawing tool event handlers for canvas (Fabric.js 6.9.0):', {
      canvas: canvas,
      hasElement: !!canvasElement,
      hasLowerCanvas: !!lowerCanvas,
      hasUpperCanvas: !!upperCanvas,
      element: canvasElement,
      lowerCanvasEl: lowerCanvas,
      upperCanvasEl: upperCanvas,
      containerClass: container,
      width: canvas.getWidth(),
      height: canvas.getHeight()
    })

    // Fabric.js 6.0+ getElement() 应该总是可用
    // 如果返回 null，尝试从 DOM 获取作为降级方案
    let actualCanvasElement = canvasElement
    if (!actualCanvasElement) {
      // 尝试从 DOM 获取 canvas 元素
      const canvasEl = document.querySelector('canvas.lower-canvas') || document.querySelector('canvas')
      if (canvasEl && canvasEl instanceof HTMLCanvasElement) {
        actualCanvasElement = canvasEl
        console.log('✅ Found canvas element from DOM:', canvasEl)
        
        // 检查画布元素的实际状态
        const rect = canvasEl.getBoundingClientRect()
        const computedStyle = window.getComputedStyle(canvasEl)
        console.log('🔍 Canvas element state:', {
          width: canvasEl.width,
          height: canvasEl.height,
          clientWidth: canvasEl.clientWidth,
          clientHeight: canvasEl.clientHeight,
          boundingRect: {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            visible: rect.width > 0 && rect.height > 0
          },
          pointerEvents: computedStyle.pointerEvents,
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          opacity: computedStyle.opacity,
          zIndex: computedStyle.zIndex,
          position: computedStyle.position
        })
      } else {
        console.warn('⚠️ Canvas elements not found, but proceeding with event registration anyway')
      }
    } else {
      // 如果找到了 canvas 元素，检查它们的状态
      const rect = actualCanvasElement.getBoundingClientRect()
      const computedStyle = window.getComputedStyle(actualCanvasElement)
      const htmlCanvas = actualCanvasElement instanceof HTMLCanvasElement ? actualCanvasElement : null
      console.log('🔍 Canvas element state (from Fabric.js):', {
        width: htmlCanvas?.width ?? 'N/A',
        height: htmlCanvas?.height ?? 'N/A',
        clientWidth: actualCanvasElement.clientWidth,
        clientHeight: actualCanvasElement.clientHeight,
        boundingRect: {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          visible: rect.width > 0 && rect.height > 0
        },
        pointerEvents: computedStyle.pointerEvents,
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        zIndex: computedStyle.zIndex,
        position: computedStyle.position
      })
    }

    // 添加 DOM 级别的事件监听器作为诊断（临时）
    if (actualCanvasElement) {
      const domMouseDown = (e: MouseEvent) => {
        console.log('🔵 DOM mousedown event triggered!', {
          timestamp: Date.now(),
          clientX: e.clientX,
          clientY: e.clientY,
          target: (e.target as HTMLElement)?.tagName,
          currentTarget: (e.currentTarget as HTMLElement)?.tagName,
          button: e.button,
          buttons: e.buttons
        })
      }
      // 使用 capture 模式确保能捕获到事件
      actualCanvasElement.addEventListener('mousedown', domMouseDown, { capture: true })
      console.log('🔵 DOM mousedown listener added to canvas element (capture mode)')
      
      // 也在父容器上添加监听器，检查是否有元素拦截
      const parentElement = actualCanvasElement.parentElement
      let parentMouseDown: ((e: MouseEvent) => void) | null = null
      if (parentElement) {
        parentMouseDown = (e: MouseEvent) => {
          console.log('🔵 Parent mousedown event triggered!', {
            timestamp: Date.now(),
            clientX: e.clientX,
            clientY: e.clientY,
            target: (e.target as HTMLElement)?.tagName,
            currentTarget: (e.currentTarget as HTMLElement)?.tagName
          })
        }
        parentElement.addEventListener('mousedown', parentMouseDown, { capture: true })
        console.log('🔵 DOM mousedown listener added to parent element (capture mode)')
      }
      
      // 清理函数中移除 DOM 监听器
      setTimeout(() => {
        actualCanvasElement?.removeEventListener('mousedown', domMouseDown, { capture: true })
        if (parentElement && parentMouseDown) {
          parentElement.removeEventListener('mousedown', parentMouseDown, { capture: true })
        }
      }, 10000) // 10秒后移除，仅用于诊断
    }

    // 先添加一个简单的测试事件监听器，验证 Fabric.js 事件系统是否工作
    const testHandler = (opt: any) => {
      console.log('🧪 TEST EVENT TRIGGERED!', {
        timestamp: Date.now(),
        eventType: opt.e?.type,
        clientX: opt.e?.clientX,
        clientY: opt.e?.clientY
      })
    }
    canvas.on('mouse:down', testHandler)
    console.log('🧪 Test event listener registered')

    // 从 ref 获取工具状态，避免闭包问题
    const getCurrentTool = () => currentToolRef.current

    // 绘制工具鼠标按下事件
    const handleDrawingMouseDown = (opt: any) => {
      console.log('🖱️🖱️🖱️ handleDrawingMouseDown CALLED!', {
        timestamp: Date.now(),
        eventType: opt.e?.type,
        hasTarget: !!opt.target,
        targetType: opt.target?.type
      })
      
      const tool = getCurrentTool()
      const evt = opt.e as MouseEvent
      
      console.log('🖱️ handleDrawingMouseDown called:', {
        tool,
        altKey: evt.altKey,
        target: opt.target?.type || 'canvas',
        targetRole: (opt.target as any)?.templateRole,
        hasTarget: !!opt.target
      })
      
      // 跳过非绘制工具
      if (tool === 'select' || tool === 'draw' || tool === 'move') {
        console.log('🖱️ handleDrawingMouseDown: Skipping - not a drawing tool')
        return // 让其他事件处理器处理
      }
      
      // 跳过 Alt+拖拽（画布平移）
      if (evt.altKey) {
        console.log('🖱️ handleDrawingMouseDown: Skipping - Alt key pressed')
        return
      }
      
      // 如果点击在已有对象上，且不是文本工具，检查是否允许绘制
      if (opt.target && tool !== 'text') {
        const targetRole = (opt.target as any)?.templateRole
        const targetType = opt.target.type
        
        console.log('🖱️ handleDrawingMouseDown: Clicked on object:', {
          targetType,
          targetRole,
          isTemplateGroup: targetRole === 'tti-group' || targetRole === 'siti-group' || targetRole === 'miti-group'
        })
        
        // 允许在模板 Group 上绘制
        if (targetRole === 'tti-group' || targetRole === 'siti-group' || targetRole === 'miti-group') {
          console.log('🖱️ handleDrawingMouseDown: Allowing drawing on template group')
          // 继续处理，允许在模板 Group 上绘制
        } else if (targetType === 'group') {
          // 如果是其他 Group，也允许绘制（可能是用户创建的 Group）
          console.log('🖱️ handleDrawingMouseDown: Allowing drawing on group')
          // 继续处理
        } else {
          // 点击在普通对象上，不处理（让 Fabric.js 处理选择）
          console.log('🖱️ handleDrawingMouseDown: Skipping - clicked on regular object')
        return
      }
      }

      // 获取画布坐标
      const pointer = canvas.getPointer(opt.e)
      
      // 开始绘制
      isDrawingRef.current = true
      setIsDrawing(true)
      startPointRef.current = pointer
      setStartPoint(pointer)

      // 根据工具创建形状
      let shape: fabric.Object | null = null
      
      switch (tool) {
        case 'rectangle':
          shape = new fabric.Rect({
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
          break
          
        case 'circle':
          shape = new fabric.Circle({
            left: pointer.x,
            top: pointer.y,
            radius: 0,
            fill: 'rgba(16, 185, 129, 0.3)',
            stroke: '#10b981',
            strokeWidth: 2,
            selectable: false,
            evented: false
          })
          break
          
        case 'text':
          // 文本工具：直接创建并进入编辑模式
          shape = new fabric.IText('请输入文字', {
            left: pointer.x,
            top: pointer.y,
            fontSize: 20,
            fill: '#000000'
          })
          canvas.add(shape)
          canvas.setActiveObject(shape)
          ;(shape as fabric.IText).enterEditing()
          ;(shape as fabric.IText).selectAll()
          canvas.requestRenderAll()
          return // 文本工具不需要拖拽绘制
          
        case 'arrow':
          shape = new fabric.Path('', {
            stroke: '#ef4444',
            fill: 'transparent',
            strokeWidth: 3,
            selectable: false,
            evented: false,
            objectCaching: false
          })
          ;(shape as any).arrow = { x1: pointer.x, y1: pointer.y, x2: pointer.x, y2: pointer.y }
          ;(shape as fabric.Path).set({ 
            path: [['M', pointer.x, pointer.y], ['L', pointer.x, pointer.y]] as any 
          })
          break
      }

      if (shape) {
        canvas.add(shape)
        currentShapeRef.current = shape
        setCurrentShape(shape)
        canvas.requestRenderAll()
      }
    }

    // 绘制工具鼠标移动事件
    const handleDrawingMouseMove = (opt: any) => {
      if (!isDrawingRef.current || !startPointRef.current || !currentShapeRef.current) return

      const pointer = canvas.getPointer(opt.e)
      const tool = getCurrentTool()
      const shape = currentShapeRef.current
      const start = startPointRef.current

      switch (tool) {
        case 'rectangle':
          const width = Math.abs(pointer.x - start.x)
          const height = Math.abs(pointer.y - start.y)
          const left = Math.min(pointer.x, start.x)
          const top = Math.min(pointer.y, start.y)
          shape.set({ left, top, width, height })
          break
          
        case 'circle':
          const radius = Math.sqrt(
            Math.pow(pointer.x - start.x, 2) + Math.pow(pointer.y - start.y, 2)
          ) / 2
          shape.set({
            left: start.x - radius,
            top: start.y - radius,
            radius
          })
          break
          
        case 'arrow':
          const a = (shape as any).arrow
          a.x2 = pointer.x
          a.y2 = pointer.y
          ;(shape as fabric.Path).set({ 
            path: [['M', a.x1, a.y1], ['L', a.x2, a.y2]] as any 
          })
          shape.setCoords()
          break
      }

      canvas.requestRenderAll()
    }

    // 绘制工具鼠标抬起事件
    const handleDrawingMouseUp = (opt: fabric.TEvent) => {
      if (!isDrawingRef.current || !currentShapeRef.current) return

      const tool = getCurrentTool()
      const shape = currentShapeRef.current
      const start = startPointRef.current

      // 结束绘制状态
      isDrawingRef.current = false
      setIsDrawing(false)

      // 箭头特殊处理
      if (tool === 'arrow' && start) {
        const a = (shape as any).arrow
        const arrowPathObj = shape as fabric.Path
        
        // 归一化坐标
        const minX = Math.min(a.x1, a.x2)
        const minY = Math.min(a.y1, a.y2)
        const local = {
          x1: a.x1 - minX,
          y1: a.y1 - minY,
          x2: a.x2 - minX,
          y2: a.y2 - minY
        }
        
        // 计算箭头头部
        const ang = Math.atan2(local.y2 - local.y1, local.x2 - local.x1)
        const head = 14
        const hx1 = local.x2 - head * Math.cos(ang - Math.PI/6)
        const hy1 = local.y2 - head * Math.sin(ang - Math.PI/6)
        const hx2 = local.x2 - head * Math.cos(ang + Math.PI/6)
        const hy2 = local.y2 - head * Math.sin(ang + Math.PI/6)
        
        ;(arrowPathObj as any).arrow = local
        arrowPathObj.set({
          left: minX,
          top: minY,
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
          perPixelTargetFind: false,
          strokeUniform: true,
          hoverCursor: 'move',
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
          padding: 10,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          hasRotatingPoint: false,
          objectCaching: false,
          path: [
            ['M', local.x1, local.y1], ['L', local.x2, local.y2],
            ['M', local.x2, local.y2], ['L', hx1, hy1],
            ['M', local.x2, local.y2], ['L', hx2, hy2]
          ] as any
        })

        // 添加端点控制点（简化版，完整代码见原文件）
        const positionHandlerFactory = (keyX: 'x1'|'x2', keyY: 'y1'|'y2') => () => {
          const arr = (arrowPathObj as any).arrow
          return fabric.util.transformPoint(
            new fabric.Point(arr[keyX], arr[keyY]), 
            arrowPathObj.calcTransformMatrix()
          )
        }
        
        const actionHandlerFactory = (keyX: 'x1'|'x2', keyY: 'y1'|'y2') => 
          (_evt: any, _transform: any, x: number, y: number) => {
            const local = fabric.util.transformPoint(
              new fabric.Point(x, y), 
              fabric.util.invertTransform(arrowPathObj.calcTransformMatrix())
            )
          let { x1, y1, x2, y2 } = (arrowPathObj as any).arrow
            if (keyX === 'x1') x1 = local.x
            if (keyY === 'y1') y1 = local.y
            if (keyX === 'x2') x2 = local.x
            if (keyY === 'y2') y2 = local.y

          const minX = Math.min(x1, x2)
          const minY = Math.min(y1, y2)
            const norm = { 
              x1: x1 - minX, y1: y1 - minY, 
              x2: x2 - minX, y2: y2 - minY 
            }
          ;(arrowPathObj as any).arrow = norm
            arrowPathObj.set({ 
              left: (arrowPathObj.left || 0) + minX, 
              top: (arrowPathObj.top || 0) + minY 
            })

          const ang = Math.atan2(norm.y2 - norm.y1, norm.x2 - norm.x1)
          const head = 14
          const hx1 = norm.x2 - head * Math.cos(ang - Math.PI/6)
          const hy1 = norm.y2 - head * Math.sin(ang - Math.PI/6)
          const hx2 = norm.x2 - head * Math.cos(ang + Math.PI/6)
          const hy2 = norm.y2 - head * Math.sin(ang + Math.PI/6)
            
            arrowPathObj.set({ 
              path: [
            ['M', norm.x1, norm.y1], ['L', norm.x2, norm.y2],
            ['M', norm.x2, norm.y2], ['L', hx1, hy1],
            ['M', norm.x2, norm.y2], ['L', hx2, hy2]
              ] as any 
            })
          arrowPathObj.setCoords()
            arrowPathObj.canvas?.requestRenderAll()
          return true
        }

        const p1 = new fabric.Control({
          positionHandler: positionHandlerFactory('x1', 'y1'),
          actionHandler: actionHandlerFactory('x1', 'y1'),
          cursorStyle: 'nwse-resize'
        })
        const p2 = new fabric.Control({
          positionHandler: positionHandlerFactory('x2', 'y2'),
          actionHandler: actionHandlerFactory('x2', 'y2'),
          cursorStyle: 'nwse-resize'
        })
        ;(arrowPathObj as any).controls = { 
          ...fabric.Object.prototype.controls, 
          p1, 
          p2 
        }
        arrowPathObj.setCoords()
      } else {
        // 其他形状：设置为可选择
        shape.set({ selectable: true, evented: true })
        shape.setCoords()
        canvas.setActiveObject(shape)
      }

      // 清理状态
      startPointRef.current = null
        setStartPoint(null)
      currentShapeRef.current = null
        setCurrentShape(null)
        canvas.requestRenderAll()
      }

    // 注册 Fabric.js 事件
    // 注意：Fabric.js 事件按注册顺序反向执行（后注册的先执行）
    // 我们需要确保绘制工具事件在其他事件之前执行
    console.log('📝 Registering drawing tool mouse:down event handler (high priority, will execute first)')
    console.log('📝 Handler function:', handleDrawingMouseDown)
    console.log('📝 Canvas object:', canvas)
    
    // 直接注册事件监听器
    const registered1 = canvas.on('mouse:down', handleDrawingMouseDown)
    const registered2 = canvas.on('mouse:move', handleDrawingMouseMove)
    const registered3 = canvas.on('mouse:up', handleDrawingMouseUp)

    console.log('✅ Drawing tool event handlers registered:', {
      mouseDown: registered1,
      mouseMove: registered2,
      mouseUp: registered3,
      canvasType: canvas.constructor.name
    })
    
    // 测试：直接调用一次事件处理器，确认函数本身没有问题
    console.log('🧪 Testing handler function directly...')
    try {
      // 创建一个模拟事件对象
      const testEvent = {
        e: new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
        target: null
      } as any
      console.log('🧪 Test event created:', testEvent)
      // 不实际调用，只是验证函数存在
      console.log('🧪 Handler function exists:', typeof handleDrawingMouseDown === 'function')
    } catch (error) {
      console.error('🧪 Test failed:', error)
    }

    return () => {
      console.log('🧹 Cleaning up drawing tool event handlers')
      canvas.off('mouse:down', testHandler)
      canvas.off('mouse:down', handleDrawingMouseDown)
      canvas.off('mouse:move', handleDrawingMouseMove)
      canvas.off('mouse:up', handleDrawingMouseUp)
    }
  }, [canvas, safeRenderAll])

  // 选择模式下：为 Path 箭头增加兜底命中（线段距离判定）
  useEffect(() => {
    if (!canvas) return
    if (currentTool !== 'select') return

    const distPointToSeg = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
      const vx = x2 - x1, vy = y2 - y1
      const wx = px - x1, wy = py - y1
      const c1 = vx * wx + vy * wy
      if (c1 <= 0) return Math.hypot(px - x1, py - y1)
      const c2 = vx * vx + vy * vy
      if (c2 <= c1) return Math.hypot(px - x2, py - y2)
      const b = c1 / c2
      const bx = x1 + b * vx, by = y1 + b * vy
      return Math.hypot(px - bx, py - by)
    }

    const handleSelectMouseDown = (e: any) => {
      if (e.target) return // Fabric 已命中对象
      const pointer = canvas.getPointer(e.e)
      const tolerance = 12
        const objects = canvas.getObjects()
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj: any = objects[i]
        if (!(obj instanceof fabric.Path)) continue
        if (!(obj as any).arrow) continue
        // 计算主线段世界坐标（箭头局部 + 对象 left/top）
        const arr = (obj as any).arrow
        const x1 = (obj.left || 0) + arr.x1
        const y1 = (obj.top || 0) + arr.y1
        const x2 = (obj.left || 0) + arr.x2
        const y2 = (obj.top || 0) + arr.y2
        const d = distPointToSeg(pointer.x, pointer.y, x1, y1, x2, y2)
        if (d <= tolerance) {
          canvas.setActiveObject(obj)
          canvas.requestRenderAll()
          break
        }
      }
    }

    canvas.on('mouse:down', handleSelectMouseDown)
    return () => { canvas.off('mouse:down', handleSelectMouseDown) }
  }, [canvas, currentTool])

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


  // AI Edit 快捷按钮点击处理
  const handleAiEditClick = useCallback(async () => {
    if (!isAuthed) {
      setLoginOpen(true)
      return
    }
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length === 0) return

    try {
      const selectedData = await getSelectedObjectsImage()
      if (!selectedData) {
        throw new Error('Unable to capture selected objects image')
      }

      // 计算对话框在视口中的位置（将画布坐标转换为客户端坐标）
      const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0]
      const rect = canvasRef.current?.getBoundingClientRect()
      const scaleX = vpt[0]
      const scaleY = vpt[3]
      const translateX = vpt[4]
      const translateY = vpt[5]

      const bx = selectedData.bounds.left + selectedData.bounds.width // 右下角 x（画布坐标）
      const by = selectedData.bounds.top + selectedData.bounds.height // 右下角 y（画布坐标）

      // 转换为画布视口坐标（像素）
      const viewportX = bx * scaleX + translateX
      const viewportY = by * scaleY + translateY

      // 加上 canvas DOM 在页面中的偏移，得到最终客户端坐标
      const clientX = (rect?.left || 0) + viewportX
      const clientY = (rect?.top || 0) + viewportY

      // 显示 AI 对话框（使用客户端坐标）
      showAiDialog(clientX, clientY)
    } catch (error) {
      console.error('AI Edit shortcut failed:', error)
    }
  }, [canvas, isAuthed, showAiDialog, getSelectedObjectsImage])

  // AI聊天功能
  const sendMessage = async () => {
    if (!isAuthed) {
      setLoginOpen(true)
      return
    }
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
            model: selectedModel
          })
        })

        console.log('📡 Edit API Response status:', response.status)
        const result = await response.json()
        console.log('📡 Edit API Response data:', result)

        if (result.success && result.data?.editedImageUrl) {
          // Add generated image to the right of selected objects
          // Fabric.js 6.x: fromURL 返回 Promise
          const img = await fabric.Image.fromURL(result.data.editedImageUrl, { crossOrigin: 'anonymous' })

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
          safeRenderAll(canvas)

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
            model: selectedModel
          })
        })

        console.log('📡 Generate API Response status:', response.status)
        const result = await response.json()
        console.log('📡 Generate API Response data:', result)

        if (result.success && result.data?.imageUrl) {
          // 在画布中央添加生成的图像
          // Fabric.js 6.x: fromURL 返回 Promise
          const img = await fabric.Image.fromURL(result.data.imageUrl, { crossOrigin: 'anonymous' })

          // 计算画布中央位置（考虑当前视口）
          const viewport = canvas.viewportTransform || [1, 0, 0, 1, 0, 0]
          const zoom = viewport[0]
          const panX = viewport[4]
          const panY = viewport[5]

          // 计算视口中心在画布坐标系中的位置
          const viewportCenterX = (canvas.getWidth() / 2 - panX) / zoom
          const viewportCenterY = (canvas.getHeight() / 2 - panY) / zoom

          // 保存原始尺寸信息
          const originalWidth = img.width || 0
          const originalHeight = img.height || 0
          const imgAny = img as any
          
          if (imgAny._originalElement) {
            imgAny._originalWidth = imgAny._originalElement.naturalWidth || originalWidth
            imgAny._originalHeight = imgAny._originalElement.naturalHeight || originalHeight
          } else {
            imgAny._originalWidth = originalWidth
            imgAny._originalHeight = originalHeight
          }

          // 检测分辨率类别
          const maxDimension = Math.max(originalWidth, originalHeight)
          let resolutionCategory = 'other'
          if (maxDimension <= 1024) resolutionCategory = '1K'
          else if (maxDimension <= 2048) resolutionCategory = '2K'
          else if (maxDimension <= 4096) resolutionCategory = '4K'
          imgAny._resolutionCategory = resolutionCategory

          // 缩放图像
          const maxWidth = 400
          const maxHeight = 400
          if (originalWidth && originalHeight) {
            const scale = Math.min(maxWidth / originalWidth, maxHeight / originalHeight, 1)
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
          safeRenderAll(canvas)

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

  // 图片上传 - 基于 Fabric.js 社区最佳实践
  const handleImageUpload = (file: File) => {
    // 通过全局变量获取当前画布实例，避免闭包问题
    const currentCanvas = canvasRef.current ?
      (window as any).fabricCanvasInstance || canvas : null

    if (!currentCanvas) {
      console.error('❌ Canvas not available for image upload')
      return
    }

    console.log('📸 Starting image upload:', file.name, file.type, file.size)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const imgUrl = e.target?.result as string
        if (!imgUrl) {
          console.error('❌ Failed to read image file')
          return
        }

        console.log('📸 Creating Fabric image from URL...')
        // Fabric.js 6.x: fromURL 返回 Promise
        const img = await fabric.Image.fromURL(imgUrl, { crossOrigin: 'anonymous' })

        // 保存原始尺寸信息用于后续高清导出
        const originalWidth = img.width || 0
        const originalHeight = img.height || 0
        
        // 保存到图片对象中
        const imgAny = img as any
        if (imgAny._originalElement) {
          imgAny._originalWidth = imgAny._originalElement.naturalWidth || originalWidth
          imgAny._originalHeight = imgAny._originalElement.naturalHeight || originalHeight
        } else {
          imgAny._originalWidth = originalWidth
          imgAny._originalHeight = originalHeight
        }

        // 检测分辨率类别
        const maxDimension = Math.max(originalWidth, originalHeight)
        let resolutionCategory = 'other'
        if (maxDimension <= 1024) resolutionCategory = '1K'
        else if (maxDimension <= 2048) resolutionCategory = '2K'
        else if (maxDimension <= 4096) resolutionCategory = '4K'
        imgAny._resolutionCategory = resolutionCategory

        console.log('📸 Uploaded image info:', {
          original: { width: originalWidth, height: originalHeight },
          category: resolutionCategory,
          file: { name: file.name, size: file.size }
        })

        // 智能缩放：保持宽高比，适应画布大小
        const canvasWidth = currentCanvas.getWidth()
        const canvasHeight = currentCanvas.getHeight()
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

        console.log('📸 Adding image to canvas...')
        currentCanvas.add(img)
        currentCanvas.setActiveObject(img)
        safeRenderAll(currentCanvas)

        console.log('✅ Image upload completed successfully')
      } catch (error) {
        console.error('❌ Failed to upload image:', error)
      }
    }

    reader.onerror = () => {
      console.error('❌ Failed to read file')
    }

    reader.readAsDataURL(file)
  }


  // 标准功能
  const deleteSelected = () => {
    const activeObjects = canvas?.getActiveObjects()
    if (activeObjects) {
      canvas?.remove(...activeObjects)
      canvas?.discardActiveObject()
      safeRenderAll(canvas)
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

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('selectedTemplate')
      if (!raw) return
      const tpl = JSON.parse(raw)
      if (tpl && typeof tpl.prompt === 'string') {
        // 打开常驻 AI Assistant 面板，并将提示词填入输入框
        setIsChatExpanded(true)
        setInputMessage(tpl.prompt)
        // 可选：在对话里提示当前模板（不自动发送）
        setChatMessages(prev => ([
          ...prev,
          {
            id: (Date.now()).toString(),
            role: 'assistant',
            content: `🧩 Template selected: ${tpl.name}. You can edit or generate with the prefilled prompt.`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]))
      }
    } catch (e) {
      console.warn('Failed to read selectedTemplate from sessionStorage')
    } finally {
      sessionStorage.removeItem('selectedTemplate')
    }
  }, [])

  // 空状态处理函数
  const handleEmptyStateUpload = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
        if (imageFiles.length > 0) {
          handleMultipleImageUpload(imageFiles)
          setShowEmptyState(false)
        }
      }
    }
    input.click()
  }, [handleMultipleImageUpload])

  const handleEmptyStateAIGenerate = useCallback(() => {
    setShowEmptyState(false)
    // 触发 AI 生成功能
    setAiDialog({
      visible: true,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      message: '请描述你想要生成的图片',
      isLoading: false,
      textareaHeight: 72
    })
  }, [])

  const handleEmptyStateTemplates = useCallback(() => {
    setShowTemplateSelector(true)
  }, [])

  const handleEmptyStateGuide = useCallback(() => {
    setShowOnboarding(true)
  }, [])

  // 引导完成处理
  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false)
    markOnboardingSeen()
  }, [markOnboardingSeen])

  const handleOnboardingSkip = useCallback(() => {
    setShowOnboarding(false)
    markOnboardingSeen()
  }, [markOnboardingSeen])

  // 模板选择处理
  const handleTemplateSelect = useCallback(async (template: any) => {
    console.log('Selected template:', template)
    
    if (!templateFactory || !canvas) {
      console.error('Template factory or canvas not available')
      return
    }

    try {
      // 根据模板类型加载相应的模板
      // 如果模板有 type 字段（来自数据库），使用它
      // 否则根据模板 ID 或名称推断类型
      let templateType: TemplateType | null = null
      
      if (template.type) {
        // 数据库模板类型映射 - 支持三种模板类型
        // 文生图：text-to-image
        // 单图生图：single-image
        // 多图生图：multi-image
        const typeMap: Record<string, TemplateType> = {
          'text-to-image': TemplateType.TEXT_TO_IMAGE,
          'single-image': TemplateType.SINGLE_IMAGE_TO_IMAGE,
          'multi-image': TemplateType.MULTI_IMAGE_TO_IMAGE,
          'image-to-image': TemplateType.SINGLE_IMAGE_TO_IMAGE, // 通用图生图类型默认使用单图生图
        }
        templateType = typeMap[template.type] || TemplateType.TEXT_TO_IMAGE
      } else {
        // 预设模板：默认使用文生图模板
        templateType = TemplateType.TEXT_TO_IMAGE
      }

      // 计算画布中心位置（考虑视口变换）
      const canvasWidth = canvas.getWidth()
      const canvasHeight = canvas.getHeight()
      const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0]
      const viewportCenterX = (canvasWidth / 2 - vpt[4]) / vpt[0]
      const viewportCenterY = (canvasHeight / 2 - vpt[5]) / vpt[3]

      // 根据模板类型创建模板
      let createdTemplate = null
      switch (templateType) {
        case TemplateType.TEXT_TO_IMAGE:
          createdTemplate = await templateFactory.createTextToImageTemplate({
            position: { left: viewportCenterX - 250, top: viewportCenterY - 150 }
          })
          break
        case TemplateType.SINGLE_IMAGE_TO_IMAGE:
          createdTemplate = await templateFactory.createSingleImageToImageTemplate({
            position: { left: viewportCenterX - 250, top: viewportCenterY - 150 }
          })
          break
        case TemplateType.MULTI_IMAGE_TO_IMAGE:
          createdTemplate = await templateFactory.createMultiImageToImageTemplate({
            position: { left: viewportCenterX - 250, top: viewportCenterY - 150 }
          })
          break
        default:
          console.warn('Unknown template type, using text-to-image')
          createdTemplate = await templateFactory.createTextToImageTemplate({
            position: { left: viewportCenterX - 250, top: viewportCenterY - 150 }
          })
      }

      if (createdTemplate) {
        console.log('✅ Template loaded successfully:', templateType)
        
        // 确保模板在视口内可见
        const objects = canvas.getObjects()
        if (objects.length > 0) {
          const templateGroup = objects[objects.length - 1] as any
          console.log('📦 Template group info:', {
            left: templateGroup.left,
            top: templateGroup.top,
            width: templateGroup.width,
            height: templateGroup.height,
            visible: templateGroup.visible !== false,
            opacity: templateGroup.opacity !== 0
          })
          
          // 将视口移动到模板位置，确保模板可见
          const templateCenterX = (templateGroup.left || 0) + (templateGroup.width || 0) / 2
          const templateCenterY = (templateGroup.top || 0) + (templateGroup.height || 0) / 2
          const currentVpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0]
          const canvasWidth = canvas.getWidth()
          const canvasHeight = canvas.getHeight()
          const newVptX = canvasWidth / 2 - templateCenterX * currentVpt[0]
          const newVptY = canvasHeight / 2 - templateCenterY * currentVpt[3]
          
          canvas.setViewportTransform([currentVpt[0], currentVpt[1], currentVpt[2], currentVpt[3], newVptX, newVptY])
          console.log('📍 Viewport moved to template position:', { newVptX, newVptY })
        }
        
        // 确保画布正确渲染
        safeRenderAll(canvas)
        console.log('✅ Canvas rendered, total objects:', canvas.getObjects().length)
        
        // 如果模板有预设的 prompt，可以设置到文本框中
        if (template.prompt && createdTemplate instanceof TextToImageTemplate) {
          // 这里可以设置 prompt 到模板的文本框中
          // 需要访问模板内部的文本框对象
        }
      } else {
        console.error('❌ Failed to create template')
      }

      setShowEmptyState(false)
      setShowTemplateSelector(false)
    } catch (error) {
      console.error('❌ Error loading template:', error)
    }
  }, [templateFactory, canvas])

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      
      {/* 新用户引导 */}
      <OnboardingGuide
        isVisible={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />

      {/* 空状态界面 */}
      {showEmptyState && (
        <EmptyState
          onUpload={handleEmptyStateUpload}
          onAIGenerate={handleEmptyStateAIGenerate}
          onShowTemplates={handleEmptyStateTemplates}
          onStartGuide={handleEmptyStateGuide}
        />
      )}

      {/* 模板选择器 */}
      <TemplateSelector
        isVisible={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleTemplateSelect}
      />
      
      {/* 积分显示 */}
      {isAuthed && (
        <div className="absolute top-4 right-4 z-50">
          <PointsDisplay compact={true} />
        </div>
      )}
      {/* 无限画布 */}
      <div
        className="upload-area absolute inset-0 w-full h-full"
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          style={{ display: 'block', position: 'absolute', top: 0, left: 0, zIndex: 10, pointerEvents: 'auto' }}
          onContextMenu={handleReactContextMenu}
        />

        {/* AI Edit 快捷按钮 */}
        {aiEditButton.visible && (
          <button
            className="ai-edit-button absolute z-30 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg hover:bg-blue-700 transition-colors"
            onMouseDown={(e) => { e.stopPropagation() }}
            onClick={(e) => { e.stopPropagation(); handleAiEditClick() }}
            data-ai-dialog
            style={{
              left: aiEditButton.x,
              top: aiEditButton.y,
              transform: 'translate(-100%, -100%)'
            }}
          >
            AI Edit
          </button>
        )}

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
            {/* AI功能 - 总是显示，但文本根据场景变化 */}
            <button
              onClick={() => showAiDialog(contextMenu.x, contextMenu.y)}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center space-x-2 text-sm"
            >
              <span className="text-blue-500">🤖</span>
              <span>
                {contextMenu.selectedObjects.length > 0
                  ? 'AI Edit with Gemini'
                  : 'AI Generate with Gemini'
                }
              </span>
            </button>

            {/* 只有选中对象时才显示的选项 */}
            {contextMenu.selectedObjects.length > 0 && (
              <>
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
                      safeRenderAll(canvas)
                    }
                    hideContextMenu()
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center space-x-2 text-sm text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </>
            )}

            {/* 只有空白画布时才显示的选项 */}
            {contextMenu.selectedObjects.length === 0 && (
              <>
                <div className="border-t border-gray-200 my-1" />
                <div className="px-4 py-2 text-xs text-gray-500">
                  Canvas Actions
                </div>
                <button
                  onClick={() => {
                    // 可以添加其他画布操作，比如清空画布、重置视图等
                    hideContextMenu()
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm text-gray-600"
                >
                  <span>📋</span>
                  <span>Paste (Coming Soon)</span>
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* 竖屏工具栏 - 减少30%宽度 */}
      <div className="toolbar absolute top-6 left-4 z-40">
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
                    input.multiple = true // 支持多文件选择
                    input.onchange = (e) => {
                      const target = e.target as HTMLInputElement
                      const files = target.files
                      if (!files || files.length === 0) return

                      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
                      if (imageFiles.length > 0) {
                        handleMultipleImageUpload(imageFiles)
                      }
                    }
                    input.click()
                  }}
                  className="p-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg w-10 h-10 flex items-center justify-center"
                  title="Upload Images (Multiple)"
                >
                  <Upload className="w-4 h-4" />
                </button>

                <button
                  onClick={downloadImage}
                  className="save-button p-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors shadow-lg w-10 h-10 flex items-center justify-center"
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
                {/* 模型选择器 */}
                <div className="mb-2 flex items-center space-x-2">
                  <label htmlFor="model-selector" className="text-xs text-gray-500 whitespace-nowrap">模型:</label>
                  <select
                    id="model-selector"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value as 'gemini-2.5-flash-image-preview' | 'gemini-3-pro-image-preview')}
                    className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    disabled={isLoading}
                  >
                    <option value="gemini-2.5-flash-image-preview">Gemini 2.5 Flash Image</option>
                    <option value="gemini-3-pro-image-preview">Gemini 3 Pro Image</option>
                  </select>
                </div>
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
              <h3 className="font-semibold text-gray-800">Gemini AI Assistant</h3>
            </div>
            <div className="space-y-3">
              {/* 模型选择器 */}
              <div className="flex items-center space-x-2">
                <label htmlFor="ai-dialog-model-selector" className="text-xs text-gray-600 whitespace-nowrap">模型:</label>
                <select
                  id="ai-dialog-model-selector"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as 'gemini-2.5-flash-image-preview' | 'gemini-3-pro-image-preview')}
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  disabled={aiDialog.isLoading}
                >
                  <option value="gemini-2.5-flash-image-preview">Gemini 2.5 Flash Image</option>
                  <option value="gemini-3-pro-image-preview">Gemini 3 Pro Image</option>
                </select>
              </div>
              <textarea
                value={aiDialog.message}
                onChange={(e) => adjustTextareaHeight(e.target.value)}
                placeholder={contextMenu.selectedObjects.length > 0
                  ? "Describe how to edit the selected objects..."
                  : "Describe the image you want to generate..."}
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
                      await processAiRequest(aiDialog.message)
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
                  {aiDialog.isLoading
                    ? 'Processing with Gemini...'
                    : (contextMenu.selectedObjects.length > 0 ? 'Edit with AI' : 'Generate Image')
                  }
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
