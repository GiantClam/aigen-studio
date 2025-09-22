'use client'

import { useEffect } from 'react'

interface OnboardingGuideProps {
  isVisible: boolean
  onComplete: () => void
  onSkip: () => void
}

// 仅提供蒙层，不修改编辑器 DOM；点击任意位置关闭
export default function OnboardingGuide({ isVisible, onComplete, onSkip }: OnboardingGuideProps) {
  // 不拦截鼠标事件，允许点击透传到编辑器；同时监听全局点击以关闭蒙层
  useEffect(() => {
    if (!isVisible) return
    const onAnyClick = () => onComplete()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onComplete()
    }
    document.addEventListener('click', onAnyClick, { once: true })
    window.addEventListener('keydown', onKeyDown)
    const timer = window.setTimeout(onComplete, 5000)
    return () => {
      document.removeEventListener('click', onAnyClick)
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 pointer-events-none select-none"
      aria-label="onboarding-overlay"
      role="presentation"
    />
  )
}
