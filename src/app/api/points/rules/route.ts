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
    const user = await AuthService.ensureUserByEmail(session.user.email, session.user.name || undefined)
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const ruleType = searchParams.get('type')
    const seed = searchParams.get('seed')

    // 开发环境支持通过 GET 触发默认规则写入
    if (seed === 'true' && process.env.NODE_ENV !== 'production') {
      const result = await PointsService.ensureDefaultRules()
      return NextResponse.json({ success: result.success, message: result.message })
    }

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

/**
 * 写入/更新默认积分规则（开发环境使用）
 */
export async function POST(request: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV !== 'production'
    if (!isDev) {
      return NextResponse.json({ error: '仅允许在开发环境写入默认规则' }, { status: 403 })
    }

    const result = await PointsService.ensureDefaultRules()
    return NextResponse.json({
      success: result.success,
      message: result.message
    }, { status: result.success ? 200 : 500 })
  } catch (error) {
    console.error('写入默认积分规则失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
