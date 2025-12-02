'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import * as fabric from 'fabric'
import { useSession } from 'next-auth/react'
import LoginDialog from '@/components/LoginDialog'
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
  ArrowUpRight,
  Loader2
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
  const searchParams = useSearchParams()
  const canvasIdParam = searchParams?.get('canvasId') || null
  const localProjectId = searchParams?.get('localProjectId') || null
  const { status } = useSession()
  const isAuthed = status === 'authenticated'
  const [loginOpen, setLoginOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
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

  // Prefill AI dialog from template selection
  useEffect(() => {
    try {
      let initialPrompt = ''
      const tplStr = sessionStorage.getItem('selectedTemplate')
      if (tplStr) {
        const tpl = JSON.parse(tplStr)
        initialPrompt = (tpl && tpl.prompt) || ''
      }
      if (!initialPrompt) {
        const p = sessionStorage.getItem('nc_initial_prompt')
        if (p) initialPrompt = p
      }
      if (initialPrompt) {
        setAiDialog(prev => ({ ...prev, visible: true, message: initialPrompt }))
        setIsChatExpanded(true)
        try { sessionStorage.removeItem('selectedTemplate') } catch {}
        try { sessionStorage.removeItem('nc_initial_prompt') } catch {}
      }
    } catch {}
  }, [])

  // 获取选中对象的图片数据 - 使用新的上传方式（提前定义，供 AI 请求使用）
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

  // 添加AI生成的图片到画布（提前定义，供 AI 请求使用）
  const addAiGeneratedImage = useCallback(async (imageUrl: string, bounds?: any) => {
    if (!canvas) return

    try {
      console.log('🖼️ Adding AI generated image to canvas', { imageUrl, bounds })

      const img = await fabric.Image.fromURL(imageUrl, { crossOrigin: 'anonymous' })

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

  // 处理AI请求 - 使用新的上传方式（提到前面以便依赖引用）
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
      const activeObjects = canvas.getActiveObjects()
      let hasImage = false
      const shapeColors = new Set<string>()
      const shapeTypes = ['rect','circle','triangle','path','line','polygon','polyline']
      activeObjects.forEach(obj => {
        if (obj.type === 'image') {
          hasImage = true
        } else if (shapeTypes.includes(obj.type)) {
          const fill = (obj as any).fill
          const stroke = (obj as any).stroke
          let color: string | null = null
          if (typeof fill === 'string' && fill && fill !== 'transparent') {
            color = fill
          } else if (typeof stroke === 'string' && stroke) {
            color = stroke
          }
          if (color) shapeColors.add(color)
        }
      })

      let finalMessage = message
      if (hasImage && shapeColors.size > 0) {
        const colorsText = Array.from(shapeColors).join('、')
        finalMessage = `${message} 删除${colorsText}颜色的图形对象`
      }

      const result = await getSelectedObjectsImage()

      if (result) {
        console.log('📸 Selected objects image captured, performing image editing')

        const uploadResult = await smartUpload(
          result.imageData,
          finalMessage,
          'gemini-2.5-flash-image',
          uploadOptions
        )

        if (uploadResult.success && uploadResult.data?.editedImageUrl) {
          await addAiGeneratedImage(uploadResult.data.editedImageUrl, result.bounds)
          console.log('🎨 AI-edited image added to canvas')
        } else {
          throw new Error(uploadResult.error || 'No edited image received')
        }
      } else {
        console.log('📝 No objects selected, performing image generation')

        const uploadResult = await smartUpload(
          '', // 空字符串表示生成新图片
          message,
          'gemini-2.5-flash-image',
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

  // 自动保存：每 30s 保存当前画布 JSON（覆盖写入）
  useEffect(() => {
    let timer: any
    const saveNow = async () => {
      try {
        if (!canvas) return
        const cid = canvasIdParam
        const fabricJson = canvas.toJSON()
        const vt = canvas.viewportTransform as any
        const zoom = canvas.getZoom()
        const payload = {
          version: 'nanocanvas-v1',
          fabric: fabricJson,
          viewport: { transform: vt, zoom }
        }
        if (cid) {
          await fetch(`/api/canvas/${cid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ canvasJson: payload })
          })
        } else if (localProjectId) {
          try {
            const raw = localStorage.getItem('nc_projects')
            if (!raw) return
            const arr = JSON.parse(raw) || []
            const idx = arr.findIndex((p: any) => String(p.id) === String(localProjectId))
            if (idx >= 0) {
              arr[idx] = {
                ...arr[idx],
                data: payload,
                updatedAt: new Date().toISOString()
              }
              localStorage.setItem('nc_projects', JSON.stringify(arr))
            }
          } catch {}
        }
      } catch {}
    }
    // 初次加载后 30s 执行一次，然后每 30s
    if (canvas) {
      timer = setInterval(saveNow, 30000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [canvas, canvasIdParam, localProjectId])

  // 加载已保存的画布 JSON（包括视口位置与缩放）
  useEffect(() => {
    const loadSaved = async () => {
      try {
        if (!canvas) return
        const cid = canvasIdParam
        if (cid) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          if (!supabaseUrl || !supabaseAnonKey) return
          const { createClient } = await import('@supabase/supabase-js')
          const sp = createClient(supabaseUrl, supabaseAnonKey)
          const { data, error } = await sp
            .from('nanobanana_user_canvas')
            .select('canvas_json')
            .eq('id', cid)
            .maybeSingle()
          if (error || !data || !data.canvas_json) return
          const saved = data.canvas_json
          if (saved?.fabric) {
            canvas.loadFromJSON(saved.fabric, () => {
              if (saved?.viewport?.transform) {
                canvas.setViewportTransform(saved.viewport.transform)
              }
              if (saved?.viewport?.zoom) {
                canvas.setZoom(saved.viewport.zoom)
              }
              canvas.renderAll()
            })
          }
        } else if (localProjectId) {
          const raw = localStorage.getItem('nc_projects')
          if (!raw) return
          const arr = JSON.parse(raw) || []
          const found = arr.find((p: any) => String(p.id) === String(localProjectId))
          const saved = found?.data
          if (saved?.fabric) {
            canvas.loadFromJSON(saved.fabric, () => {
              if (saved?.viewport?.transform) {
                canvas.setViewportTransform(saved.viewport.transform)
              }
              if (saved?.viewport?.zoom) {
                canvas.setZoom(saved.viewport.zoom)
              }
              canvas.renderAll()
            })
          }
        }
      } catch {}
    }
    loadSaved()
  }, [canvas, canvasIdParam, localProjectId])

  // Send AI request from dialog
  const handleSend = useCallback(async () => {
    const msg = aiDialog.message.trim()
    if (!msg) return
    setAiDialog(prev => ({ ...prev, isLoading: true }))
    try {
      await processAiRequest(msg)
    } catch (e) {
      // swallow error, UI can show toast in future
    } finally {
      setAiDialog(prev => ({ ...prev, isLoading: false }))
    }
  }, [aiDialog.message, processAiRequest])

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
        // Fabric.js 6.x: fromURL 返回 Promise
        const img = await fabric.Image.fromURL(imgUrl, { crossOrigin: 'anonymous' })

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

      {/* AI 面板 */}
      <div className="absolute top-6 right-6 z-50 w-[360px]">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/60">
            <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-gray-700" />
              <span>AI 面板</span>
            </div>
            <button
              className="text-gray-600 hover:text-black"
              onClick={() => setIsChatExpanded(prev => !prev)}
              title={isChatExpanded ? '收起' : '展开'}
            >
              {isChatExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {isChatExpanded && (
            <div className="p-4 space-y-3">
              <textarea
                value={aiDialog.message}
                onChange={(e) => setAiDialog(prev => ({ ...prev, message: e.target.value }))}
                placeholder="描述你要生成或编辑的内容..."
                className="w-full h-28 resize-none rounded-lg border border-gray-200 bg-white text-sm p-3 outline-none focus:ring-2 focus:ring-gray-900"
              />
              <div className="flex items-center justify-end">
                <button
                  disabled={aiDialog.isLoading || !aiDialog.message.trim()}
                  onClick={handleSend}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-black disabled:bg-gray-300 disabled:text-gray-600"
                >
                  {aiDialog.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {aiDialog.isLoading ? '生成中' : '发送'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
