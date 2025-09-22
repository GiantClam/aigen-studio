'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Upload, X } from 'lucide-react'
import Image from 'next/image'
import TemplateUpload from '@/components/TemplateUpload'

interface Template {
  id: string
  name: string
  image_url: string
  prompt: string
  type: string
  created_at: string
  updated_at: string
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  // 加载模板列表
  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/templates')
      const data = await response.json()
      
      if (response.ok) {
        setTemplates(data)
      } else {
        setError('加载模板失败')
      }
    } catch (err) {
      setError('网络错误')
      console.error('加载模板失败:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  // 处理上传成功
  const handleUploadSuccess = (newTemplate: Template) => {
    setTemplates(prev => [newTemplate, ...prev])
    setShowUpload(false)
  }

  // 删除模板
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个模板吗？')) return

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id))
      } else {
        setError('删除失败')
      }
    } catch (err) {
      setError('删除失败')
      console.error('删除模板失败:', err)
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  // 获取类型标签
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'TEXT_TO_IMAGE': '文生图',
      'SINGLE_IMAGE_GENERATION': '单图生图',
      'MULTI_IMAGE_GENERATION': '多图生图'
    }
    return labels[type] || type
  }

  // 获取类型颜色
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'TEXT_TO_IMAGE': 'bg-blue-100 text-blue-800',
      'SINGLE_IMAGE_GENERATION': 'bg-green-100 text-green-800',
      'MULTI_IMAGE_GENERATION': 'bg-purple-100 text-purple-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">模板管理</h1>
              <p className="text-sm text-gray-600">管理 AI 图像生成模板</p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>上传模板</span>
            </button>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 模板网格 */}
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无模板</h3>
            <p className="text-gray-600 mb-4">开始上传你的第一个模板</p>
            <button
              onClick={() => setShowUpload(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              上传模板
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 图片 */}
                <div className="aspect-square bg-gray-100 relative group">
                  <Image
                    src={template.image_url}
                    alt={template.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-image.png'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                      title="查看详情"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors"
                      title="删除模板"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 内容 */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate flex-1">
                      {template.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(template.type)}`}>
                      {getTypeLabel(template.type)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {template.prompt}
                  </p>
                  
                  <div className="text-xs text-gray-500">
                    创建于 {formatDate(template.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 上传模态框 */}
      {showUpload && (
        <TemplateUpload
          onSuccess={handleUploadSuccess}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* 详情模态框 */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">模板详情</h2>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 图片 */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={selectedTemplate.image_url}
                  alt={selectedTemplate.name}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* 信息 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    模板名称
                  </label>
                  <p className="text-gray-900">{selectedTemplate.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    类型
                  </label>
                  <span className={`px-3 py-1 text-sm rounded-full ${getTypeColor(selectedTemplate.type)}`}>
                    {getTypeLabel(selectedTemplate.type)}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    提示词
                  </label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedTemplate.prompt}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">创建时间:</span>
                    <br />
                    {formatDate(selectedTemplate.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">更新时间:</span>
                    <br />
                    {formatDate(selectedTemplate.updated_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
