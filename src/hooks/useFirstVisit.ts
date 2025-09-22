'use client'

import { useState, useEffect } from 'react'

interface FirstVisitState {
  isFirstVisit: boolean
  hasSeenOnboarding: boolean
  isLoading: boolean
}

/**
 * 首次访问检测 Hook
 * 用于检测用户是否第一次使用编辑器
 */
export function useFirstVisit() {
  const [state, setState] = useState<FirstVisitState>({
    isFirstVisit: false,
    hasSeenOnboarding: false,
    isLoading: true
  })

  useEffect(() => {
    const checkFirstVisit = () => {
      try {
        // 检查是否第一次访问编辑器
        const hasVisitedEditor = localStorage.getItem('hasVisitedEditor')
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true'
        
        setState({
          isFirstVisit: !hasVisitedEditor,
          hasSeenOnboarding,
          isLoading: false
        })
      } catch (error) {
        console.error('检查首次访问状态失败:', error)
        setState({
          isFirstVisit: false,
          hasSeenOnboarding: false,
          isLoading: false
        })
      }
    }

    checkFirstVisit()
  }, [])

  /**
   * 标记用户已访问编辑器
   */
  const markEditorVisited = () => {
    try {
      localStorage.setItem('hasVisitedEditor', 'true')
      setState(prev => ({ ...prev, isFirstVisit: false }))
    } catch (error) {
      console.error('标记编辑器访问失败:', error)
    }
  }

  /**
   * 标记用户已看过引导
   */
  const markOnboardingSeen = () => {
    try {
      localStorage.setItem('hasSeenOnboarding', 'true')
      setState(prev => ({ ...prev, hasSeenOnboarding: true }))
    } catch (error) {
      console.error('标记引导已看失败:', error)
    }
  }

  /**
   * 重置首次访问状态（用于测试）
   */
  const resetFirstVisit = () => {
    try {
      localStorage.removeItem('hasVisitedEditor')
      localStorage.removeItem('hasSeenOnboarding')
      setState({
        isFirstVisit: true,
        hasSeenOnboarding: false,
        isLoading: false
      })
    } catch (error) {
      console.error('重置首次访问状态失败:', error)
    }
  }

  /**
   * 检查是否应该显示引导
   */
  const shouldShowOnboarding = () => {
    return state.isFirstVisit && !state.hasSeenOnboarding
  }

  return {
    ...state,
    markEditorVisited,
    markOnboardingSeen,
    resetFirstVisit,
    shouldShowOnboarding
  }
}
