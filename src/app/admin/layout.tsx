'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/services/auth-service'
import { 
  Shield, 
  Coins, 
  Users, 
  Settings, 
  BarChart3,
  LogOut,
  Home,
  AlertTriangle
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  // 检查管理员权限
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (status === 'loading') return
      
      if (!session?.user?.email) {
        router.push('/login')
        return
      }

      try {
        // 使用 email 作为用户标识符
        const adminCheck = await AuthService.isAdmin(session.user.email)
        setIsAdmin(adminCheck)
        
        if (!adminCheck) {
          // 非管理员用户，重定向到首页
          router.push('/')
          return
        }
      } catch (error) {
        console.error('检查管理员权限失败:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [session, status, router])

  // 导航菜单项
  const menuItems = [
    {
      id: 'overview',
      label: '概览',
      icon: BarChart3,
      href: '/admin',
      description: '系统概览和统计'
    },
    {
      id: 'points',
      label: '积分管理',
      icon: Coins,
      href: '/admin/points',
      description: '管理用户积分和交易记录'
    },
    {
      id: 'users',
      label: '用户管理',
      icon: Users,
      href: '/admin/users',
      description: '管理用户账户和角色'
    },
    {
      id: 'settings',
      label: '系统设置',
      icon: Settings,
      href: '/admin/settings',
      description: '系统配置和参数'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">检查权限中...</p>
        </div>
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">访问被拒绝</h1>
          <p className="text-gray-600 mb-6">
            您没有管理员权限，无法访问此页面。
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              返回首页
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              返回上页
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo 和标题 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">管理面板</h1>
              </div>
            </div>

            {/* 用户信息和操作 */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                欢迎，{session?.user?.name || session?.user?.email}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>返回首页</span>
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                  onClick={() => router.push('/api/auth/signout')}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = typeof window !== 'undefined' && 
                  window.location.pathname === item.href
                
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
