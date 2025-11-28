'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Heart, Share2, Download, Play, Settings, Star } from 'lucide-react'
import dynamic from 'next/dynamic'
import { generateSlug, formatSlugToTitle } from '@/lib/slug-utils'
import Image from 'next/image'

// 动态导入组件以避免SSR问题
const TemplateCard = dynamic(() => import('@/components/templates/TemplateCard'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-2xl h-64"></div>
})

interface Template {
  id: string
  name: string
  image_url: string
  prompt: string
  type: 'single-image' | 'multi-image' | 'text-to-image'
  created_at: string
  updated_at: string
}

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [parameters, setParameters] = useState({
    style: 'realistic',
    quality: 'high',
    aspectRatio: '1:1',
    creativity: 0.7
  })

  // 根据slug获取模板详情（优先后端按 slug 查询）
  useEffect(() => {
    const fetchTemplateBySlug = async () => {
      try {
        const slug = (params as any)?.slug as string | undefined
        if (!slug) { setLoading(false); return }
        const response = await fetch(`/api/templates/slug/${slug}`)
        if (response.ok) {
          const tpl = await response.json()
          setTemplate(tpl)
        } else {
          router.push('/templates')
        }
      } catch (error) {
        console.error('Failed to fetch template:', error)
        router.push('/templates')
      } finally {
        setLoading(false)
      }
    }

    fetchTemplateBySlug()
  }, [params, router])

  // 复制提示词
  const copyPrompt = () => {
    if (template) {
      navigator.clipboard.writeText(template.prompt)
      setToastMessage('Prompt copied')
      window.setTimeout(() => setToastMessage(null), 1500)
    }
  }

  // 使用模板
  const useTemplate = () => {
    if (template) {
      // 跳转到编辑器页面，并传递模板参数
      const templateData = {
        id: template.id,
        name: template.name,
        prompt: template.prompt,
        type: template.type,
        parameters
      }
      
      // 将模板数据存储到 sessionStorage
      sessionStorage.setItem('selectedTemplate', JSON.stringify(templateData))
      
      // 跳转到编辑器
      router.push('/editor-next')
    }
  }

  const shareTemplate = () => {
    if (!template) return
    const slug = (typeof window !== 'undefined') ? `${window.location.origin}/templates/${encodeURIComponent((template.name || '').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''))}` : ''
    const shareData = {
      title: template.name,
      text: 'Check out this AI image template',
      url: slug
    }
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      ;(navigator as any).share(shareData).catch(() => {/* ignore */})
    } else if (slug) {
      navigator.clipboard.writeText(shareData.url)
      setToastMessage('Link copied')
      window.setTimeout(() => setToastMessage(null), 1500)
    }
  }

  // 切换收藏状态
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited)
    // 这里可以添加收藏/取消收藏的API调用
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Template not found</h1>
            <button
              onClick={() => router.push('/templates')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Templates
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Templates</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：模板预览 */}
          <div className="space-y-6">
            {/* 主图 */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative w-full h-96">
                <Image
                  src={template.image_url}
                  alt={template.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* 轻量提示 */}
            {toastMessage && (
              <div className="text-center">
                <span className="inline-block bg-black/80 text-white text-xs px-3 py-1 rounded-full">{toastMessage}</span>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={useTemplate}
                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Use This Template</span>
              </button>
              
              <button
                onClick={toggleFavorite}
                className={`px-4 py-3 rounded-xl transition-colors flex items-center space-x-2 ${
                  isFavorited 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={copyPrompt}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <Copy className="w-5 h-5" />
                <span>Copy Prompt</span>
              </button>
              
              <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2">
                <Share2 className="w-5 h-5" onClick={shareTemplate} />
                <span onClick={shareTemplate}>Share</span>
              </button>
            </div>
          </div>

          {/* 右侧：模板信息 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{template.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {template.type.replace('-', ' ').toUpperCase()}
                    </span>
                    <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">4.8</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">
                This template helps you create stunning images using AI. Simply use the template 
                and customize the parameters to match your creative vision.
              </p>
            </div>

            {/* 提示词 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Prompt</h3>
                <button
                  onClick={copyPrompt}
                  className="text-blue-500 hover:text-blue-600 transition-colors flex items-center space-x-1"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copy</span>
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 font-mono leading-relaxed">
                  {template.prompt}
                </p>
              </div>
            </div>

            {/* 参数设置 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Parameters</h3>
              </div>
              
              <div className="space-y-4">
                {/* 风格 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                  <select
                    value={parameters.style}
                    onChange={(e) => setParameters(prev => ({ ...prev, style: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="realistic">Realistic</option>
                    <option value="artistic">Artistic</option>
                    <option value="cartoon">Cartoon</option>
                    <option value="anime">Anime</option>
                  </select>
                </div>

                {/* 质量 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
                  <select
                    value={parameters.quality}
                    onChange={(e) => setParameters(prev => ({ ...prev, quality: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>

                {/* 宽高比 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
                  <select
                    value={parameters.aspectRatio}
                    onChange={(e) => setParameters(prev => ({ ...prev, aspectRatio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1:1">Square (1:1)</option>
                    <option value="16:9">Widescreen (16:9)</option>
                    <option value="9:16">Portrait (9:16)</option>
                    <option value="4:3">Standard (4:3)</option>
                  </select>
                </div>

                {/* 创意度 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Creativity: {Math.round(parameters.creativity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={parameters.creativity}
                    onChange={(e) => setParameters(prev => ({ ...prev, creativity: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 使用说明 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                  <span>Click &quot;Use This Template&quot; to open the editor</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                  <span>Upload your image or start with text generation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                  <span>Adjust parameters and generate your image</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                  <span>Download or continue editing in the editor</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
