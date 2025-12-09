'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Image as ImageIcon, Loader2, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export interface AIPanelProps {
  onGenerateAction: (prompt: string, settings: GenerationSettings) => Promise<void>
  isGenerating?: boolean
  selectedObjectsCount?: number
  availableProviders?: string[]
}

export interface GenerationSettings {
  provider: string
  aspectRatio: string
  quality: string
  type: 'text-to-image' | 'single-image-to-image' | 'multi-image-to-image' | 'edit'
  imageSize?: '1K' | '2K' | '4K'
  modelName?: string
}

export function AIPanel({
  onGenerateAction,
  isGenerating = false,
  selectedObjectsCount = 0,
  availableProviders = ['gemini']
}: AIPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<GenerationSettings>({
    provider: 'gemini',
    aspectRatio: '1:1',
    quality: 'high',
    type: 'text-to-image',
    imageSize: '1K',
    modelName: 'gemini-2.5-flash-image'
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (selectedObjectsCount > 0) {
      setSettings(prev => ({
        ...prev,
        type: selectedObjectsCount === 1 ? 'single-image-to-image' : 'multi-image-to-image'
      }))
    } else {
      setSettings(prev => ({ ...prev, type: 'text-to-image' }))
    }
  }, [selectedObjectsCount])

  const handleSubmit = async () => {
    if (!prompt.trim() || isGenerating) return

    await onGenerateAction(prompt, settings)
    setPrompt('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const getActionButtonText = () => {
    if (isGenerating) return '生成中...'
    if (selectedObjectsCount > 0) return `编辑选中的 ${selectedObjectsCount} 个对象`
    return '生成图片'
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="font-semibold text-gray-900">AI 助手</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {showSettings && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              提供商
            </label>
            <select
              value={settings.provider}
              onChange={(e) => setSettings({ ...settings, provider: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableProviders.map(provider => (
                <option key={provider} value={provider}>
                  {provider === 'gemini' ? 'Gemini 2.5 Flash' : 
                   provider === 'nanobanana-1' ? 'Nanobanana 1' :
                   provider === 'nanobanana-2' ? 'Nanobanana 2' : provider}
                </option>
              ))}
            </select>
          </div>

          {settings.provider === 'gemini' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                模型版本
              </label>
              <select
                value={settings.modelName}
                onChange={(e) => setSettings({ ...settings, modelName: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image</option>
                <option value="gemini-3-pro-image-preview">Gemini 3 Image Pro (Nanobanana Pro)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              宽高比
            </label>
            <select
              value={settings.aspectRatio}
              onChange={(e) => setSettings({ ...settings, aspectRatio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1:1">1:1 (正方形)</option>
              <option value="16:9">16:9 (横向)</option>
              <option value="9:16">9:16 (竖向)</option>
              <option value="4:3">4:3</option>
              <option value="3:4">3:4</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              输出尺寸
            </label>
            <select
              value={settings.imageSize}
              onChange={(e) => setSettings({ ...settings, imageSize: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1K">1K (1024)</option>
              <option value="2K">2K (2048)</option>
              <option value="4K">4K (4096)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              质量
            </label>
            <select
              value={settings.quality}
              onChange={(e) => setSettings({ ...settings, quality: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {selectedObjectsCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <ImageIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-blue-900">
                  已选中 {selectedObjectsCount} 个对象
                </p>
                <p className="text-blue-700 mt-1">
                  描述您想要的编辑效果，AI 将基于选中的内容生成新图片
                </p>
              </div>
            </div>
          )}

          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-900">
              <strong>提示：</strong>使用详细的描述可以获得更好的结果
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 space-y-3">
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedObjectsCount > 0
              ? '描述您想要的编辑效果...'
              : '描述您想要生成的图片...'
          }
          className="min-h-[100px] resize-none"
          disabled={isGenerating}
        />

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {getActionButtonText()}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {getActionButtonText()}
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          按 Ctrl/Cmd + Enter 快速发送
        </p>
      </div>
    </div>
  )
}
