'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  X, 
  Search, 
  Filter, 
  Grid, 
  List,
  Image as ImageIcon,
  Sparkles,
  Clock,
  Star,
  ArrowRight
} from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  tags: string[]
  isPopular?: boolean
  isNew?: boolean
}

interface TemplateSelectorProps {
  isVisible: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
}

export default function TemplateSelector({ 
  isVisible, 
  onClose, 
  onSelectTemplate 
}: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [templates, setTemplates] = useState<Template[]>([])

  // 预设模板数据
  const defaultTemplates: Template[] = useMemo(() => [
    {
      id: 'social-media-post',
      name: '社交媒体帖子',
      description: '适合 Instagram、Facebook 等社交平台的图片模板',
      category: 'social',
      thumbnail: '/api/placeholder/300/200',
      tags: ['社交媒体', '帖子', '方形'],
      isPopular: true
    },
    {
      id: 'business-card',
      name: '名片设计',
      description: '专业的名片模板，适合商务使用',
      category: 'business',
      thumbnail: '/api/placeholder/300/200',
      tags: ['名片', '商务', '专业'],
      isNew: true
    },
    {
      id: 'poster-design',
      name: '海报设计',
      description: '活动海报和宣传单页模板',
      category: 'marketing',
      thumbnail: '/api/placeholder/300/200',
      tags: ['海报', '宣传', '活动'],
      isPopular: true
    },
    {
      id: 'profile-picture',
      name: '头像设计',
      description: '个人头像和社交媒体头像模板',
      category: 'personal',
      thumbnail: '/api/placeholder/300/200',
      tags: ['头像', '个人', '圆形'],
      isNew: true
    },
    {
      id: 'banner-design',
      name: '横幅设计',
      description: '网站横幅和广告横幅模板',
      category: 'web',
      thumbnail: '/api/placeholder/300/200',
      tags: ['横幅', '网站', '广告'],
      isPopular: true
    },
    {
      id: 'invitation-card',
      name: '邀请函',
      description: '活动邀请函和婚礼请柬模板',
      category: 'events',
      thumbnail: '/api/placeholder/300/200',
      tags: ['邀请函', '活动', '请柬']
    },
    {
      id: 'logo-design',
      name: 'Logo 设计',
      description: '品牌 Logo 和企业标识模板',
      category: 'branding',
      thumbnail: '/api/placeholder/300/200',
      tags: ['Logo', '品牌', '标识'],
      isNew: true
    },
    {
      id: 'presentation-slide',
      name: '演示文稿',
      description: 'PPT 幻灯片和演示文稿模板',
      category: 'presentation',
      thumbnail: '/api/placeholder/300/200',
      tags: ['演示', 'PPT', '幻灯片']
    }
  ], [])

  const categories = [
    { id: 'all', name: '全部', count: defaultTemplates.length },
    { id: 'social', name: '社交媒体', count: defaultTemplates.filter(t => t.category === 'social').length },
    { id: 'business', name: '商务', count: defaultTemplates.filter(t => t.category === 'business').length },
    { id: 'marketing', name: '营销', count: defaultTemplates.filter(t => t.category === 'marketing').length },
    { id: 'personal', name: '个人', count: defaultTemplates.filter(t => t.category === 'personal').length },
    { id: 'web', name: '网页', count: defaultTemplates.filter(t => t.category === 'web').length },
    { id: 'events', name: '活动', count: defaultTemplates.filter(t => t.category === 'events').length },
    { id: 'branding', name: '品牌', count: defaultTemplates.filter(t => t.category === 'branding').length },
    { id: 'presentation', name: '演示', count: defaultTemplates.filter(t => t.category === 'presentation').length }
  ]

  useEffect(() => {
    setTemplates(defaultTemplates)
  }, [defaultTemplates])

  // 过滤模板
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template)
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">选择模板</h2>
            <p className="text-gray-600">从预设模板开始你的创作</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* 侧边栏 */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
            {/* 搜索 */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索模板..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 分类 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">分类</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-xs text-gray-400">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 主内容区 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* 工具栏 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  找到 {filteredTemplates.length} 个模板
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 模板列表 */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="group cursor-pointer bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <div className="relative">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" aria-hidden="true" />
                      </div>
                      {template.isPopular && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          热门
                        </div>
                      )}
                      {template.isNew && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" />
                          新品
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">点击使用</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="group cursor-pointer bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:scale-102"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-8 h-8 text-gray-400" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          {template.isPopular && (
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                              热门
                            </span>
                          )}
                          {template.isNew && (
                            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                              新品
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到模板</h3>
              <p className="text-gray-500">尝试调整搜索条件或选择其他分类</p>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
