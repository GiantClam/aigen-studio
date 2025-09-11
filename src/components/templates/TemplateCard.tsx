'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Star, Clock, Play, Copy, Share2 } from 'lucide-react'
import { generateSlug } from '@/lib/slug-utils'

interface Template {
  id: string
  name: string
  image_url: string
  prompt: string
  type: 'single-image' | 'multi-image' | 'text-to-image'
  created_at: string
  updated_at: string
}

interface TemplateCardProps {
  template: Template
  viewMode: 'grid' | 'list'
}

export default function TemplateCard({ template, viewMode }: TemplateCardProps) {
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleUseTemplate = () => {
    if (!mounted) return
    
    // 将模板数据存储到 sessionStorage
    const templateData = {
      id: template.id,
      name: template.name,
      prompt: template.prompt,
      type: template.type
    }
    sessionStorage.setItem('selectedTemplate', JSON.stringify(templateData))
    
    // 跳转到编辑器
    router.push('/standard-editor')
  }

  const handleViewDetails = () => {
    if (!mounted) return
    const slug = generateSlug(template.name)
    router.push(`/templates/${slug}`)
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorited(!isFavorited)
  }

  const copyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(template.prompt)
    setToastMessage('Prompt copied')
    window.setTimeout(() => setToastMessage(null), 1500)
  }

  const shareTemplate = (e: React.MouseEvent) => {
    e.stopPropagation()
    const slug = generateSlug(template.name)
    const url = typeof window !== 'undefined' ? `${window.location.origin}/templates/${slug}` : ''
    const shareData = {
      title: template.name,
      text: 'Check out this AI image template',
      url
    }
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      ;(navigator as any).share(shareData).catch(() => {/* ignore */})
    } else if (url) {
      navigator.clipboard.writeText(url)
      setToastMessage('Link copied')
      window.setTimeout(() => setToastMessage(null), 1500)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'single-image':
        return 'bg-blue-100 text-blue-700'
      case 'multi-image':
        return 'bg-green-100 text-green-700'
      case 'text-to-image':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'single-image':
        return 'Single Image'
      case 'multi-image':
        return 'Multi Image'
      case 'text-to-image':
        return 'Text to Image'
      default:
        return type
    }
  }

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl shadow-lg animate-pulse">
        <div className="aspect-square bg-gray-200"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
        onClick={handleViewDetails}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex">
          {/* 图片 */}
          <div className="w-48 h-32 flex-shrink-0">
            <img
              src={template.image_url}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* 内容 */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {template.name}
                </h3>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                    {getTypeLabel(template.type)}
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(template.created_at).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    isFavorited 
                      ? 'bg-red-100 text-red-500' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">4.8</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {template.prompt.length > 150 
                ? `${template.prompt.substring(0, 150)}...` 
                : template.prompt
              }
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUseTemplate}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Use Template</span>
                </button>
                
                <button
                  onClick={copyPrompt}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                
                <button
                  onClick={shareTemplate}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={handleViewDetails}
                className="text-blue-500 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                View Details →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
      onClick={handleViewDetails}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 图片 */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={template.image_url}
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* 悬停覆盖层 */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-2">
            <button
              onClick={handleUseTemplate}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Use</span>
            </button>
            
            <button
              onClick={copyPrompt}
              className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            
            <button
              onClick={shareTemplate}
              className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* 收藏按钮 */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isFavorited 
              ? 'bg-red-500 text-white' 
              : 'bg-white bg-opacity-80 text-gray-600 hover:bg-opacity-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>
        
        {/* 类型标签 */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
            {getTypeLabel(template.type)}
          </span>
        </div>

        {/* 轻量提示 */}
        {toastMessage && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-full">
            {toastMessage}
          </div>
        )}
      </div>
      
      {/* 内容 */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {template.name}
          </h3>
          
          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">4.8</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {template.prompt.length > 100 
            ? `${template.prompt.substring(0, 100)}...` 
            : template.prompt
          }
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(template.created_at).toLocaleDateString()}</span>
          </span>
          
          <button
            onClick={handleViewDetails}
            className="text-blue-500 hover:text-blue-600 transition-colors font-medium"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}
