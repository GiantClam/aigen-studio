"use client"
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import LoginDialog from '@/components/LoginDialog'

export default function HomeAuthMenu() {
  const { status, data } = useSession()
  const [open, setOpen] = useState(false)

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
    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-sm text-gray-700 max-w-[160px] truncate">{data?.user?.name}</span>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm rounded-lg bg-white/70 backdrop-blur-md border border-gray-200 text-gray-900 hover:bg-white shadow-sm transition-all"
        >
          Sign out
        </button>
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


