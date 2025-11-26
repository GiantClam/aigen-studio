"use client"

import { useState } from 'react'
import { Wand2, Sparkles, Palette, ImageIcon, Layers, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CreateCanvasModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateCanvas: (data: { name: string; type: string; description: string }) => void
}

const canvasTypes = [
  {
    id: 'text-to-image',
    label: '文本生图',
    description: '从文字描述生成AI图像',
    icon: Zap,
    color: 'text-blue-600'
  },
  {
    id: 'image-edit',
    label: '图片编辑',
    description: '智能编辑和美化现有图片',
    icon: ImageIcon,
    color: 'text-green-600'
  },
  {
    id: 'multi-image',
    label: '多图合成',
    description: '将多张图片进行艺术合成',
    icon: Layers,
    color: 'text-purple-600'
  },
  {
    id: 'template',
    label: '模板创作',
    description: '使用预设模板快速创作',
    icon: Palette,
    color: 'text-orange-600'
  }
]

export function CreateCanvasModal({ open, onOpenChange, onCreateCanvas }: CreateCanvasModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'text-to-image', // 默认选择第一个
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.type) {
      return
    }
    
    onCreateCanvas(formData)
    setFormData({ name: '', type: 'text-to-image', description: '' })
    onOpenChange(false)
  }

  const selectedType = canvasTypes.find(type => type.id === formData.type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            创建新画布
          </DialogTitle>
          <DialogDescription>
            创建一个新的AI创作画布，开始你的创意之旅
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Canvas Name */}
            <div className="space-y-2">
              <Label htmlFor="name">画布名称</Label>
              <Input
                id="name"
                placeholder="为你的画布起个名字..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            {/* Canvas Type - 使用简单的按钮组 */}
            <div className="space-y-2">
              <Label>画布类型</Label>
              <div className="grid grid-cols-2 gap-2">
                {canvasTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = formData.type === type.id
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                      className={`
                        p-3 rounded-lg border-2 transition-all text-left
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${type.color}`} />
                        <span className="font-medium text-sm">{type.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">描述（可选）</Label>
              <Textarea
                id="description"
                placeholder="描述你的创作想法..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Type Preview */}
            {selectedType && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white border ${selectedType.color}`}>
                    <selectedType.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{selectedType.label}</h4>
                    <p className="text-xs text-gray-500">{selectedType.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.name.trim() || !formData.type}
              className="bg-gray-900 hover:bg-gray-800"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              创建画布
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}