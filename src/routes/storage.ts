import { Hono } from 'hono'
import type { Env } from '../types/env'

const storage = new Hono<{ Bindings: Env }>()

// 模拟文件存储
const files = []

// 上传文件
storage.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as unknown as File
    
    if (!file) {
      return c.json({
        success: false,
        error: 'No file provided'
      }, 400)
    }
    
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fileName = file.name
    const fileSize = file.size
    const fileType = file.type
    
    // 如果有 R2 存储绑定，上传到 Cloudflare R2
    if (c.env?.STORAGE) {
      const arrayBuffer = await file.arrayBuffer()
      await c.env.STORAGE.put(fileId, arrayBuffer, {
        httpMetadata: {
          contentType: fileType,
        },
        customMetadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString()
        }
      })
    } else {
      // 模拟存储
      files.push({
        id: fileId,
        name: fileName,
        size: fileSize,
        type: fileType,
        url: `/api/storage/files/${fileId}`,
        uploadedAt: new Date().toISOString()
      })
    }
    
    return c.json({
      success: true,
      data: {
        id: fileId,
        name: fileName,
        size: fileSize,
        type: fileType,
        url: `/api/storage/files/${fileId}`,
        uploadedAt: new Date().toISOString()
      }
    }, 201)
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to upload file'
    }, 500)
  }
})

// 获取文件列表
storage.get('/files', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    
    if (c.env?.STORAGE) {
      const objects = await c.env.STORAGE.list({ limit, cursor: c.req.query('cursor') })
      
      const fileList = objects.objects.map(obj => ({
        id: obj.key,
        name: obj.customMetadata?.originalName || obj.key,
        size: obj.size,
        type: obj.httpMetadata?.contentType || 'application/octet-stream',
        url: `/api/storage/files/${obj.key}`,
        uploadedAt: obj.customMetadata?.uploadedAt || obj.uploaded.toISOString()
      }))
      
      return c.json({
        success: true,
        data: {
          files: fileList,
          truncated: objects.truncated,
          cursor: objects.cursor
        }
      })
    }
    
    // 使用模拟数据
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedFiles = files.slice(startIndex, endIndex)
    
    return c.json({
      success: true,
      data: {
        files: paginatedFiles,
        pagination: {
          page,
          limit,
          total: files.length,
          pages: Math.ceil(files.length / limit)
        }
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch files'
    }, 500)
  }
})

// 获取文件
storage.get('/files/:id', async (c) => {
  try {
    const fileId = c.req.param('id')
    
    if (c.env?.STORAGE) {
      const object = await c.env.STORAGE.get(fileId)
      
      if (!object) {
        return c.json({
          success: false,
          error: 'File not found'
        }, 404)
      }
      
      const headers = new Headers()
      object.writeHttpMetadata(headers)
      headers.set('etag', object.httpEtag)
      
      return new Response(object.body, { headers })
    }
    
    // 使用模拟数据
    const file = files.find(f => f.id === fileId)
    
    if (!file) {
      return c.json({
        success: false,
        error: 'File not found'
      }, 404)
    }
    
    return c.json({
      success: true,
      data: file
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch file'
    }, 500)
  }
})

// 删除文件
storage.delete('/files/:id', async (c) => {
  try {
    const fileId = c.req.param('id')
    
    if (c.env?.STORAGE) {
      await c.env.STORAGE.delete(fileId)
    } else {
      // 使用模拟数据
      const fileIndex = files.findIndex(f => f.id === fileId)
      
      if (fileIndex === -1) {
        return c.json({
          success: false,
          error: 'File not found'
        }, 404)
      }
      
      files.splice(fileIndex, 1)
    }
    
    return c.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to delete file'
    }, 500)
  }
})

// 批量上传
storage.post('/upload/batch', async (c) => {
  try {
    const formData = await c.req.formData()
    const uploadedFiles = []
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('files') && typeof value === 'object' && value !== null) {
        const file = value as unknown as File
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        if (c.env?.STORAGE) {
          const arrayBuffer = await file.arrayBuffer()
          await c.env.STORAGE.put(fileId, arrayBuffer, {
            httpMetadata: {
              contentType: file.type,
            },
            customMetadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString()
            }
          })
        }
        
        uploadedFiles.push({
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: `/api/storage/files/${fileId}`,
          uploadedAt: new Date().toISOString()
        })
      }
    }
    
    return c.json({
      success: true,
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length
      }
    }, 201)
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to upload files'
    }, 500)
  }
})

// 获取存储统计
storage.get('/stats', async (c) => {
  try {
    if (c.env?.STORAGE) {
      // R2 没有直接的统计 API，这里返回模拟数据
      return c.json({
        success: true,
        data: {
          totalFiles: 'N/A',
          totalSize: 'N/A',
          message: 'R2 storage statistics not available via API'
        }
      })
    }
    
    // 使用模拟数据
    const totalFiles = files.length
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0)
    
    return c.json({
      success: true,
      data: {
        totalFiles,
        totalSize,
        averageSize: totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch statistics'
    }, 500)
  }
})

export { storage as storageRoutes } 