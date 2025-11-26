'use client'

import { MousePointer2, Move, Brush, Square, Circle, Type, Upload, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToolType } from '@/core/tools/BaseTool'

export interface ToolbarProps {
  currentTool: ToolType
  onToolChange: (tool: ToolType) => void
  onUpload: () => void
  onDownload: () => void
  onDelete: () => void
  hasSelection?: boolean
}

interface ToolButton {
  type: ToolType
  icon: React.ReactNode
  label: string
  shortcut?: string
}

export function Toolbar({
  currentTool,
  onToolChange,
  onUpload,
  onDownload,
  onDelete,
  hasSelection = false
}: ToolbarProps) {
  const tools: ToolButton[] = [
    {
      type: ToolType.SELECT,
      icon: <MousePointer2 className="w-5 h-5" />,
      label: '选择',
      shortcut: 'V'
    },
    {
      type: ToolType.MOVE,
      icon: <Move className="w-5 h-5" />,
      label: '移动',
      shortcut: 'H'
    },
    {
      type: ToolType.BRUSH,
      icon: <Brush className="w-5 h-5" />,
      label: '画笔',
      shortcut: 'B'
    },
    {
      type: ToolType.RECTANGLE,
      icon: <Square className="w-5 h-5" />,
      label: '矩形',
      shortcut: 'R'
    },
    {
      type: ToolType.CIRCLE,
      icon: <Circle className="w-5 h-5" />,
      label: '圆形',
      shortcut: 'C'
    },
    {
      type: ToolType.TEXT,
      icon: <Type className="w-5 h-5" />,
      label: '文本',
      shortcut: 'T'
    }
  ]

  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-white border-r border-gray-200 w-16">
      {tools.map((tool) => (
        <Button
          key={tool.type}
          variant={currentTool === tool.type ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onToolChange(tool.type)}
          className="w-10 h-10 p-0"
          title={`${tool.label} (${tool.shortcut})`}
        >
          {tool.icon}
        </Button>
      ))}

      <div className="w-full h-px bg-gray-200 my-2" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onUpload}
        className="w-10 h-10 p-0"
        title="上传图片"
      >
        <Upload className="w-5 h-5" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onDownload}
        className="w-10 h-10 p-0"
        title="下载"
      >
        <Download className="w-5 h-5" />
      </Button>

      {hasSelection && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="w-10 h-10 p-0 text-red-500 hover:text-red-600"
          title="删除 (Delete)"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      )}
    </div>
  )
}
