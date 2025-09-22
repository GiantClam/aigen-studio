'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Canvas, Rect, Circle as FabricCircle, IText, FabricImage, Path } from 'fabric'
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
  const { status } = useSession()
  const isAuthed = status === 'authenticated'
  const [loginOpen, setLoginOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [currentTool, setCurrentTool] = useState<'select' | 'move' | 'draw' | 'rectangle' | 'circle' | 'text' | 'arrow'>('select')

  // Floating window states
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true)
  const [isChatExpanded, setIsChatExpanded] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const dragDepthRef = useRef(0)

  // 拖拽绘制状态
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

  // 首次访问检测和引导逻辑
  useEffect(() => {
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
        const img = await FabricImage.fromURL(imgUrl, {
          crossOrigin: 'anonymous'
        })

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
        currentCanvas.renderAll()

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
      canvas.renderAll()

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
        canvas.renderAll()
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      // 双保险恢复视口
      if (canvas) {
        canvas.renderAll()
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
      const img = await FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous'
      })

      // 设置图片位置和大小
      if (bounds) {
        // 如果有边界信息，在原位置右侧添加编辑后的图片
        const offsetX = bounds.width + 20 // 在原图右侧20px处

        img.set({
          left: bounds.left + offsetX,
          top: bounds.top,
          scaleX: bounds.width / (img.width || 1),
          scaleY: bounds.height / (img.height || 1),
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
      canvas.renderAll()

      console.log('✅ AI generated image added successfully')
    } catch (error) {
      console.error('❌ Failed to add AI generated image:', error)
      throw error
    }
  }, [canvas])

  // 处理AI请求 - 集成 gemini-2.5-flash-image-preview 模型
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
            model: 'gemini-2.5-flash-image-preview'
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
            model: 'gemini-2.5-flash-image-preview'
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
  }, [canvas, isAuthed, hasEnoughPoints, deductPoints, getSelectedObjectsImage, checkPoints, addAiGeneratedImage])


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
      currentCanvas.renderAll()

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
    if (!canvasRef.current || canvas) return // 防止重复创建

    console.log('🎨 Initializing new canvas instance')

    // Canvas 初始化 - 不需要保存状态，因为这是首次创建
    console.log('ℹ️ Initializing new canvas (first time or after cleanup)')

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

    // Enable canvas zooming - 使用 Fabric.js 标准方式，避免性能警告
    fabricCanvas.on('mouse:wheel', (opt) => {
      // 使用 requestAnimationFrame 来优化性能，避免阻塞主线程
      requestAnimationFrame(() => {
        const delta = opt.e.deltaY
        let zoom = fabricCanvas.getZoom()
        zoom *= 0.999 ** delta
        if (zoom > 20) zoom = 20
        if (zoom < 0.01) zoom = 0.01
        const pointer = fabricCanvas.getPointer(opt.e)
        fabricCanvas.zoomToPoint(pointer, zoom)
      })

      // 只在必要时阻止默认行为，减少性能影响
      if (Math.abs(opt.e.deltaY) > 0) {
        opt.e.preventDefault()
        opt.e.stopPropagation()
      }
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
          requestAnimationFrame(() => refreshAiEditButtonPosition())
        }
      }
    })

    fabricCanvas.on('mouse:up', () => {
      fabricCanvas.setViewportTransform(fabricCanvas.viewportTransform!)
      isDragging = false
      fabricCanvas.selection = true
      refreshAiEditButtonPosition()
    })

    // 统一刷新 AI Edit 按钮位置（支持多选、平移、缩放）
    const refreshAiEditButtonPosition = () => {
      if (currentTool !== 'select') {
        setAiEditButton({ visible: false, x: 0, y: 0 })
        return
      }

      const activeObjects = fabricCanvas.getActiveObjects()
      if (!activeObjects || activeObjects.length === 0) {
        setAiEditButton({ visible: false, x: 0, y: 0 })
        return
      }

      let bounds: any | null = null
      try {
        // @ts-ignore: 支持对象数组
        bounds = getPreciseBounds ? getPreciseBounds(activeObjects) : null
      } catch (_) {
        bounds = null
      }
      if (!bounds) {
        const selection: any = fabricCanvas.getActiveObject()
        bounds = selection?.getBoundingRect ? selection.getBoundingRect() : null
      }
      if (!bounds) {
        setAiEditButton({ visible: false, x: 0, y: 0 })
        return
      }

      const vpt = fabricCanvas.viewportTransform || [1, 0, 0, 1, 0, 0]
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
    }

    // 窗口大小变化处理
    const handleResize = () => {
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight
      fabricCanvas.setDimensions({ width: newWidth, height: newHeight })
      fabricCanvas.renderAll()
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

      // 设置画笔属性
      fabricCanvas.freeDrawingBrush.width = 5
      fabricCanvas.freeDrawingBrush.color = '#000000'

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

    fabricCanvas.upperCanvasEl.addEventListener('contextmenu', contextMenuHandler)

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

    // 存储画布实例到全局变量，供键盘事件使用
    ;(window as any).fabricCanvasInstance = fabricCanvas

    setCanvas(fabricCanvas)

    console.log('✅ Canvas initialized successfully')

    return () => {
      window.removeEventListener('resize', handleResize)
      fabricCanvas.upperCanvasEl.removeEventListener('contextmenu', contextMenuHandler)
      document.removeEventListener('keydown', handleKeyboardDelete)
      fabricCanvas.off('selection:created', handleSelectionCreated)
      fabricCanvas.off('selection:updated', handleSelectionUpdated)
      fabricCanvas.off('selection:cleared', handleSelectionCleared)
      fabricCanvas.off('object:moving', handleObjectChange)
      fabricCanvas.off('object:scaling', handleObjectChange)
      fabricCanvas.off('object:rotating', handleObjectChange)
      fabricCanvas.off('object:modified', handleObjectChange)
      fabricCanvas.off('mouse:wheel', wheelHandler)
      // 清除全局画布实例
      ;(window as any).fabricCanvasInstance = null
      fabricCanvas.dispose()
    }
  }, [canvas, currentTool, handleKeyboardDelete]) // 只在组件挂载时初始化画布

  // 工具切换 - 使用Fabric.js标准方式
  useEffect(() => {
    if (!canvas) return

    switch (currentTool) {
      case 'select':
        canvas.isDrawingMode = false
        canvas.selection = true
        canvas.defaultCursor = 'default'
        canvas.hoverCursor = 'move'
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

        // 配置画笔属性
        canvas.freeDrawingBrush.width = 5
        canvas.freeDrawingBrush.color = '#000000'

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
        // 禁止对象命中，避免拖动对象
        canvas.skipTargetFind = true
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
          // 绘制完成后不自动选中对象，避免触发AI Edit按钮
          // canvas.setActiveObject(shape)
          canvas.renderAll()
          return
        case 'arrow':
          // 箭头拖拽绘制 - 创建初始线条（从起点到起点，长度为0）
          console.log('🏹 Starting arrow drag from', pointer)
          shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: '#ef4444',
            strokeWidth: 3,
            selectable: false,
            evented: false,
            originX: 'left',
            originY: 'top'
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
          // 更新箭头线条的终点
          const line = currentShape as fabric.Line
          console.log('🏹 Updating arrow to', pointer)
          line.set({
            x2: pointer.x,
            y2: pointer.y
          })
          // 重新计算线条的位置和尺寸
          line.setCoords()
          break
      }

      canvas.renderAll()
    }

    const handleMouseUp = () => {
      if (!isDrawing || !currentShape) return

      // 箭头特殊处理：替换线条为完整的箭头路径
      if (currentTool === 'arrow' && startPoint) {
        const line = currentShape as fabric.Line
        const endX = line.x2 || startPoint.x
        const endY = line.y2 || startPoint.y

        console.log('🏹 Creating arrow from', startPoint, 'to', { x: endX, y: endY })

        // 移除临时线条
        canvas.remove(currentShape)

        // 创建完整的箭头路径
        const arrowPath = createArrowPath(startPoint.x, startPoint.y, endX, endY)
        const arrowShape = new fabric.Path(arrowPath, {
          fill: 'transparent',
          stroke: '#ef4444',
          strokeWidth: 3,
          selectable: true,
          evented: true
        })

        canvas.add(arrowShape)
        // 绘制完成后不自动选中对象，避免触发AI Edit按钮
        // canvas.setActiveObject(arrowShape)

        // 重置状态
        setIsDrawing(false)
        setStartPoint(null)
        setCurrentShape(null)
        canvas.renderAll()
        return
      }

      // 其他形状的标准处理
      setIsDrawing(false)
      setStartPoint(null)

      currentShape.set({ selectable: true })
      // 绘制完成后不自动选中对象，避免触发AI Edit按钮
      // canvas.setActiveObject(currentShape)
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
        const img = await FabricImage.fromURL(imgUrl, {
          crossOrigin: 'anonymous'
        })

        // 保存原始尺寸信息用于后续高清导出
        const originalWidth = img.width || 0
        const originalHeight = img.height || 0

        console.log('📸 Uploaded image info:', {
          original: { width: originalWidth, height: originalHeight },
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
        currentCanvas.renderAll()

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
  const handleTemplateSelect = useCallback((template: any) => {
    console.log('Selected template:', template)
    // 这里可以加载模板到画布
    setShowEmptyState(false)
  }, [])

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
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
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
                      canvas.renderAll()
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
