'use client'

import PointsDisplay from '@/components/PointsDisplay'
import { useEffect, useState } from 'react'

export default function PointsPage() {
  const [open, setOpen] = useState<{ visible: boolean; plan?: string }>({ visible: false })
  const plans = [
    { id: 'starter', title: '入门包', credits: 100, price: 19, desc: '适合轻量使用，体验基础功能' },
    { id: 'pro', title: '专业包', credits: 500, price: 79, desc: '稳定创作频率，升级体验' },
    { id: 'studio', title: '工作室包', credits: 1000, price: 149, desc: '团队协作与高频创作' },
  ]
  const [credited, setCredited] = useState<any[]>([])
  const [loadingCredited, setLoadingCredited] = useState(true)
  const formatDate = (s: string) => new Date(s).toLocaleString('zh-CN')
  const getSourceText = (source: string) => {
    const map: Record<string, string> = {
      registration: '注册赠送',
      daily_login: '每日登录',
      ai_generation: 'AI 生成',
      admin_adjustment: '管理员调整',
    }
    return map[source] || source
  }
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/points/transactions?limit=100')
        const data = await res.json()
        if (data && data.success && Array.isArray(data.data)) {
          const list = data.data.filter((t: any) => (t?.points || 0) > 0)
          if (!cancelled) setCredited(list)
        }
      } catch {}
      finally {
        if (!cancelled) setLoadingCredited(false)
      }
    })()
    return () => { cancelled = true }
  }, [])
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">我的积分</h1>
          <p className="text-gray-600">查看积分余额与最近交易</p>
        </div>
        <PointsDisplay showHistory className="" />

        <div className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900">积分到账记录</h2>
            <span className="text-xs text-gray-500">最近 100 条</span>
          </div>
          {loadingCredited ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">加载中...</span>
            </div>
          ) : credited.length === 0 ? (
            <div className="text-sm text-gray-500">暂无到账记录</div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 divide-y">
              {credited.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{getSourceText(t.source)}</div>
                    <div className="text-xs text-gray-500">{formatDate(t.created_at)}</div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">+{t.points}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">充值与购买</h2>
              <p className="text-gray-600">使用 Stripe 支付购买积分（当前为展示，未启用支付）</p>
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">Stripe</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-baseline justify-between">
                  <div className="font-semibold text-gray-900">{plan.title}</div>
                  <div className="text-sm text-gray-500">{plan.credits} 积分</div>
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900">${plan.price}</div>
                <div className="mt-1 text-xs text-gray-500">USD</div>
                <div className="mt-3 text-sm text-gray-600">{plan.desc}</div>
                <button
                  onClick={() => setOpen({ visible: true, plan: plan.title })}
                  className="mt-4 w-full px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  使用 Stripe 支付
                </button>
              </div>
            ))}
          </div>
        </div>

        {open.visible && (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen({ visible: false })} />
            <div className="relative z-10 w-[380px] max-w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
              <div className="mb-4 text-center">
                <div className="text-lg font-semibold text-gray-900">{open.plan} 支付</div>
                <div className="mt-1 text-sm text-gray-600">支付暂未启用，仅作展示</div>
              </div>
              <button
                onClick={() => setOpen({ visible: false })}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
