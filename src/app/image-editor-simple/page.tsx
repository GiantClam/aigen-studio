'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, Rect, Circle as FabricCircle, IText, FabricImage } from 'fabric'
import { 
  MousePointer2, 
  Square, 
  Circle, 
  Type, 
  Upload,
  ImageIcon
} from 'lucide-react'

export default function SimpleImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [currentTool, setCurrentTool] = useState<'select' | 'rectangle' | 'circle' | 'text'>('select')
  const [isDragOver, setIsDragOver] = useState(false)
  const initRef = useRef(false)

  // 简化的画布初始化
  useEffect(() => {
    if (!canvasRef.current || initRef.current) return

    console.log('🎨 Initializing simple canvas...')
    initRef.current = true

    try {
      const container = canvasRef.current.parentElement
      const containerWidth = container?.clientWidth || 800
      const containerHeight = container?.clientHeight || 600

      // 创建Fabric.js画布
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: containerWidth,
        height: containerHeight,
        backgroundColor: '#ffffff'
      })

      console.log('✅ Canvas created:', containerWidth, 'x', containerHeight)

      // 添加测试图形
      const testRect = new Rect({
        left: 100,
        top: 100,
        width: 200,
        height: 150,
        fill: 'rgba(255, 0, 0, 0.7)',
        stroke: 'black',
        strokeWidth: 3,
        selectable: true,
        evented: true
      })

      const testCircle = new FabricCircle({
        left: 350,
        top: 200,
        radius: 80,
        fill: 'rgba(0, 255, 0, 0.7)',
        stroke: 'darkgreen',
        strokeWidth: 3,
        selectable: true,
        evented: true
      })

      fabricCanvas.add(testRect)
      fabricCanvas.add(testCircle)
      fabricCanvas.renderAll()

      console.log('🧪 Test objects added:', fabricCanvas.getObjects().length)

      // 添加事件处理
      fabricCanvas.on('mouse:down', (e) => {
        if (!e.e) return
        const pointer = fabricCanvas.getPointer(e.e)

        if (!e.target && currentTool !== 'select') {
          let newObject = null

          switch (currentTool) {
            case 'rectangle':
              newObject = new Rect({
                left: pointer.x - 50,
                top: pointer.y - 30,
                width: 100,
                height: 60,
                fill: 'rgba(0, 123, 255, 0.5)',
                stroke: '#007bff',
                strokeWidth: 2,
                selectable: true,
                evented: true
              })
              break

            case 'circle':
              newObject = new FabricCircle({
                left: pointer.x - 50,
                top: pointer.y - 50,
                radius: 50,
                fill: 'rgba(255, 193, 7, 0.5)',
                stroke: '#ffc107',
                strokeWidth: 2,
                selectable: true,
                evented: true
              })
              break

            case 'text':
              newObject = new IText('编辑文本', {
                left: pointer.x - 50,
                top: pointer.y - 10,
                fontFamily: 'Arial',
                fontSize: 20,
                fill: '#000000',
                selectable: true,
                evented: true
              })
              break
          }

          if (newObject) {
            fabricCanvas.add(newObject)
            fabricCanvas.setActiveObject(newObject)
            fabricCanvas.renderAll()
            console.log('✅ Created:', currentTool)
          }
        }
      })

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
  }, [currentTool])

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
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">简化图像编辑器</h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentTool('select')}
              className={`p-2 rounded ${currentTool === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <MousePointer2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCurrentTool('rectangle')}
              className={`p-2 rounded ${currentTool === 'rectangle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <Square className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCurrentTool('circle')}
              className={`p-2 rounded ${currentTool === 'circle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <Circle className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCurrentTool('text')}
              className={`p-2 rounded ${currentTool === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <Type className="w-4 h-4" />
            </button>
          </div>

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
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <ImageIcon className="w-4 h-4" />
            <span>上传图片</span>
          </button>
        </div>
      </div>

      {/* 画布区域 */}
      <div className="flex-1 relative">
        <div 
          className="absolute inset-0 w-full h-full"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full border-2 border-gray-300"
          />
          
          {/* 拖放提示 */}
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm">
              <div className="text-center bg-white/90 rounded-xl p-8 shadow-xl border-2 border-dashed border-blue-400">
                <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <p className="text-xl font-bold text-blue-700">拖放图片到这里</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
