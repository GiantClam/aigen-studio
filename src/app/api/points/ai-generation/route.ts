import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PointsService } from '@/services/points-service'
import { AuthService } from '@/services/auth-service'

/**
 * 扣除 AI 生成图片积分
 */
export async function POST(request: NextRequest) {
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

    const { model } = await request.json().catch(() => ({ }))

    const result = await PointsService.deductAIGenerationPoints(user.id, model)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        points: result.points,
        message: result.message
      }
    })
  } catch (error) {
    console.error('扣除 AI 生成积分失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
