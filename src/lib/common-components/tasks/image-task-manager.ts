/**
 * 图片生成任务管理器
 */

import type { ImageTask } from '../types'
import { RunningHubAPIService } from '../api/runninghub-api'
import { R2StorageService } from '../storage/r2-storage'

export interface TaskManagerConfig {
  runninghub?: {
    apiKey: string
    baseUrl: string
  }
  storage?: {
    accountId: string
    accessKeyId: string
    secretAccessKey: string
    bucketName: string
    publicUrl?: string
  }
}

export class ImageTaskManager {
  private tasks: Map<string, ImageTask> = new Map()
  private runninghub?: RunningHubAPIService
  private storage?: R2StorageService

  constructor(config?: TaskManagerConfig) {
    if (config?.runninghub) {
      this.runninghub = new RunningHubAPIService(config.runninghub)
    }
    if (config?.storage) {
      this.storage = new R2StorageService(config.storage)
    }
  }

  /**
   * 创建图片生成任务
   */
  async createTask(
    type: 'generate' | 'edit' | 'analyze',
    prompt: string,
    model: string,
    imageData?: string
  ): Promise<ImageTask> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

    const task: ImageTask = {
      id: taskId,
      type,
      prompt,
      model,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.tasks.set(taskId, task)

    // 如果配置了 RunningHub，使用它来处理任务
    if (this.runninghub) {
      try {
        const hubTask = await this.runninghub.createTask('image_generation', {
          type,
          prompt,
          model,
          imageData,
        })

        task.status = 'processing'
        task.updatedAt = new Date().toISOString()
        this.tasks.set(taskId, task)

        // 轮询任务状态
        this.pollTaskStatus(taskId, hubTask.id)
      } catch (error) {
        task.status = 'failed'
        task.result = {
          error: error instanceof Error ? error.message : 'Failed to create task',
        }
        task.updatedAt = new Date().toISOString()
        this.tasks.set(taskId, task)
      }
    }

    return task
  }

  /**
   * 轮询任务状态
   */
  private async pollTaskStatus(taskId: string, hubTaskId: string) {
    if (!this.runninghub) return

    const maxAttempts = 60 // 最多轮询 60 次
    let attempts = 0

    const poll = async () => {
      if (attempts >= maxAttempts) {
        const task = this.tasks.get(taskId)
        if (task) {
          task.status = 'failed'
          task.result = { error: 'Task timeout' }
          task.updatedAt = new Date().toISOString()
          this.tasks.set(taskId, task)
        }
        return
      }

      try {
        const hubTask = await this.runninghub!.getTaskStatus(hubTaskId)
        const task = this.tasks.get(taskId)

        if (!task) return

        if (hubTask.status === 'completed') {
          task.status = 'completed'
          task.result = {
            imageUrl: hubTask.result?.imageUrl,
            textResponse: hubTask.result?.textResponse,
          }
          task.updatedAt = new Date().toISOString()
          this.tasks.set(taskId, task)
        } else if (hubTask.status === 'failed') {
          task.status = 'failed'
          task.result = {
            error: hubTask.error || 'Task failed',
          }
          task.updatedAt = new Date().toISOString()
          this.tasks.set(taskId, task)
        } else {
          // 继续轮询
          attempts++
          setTimeout(poll, 2000) // 每 2 秒轮询一次
        }
      } catch (error) {
        console.error('Poll task status error:', error)
        attempts++
        setTimeout(poll, 2000)
      }
    }

    poll()
  }

  /**
   * 获取任务
   */
  getTask(taskId: string): ImageTask | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): ImageTask[] {
    return Array.from(this.tasks.values())
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) return

    if (this.runninghub && task.status === 'processing') {
      // 如果任务在 RunningHub 中，尝试取消
      // 这里需要存储 hubTaskId，简化实现
    }

    task.status = 'failed'
    task.result = { error: 'Task cancelled' }
    task.updatedAt = new Date().toISOString()
    this.tasks.set(taskId, task)
  }
}

