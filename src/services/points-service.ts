/**
 * 积分系统服务
 * 处理所有积分相关的业务逻辑
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface UserPoints {
  id: string
  user_id: string
  current_points: number
  total_earned: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface PointTransaction {
  id: string
  user_id: string
  points: number
  transaction_type: 'earn' | 'spend' | 'refund'
  source: 'registration' | 'daily_login' | 'ai_generation' | 'admin_adjustment'
  description: string
  metadata?: any
  created_at: string
}

export interface PointRule {
  id: string
  rule_name: string
  rule_type: string
  points_value: number
  is_active: boolean
  description: string
}

export class PointsService {
  /**
   * 获取用户积分信息
   */
  static async getUserPoints(userId: string): Promise<UserPoints | null> {
    try {
      const { data, error } = await supabase
        .from('nanobanana_user_points')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('获取用户积分失败:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('获取用户积分异常:', error)
      return null
    }
  }

  /**
   * 获取用户积分交易记录
   */
  static async getUserTransactions(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<PointTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('nanobanana_point_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('获取积分交易记录失败:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('获取积分交易记录异常:', error)
      return []
    }
  }

  /**
   * 检查用户今日是否已登录
   */
  static async hasLoggedInToday(userId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('nanobanana_daily_login_records')
        .select('id')
        .eq('user_id', userId)
        .eq('login_date', today)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 表示没有找到记录
        console.error('检查今日登录状态失败:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('检查今日登录状态异常:', error)
      return false
    }
  }

  /**
   * 处理每日登录积分
   */
  static async processDailyLogin(userId: string): Promise<{
    success: boolean
    points: number
    message: string
  }> {
    try {
      // 检查今日是否已登录
      const hasLoggedIn = await this.hasLoggedInToday(userId)
      if (hasLoggedIn) {
        return {
          success: false,
          points: 0,
          message: '今日已登录，无法重复获得积分'
        }
      }

      // 检查积分规则
      const rule = await this.getPointRule('daily_login')
      if (!rule || !rule.is_active) {
        return {
          success: false,
          points: 0,
          message: '每日登录积分规则未启用'
        }
      }

      const today = new Date().toISOString().split('T')[0]
      const transactionId = `${userId}_daily_${Date.now()}`

      // 记录每日登录
      const { error: loginError } = await supabase
        .from('nanobanana_daily_login_records')
        .insert({
          id: transactionId,
          user_id: userId,
          login_date: today,
          points_awarded: rule.points_value
        })

      if (loginError) {
        console.error('记录每日登录失败:', loginError)
        return {
          success: false,
          points: 0,
          message: '记录每日登录失败'
        }
      }

      // 创建积分交易记录
      const { error: transactionError } = await supabase
        .from('nanobanana_point_transactions')
        .insert({
          id: transactionId,
          user_id: userId,
          points: rule.points_value,
          transaction_type: 'earn',
          source: 'daily_login',
          description: '每日登录赠送积分'
        })

      if (transactionError) {
        console.error('创建积分交易记录失败:', transactionError)
        return {
          success: false,
          points: 0,
          message: '创建积分交易记录失败'
        }
      }

      return {
        success: true,
        points: rule.points_value,
        message: `每日登录获得 ${rule.points_value} 积分`
      }
    } catch (error) {
      console.error('处理每日登录积分异常:', error)
      return {
        success: false,
        points: 0,
        message: '处理每日登录积分异常'
      }
    }
  }

  /**
   * 扣除 AI 生成图片积分
   */
  static async deductAIGenerationPoints(userId: string): Promise<{
    success: boolean
    points: number
    message: string
  }> {
    try {
      // 检查用户积分是否足够
      const userPoints = await this.getUserPoints(userId)
      if (!userPoints) {
        return {
          success: false,
          points: 0,
          message: '用户积分信息不存在'
        }
      }

      // 检查积分规则
      const rule = await this.getPointRule('ai_generation')
      if (!rule || !rule.is_active) {
        return {
          success: false,
          points: 0,
          message: 'AI 生成积分规则未启用'
        }
      }

      const pointsToDeduct = Math.abs(rule.points_value)
      
      if (userPoints.current_points < pointsToDeduct) {
        return {
          success: false,
          points: 0,
          message: `积分不足，需要 ${pointsToDeduct} 积分，当前只有 ${userPoints.current_points} 积分`
        }
      }

      const transactionId = `${userId}_ai_${Date.now()}`

      // 创建积分交易记录
      const { error } = await supabase
        .from('nanobanana_point_transactions')
        .insert({
          id: transactionId,
          user_id: userId,
          points: -pointsToDeduct,
          transaction_type: 'spend',
          source: 'ai_generation',
          description: 'AI 生成图片扣除积分',
          metadata: {
            generation_time: new Date().toISOString(),
            points_deducted: pointsToDeduct
          }
        })

      if (error) {
        console.error('扣除 AI 生成积分失败:', error)
        return {
          success: false,
          points: 0,
          message: '扣除积分失败'
        }
      }

      return {
        success: true,
        points: -pointsToDeduct,
        message: `成功扣除 ${pointsToDeduct} 积分用于 AI 生成`
      }
    } catch (error) {
      console.error('扣除 AI 生成积分异常:', error)
      return {
        success: false,
        points: 0,
        message: '扣除积分异常'
      }
    }
  }

  /**
   * 获取积分规则
   */
  static async getPointRule(ruleType: string): Promise<PointRule | null> {
    try {
      const { data, error } = await supabase
        .from('nanobanana_point_rules')
        .select('*')
        .eq('rule_type', ruleType)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('获取积分规则失败:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('获取积分规则异常:', error)
      return null
    }
  }

  /**
   * 获取所有积分规则
   */
  static async getAllPointRules(): Promise<PointRule[]> {
    try {
      const { data, error } = await supabase
        .from('nanobanana_point_rules')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('获取积分规则失败:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('获取积分规则异常:', error)
      return []
    }
  }

  /**
   * 管理员调整积分
   */
  static async adminAdjustPoints(
    userId: string,
    points: number,
    reason: string,
    adminId: string
  ): Promise<{
    success: boolean
    message: string
  }> {
    try {
      const transactionId = `${userId}_admin_${Date.now()}`
      const transactionType = points > 0 ? 'earn' : 'spend'

      // 创建积分交易记录
      const { error } = await supabase
        .from('nanobanana_point_transactions')
        .insert({
          id: transactionId,
          user_id: userId,
          points: points,
          transaction_type: transactionType,
          source: 'admin_adjustment',
          description: reason,
          metadata: {
            admin_id: adminId,
            adjustment_time: new Date().toISOString(),
            points_adjusted: points
          }
        })

      if (error) {
        console.error('管理员调整积分失败:', error)
        return {
          success: false,
          message: '调整积分失败'
        }
      }

      return {
        success: true,
        message: `成功调整 ${points} 积分`
      }
    } catch (error) {
      console.error('管理员调整积分异常:', error)
      return {
        success: false,
        message: '调整积分异常'
      }
    }
  }

  /**
   * 初始化用户积分（新用户注册时调用）
   */
  static async initializeUserPoints(userId: string): Promise<{
    success: boolean
    message: string
  }> {
    try {
      // 检查用户是否已有积分记录
      const existingPoints = await this.getUserPoints(userId)
      if (existingPoints) {
        return {
          success: true,
          message: '用户积分已存在'
        }
      }

      // 获取注册积分规则，若不存在或未启用，则使用默认 100 分
      const rule = await this.getPointRule('registration')
      const pointsValue = rule && rule.is_active ? rule.points_value : 100

      // 创建用户积分记录
      const { error: pointsError } = await supabase
        .from('nanobanana_user_points')
        .insert({
          id: `${userId}_points`,
          user_id: userId,
          current_points: pointsValue,
          total_earned: pointsValue,
          total_spent: 0
        })

      if (pointsError) {
        console.error('创建用户积分记录失败:', pointsError)
        return {
          success: false,
          message: '创建用户积分记录失败'
        }
      }

      // 创建积分交易记录
      const transactionId = `${userId}_reg_${Date.now()}`
      const { error: transactionError } = await supabase
        .from('nanobanana_point_transactions')
        .insert({
          id: transactionId,
          user_id: userId,
          points: pointsValue,
          transaction_type: 'earn',
          source: 'registration',
          description: '新用户注册赠送积分'
        })

      if (transactionError) {
        console.error('创建注册积分交易记录失败:', transactionError)
        return {
          success: false,
          message: '创建注册积分交易记录失败'
        }
      }

      return {
        success: true,
        message: `新用户注册成功，获得 ${pointsValue} 积分`
      }
    } catch (error) {
      console.error('初始化用户积分异常:', error)
      return {
        success: false,
        message: '初始化用户积分异常'
      }
    }
  }
}
