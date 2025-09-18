"use client"
import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import LoginDialog from '@/components/LoginDialog'

export default function HomeAuthMenu() {
  const { status, data } = useSession()
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  if (status === 'loading') {
    return (
      <button
        className="px-4 py-2 text-sm rounded-lg bg-white/70 backdrop-blur-md border border-gray-200 text-gray-600 hover:bg-white transition-all"
        disabled
      >
        Loading
      </button>
    )
  }

  if (status === 'authenticated') {
    const displayName = data?.user?.name || 'Account'
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-white/70 backdrop-blur-md border border-gray-200 text-gray-900 hover:bg-white shadow-sm transition-all max-w-[200px]"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          title={displayName}
        >
          <span className="truncate">{displayName}</span>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 7l5 6 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 bg-white/95 backdrop-blur shadow-xl py-1 z-50"
          >
            <button
              role="menuitem"
              onClick={() => { setMenuOpen(false); signOut() }}
              className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-sm rounded-lg bg-white/70 backdrop-blur-md border border-gray-200 text-gray-900 hover:bg-white shadow-sm transition-all"
      >
        Sign in
      </button>
      <LoginDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}


