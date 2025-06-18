import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  STORAGE: R2Bucket
  CACHE: KVNamespace
  AI: any
  JWT_SECRET: string
}

const electronRoutes = new Hono<{ Bindings: Bindings }>()

// 发布到多平台
electronRoutes.post('/publish', async (c) => {
  try {
    const { channel, title, content, images } = await c.req.json()
    
    console.log(`Publishing to ${channel}:`, { title, content })
    
    // 存储发布记录到 D1 数据库
    const publishId = crypto.randomUUID()
    
    await c.env.DB.prepare(`
      INSERT INTO publications (id, channel, title, content, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      publishId,
      channel,
      title,
      content,
      'pending',
      new Date().toISOString()
    ).run()
    
    // 根据不同平台处理发布逻辑
    let result
    switch (channel) {
      case 'xiaohongshu':
        result = await publishToXiaohongshu({ title, content, images })
        break
      case 'bilibili':
        result = await publishToBilibili({ title, content, images })
        break
      case 'youtube':
        result = await publishToYoutube({ title, content, images })
        break
      case 'x':
        result = await publishToX({ title, content, images })
        break
      default:
        throw new Error(`Unsupported platform: ${channel}`)
    }
    
    // 更新发布状态
    await c.env.DB.prepare(`
      UPDATE publications SET status = ?, result = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      result.success ? 'success' : 'failed',
      JSON.stringify(result),
      new Date().toISOString(),
      publishId
    ).run()
    
    return c.json({
      success: true,
      data: {
        publishId,
        channel,
        status: result.success ? 'success' : 'failed',
        result
      }
    })
  } catch (error) {
    console.error('Publish error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// 获取发布历史
electronRoutes.get('/publish/history', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM publications 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all()
    
    return c.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('Get publish history error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ComfyUI 状态检查
electronRoutes.get('/comfyui/status', async (c) => {
  try {
    // 检查 ComfyUI 服务状态
    const comfyuiUrl = 'http://127.0.0.1:8188'
    
    try {
      const response = await fetch(`${comfyuiUrl}/system_stats`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5秒超时
      })
      
      if (response.ok) {
        const stats = await response.json()
        return c.json({
          success: true,
          data: {
            installed: true,
            running: true,
            url: comfyuiUrl,
            stats
          }
        })
      }
    } catch (fetchError) {
      // ComfyUI 未运行或不可访问
    }
    
    return c.json({
      success: true,
      data: {
        installed: false,
        running: false,
        url: comfyuiUrl,
        message: 'ComfyUI is not running or not installed'
      }
    })
  } catch (error) {
    console.error('ComfyUI status check error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ComfyUI 图像生成
electronRoutes.post('/comfyui/generate', async (c) => {
  try {
    const { prompt, model = 'flux-dev', width = 1024, height = 1024 } = await c.req.json()
    
    // 构建 ComfyUI 工作流
    const workflow = {
      "3": {
        "inputs": {
          "seed": Math.floor(Math.random() * 1000000),
          "steps": 20,
          "cfg": 3.5,
          "sampler_name": "euler",
          "scheduler": "simple",
          "denoise": 1,
          "model": ["4", 0],
          "positive": ["6", 0],
          "negative": ["7", 0],
          "latent_image": ["5", 0]
        },
        "class_type": "KSampler"
      },
      "4": {
        "inputs": {
          "ckpt_name": `${model}.safetensors`
        },
        "class_type": "CheckpointLoaderSimple"
      },
      "5": {
        "inputs": {
          "width": width,
          "height": height,
          "batch_size": 1
        },
        "class_type": "EmptyLatentImage"
      },
      "6": {
        "inputs": {
          "text": prompt,
          "clip": ["4", 1]
        },
        "class_type": "CLIPTextEncode"
      },
      "7": {
        "inputs": {
          "text": "",
          "clip": ["4", 1]
        },
        "class_type": "CLIPTextEncode"
      },
      "8": {
        "inputs": {
          "samples": ["3", 0],
          "vae": ["4", 2]
        },
        "class_type": "VAEDecode"
      },
      "9": {
        "inputs": {
          "filename_prefix": "ComfyUI",
          "images": ["8", 0]
        },
        "class_type": "SaveImage"
      }
    }
    
    // 发送到 ComfyUI
    const comfyuiUrl = 'http://127.0.0.1:8188'
    const response = await fetch(`${comfyuiUrl}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: workflow,
        client_id: crypto.randomUUID()
      })
    })
    
    if (!response.ok) {
      throw new Error(`ComfyUI request failed: ${response.statusText}`)
    }
    
    const result = await response.json() as { prompt_id: string }
    
    return c.json({
      success: true,
      data: {
        prompt_id: result.prompt_id,
        workflow,
        message: 'Image generation started'
      }
    })
  } catch (error) {
    console.error('ComfyUI generate error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// 平台发布函数实现
async function publishToXiaohongshu(data: { title: string; content: string; images?: string[] }) {
  // 小红书发布逻辑 - 在 Worker 环境中，我们只能模拟或使用 API
  console.log('Publishing to 小红书:', data)
  
  // 这里应该集成小红书的 API 或使用其他方式
  // 由于 Worker 环境限制，我们返回模拟结果
  return {
    success: true,
    platform: 'xiaohongshu',
    message: '发布到小红书成功（模拟）',
    url: 'https://www.xiaohongshu.com/explore/mock-post-id'
  }
}

async function publishToBilibili(data: { title: string; content: string; images?: string[] }) {
  console.log('Publishing to Bilibili:', data)
  
  return {
    success: true,
    platform: 'bilibili',
    message: '发布到 Bilibili 成功（模拟）',
    url: 'https://www.bilibili.com/video/mock-video-id'
  }
}

async function publishToYoutube(data: { title: string; content: string; images?: string[] }) {
  console.log('Publishing to YouTube:', data)
  
  return {
    success: true,
    platform: 'youtube',
    message: '发布到 YouTube 成功（模拟）',
    url: 'https://www.youtube.com/watch?v=mock-video-id'
  }
}

async function publishToX(data: { title: string; content: string; images?: string[] }) {
  console.log('Publishing to X:', data)
  
  return {
    success: true,
    platform: 'x',
    message: '发布到 X 成功（模拟）',
    url: 'https://x.com/mock-user/status/mock-tweet-id'
  }
}

export { electronRoutes } 