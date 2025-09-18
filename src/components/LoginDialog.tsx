"use client"
import { signIn } from 'next-auth/react'
import { Github, LogIn } from 'lucide-react'

export default function LoginDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-[100] grid place-items-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative z-10 w-[380px] max-w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
          <div className="mb-4 text-center">
            <div className="text-lg font-semibold text-gray-900">Sign in to continue</div>
            <div className="mt-1 text-sm text-gray-600">Choose a sign-in method</div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => signIn('github')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
            >
              <Github size={18} /> Continue with GitHub
            </button>
            <button
              onClick={() => signIn('google')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm"
            >
              <LogIn size={18} /> Continue with Google
            </button>
          </div>
          <div className="mt-3 text-center">
            <button
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}


