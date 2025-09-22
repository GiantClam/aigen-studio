import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PointsService } from '@/services/points-service'
import { AuthService } from '@/services/auth-service'

/**
 * 获取积分规则
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const ruleType = searchParams.get('type')

    let rules
    if (ruleType) {
      const rule = await PointsService.getPointRule(ruleType)
      rules = rule ? [rule] : []
    } else {
      rules = await PointsService.getAllPointRules()
    }

    return NextResponse.json({
      success: true,
      data: rules
    })
  } catch (error) {
    console.error('获取积分规则失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
