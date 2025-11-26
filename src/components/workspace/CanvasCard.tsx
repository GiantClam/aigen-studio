'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MoreHorizontal, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  Calendar,
  Image as ImageIcon,
  Palette,
  Heart,
  Star,
  Clock,
  User
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Image from 'next/image'

interface CanvasCardProps {
  id: string
  title: string
  type: 'template'
  thumbnail?: string
  lastModified: string
  isNew?: boolean
  onOpen?: (id: string) => void
  onClick?: () => void
  onRename?: (id: string) => void
  onDelete?: (id: string) => void
  taskStatus?: 'pending' | 'in_progress' | 'failed' | 'succeeded'
  description?: string
  rating?: number
  ratingCount?: number
  usageCount?: number
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime?: number
  authorName?: string
  tags?: string[]
  isFavorited?: boolean
  onToggleFavorite?: (id: string) => void
}

const difficultyLabels = {
  'beginner': '初级',
  'intermediate': '中级',
  'advanced': '高级'
}

const difficultyColors = {
  'beginner': 'bg-green-100 text-green-700 border-green-200',
  'intermediate': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'advanced': 'bg-red-100 text-red-700 border-red-200'
}

export function CanvasCard({ 
  id, 
  title, 
  type, 
  thumbnail, 
  lastModified, 
  isNew = false,
  onOpen,
  onClick,
  onRename,
  onDelete,
  taskStatus,
  description,
  rating = 0,
  ratingCount = 0,
  usageCount = 0,
  difficultyLevel = 'beginner',
  estimatedTime = 15,
  authorName = 'AI设计师',
  tags = [],
  isFavorited = false,
  onToggleFavorite
}: CanvasCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite?.(id)
  }

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onOpen) {
      onOpen(id)
    }
  }

  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-200 bg-white overflow-hidden hover:border-gray-300 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (onOpen) {
          onOpen(id)
        } else if (onClick) {
          onClick()
        }
      }}
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-50 overflow-hidden">
          {thumbnail && !imageError ? (
            <Image 
              src={thumbnail} 
              alt={title}
              width={400}
              height={225}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <div className="text-white/90 text-center">
                <Palette className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm font-medium">{title}</p>
              </div>
            </div>
          )}
          
          {/* Overlay */}
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0 bg-white/95 hover:bg-white shadow-sm border-0 rounded-full"
                onClick={handleFavoriteClick}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    className="w-8 h-8 p-0 bg-white/95 hover:bg-white shadow-sm border-0 rounded-full inline-flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem className="text-sm" onClick={handleOpenClick}>
                    <Eye className="w-4 h-4 mr-2" />
                    预览
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm" onClick={(e) => { e.stopPropagation(); onRename?.(id) }}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    重命名
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm" onClick={(e) => { e.stopPropagation(); onDelete?.(id) }}>
                    <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="absolute bottom-2 left-2 right-2">
              <Button 
                size="sm" 
                className="w-full bg-white/95 text-gray-900 hover:bg-white shadow-sm border-0 h-8 font-medium"
                onClick={handleOpenClick}
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                打开模板
              </Button>
            </div>
          </div>

          {/* New Badge */}
          {isNew && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-green-500 text-white border-0 shadow-sm text-xs px-2 py-0.5 rounded-md font-medium">
                新建
              </Badge>
            </div>
          )}
          
          {/* Featured Badge */}
          {usageCount > 100 && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-yellow-500 text-white border-0 shadow-sm text-xs px-2 py-0.5 rounded-md font-medium">
                热门
              </Badge>
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm text-gray-900 truncate flex-1 mr-2 leading-tight">{title}</h3>
            <Badge 
              className={`text-xs ${difficultyColors[difficultyLevel]} border rounded-md px-2 py-0.5 font-medium`}
            >
              {difficultyLabels[difficultyLevel]}
            </Badge>
          </div>
          
          {description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">{description}</p>
          )}
          
          {/* Stats */}
          <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span>{rating.toFixed(1)}</span>
                  {ratingCount > 0 && <span>({ratingCount})</span>}
                </div>
              )}
              {usageCount > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{usageCount}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{estimatedTime}分钟</span>
            </div>
          </div>
          
          {/* Author */}
          <div className="flex items-center gap-1 mb-3 text-xs text-gray-500">
            <User className="w-3 h-3" />
            <span>{authorName}</span>
          </div>
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 border-gray-200 text-gray-600">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 border-gray-200 text-gray-600">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Last Modified */}
          <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{lastModified}</span>
            </div>
            {taskStatus && (
              <div className="text-xs">
                {taskStatus === 'in_progress' && <span className="text-blue-600 font-medium">处理中...</span>}
                {taskStatus === 'pending' && <span className="text-gray-600 font-medium">等待中</span>}
                {taskStatus === 'succeeded' && <span className="text-green-600 font-medium">已完成</span>}
                {taskStatus === 'failed' && <span className="text-red-600 font-medium">失败</span>}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}