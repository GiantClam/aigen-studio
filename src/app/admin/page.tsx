'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/services/auth-service'
import { 
  Users, 
  Coins, 
  TrendingUp, 
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalPoints: number
  totalTransactions: number
  activeUsers: number
}

export default function AdminOverviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPoints: 0,
    totalTransactions: 0,
    activeUsers: 0
  })

  // 检查管理员权限
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (status === 'loading') return
      
      if (!session?.user?.email) {
        router.push('/login')
        return
      }
      
      try {
        const isAdmin = await AuthService.isAdmin(session.user.email)
        if (!isAdmin) {
          router.push('/')
          return
        }
      } catch (error) {
        console.error('检查管理员权限失败:', error)
        router.push('/')
        return
      }
      
      setLoading(false)
    }

    checkAdminAccess()
  }, [session, status, router])

  // 获取统计数据
  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // 获取用户统计
      const users = await AuthService.getAllUsers()
      const totalUsers = users.length
      const activeUsers = users.filter(user => {
        const lastActive = new Date(user.updated_at)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return lastActive > thirtyDaysAgo
      }).length

      // 获取积分统计
      const pointsResponse = await fetch('/api/points')
      const pointsData = await pointsResponse.json()
      const totalPoints = pointsData.success ? pointsData.data.current_points : 0

      // 获取交易统计
      const transactionsResponse = await fetch('/api/points/transactions?limit=1000')
      const transactionsData = await transactionsResponse.json()
      const totalTransactions = transactionsData.success ? transactionsData.data.length : 0

      setStats({
        totalUsers,
        totalPoints,
        totalTransactions,
        activeUsers
      })
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchStats()
    }
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: '总用户数',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      description: '已注册用户总数'
    },
    {
      title: '活跃用户',
      value: stats.activeUsers,
      icon: Activity,
      color: 'green',
      description: '30天内活跃用户'
    },
    {
      title: '总积分',
      value: stats.totalPoints,
      icon: Coins,
      color: 'yellow',
      description: '系统中总积分数量'
    },
    {
      title: '交易记录',
      value: stats.totalTransactions,
      icon: TrendingUp,
      color: 'purple',
      description: '积分交易总次数'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统概览</h1>
          <p className="text-gray-600">管理员控制面板总览</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>刷新数据</span>
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/points"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Coins className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="font-medium text-gray-900">积分管理</p>
              <p className="text-sm text-gray-500">管理用户积分和交易</p>
            </div>
          </a>
          
          <a
            href="/admin/users"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">用户管理</p>
              <p className="text-sm text-gray-500">管理用户账户和角色</p>
            </div>
          </a>
          
          <a
            href="/admin/settings"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <div>
              <p className="font-medium text-gray-900">系统设置</p>
              <p className="text-sm text-gray-500">配置系统参数</p>
            </div>
          </a>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">最近活动</h3>
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>活动记录功能开发中...</p>
        </div>
      </div>
    </div>
  )
}
