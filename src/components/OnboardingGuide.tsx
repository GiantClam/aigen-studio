'use client'

interface OnboardingGuideProps {
  isVisible: boolean
  onComplete: () => void
  onSkip: () => void
}

// 仅提供蒙层，不修改编辑器 DOM；点击任意位置关闭
export default function OnboardingGuide({ isVisible, onComplete, onSkip }: OnboardingGuideProps) {
  if (!isVisible) return null

  const handleClick = () => {
    onComplete()
  }

  // ESC 键关闭 + 定时自动隐藏（5 秒）
  // 为保证纯叠加不干扰编辑器，不做任何 DOM 改动，仅监听全局事件
  // 组件销毁时自动清理
  // 注意：若不需要自动隐藏，可改为更长时间或去掉计时器
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const React = require('react') as typeof import('react')
  // eslint-disable-next-line react-hooks/rules-of-hooks
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    const timer = window.setTimeout(() => {
      onComplete()
    }, 5000)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 cursor-pointer"
      onClick={handleClick}
      aria-label="onboarding-overlay"
      role="presentation"
    />
  )
}
