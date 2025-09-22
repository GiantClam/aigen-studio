'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  MousePointer2, 
  Square, 
  Type, 
  Wand2, 
  Download,
  CheckCircle,
  Sparkles
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  content: React.ReactNode
  target?: string // CSS selector for highlighting
}

interface OnboardingGuideProps {
  isVisible: boolean
  onComplete: () => void
  onSkip: () => void
}

export default function OnboardingGuide({ isVisible, onComplete, onSkip }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: '欢迎使用 AI 图像编辑器',
      description: '让我们快速了解如何使用这个强大的创作工具',
      icon: Sparkles,
      content: (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">开始你的创作之旅</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            这个编辑器集成了 AI 功能，让你轻松创建专业级的图像作品。
            我们将用 5 个简单步骤带你熟悉所有功能。
          </p>
        </div>
      )
    },
    {
      id: 'upload',
      title: '上传你的图片',
      description: '拖拽图片到画布或点击上传按钮',
      icon: Upload,
      target: '.upload-area',
      content: (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">三种上传方式：</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 拖拽图片到画布区域</li>
              <li>• 点击上传按钮选择文件</li>
              <li>• 使用 AI 生成新图片</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'tools',
      title: '使用编辑工具',
      description: '选择、绘制、添加文字和图形',
      icon: MousePointer2,
      target: '.toolbar',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <MousePointer2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">选择工具</p>
              <p className="text-xs text-gray-500">移动和编辑对象</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Square className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">绘制工具</p>
              <p className="text-xs text-gray-500">绘制图形和线条</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Type className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">文字工具</p>
              <p className="text-xs text-gray-500">添加文字内容</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Wand2 className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-medium">AI 工具</p>
              <p className="text-xs text-gray-500">智能编辑和生成</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-features',
      title: '体验 AI 功能',
      description: '使用 AI 智能编辑和生成图片',
      icon: Wand2,
      target: '.ai-edit-button',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">AI 功能包括：</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 智能图片编辑和优化</li>
              <li>• 根据文字描述生成图片</li>
              <li>• 自动背景移除和替换</li>
              <li>• 风格转换和滤镜效果</li>
            </ul>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              每次使用 AI 功能会消耗 5 积分，新用户注册赠送 100 积分
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'save-export',
      title: '保存和导出',
      description: '保存你的作品并导出为不同格式',
      icon: Download,
      target: '.save-button',
      content: (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center">
              <Download className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">导出选项：</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• PNG - 支持透明背景</li>
              <li>• JPEG - 适合照片和社交媒体</li>
              <li>• SVG - 矢量格式，可无限缩放</li>
              <li>• PDF - 适合打印和文档</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsAnimating(false)
      }, 200)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsAnimating(false)
      }, 200)
    }
  }

  const skipGuide = () => {
    onSkip()
  }

  if (!isVisible) return null

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
      
      {/* 引导内容 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentStepData.title}
                </h2>
                <p className="text-sm text-gray-500">
                  步骤 {currentStep + 1} / {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={skipGuide}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 进度条 */}
          <div className="px-6 py-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-6">
            <div className={`transition-all duration-200 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
              {currentStepData.content}
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentStep === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>上一步</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={skipGuide}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                跳过
              </button>
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                <span>{currentStep === steps.length - 1 ? '完成' : '下一步'}</span>
                {currentStep === steps.length - 1 ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
