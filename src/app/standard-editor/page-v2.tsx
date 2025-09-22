'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Canvas, Rect, Circle as FabricCircle, IText, FabricImage, Path } from 'fabric'
import { useSession } from 'next-auth/react'
import LoginDialog from '@/components/LoginDialog'
import * as fabric from 'fabric'
import { exportSelectedObjectsSmart, calculateOptimalMultiplier, getPreciseBounds } from '@/utils/fabric-object-export'
import { smartUpload, UploadOptions } from '@/utils/gemini-image-upload'
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

export default function StandardEditorV2() {
  const { status } = useSession()
  const isAuthed = status === 'authenticated'
  const [loginOpen, setLoginOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [currentTool, setCurrentTool] = useState<'select' | 'move' | 'draw' | 'rectangle' | 'circle' | 'text' | 'arrow'>('select')

  // 上传方式选择
  const [uploadMethod, setUploadMethod] = useState<'auto' | 'file' | 'url' | 'base64'>('auto')
  const [uploadOptions, setUploadOptions] = useState<UploadOptions>({
    method: 'auto',
    maxSize: 5 * 1024 * 1024, // 5MB
    quality: 0.8,
    format: 'jpeg'
  })

  // Floating window states
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true)
  const [isChatExpanded, setIsChatExpanded] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const dragDepthRef = useRef(0)

  // 拖拽绘制状态
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentShape, setCurrentShape] = useState<any>(null)

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

  // 带位置参数的图片上传
  const handleImageUploadWithPosition = useCallback((file: File, position: { x: number, y: number }) => {
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

        // 智能缩放
        const maxDisplayWidth = 250
        const maxDisplayHeight = 250

        if (img.width && img.height) {
          const scale = Math.min(
            maxDisplayWidth / img.width,
            maxDisplayHeight / img.height,
            1
          )
          img.scale(scale)
        }

        // 设置图像位置
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

  // 处理多个图片文件上传
  const handleMultipleImageUpload = useCallback((files: File[]) => {
    console.log(`📸 Starting multiple image upload: ${files.length} files`)

    // 智能布局参数
    const GRID_SPACING = 20
    const MAX_COLUMNS = 3
    const START_X = 50
    const START_Y = 50

    files.forEach((file, index) => {
      const column = index % MAX_COLUMNS
      const row = Math.floor(index / MAX_COLUMNS)
      const offsetX = column * (300 + GRID_SPACING)
      const offsetY = row * (300 + GRID_SPACING)

      console.log(`📸 Processing image ${index + 1}/${files.length}: ${file.name}`)

      handleImageUploadWithPosition(file, {
        x: START_X + offsetX,
        y: START_Y + offsetY
      })
    })
  }, [handleImageUploadWithPosition])

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

    // 处理多个图片文件
    handleMultipleImageUpload(imageFiles)
  }, [handleMultipleImageUpload])

  // 处理文件输入上传
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

    handleMultipleImageUpload(imageFiles)
    e.target.value = ''
  }, [handleMultipleImageUpload])

  

  // 获取选中对象的图片数据 - 使用新的上传方式
  const getSelectedObjectsImage = useCallback(async (): Promise<{ imageData: string; bounds: any } | null> => {
    if (!canvas) return null

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length === 0) return null

    try {
      console.log('🎯 === USING NEW UPLOAD METHOD ===')
      console.log('📸 Capturing selected objects...', {
        count: activeObjects.length,
        objectTypes: activeObjects.map(obj => obj.type)
      })

      const optimalMultiplier = calculateOptimalMultiplier(activeObjects)

      const result = await exportSelectedObjectsSmart(canvas, {
        format: 'jpeg',
        quality: 0.8,
        multiplier: Math.min(optimalMultiplier, 2),
        tightBounds: true,
        padding: 0,
        backgroundColor: 'white'
      })

      if (!result) {
        console.error('❌ Failed to export selected objects')
        return null
      }

      console.log('✅ Export completed:', {
        imageSize: result.imageData.length,
        bounds: result.bounds,
        multiplier: optimalMultiplier
      })

      return result
    } catch (error) {
      console.error('❌ Error generating selected objects image:', error)
      return null
    }
  }, [canvas])

  // 添加AI生成的图片到画布（提前定义，供 processAiRequest 使用）
  const addAiGeneratedImage = useCallback(async (imageUrl: string, bounds?: any) => {
    if (!canvas) return

    try {
      console.log('🖼️ Adding AI generated image to canvas', { imageUrl, bounds })

      const img = await FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous'
      })

      if (bounds) {
        const offsetX = bounds.width + 20
        img.set({
          left: bounds.left + offsetX,
          top: bounds.top,
          scaleX: bounds.width / (img.width || 1),
          scaleY: bounds.height / (img.height || 1),
        })
      } else {
        const viewport = canvas.getVpCenter()
        const scale = Math.min(300 / (img.width || 1), 300 / (img.height || 1))

        img.set({
          left: viewport.x - (img.width || 0) * scale / 2,
          top: viewport.y - (img.height || 0) * scale / 2,
          scaleX: scale,
          scaleY: scale,
        })
      }

      img.set({
        selectable: true,
        evented: true
      })

      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()

      console.log('✅ AI generated image added successfully')
    } catch (error) {
      console.error('❌ Failed to add AI generated image:', error)
      throw error
    }
  }, [canvas])

  // 处理AI请求 - 使用新的上传方式
  const processAiRequest = useCallback(async (message: string) => {
    if (!canvas) {
      console.error('Canvas not available')
      return
    }

    if (!isAuthed) {
      setLoginOpen(true)
      throw new Error('AUTH_REQUIRED')
    }

    console.log('🤖 Processing AI request:', message)

    try {
      const result = await getSelectedObjectsImage()

      if (result) {
        // 场景1: 有选中对象 - 图像编辑
        console.log('📸 Selected objects image captured, performing image editing')

        // 使用新的智能上传方式
        const uploadResult = await smartUpload(
          result.imageData,
          message,
          'gemini-2.5-flash-image-preview',
          uploadOptions
        )

        if (uploadResult.success && uploadResult.data?.editedImageUrl) {
          await addAiGeneratedImage(uploadResult.data.editedImageUrl, result.bounds)
          console.log('🎨 AI-edited image added to canvas')
        } else {
          throw new Error(uploadResult.error || 'No edited image received')
        }
      } else {
        // 场景2: 没有选中对象 - 图像生成
        console.log('📝 No objects selected, performing image generation')

        const uploadResult = await smartUpload(
          '', // 空字符串表示生成新图片
          message,
          'gemini-2.5-flash-image-preview',
          uploadOptions
        )

        if (uploadResult.success && uploadResult.data?.editedImageUrl) {
          await addAiGeneratedImage(uploadResult.data.editedImageUrl)
          console.log('🎨 AI-generated image added to canvas')
        } else {
          throw new Error(uploadResult.error || 'No generated image received')
        }
      }
    } catch (error) {
      console.error('❌ AI request failed:', error)
      throw error
    }
  }, [canvas, isAuthed, getSelectedObjectsImage, uploadOptions, addAiGeneratedImage])

  // 其他组件代码保持不变...
  // (这里省略了画布初始化、工具切换等代码，与原版本相同)

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      
      {/* 上传方式选择器 */}
      <div className="absolute top-6 right-6 z-50">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">上传方式</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="radio"
                name="uploadMethod"
                value="auto"
                checked={uploadMethod === 'auto'}
                onChange={(e) => setUploadMethod(e.target.value as any)}
              />
              <span>自动选择</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="radio"
                name="uploadMethod"
                value="file"
                checked={uploadMethod === 'file'}
                onChange={(e) => setUploadMethod(e.target.value as any)}
              />
              <span>直接文件上传</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="radio"
                name="uploadMethod"
                value="url"
                checked={uploadMethod === 'url'}
                onChange={(e) => setUploadMethod(e.target.value as any)}
              />
              <span>云存储 URL</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="radio"
                name="uploadMethod"
                value="base64"
                checked={uploadMethod === 'base64'}
                onChange={(e) => setUploadMethod(e.target.value as any)}
              />
              <span>Base64 编码</span>
            </label>
          </div>
        </div>
      </div>

      {/* 其他 UI 组件保持不变 */}
      {/* ... */}
    </div>
  )
}
