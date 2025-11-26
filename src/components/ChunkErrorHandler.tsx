"use client"

import { useEffect } from 'react'

export default function ChunkErrorHandler() {
  useEffect(() => {
    // 监听 ChunkLoadError
    const handleChunkError = (event: ErrorEvent) => {
      if (event.error?.name === 'ChunkLoadError' || 
          event.message?.includes('Loading chunk') ||
          event.message?.includes('Loading CSS chunk')) {
        console.warn('ChunkLoadError detected, reloading page...', event.error)
        
        // 清除缓存并重新加载
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name)
            })
          })
        }
        
        // 延迟重新加载以避免无限循环
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    }

    // 监听未处理的 Promise 拒绝
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.name === 'ChunkLoadError' || 
          event.reason?.message?.includes('Loading chunk')) {
        console.warn('ChunkLoadError in Promise, reloading page...', event.reason)
        
        // 清除缓存并重新加载
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name)
            })
          })
        }
        
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    }

    // 添加事件监听器
    window.addEventListener('error', handleChunkError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // 清理函数
    return () => {
      window.removeEventListener('error', handleChunkError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
