'use client'

import { useState } from 'react'
import { 
  Move, Type, Square, Circle, Palette, Trash2, 
  ChevronUp, ChevronDown, MoreHorizontal 
} from 'lucide-react'

interface MobileToolbarProps {
  selectedTool: string
  brushColor: string
  onToolSelect: (tool: string) => void
  onColorChange: (color: string) => void
  onAddText: () => void
  onAddRectangle: () => void
  onAddCircle: () => void
  onDeleteSelected: () => void
}

export function MobileToolbar({
  selectedTool,
  brushColor,
  onToolSelect,
  onColorChange,
  onAddText,
  onAddRectangle,
  onAddCircle,
  onDeleteSelected
}: MobileToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const tools = [
    {
      id: 'select',
      icon: Move,
      label: '选择',
      color: 'blue',
      action: () => onToolSelect('select')
    },
    {
      id: 'text',
      icon: Type,
      label: '文本',
      color: 'purple',
      action: () => onToolSelect('text')
    },
    {
      id: 'rectangle',
      icon: Square,
      label: '矩形',
      color: 'green',
      action: () => onToolSelect('rectangle')
    },
    {
      id: 'circle',
      icon: Circle,
      label: '圆形',
      color: 'orange',
      action: () => onToolSelect('circle')
    }
  ]

  const getToolColor = (toolId: string, color: string) => {
    if (selectedTool === toolId) {
      switch (color) {
        case 'blue': return 'bg-blue-500 text-white'
        case 'purple': return 'bg-purple-500 text-white'
        case 'green': return 'bg-green-500 text-white'
        case 'orange': return 'bg-orange-500 text-white'
        default: return 'bg-gray-500 text-white'
      }
    }
    return 'bg-white/10 text-white/70 hover:bg-white/20'
  }

  return (
    <>
      {/* 移动端底部工具栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10 z-40 md:hidden">
        {/* 展开/收起按钮 */}
        <div className="flex justify-center py-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-full text-white/80"
          >
            <Palette className="w-4 h-4" />
            <span className="text-sm">工具</span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* 工具栏内容 */}
        {isExpanded && (
          <div className="px-4 pb-4">
            {/* 主要工具 */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {tools.map((tool) => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.id}
                    onClick={tool.action}
                    className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-200 ${getToolColor(tool.id, tool.color)}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{tool.label}</span>
                  </button>
                )
              })}
            </div>

            {/* 颜色选择和操作 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-white/80 text-sm">颜色:</span>
                  <div className="relative">
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => onColorChange(e.target.value)}
                      className="w-8 h-8 rounded-lg border-2 border-white/20 cursor-pointer"
                      style={{ backgroundColor: brushColor }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={onDeleteSelected}
                className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors border border-red-500/30"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">删除</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 平板端侧边工具栏 */}
      <div className="hidden md:block lg:hidden fixed left-0 top-16 bottom-0 w-16 bg-black/20 backdrop-blur-sm border-r border-white/10 z-30">
        <div className="flex flex-col items-center py-4 space-y-3">
          {/* 工具标题 */}
          <div className="text-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-1">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-white/60">工具</p>
          </div>

          {/* 工具按钮 */}
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <div key={tool.id} className="relative group">
                <button
                  onClick={tool.action}
                  className={`p-2 rounded-lg transition-all duration-200 ${getToolColor(tool.id, tool.color)}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
                <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {tool.label}
                </div>
              </div>
            )
          })}

          <div className="w-full h-px bg-white/20 my-2"></div>

          {/* 颜色选择器 */}
          <div className="relative group">
            <div className="p-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <input
                type="color"
                value={brushColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                style={{ backgroundColor: brushColor }}
              />
            </div>
            <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              选择颜色
            </div>
          </div>

          <div className="w-full h-px bg-white/20 my-2"></div>

          {/* 删除按钮 */}
          <div className="relative group">
            <button
              onClick={onDeleteSelected}
              className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              删除选中
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
