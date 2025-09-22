'use client'

import { useState, useEffect, useCallback } from 'react'
import { Coins, TrendingUp, TrendingDown, History } from 'lucide-react'

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

interface PointsDisplayProps {
  className?: string
  showHistory?: boolean
  compact?: boolean
}

export default function PointsDisplay({ 
  className = '', 
  showHistory = false, 
  compact = false 
}: PointsDisplayProps) {
  const [points, setPoints] = useState<UserPoints | null>(null)
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 获取用户积分信息
  const fetchPoints = useCallback(async () => {
    try {
      const response = await fetch('/api/points')
      const data = await response.json()
      
      if (data.success) {
        setPoints(data.data)
      } else {
        setError(data.error || '获取积分失败')
      }
    } catch (err) {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }, [])

  // 获取积分交易记录
  const fetchTransactions = useCallback(async () => {
    if (!showHistory) return
    
    try {
      const response = await fetch('/api/points/transactions?limit=10')
      const data = await response.json()
      
      if (data.success) {
        setTransactions(data.data)
      }
    } catch (err) {
      console.error('获取交易记录失败:', err)
    }
  }, [showHistory])

  // 处理每日登录
  const handleDailyLogin = async () => {
    try {
      const response = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'daily_login' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 刷新积分信息
        await fetchPoints()
        alert(data.data.message)
      } else {
        alert(data.error || '登录积分获取失败')
      }
    } catch (err) {
      alert('网络错误')
    }
  }

  useEffect(() => {
    fetchPoints()
    fetchTransactions()
  }, [showHistory, fetchPoints, fetchTransactions])

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-600">加载中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 text-red-600 ${className}`}>
        <Coins className="w-4 h-4" />
        <span className="text-sm">积分加载失败</span>
      </div>
    )
  }

  if (!points) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getTransactionIcon = (type: string, points: number) => {
    if (points > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    }
  }

  const getTransactionColor = (type: string, points: number) => {
    if (points > 0) {
      return 'text-green-600'
    } else {
      return 'text-red-600'
    }
  }

  const getSourceText = (source: string) => {
    const sourceMap: Record<string, string> = {
      'registration': '注册赠送',
      'daily_login': '每日登录',
      'ai_generation': 'AI 生成',
      'admin_adjustment': '管理员调整'
    }
    return sourceMap[source] || source
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Coins className="w-4 h-4 text-yellow-500" />
        <span className="text-sm font-medium text-gray-800">
          {points.current_points} 积分
        </span>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      {/* 积分概览 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-800">我的积分</h3>
        </div>
        <button
          onClick={handleDailyLogin}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
        >
          每日登录
        </button>
      </div>

      {/* 积分统计 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {points.current_points}
          </div>
          <div className="text-sm text-gray-600">当前积分</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {points.total_earned}
          </div>
          <div className="text-sm text-gray-600">累计获得</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {points.total_spent}
          </div>
          <div className="text-sm text-gray-600">累计消费</div>
        </div>
      </div>

      {/* 交易记录 */}
      {showHistory && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <History className="w-4 h-4 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-700">最近交易</h4>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-4">
                暂无交易记录
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.transaction_type, transaction.points)}
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {getSourceText(transaction.source)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(transaction.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${getTransactionColor(transaction.transaction_type, transaction.points)}`}>
                    {transaction.points > 0 ? '+' : ''}{transaction.points}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
