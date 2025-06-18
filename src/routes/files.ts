import { Hono } from 'hono'
import type { Env } from '../types/env'

const files = new Hono<{ Bindings: Env }>()

// 模拟文件系统存储
const fileSystem = new Map<string, string>()
const defaultContent = `# Welcome to AI Gen Studio Editor

This is your new document. Start typing to create your content.

## Features

- Real-time collaboration
- AI-powered assistance
- Multi-platform publishing
- Rich media support

Start writing and let your creativity flow!`

// 初始化一些示例文件
fileSystem.set('welcome.md', defaultContent)
fileSystem.set('untitled.md', '# Untitled\n\nStart writing here...')

// 读取文件
files.post('/read_file', async (c) => {
  try {
    const { path } = await c.req.json()
    
    if (!path) {
      return c.json({
        success: false,
        error: 'File path is required'
      }, 400)
    }
    
    // 从 KV 存储或模拟存储中读取
    let content = ''
    
    if (c.env?.FILES) {
      const storedContent = await c.env.FILES.get(path)
      content = storedContent || defaultContent
    } else {
      content = fileSystem.get(path) || defaultContent
    }
    
    return c.json({
      success: true,
      content,
      path
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to read file'
    }, 500)
  }
})

// 更新文件
files.post('/update_file', async (c) => {
  try {
    const { path, content } = await c.req.json()
    
    if (!path || typeof content !== 'string') {
      return c.json({
        success: false,
        error: 'File path and content are required'
      }, 400)
    }
    
    // 保存到 KV 存储或模拟存储
    if (c.env?.FILES) {
      await c.env.FILES.put(path, content)
    } else {
      fileSystem.set(path, content)
    }
    
    return c.json({
      success: true,
      message: 'File updated successfully',
      path
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to update file'
    }, 500)
  }
})

// 重命名文件
files.post('/rename_file', async (c) => {
  try {
    const { old_path, new_title } = await c.req.json()
    
    if (!old_path || !new_title) {
      return c.json({
        success: false,
        error: 'Old path and new title are required'
      }, 400)
    }
    
    // 生成新的文件路径
    const sanitizedTitle = new_title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    const new_path = `${sanitizedTitle}.md`
    
    // 从旧路径读取内容
    let content = ''
    if (c.env?.FILES) {
      content = await c.env.FILES.get(old_path) || ''
      
      // 保存到新路径
      await c.env.FILES.put(new_path, content)
      
      // 删除旧文件（如果路径不同）
      if (old_path !== new_path) {
        await c.env.FILES.delete(old_path)
      }
    } else {
      content = fileSystem.get(old_path) || ''
      fileSystem.set(new_path, content)
      
      // 删除旧文件（如果路径不同）
      if (old_path !== new_path) {
        fileSystem.delete(old_path)
      }
    }
    
    return c.json({
      success: true,
      path: new_path,
      message: 'File renamed successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to rename file'
    }, 500)
  }
})

// 发布文章
files.post('/publish', async (c) => {
  try {
    const formData = await c.req.formData()
    const platformId = formData.get('platformId') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    
    if (!platformId || !title || !content) {
      return c.json({
        success: false,
        error: 'Platform ID, title, and content are required'
      }, 400)
    }
    
    // 处理媒体文件
    const mediaFiles = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('media_')) {
        const index = key.split('_')[1]
        const typeKey = `media_type_${index}`
        const type = formData.get(typeKey) as string
        
        mediaFiles.push({
          url: value as string,
          type: type || 'image'
        })
      }
    }
    
    // 模拟发布到不同平台
    const publishResult = {
      id: `post_${Date.now()}`,
      platform: platformId,
      title,
      content,
      mediaFiles,
      publishedAt: new Date().toISOString(),
      status: 'published'
    }
    
    // 如果有数据库，保存发布记录
    if (c.env?.DB) {
      await c.env.DB.prepare(`
        INSERT INTO published_posts (platform_id, title, content, media_files, published_at, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        platformId,
        title,
        content,
        JSON.stringify(mediaFiles),
        publishResult.publishedAt,
        publishResult.status
      ).run()
    }
    
    return c.json({
      success: true,
      data: publishResult,
      message: `Post published to ${platformId} successfully`
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to publish post'
    }, 500)
  }
})

// 获取文件列表
files.get('/list', async (c) => {
  try {
    let fileList = []
    
    if (c.env?.FILES) {
      // 从 KV 获取文件列表 - 这是一个简化实现
      // 实际应用中可能需要单独的索引存储
      const keys = ['welcome.md', 'untitled.md'] // 示例键
      
      for (const key of keys) {
        const content = await c.env.FILES.get(key)
        if (content) {
          fileList.push({
            path: key,
            name: key.replace('.md', ''),
            size: content.length,
            lastModified: new Date().toISOString()
          })
        }
      }
    } else {
      // 从模拟存储获取
      for (const [path, content] of fileSystem.entries()) {
        fileList.push({
          path,
          name: path.replace('.md', ''),
          size: content.length,
          lastModified: new Date().toISOString()
        })
      }
    }
    
    return c.json({
      success: true,
      data: fileList
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to list files'
    }, 500)
  }
})

export { files as fileRoutes } 