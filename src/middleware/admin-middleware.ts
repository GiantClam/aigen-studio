/**
 * 管理员权限中间件
 * 用于保护 /admin 路由
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuthService } from '@/services/auth-service'

export async function adminMiddleware(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未登录，请先登录' },
        { status: 401 }
      )
    }

    // 检查管理员权限
    const accessCheck = await AuthService.checkAdminAccess(session.user.email)
    
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { error: accessCheck.message },
        { status: 403 }
      )
    }

    // 权限验证通过，继续处理请求
    return NextResponse.next()
  } catch (error) {
    console.error('管理员权限检查失败:', error)
    return NextResponse.json(
      { error: '权限检查异常' },
      { status: 500 }
    )
  }
}

/**
 * 权限检查装饰器
 * 用于 API 路由的权限验证
 */
export function requireAdmin(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: '未登录，请先登录' },
          { status: 401 }
        )
      }

      const accessCheck = await AuthService.checkAdminAccess(session.user.email)
      
      if (!accessCheck.allowed) {
        return NextResponse.json(
          { error: accessCheck.message },
          { status: 403 }
        )
      }

      // 权限验证通过，执行原始处理器
      return handler(request, ...args)
    } catch (error) {
      console.error('权限检查装饰器异常:', error)
      return NextResponse.json(
        { error: '权限检查异常' },
        { status: 500 }
      )
    }
  }
}
