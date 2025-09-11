'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'

interface Filters {
  type: string
  difficulty: string
  style: string
}

interface SearchFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      type: 'all',
      difficulty: 'all',
      style: 'all'
    })
  }

  const hasActiveFilters = filters.type !== 'all' || filters.difficulty !== 'all' || filters.style !== 'all'

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
            {[filters.type, filters.difficulty, filters.style].filter(f => f !== 'all').length}
          </span>
        )}
      </button>

      {isExpanded && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* 筛选面板 */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-500 hover:text-blue-600 transition-colors flex items-center space-x-1"
                >
                  <X className="w-3 h-3" />
                  <span>Clear all</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* 类型筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'all', label: 'All Types' },
                    { value: 'single-image', label: 'Single Image' },
                    { value: 'multi-image', label: 'Multi Image' },
                    { value: 'text-to-image', label: 'Text to Image' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('type', option.value)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        filters.type === option.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 难度筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'easy', label: 'Easy' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'hard', label: 'Hard' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('difficulty', option.value)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        filters.difficulty === option.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 风格筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'all', label: 'All Styles' },
                    { value: 'realistic', label: 'Realistic' },
                    { value: 'artistic', label: 'Artistic' },
                    { value: 'cartoon', label: 'Cartoon' },
                    { value: 'anime', label: 'Anime' },
                    { value: 'abstract', label: 'Abstract' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('style', option.value)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        filters.style === option.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 应用按钮 */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsExpanded(false)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
