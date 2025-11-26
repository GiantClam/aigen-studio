/**
 * 认证和权限服务
 * 处理用户角色和权限验证
 */

import { supabaseServer } from '@/lib/supabase-server'

// 使用单例 supabaseServer 客户端，避免创建多个 GoTrueClient 实例
const supabase = supabaseServer

export interface User {
  id: string
  email: string
  name?: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface RolePermission {
  id: string
  role: string
  resource: string
  action: string
  is_allowed: boolean
}

export class AuthService {
  /**
   * 获取用户信息（包含角色）
   */
  static async getUser(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('获取用户信息失败:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('获取用户信息异常:', error)
      return null
    }
  }

  /**
   * 通过邮箱获取用户信息
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        console.error('通过邮箱获取用户信息失败:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('通过邮箱获取用户信息异常:', error)
      return null
    }
  }

  /**
   * 若用户不存在则按邮箱创建，默认角色为 user
   */
  static async ensureUserByEmail(email: string, name?: string): Promise<User | null> {
    try {
      const existing = await this.getUserByEmail(email)
      if (existing) return existing

      const { data, error } = await supabase
        .from('users')
        .insert({ email, name: name || null, role: 'user' })
        .select('*')
        .single()

      if (error) {
        console.error('按邮箱创建用户失败:', error)
        return null
      }

      return data as unknown as User
    } catch (error) {
      console.error('按邮箱创建用户异常:', error)
      return null
    }
  }

  /**
   * 检查用户是否为管理员
   */
  static async isAdmin(identifier: string): Promise<boolean> {
    try {
      // 判断是 email 还是 id
      const isEmail = identifier.includes('@')
      const user = isEmail 
        ? await this.getUserByEmail(identifier)
        : await this.getUser(identifier)
      return user?.role === 'admin'
    } catch (error) {
      console.error('检查管理员权限异常:', error)
      return false
    }
  }

  /**
   * 检查用户权限
   */
  static async hasPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      const user = await this.getUser(userId)
      if (!user) return false

      // 管理员拥有所有权限
      if (user.role === 'admin') return true

      // 检查具体权限
      const { data, error } = await supabase
        .from('nanobanana_role_permissions')
        .select('is_allowed')
        .eq('role', user.role)
        .eq('resource', resource)
        .eq('action', action)
        .single()

      if (error) {
        console.error('检查权限失败:', error)
        return false
      }

      return data?.is_allowed || false
    } catch (error) {
      console.error('检查权限异常:', error)
      return false
    }
  }

  /**
   * 设置用户角色
   */
  static async setUserRole(
    userId: string,
    role: 'user' | 'admin'
  ): Promise<{
    success: boolean
    message: string
  }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)

      if (error) {
        console.error('设置用户角色失败:', error)
        return {
          success: false,
          message: '设置用户角色失败'
        }
      }

      return {
        success: true,
        message: `用户角色已设置为 ${role}`
      }
    } catch (error) {
      console.error('设置用户角色异常:', error)
      return {
        success: false,
        message: '设置用户角色异常'
      }
    }
  }

  /**
   * 获取所有用户（管理员功能）
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('获取用户列表失败:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('获取用户列表异常:', error)
      return []
    }
  }

  /**
   * 创建管理员用户
   */
  static async createAdminUser(
    email: string,
    name: string,
    password?: string
  ): Promise<{
    success: boolean
    message: string
    userId?: string
  }> {
    try {
      // 检查用户是否已存在
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        // 如果用户存在，更新为管理员
        const result = await this.setUserRole(existingUser.id, 'admin')
        return {
          success: result.success,
          message: result.success ? '用户已存在，角色已更新为管理员' : result.message,
          userId: existingUser.id
        }
      }

      // 创建新用户
      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          name,
          role: 'admin'
        })
        .select()
        .single()

      if (error) {
        console.error('创建管理员用户失败:', error)
        return {
          success: false,
          message: '创建管理员用户失败'
        }
      }

      return {
        success: true,
        message: '管理员用户创建成功',
        userId: data.id
      }
    } catch (error) {
      console.error('创建管理员用户异常:', error)
      return {
        success: false,
        message: '创建管理员用户异常'
      }
    }
  }

  /**
   * 检查管理员访问权限
   */
  static async checkAdminAccess(userId: string): Promise<{
    allowed: boolean
    message: string
  }> {
    try {
      const isAdmin = await this.isAdmin(userId)
      
      if (!isAdmin) {
        return {
          allowed: false,
          message: '权限不足，需要管理员权限'
        }
      }

      return {
        allowed: true,
        message: '访问权限验证通过'
      }
    } catch (error) {
      console.error('检查管理员访问权限异常:', error)
      return {
        allowed: false,
        message: '权限检查异常'
      }
    }
  }
}
