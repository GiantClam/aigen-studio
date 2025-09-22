import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PointsService } from '@/services/points-service'
import { AuthService } from '@/services/auth-service'

/**
 * 获取用户积分交易记录
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const transactions = await PointsService.getUserTransactions(
      user.id,
      limit,
      offset
    )

    return NextResponse.json({
      success: true,
      data: transactions
    })
  } catch (error) {
    console.error('获取积分交易记录失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
