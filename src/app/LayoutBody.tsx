'use client'

import { usePathname } from 'next/navigation'
import SiteFooter from '@/components/SiteFooter'
import { useEffect, useState } from 'react'

export default function LayoutBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStandalone = pathname?.startsWith('/standard-editor')
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type?: 'success' | 'error' | 'info' }>>([])

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ message: string; type?: 'success' | 'error' | 'info' }>
      const id = Date.now() + Math.random()
      setToasts(prev => [...prev, { id, message: ce.detail?.message || '', type: ce.detail?.type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
    }
    window.addEventListener('global-toast', handler as any)
    return () => window.removeEventListener('global-toast', handler as any)
  }, [])

  if (isStandalone) return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-[2000] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-3 py-2 rounded-md text-sm shadow-md border ${t.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : t.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>{t.message}</div>
        ))}
      </div>
    </>
  )
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
      <div className="fixed top-4 right-4 z-[2000] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-3 py-2 rounded-md text-sm shadow-md border ${t.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : t.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>{t.message}</div>
        ))}
      </div>
      <SiteFooter />
    </div>
  )
}
