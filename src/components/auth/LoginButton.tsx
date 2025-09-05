'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { User, LogIn, LogOut } from 'lucide-react'

export function LoginButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span className="text-white/80">加载中...</span>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || '用户'}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <User className="w-4 h-4 text-white/80" />
          )}
          <span className="text-white/90 text-sm max-w-24 truncate">
            {session.user?.name || session.user?.email}
          </span>
        </div>
        
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl transition-colors border border-red-500/30"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">退出</span>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-colors border border-white/20"
    >
      <LogIn className="w-4 h-4" />
      <span>Google 登录</span>
    </button>
  )
}
