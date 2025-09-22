'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/services/auth-service'
import PointsDisplay from '@/components/PointsDisplay'
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Settings,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react'

interface UserPoints {
  id: string
  user_id: string
  current_points: number
  total_earned: number
  total_spent: number
  created_at: string
  updated_at: string
}

interface PointTransaction {
  id: string
  user_id: string
  points: number
  transaction_type: 'earn' | 'spend' | 'refund'
  source: 'registration' | 'daily_login' | 'ai_generation' | 'admin_adjustment'
  description: string
  metadata?: any
  created_at: string
}

interface PointRule {
  id: string
  rule_name: string
  rule_type: string
  points_value: number
  is_active: boolean
  description: string
}

export default function PointsAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'rules' | 'users'>('overview')
  
  // 数据状态
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null)
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [rules, setRules] = useState<PointRule[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])

  // 搜索和过滤
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

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

  // 获取用户积分信息
  const fetchUserPoints = useCallback(async () => {
    try {
      const response = await fetch('/api/points')
      const data = await response.json()
      
      if (data.success) {
        setUserPoints(data.data)
      }
    } catch (error) {
      console.error('获取用户积分失败:', error)
    }
  }, [])

  // 获取积分交易记录
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`/api/points/transactions?limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}`)
      const data = await response.json()
      
      if (data.success) {
        setTransactions(data.data)
      }
    } catch (error) {
      console.error('获取交易记录失败:', error)
    }
  }, [itemsPerPage, currentPage])

  // 获取积分规则
  const fetchRules = useCallback(async () => {
    try {
      const response = await fetch('/api/points/rules')
      const data = await response.json()
      
      if (data.success) {
        setRules(data.data)
      }
    } catch (error) {
      console.error('获取积分规则失败:', error)
    }
  }, [])

  // 刷新所有数据
  const refreshData = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      fetchUserPoints(),
      fetchTransactions(),
      fetchRules()
    ])
    setLoading(false)
  }, [fetchUserPoints, fetchTransactions, fetchRules])

  useEffect(() => {
    if (session) {
      refreshData()
    }
  }, [session, currentPage, refreshData])

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  // 获取交易类型颜色
  const getTransactionColor = (type: string, points: number) => {
    if (points > 0) {
      return 'text-green-600 bg-green-50'
    } else {
      return 'text-red-600 bg-red-50'
    }
  }

  // 获取来源文本
  const getSourceText = (source: string) => {
    const sourceMap: Record<string, string> = {
      'registration': '注册赠送',
      'daily_login': '每日登录',
      'ai_generation': 'AI 生成',
      'admin_adjustment': '管理员调整'
    }
    return sourceMap[source] || source
  }

  // 过滤交易记录
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || transaction.transaction_type === filterType
    return matchesSearch && matchesFilter
  })

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">积分管理</h1>
              <p className="text-gray-600">管理用户积分和交易记录</p>
            </div>
            <button
              onClick={refreshData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>刷新</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标签页 */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: '概览', icon: Coins },
              { id: 'transactions', label: '交易记录', icon: TrendingUp },
              { id: 'rules', label: '积分规则', icon: Settings },
              { id: 'users', label: '用户管理', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* 概览标签页 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 我的积分 */}
            <PointsDisplay showHistory={true} />
            
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Coins className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">当前积分</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userPoints?.current_points || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">累计获得</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userPoints?.total_earned || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">累计消费</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userPoints?.total_spent || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 交易记录标签页 */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* 搜索和过滤 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="搜索交易记录..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">所有类型</option>
                    <option value="earn">获得积分</option>
                    <option value="spend">消费积分</option>
                    <option value="refund">退款</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 交易记录列表 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        类型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        来源
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        描述
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        积分变化
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.transaction_type === 'earn' 
                              ? 'bg-green-100 text-green-800'
                              : transaction.transaction_type === 'spend'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {transaction.transaction_type === 'earn' ? '获得' : 
                             transaction.transaction_type === 'spend' ? '消费' : '退款'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getSourceText(transaction.source)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.points > 0 ? '+' : ''}{transaction.points}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  暂无交易记录
                </div>
              )}
            </div>
          </div>
        )}

        {/* 积分规则标签页 */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">积分规则配置</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {rules.map((rule) => (
                  <div key={rule.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {rule.rule_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {rule.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`text-lg font-bold ${
                          rule.points_value > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {rule.points_value > 0 ? '+' : ''}{rule.points_value}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rule.is_active 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.is_active ? '启用' : '禁用'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 用户管理标签页 */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">用户积分管理</h3>
              <p className="text-gray-500">
                用户管理功能正在开发中...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
