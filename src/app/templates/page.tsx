'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Grid, List, Star, Clock, TrendingUp } from 'lucide-react'
import dynamic from 'next/dynamic'

// 动态导入组件以避免SSR问题
const TemplateCard = dynamic(() => import('@/components/templates/TemplateCard'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-2xl h-64"></div>
})

const SearchFilters = dynamic(() => import('@/components/templates/SearchFilters'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-24"></div>
})

const CategoryNav = dynamic(() => import('@/components/templates/CategoryNav'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-12 w-full"></div>
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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popular' | 'latest' | 'rating'>('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState({
    type: 'all',
    difficulty: 'all',
    style: 'all'
  })

  // 获取模板数据
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setError(null)
        const response = await fetch('/api/templates')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setTemplates(data)
        setFilteredTemplates(data)
      } catch (error) {
        console.error('Failed to fetch templates:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch templates')
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  // 搜索和筛选逻辑
  useEffect(() => {
    if (!Array.isArray(templates)) {
      setFilteredTemplates([])
      return
    }
    
    let filtered = [...templates]

    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.type === selectedCategory)
    }

    // 类型过滤
    if (filters.type !== 'all') {
      filtered = filtered.filter(template => template.type === filters.type)
    }

    // 排序
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'rating':
        // 这里可以根据实际评分数据排序
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'popular':
      default:
        // 默认按名称排序，实际应用中可以根据使用次数排序
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    setFilteredTemplates(filtered)
  }, [templates, searchQuery, selectedCategory, filters, sortBy])

  const categories = [
    { id: 'all', name: 'All Templates', count: Array.isArray(templates) ? templates.length : 0 },
    { id: 'single-image', name: 'Single Image', count: Array.isArray(templates) ? templates.filter(t => t.type === 'single-image').length : 0 },
    { id: 'multi-image', name: 'Multi Image', count: Array.isArray(templates) ? templates.filter(t => t.type === 'multi-image').length : 0 },
    { id: 'text-to-image', name: 'Text to Image', count: Array.isArray(templates) ? templates.filter(t => t.type === 'text-to-image').length : 0 }
  ]

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Templates</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Templates</h1>
          <p className="text-lg text-gray-600">
            Discover and use powerful AI templates for image generation and editing
          </p>
        </div>

        {/* 搜索栏 */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 分类导航 */}
        <CategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* 工具栏 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          {/* 筛选器 */}
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
          />

          {/* 排序和视图切换 */}
          <div className="flex items-center space-x-4">
            {/* 排序 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">Popular</option>
                <option value="latest">Latest</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            {/* 视图切换 */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 结果统计 */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredTemplates.length} of {templates.length} templates
          </p>
        </div>

        {/* 模板网格 */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all templates
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setFilters({ type: 'all', difficulty: 'all', style: 'all' })
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredTemplates.map((template) => {
              try {
                return (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    viewMode={viewMode}
                  />
                )
              } catch (error) {
                console.error('Error rendering template card:', error)
                return (
                  <div key={template.id} className="bg-white rounded-2xl shadow-lg p-4">
                    <div className="text-center text-gray-500">
                      <p>Error loading template: {template.name}</p>
                    </div>
                  </div>
                )
              }
            })}
          </div>
        )}
      </div>
    </div>
  )
}
