/**
 * RunningHub API 服务
 */

import type { RunningHubConfig } from '../types'

export interface RunningHubTask {
  id: string
  type: string
  status: string
  result?: any
  error?: string
}

export class RunningHubAPIService {
  private apiKey: string
  private baseUrl: string

  constructor(config: RunningHubConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl.replace(/\/$/, '') // 移除尾部斜杠
  }

  /**
   * 创建任务
   */
  async createTask(type: string, params: Record<string, any>): Promise<RunningHubTask> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          type,
          params,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`RunningHub API error: ${response.status} ${error}`)
      }

      return await response.json()
    } catch (error) {
      console.error('RunningHub create task error:', error)
      throw new Error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId: string): Promise<RunningHubTask> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`RunningHub API error: ${response.status} ${error}`)
      }

      return await response.json()
    } catch (error) {
      console.error('RunningHub get task error:', error)
      throw new Error(`Failed to get task: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks/${taskId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`RunningHub API error: ${response.status} ${error}`)
      }
    } catch (error) {
      console.error('RunningHub cancel task error:', error)
      throw new Error(`Failed to cancel task: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

