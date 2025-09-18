"use client"
import { signIn, signOut, useSession } from 'next-auth/react'
import { Github, LogIn, LogOut } from 'lucide-react'

export default function AuthButtons() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <button className="px-3 py-1.5 text-sm rounded bg-gray-800 text-gray-300" disabled>
        Loading...
      </button>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 text-sm rounded bg-white text-gray-900 hover:bg-gray-200"
          onClick={() => signIn('github')}
        >
          <span className="inline-flex items-center gap-1"><Github size={16}/> GitHub 登录</span>
        </button>
        <button
          className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => signIn('google')}
        >
          <span className="inline-flex items-center gap-1"><LogIn size={16}/> Google 登录</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-300">{session.user?.name ?? '已登录'}</span>
      <button
        className="px-3 py-1.5 text-sm rounded bg-gray-700 text-white hover:bg-gray-600"
        onClick={() => signOut()}
      >
        <span className="inline-flex items-center gap-1"><LogOut size={16}/> 退出</span>
      </button>
    </div>
  )
}


