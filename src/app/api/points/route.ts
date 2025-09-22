import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PointsService } from '@/services/points-service'
import { AuthService } from '@/services/auth-service'

/**
 * 获取用户积分信息
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 通过 email 获取用户信息
    const user = await AuthService.ensureUserByEmail(session.user.email, session.user.name || undefined)
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    let userPoints = await PointsService.getUserPoints(user.id)

    // 若无积分记录，自动初始化（注册赠送）
    if (!userPoints) {
      await PointsService.initializeUserPoints(user.id)
      userPoints = await PointsService.getUserPoints(user.id)
    }

    return NextResponse.json({
      success: true,
      data: userPoints
    })
  } catch (error) {
    console.error('获取用户积分失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

/**
 * 处理每日登录积分
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 通过 email 获取用户信息
    const user = await AuthService.getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const { action } = await request.json()
    
    if (action === 'daily_login') {
      const result = await PointsService.processDailyLogin(user.id)
      return NextResponse.json({
        success: result.success,
        data: {
          points: result.points,
          message: result.message
        }
      })
    }

    return NextResponse.json({ error: '无效的操作' }, { status: 400 })
  } catch (error) {
    console.error('处理积分操作失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
