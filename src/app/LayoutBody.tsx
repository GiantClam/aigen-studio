'use client'

import { usePathname } from 'next/navigation'
import SiteFooter from '@/components/SiteFooter'

export default function LayoutBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStandalone = pathname?.startsWith('/standard-editor')
  if (isStandalone) return <>{children}</>
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
