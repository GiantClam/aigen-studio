'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Plus, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  Crown,
  Grid3X3,
  List
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

interface WorkspaceHeaderProps {
  onCreateCanvas: () => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function WorkspaceHeader({ 
  onCreateCanvas, 
  viewMode, 
  onViewModeChange,
  searchQuery,
  onSearchChange
}: WorkspaceHeaderProps) {
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              我的工作区
            </h1>
            <p className="text-sm text-gray-500 mt-1">管理你的 AI 创作画布</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="搜索画布、模板..." 
              className="pl-10 bg-gray-50 border-gray-200 focus:border-gray-300 text-sm h-9"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={`h-8 w-8 p-0 ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={`h-8 w-8 p-0 ${
                viewMode === 'list' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Create Button */}
          <Button 
            onClick={onCreateCanvas}
            className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm text-sm h-9"
          >
            <Plus className="w-4 h-4 mr-2" />
            创建画布
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                role="button"
                tabIndex={0}
                className="relative h-9 w-9 rounded-full p-0 inline-flex items-center justify-center hover:bg-gray-100"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(session?.user?.image as string) || "/logo.svg"} alt="User" />
                  <AvatarFallback className="bg-gray-900 text-white text-sm">
                    {(session?.user?.name?.charAt(0) as string) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-3">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">{session?.user?.name || '用户'}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>
                <Badge className="ml-auto bg-orange-100 text-orange-700 border-orange-200 text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm">
                <User className="mr-2 h-4 w-4" />
                个人资料
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm">
                <Settings className="mr-2 h-4 w-4" />
                设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 text-sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
