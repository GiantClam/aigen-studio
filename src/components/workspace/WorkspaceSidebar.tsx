'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Palette, 
  Layers, 
  Plus,
  Search
} from 'lucide-react'

interface WorkspaceSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onCreateCanvas: () => void
  searchQuery?: string
  onSearchChange?: (q: string) => void
}

export function WorkspaceSidebar({ activeTab, onTabChange, onCreateCanvas, searchQuery, onSearchChange }: WorkspaceSidebarProps) {
  const tabs = [
    { id: 'templates', label: '模板画布管理', icon: Palette },
  ]

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Palette className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-semibold text-gray-900">
            AI 图像编辑器
          </h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="搜索模板..." 
            className="pl-10 bg-gray-50 border-gray-200 focus:border-gray-300 text-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant="ghost"
                className={`w-full justify-start gap-3 text-sm font-medium h-9 ${
                  activeTab === tab.id 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            )
          })}
        </div>

        <div className="mt-8">
          <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-sm text-sm h-9" onClick={onCreateCanvas}>
            <Plus className="w-4 h-4 mr-2" />
            创建新画布
          </Button>
        </div>
      </div>
    </div>
  )
}
