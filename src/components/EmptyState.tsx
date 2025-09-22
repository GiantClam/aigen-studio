'use client'

import { useState } from 'react'
import { 
  Upload, 
  Sparkles, 
  Image, 
  Wand2, 
  Download,
  MousePointer2,
  Square,
  Type,
  ArrowRight,
  Play
} from 'lucide-react'

interface EmptyStateProps {
  onUpload: () => void
  onAIGenerate: () => void
  onShowTemplates: () => void
  onStartGuide: () => void
}

export default function EmptyState({ 
  onUpload, 
  onAIGenerate, 
  onShowTemplates, 
  onStartGuide 
}: EmptyStateProps) {
  const [isHovered, setIsHovered] = useState<string | null>(null)

  const quickActions = [
    {
      id: 'upload',
      title: '上传图片',
      description: '拖拽或点击上传你的图片',
      icon: Upload,
      color: 'blue',
      action: onUpload
    },
    {
      id: 'ai-generate',
      title: 'AI 生成',
      description: '用文字描述生成图片',
      icon: Wand2,
      color: 'purple',
      action: onAIGenerate
    },
    {
      id: 'templates',
      title: '选择模板',
      description: '从预设模板开始创作',
      icon: Image,
      color: 'green',
      action: onShowTemplates
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
      green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center max-w-2xl mx-auto px-6">
        {/* 主标题和描述 */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            开始你的创作之旅
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            使用 AI 图像编辑器，轻松创建专业级作品
          </p>
          <p className="text-sm text-gray-500">
            支持图片编辑、AI 生成、模板设计等多种功能
          </p>
        </div>

        {/* 快速操作按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={action.action}
                onMouseEnter={() => setIsHovered(action.id)}
                onMouseLeave={() => setIsHovered(null)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${getColorClasses(action.color)} ${
                  isHovered === action.id ? 'scale-105 shadow-lg' : 'hover:scale-102'
                }`}
              >
                <Icon className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                <p className="text-sm opacity-80">{action.description}</p>
                <div className="mt-3 flex items-center justify-center text-sm font-medium">
                  开始创作
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            )
          })}
        </div>

        {/* 功能预览 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">功能特色</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <MousePointer2 className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">选择编辑</p>
              <p className="text-xs text-gray-500">精确控制</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Square className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">绘制工具</p>
              <p className="text-xs text-gray-500">自由创作</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Type className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">文字设计</p>
              <p className="text-xs text-gray-500">丰富样式</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Download className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">多格式导出</p>
              <p className="text-xs text-gray-500">PNG/JPEG/SVG</p>
            </div>
          </div>
        </div>

        {/* 引导和帮助 */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onStartGuide}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Play className="w-4 h-4" />
            <span>观看引导教程</span>
          </button>
          <button
            onClick={onStartGuide}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>需要帮助？</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 text-xs text-gray-400">
          <p>💡 提示：拖拽图片到画布区域即可开始编辑</p>
        </div>
      </div>
    </div>
  )
}
