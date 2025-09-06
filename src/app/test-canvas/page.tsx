'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, Rect, Circle, IText } from 'fabric'

export default function TestCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    console.log('🎨 Initializing simple test canvas...')

    // 最简单的Fabric.js初始化
    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    })

    console.log('✅ Canvas created')

    // 添加一个大红色矩形
    const redRect = new Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 3
    })

    canvas.add(redRect)

    // 添加一个蓝色圆形
    const blueCircle = new Circle({
      left: 400,
      top: 200,
      radius: 80,
      fill: 'blue',
      stroke: 'navy',
      strokeWidth: 3
    })

    canvas.add(blueCircle)

    // 添加文本
    const text = new IText('Test Canvas', {
      left: 300,
      top: 50,
      fontSize: 30,
      fill: 'green'
    })

    canvas.add(text)

    canvas.renderAll()

    console.log('🧪 Test objects added:', canvas.getObjects().length)

    setFabricCanvas(canvas)

    return () => {
      canvas.dispose()
    }
  }, [])

  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Fabric.js Test Canvas</h1>
      
      <div className="w-full max-w-4xl mx-auto">
        <div 
          className="relative border-2 border-gray-300 bg-white"
          style={{ width: '800px', height: '600px' }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
          />
        </div>
        
        <div className="mt-4 space-x-2">
          <button
            onClick={() => {
              if (fabricCanvas) {
                const randomRect = new Rect({
                  left: Math.random() * 600,
                  top: Math.random() * 400,
                  width: 100,
                  height: 80,
                  fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
                  stroke: 'black',
                  strokeWidth: 2
                })
                fabricCanvas.add(randomRect)
                fabricCanvas.renderAll()
                console.log('➕ Random rectangle added')
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Random Rectangle
          </button>
          
          <button
            onClick={() => {
              if (fabricCanvas) {
                console.log('📊 Canvas info:', {
                  objects: fabricCanvas.getObjects().length,
                  width: fabricCanvas.getWidth(),
                  height: fabricCanvas.getHeight()
                })
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Debug Info
          </button>
        </div>
      </div>
    </div>
  )
}
