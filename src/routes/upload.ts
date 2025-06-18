import { Hono } from 'hono'

type Bindings = {
  STORAGE: R2Bucket
  DB: D1Database
  CACHE: KVNamespace
  AI: any
  JWT_SECRET: string
}

const uploadRoutes = new Hono<{ Bindings: Bindings }>()

// 上传静态文件到 R2
uploadRoutes.post('/static', async (c) => {
  try {
    const body = await c.req.json()
    const { filename, content, contentType } = body

    if (!filename || !content) {
      return c.json({ success: false, error: 'Missing filename or content' }, 400)
    }

    // 将 base64 内容解码
    const buffer = Uint8Array.from(atob(content), c => c.charCodeAt(0))
    
    // 上传到 R2
    await c.env.STORAGE.put(`static/${filename}`, buffer, {
      httpMetadata: {
        contentType: contentType || 'application/octet-stream'
      }
    })

    return c.json({ 
      success: true, 
      message: `File ${filename} uploaded successfully`,
      path: `/static/${filename}`
    })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, 500)
  }
})

// 批量上传静态文件
uploadRoutes.post('/static/batch', async (c) => {
  try {
    const body = await c.req.json()
    const { files } = body

    if (!Array.isArray(files)) {
      return c.json({ success: false, error: 'Files must be an array' }, 400)
    }

    const results = []

    for (const file of files) {
      try {
        const { filename, content, contentType } = file
        const buffer = Uint8Array.from(atob(content), c => c.charCodeAt(0))
        
        await c.env.STORAGE.put(`static/${filename}`, buffer, {
          httpMetadata: {
            contentType: contentType || 'application/octet-stream'
          }
        })

        results.push({ filename, success: true })
      } catch (error) {
        results.push({ 
          filename: file.filename, 
          success: false, 
          error: error instanceof Error ? error.message : 'Upload failed' 
        })
      }
    }

    return c.json({ 
      success: true, 
      message: `Uploaded ${results.filter(r => r.success).length}/${files.length} files`,
      results 
    })
  } catch (error) {
    console.error('Batch upload error:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Batch upload failed' 
    }, 500)
  }
})

// 列出 R2 中的静态文件
uploadRoutes.get('/static/list', async (c) => {
  try {
    const list = await c.env.STORAGE.list({ prefix: 'static/' })
    
    const files = list.objects.map(obj => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
      url: `/${obj.key}`
    }))

    return c.json({ 
      success: true, 
      files,
      count: files.length
    })
  } catch (error) {
    console.error('List files error:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to list files' 
    }, 500)
  }
})

export { uploadRoutes } 