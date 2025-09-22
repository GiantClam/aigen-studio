'use client'

import { useState, useCallback } from 'react'

interface UsePointsResult {
  deductPoints: () => Promise<{
    success: boolean
    message: string
    points?: number
  }>
  loading: boolean
  error: string | null
}

/**
 * 积分扣除 Hook
 * 用于 AI 生成图片时扣除积分
 */
export function usePoints(): UsePointsResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deductPoints = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/points/ai-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        return {
          success: true,
          message: data.data.message,
          points: data.data.points
        }
      } else {
        const errorMessage = data.error || '扣除积分失败'
        setError(errorMessage)
        return {
          success: false,
          message: errorMessage
        }
      }
    } catch (err) {
      const errorMessage = '网络错误，请重试'
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    deductPoints,
    loading,
    error
  }
}

/**
 * 积分检查 Hook
 * 检查用户是否有足够积分进行 AI 生成
 */
export function usePointsCheck() {
  const [points, setPoints] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkPoints = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/points')
      const data = await response.json()

      if (data.success) {
        setPoints(data.data.current_points)
        return {
          success: true,
          points: data.data.current_points,
          message: '积分检查成功'
        }
      } else {
        const errorMessage = data.error || '获取积分失败'
        setError(errorMessage)
        return {
          success: false,
          message: errorMessage
        }
      }
    } catch (err) {
      const errorMessage = '网络错误'
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const hasEnoughPoints = useCallback((requiredPoints: number = 5) => {
    return points !== null && points >= requiredPoints
  }, [points])

  return {
    points,
    loading,
    error,
    checkPoints,
    hasEnoughPoints
  }
}
