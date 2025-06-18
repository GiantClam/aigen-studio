import { Hono } from 'hono'
import type { Env } from '../types/env'

// Initialize AI
const aiRouter = new Hono<{ Bindings: Env }>()

// 文本生成
aiRouter.post('/generate', async (c) => {
  try {
    const { prompt, maxTokens = 100, temperature = 0.7 } = await c.req.json()
    
    if (!prompt) {
      return c.json({
        success: false,
        error: 'Prompt is required'
      }, 400)
    }

    // 如果有 AI 绑定，使用 Cloudflare AI
    if (c.env?.AI) {
      const response = await c.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        prompt,
        max_tokens: maxTokens,
        temperature
      })
      
      return c.json({
        success: true,
        data: response
      })
    }
    
    // 否则返回模拟响应
    const response = {
      response: `AI response to: ${prompt}`,
      usage: {
        prompt_tokens: prompt.length / 4,
        completion_tokens: maxTokens,
        total_tokens: (prompt.length / 4) + maxTokens
      }
    }
    
    return c.json({
      success: true,
      data: response
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to generate response'
    }, 500)
  }
})

// 对话功能
aiRouter.post('/chat', async (c) => {
  try {
    const { messages, model = '@cf/meta/llama-2-7b-chat-int8' } = await c.req.json()
    
    if (!messages || !Array.isArray(messages)) {
      return c.json({
        success: false,
        error: 'Messages array is required'
      }, 400)
    }

    // 构建对话提示
    const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')
    
    if (c.env?.AI) {
      const response = await c.env.AI.run(model, {
        prompt: prompt + '\nassistant:',
        max_tokens: 150,
        temperature: 0.7
      })
      
      return c.json({
        success: true,
        data: {
          content: response.response,
          role: 'assistant'
        }
      })
    }
    
    // 模拟响应
    return c.json({
      success: true,
      data: {
        content: `This is a simulated AI response to the conversation.`,
        role: 'assistant'
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to process chat'
    }, 500)
  }
})

// 获取可用模型
aiRouter.get('/models', (c) => {
  return c.json({
    success: true,
    data: [
      '@cf/meta/llama-2-7b-chat-int8',
      '@cf/microsoft/DialoGPT-medium',
      '@cf/meta/llama-2-7b-chat-fp16'
    ]
  })
})

// Auto-complete content
aiRouter.post('/complete', async (c) => {
  try {
    const { content, context } = await c.req.json()
    
    if (c.env?.AI) {
      const response = await c.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        prompt: `Complete the following content based on the context:\nContext: ${context}\nContent: ${content}`,
        max_tokens: 500,
        temperature: 0.5
      })

      return c.json({
        success: true,
        data: response
      })
    }
    
    // 模拟响应
    return c.json({
      success: true,
      data: {
        response: `Completed content based on context: ${context}. Original: ${content}`,
        usage: {
          prompt_tokens: (context + content).length / 4,
          completion_tokens: 100,
          total_tokens: (context + content).length / 4 + 100
        }
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to complete content'
    }, 500)
  }
})

// Generate reply suggestions
aiRouter.post('/reply-suggestions', async (c) => {
  try {
    const { post, product } = await c.req.json()
    
    if (c.env?.AI) {
      const response = await c.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        prompt: `Generate natural reply suggestions for the following post, incorporating the product information:\nPost: ${post}\nProduct: ${product}`,
        max_tokens: 300,
        temperature: 0.7
      })

      return c.json({
        success: true,
        data: response
      })
    }
    
    // 模拟响应
    return c.json({
      success: true,
      data: {
        response: `Here are some reply suggestions for the post about ${product}`,
        suggestions: [
          'Great point about this product!',
          'I have similar experience with this.',
          'Thanks for sharing this information.'
        ]
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to generate reply suggestions'
    }, 500)
  }
})

// 获取聊天会话列表
aiRouter.get('/chat/sessions', async (c) => {
  try {
    // 模拟聊天会话数据
    const sessions = [
      {
        id: 'session_1',
        model: '@cf/meta/llama-2-7b-chat-int8',
        provider: 'cloudflare',
        title: 'General Discussion',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'session_2',
        model: '@cf/meta/llama-2-7b-chat-int8',
        provider: 'cloudflare',
        title: 'Code Review',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'session_3',
        model: '@cf/meta/llama-2-7b-chat-int8',
        provider: 'cloudflare',
        title: 'Project Planning',
        created_at: new Date(Date.now() - 259200000).toISOString(),
        updated_at: new Date(Date.now() - 10800000).toISOString()
      }
    ]

    if (c.env?.DB) {
      // 从数据库获取真实的聊天会话
      const results = await c.env.DB.prepare(`
        SELECT * FROM chat_sessions 
        ORDER BY updated_at DESC 
        LIMIT 50
      `).all()
      
      return c.json({
        success: true,
        data: results.results || sessions
      })
    }
    
    return c.json({
      success: true,
      data: sessions
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch chat sessions'
    }, 500)
  }
})

// AI 图片生成 - CoT 思维链分析
aiRouter.post('/generate-image', async (c) => {
  try {
    const { userPrompt, conversationHistory = [] } = await c.req.json()
    
    if (!userPrompt) {
      return c.json({
        success: false,
        error: 'User prompt is required'
      }, 400)
    }

    // Step 1: 使用 CoT 思维链分析用户意图
    const cotPrompt = `
你是一个专业的AI图片生成助手。请使用Chain of Thought(思维链)方式分析用户的图片生成请求，然后生成高质量的英文提示词。

用户请求：${userPrompt}
${conversationHistory.length > 0 ? `对话历史：${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}` : ''}

请按以下步骤分析：

1. **理解用户意图**：分析用户想要生成什么类型的图片
2. **识别关键元素**：提取主题、风格、色彩、构图等关键信息
3. **补充细节**：基于常见的优质图片特征，添加必要的细节描述
4. **优化提示词**：生成符合FLUX模型要求的英文提示词

请以JSON格式回复：
{
  "thinking": "你的思考过程",
  "imagePrompt": "优化后的英文提示词",
  "style": "图片风格",
  "confidence": "置信度(0-1)"
}
`

    let cotAnalysis
    if (c.env?.AI) {
      const cotResponse = await c.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        prompt: cotPrompt,
        max_tokens: 800,
        temperature: 0.3
      })
      
      try {
        // 尝试解析JSON响应
        const jsonMatch = cotResponse.response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          cotAnalysis = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        // 如果JSON解析失败，使用简单的文本提取
        cotAnalysis = {
          thinking: cotResponse.response,
          imagePrompt: userPrompt,
          style: "realistic",
          confidence: 0.7
        }
      }
    } else {
      // 模拟CoT分析
      cotAnalysis = {
        thinking: `分析用户请求"${userPrompt}"：这是一个图片生成需求，我需要将其转化为详细的英文提示词。`,
        imagePrompt: `${userPrompt}, high quality, detailed, professional photography`,
        style: "realistic",
        confidence: 0.8
      }
    }

    // Step 2: 调用 Replicate FLUX 模型生成图片
    const fluxApiUrl = 'https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions'
    
    try {
      // 通过 Cloudflare AI Gateway 调用 Replicate
      const replicateResponse = await fetch(fluxApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${c.env.REPLICATE_API_TOKEN || 'dummy-token'}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Cloudflare-Worker'
        },
        body: JSON.stringify({
          input: {
            prompt: cotAnalysis.imagePrompt,
            width: 1024,
            height: 1024,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 50,
            seed: Math.floor(Math.random() * 1000000)
          }
        })
      })

      if (!replicateResponse.ok) {
        throw new Error(`Replicate API error: ${replicateResponse.status}`)
      }

      const replicateData = await replicateResponse.json() as any
      
      // 确保output始终是数组格式
      const output = replicateData.output 
        ? (Array.isArray(replicateData.output) ? replicateData.output : [replicateData.output]) 
        : null
      
      return c.json({
        success: true,
        data: {
          predictionId: replicateData.id,
          status: replicateData.status,
          cotAnalysis,
          originalPrompt: userPrompt,
          generatedPrompt: cotAnalysis.imagePrompt,
          urls: replicateData.urls || null,
          output: output
        }
      })
      
    } catch (replicateError) {
      console.error('Replicate API error:', replicateError)
      
      // 返回模拟响应用于开发测试
      const timestamp = Date.now()
      return c.json({
        success: true,
        data: {
          predictionId: `sim_${timestamp}`,
          status: 'succeeded',
          cotAnalysis,
          originalPrompt: userPrompt,
          generatedPrompt: cotAnalysis.imagePrompt,
          urls: {
            get: `https://example.com/prediction/sim_${timestamp}`
          },
          output: [`https://picsum.photos/1024/1024?random=${timestamp}`], // 使用随机图片作为演示，始终使用数组格式
          isSimulated: true
        }
      })
    }

  } catch (error) {
    console.error('Image generation error:', error)
    return c.json({
      success: false,
      error: 'Failed to generate image'
    }, 500)
  }
})

// 获取图片生成状态
aiRouter.get('/image-status/:predictionId', async (c) => {
  try {
    const predictionId = c.req.param('predictionId')
    
    // 如果是模拟ID，返回模拟状态
    if (predictionId.startsWith('sim_')) {
      const randomId = predictionId.replace('sim_', '')
      return c.json({
        success: true,
        data: {
          id: predictionId,
          status: 'succeeded',
          output: [`https://picsum.photos/1024/1024?random=${randomId}`], // 确保output始终是数组格式
          urls: {
            get: `https://example.com/prediction/${predictionId}`
          }
        }
      })
    }
    
    // 查询真实的 Replicate 状态
    const statusUrl = `https://api.replicate.com/v1/predictions/${predictionId}`
    
    const response = await fetch(statusUrl, {
      headers: {
        'Authorization': `Token ${c.env.REPLICATE_API_TOKEN || 'dummy-token'}`,
        'User-Agent': 'Cloudflare-Worker'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Replicate status check failed: ${response.status}`)
    }
    
    const data = await response.json() as any
    
    // 确保output始终是数组格式
    const output = data.output 
      ? (Array.isArray(data.output) ? data.output : [data.output]) 
      : null
    
    return c.json({
      success: true,
      data: {
        id: data.id,
        status: data.status,
        output: output,
        error: data.error,
        urls: data.urls
      }
    })
    
  } catch (error) {
    console.error('Status check error:', error)
    return c.json({
      success: false,
      error: 'Failed to check image generation status'
    }, 500)
  }
})

// 智能对话 - 针对图片生成优化
aiRouter.post('/chat-image', async (c) => {
  try {
    const { messages, context = 'image_generation' } = await c.req.json()
    
    if (!messages || !Array.isArray(messages)) {
      return c.json({
        success: false,
        error: 'Messages array is required'
      }, 400)
    }

    // 构建专门用于图片生成的对话提示
    const systemPrompt = `你是一个专业的AI图片生成助手。你的任务是：
1. 理解用户的图片生成需求
2. 提供创意建议和优化建议
3. 解释图片生成的技术细节
4. 帮助用户完善他们的想法

请用友好、专业的语调回应用户，并在适当时候询问更多细节以便生成更好的图片。`

    const conversationPrompt = `${systemPrompt}\n\n${messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\nassistant:`
    
    if (c.env?.AI) {
      const response = await c.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        prompt: conversationPrompt,
        max_tokens: 300,
        temperature: 0.7
      })
      
      return c.json({
        success: true,
        data: {
          content: response.response,
          role: 'assistant',
          context: 'image_generation'
        }
      })
    }
    
    // 模拟专业的图片生成助手响应
    const lastMessage = messages[messages.length - 1]?.content || ''
    let simulatedResponse = ''
    
    if (lastMessage.includes('生成') || lastMessage.includes('图片') || lastMessage.includes('画')) {
      simulatedResponse = '我理解您想要生成图片。为了创建最符合您期望的图片，请告诉我更多细节：比如您希望的风格、色彩搭配、场景设置等。我会使用先进的AI技术来实现您的创意想法。'
    } else {
      simulatedResponse = '我是您的AI图片生成助手，随时准备帮您创建精美的图片。请描述您想要生成的图片内容，我会用专业的技术为您实现。'
    }
    
    return c.json({
      success: true,
      data: {
        content: simulatedResponse,
        role: 'assistant',
        context: 'image_generation'
      }
    })
    
  } catch (error) {
    console.error('Chat with image error:', error)
    return c.json({ success: false, error: 'Failed to process chat' }, 500)
  }
})

// 添加图像代理API以解决跨域问题
aiRouter.get('/proxy-image', async (c) => {
  try {
    const imageUrl = c.req.query('url')
    
    if (!imageUrl) {
      return c.json({
        success: false,
        error: 'Image URL is required'
      }, 400)
    }
    
    // 获取图像
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }
    
    // 获取内容类型
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    // 返回图像数据
    return new Response(response.body, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      }
    })
    
  } catch (error) {
    console.error('Image proxy error:', error)
    return c.json({
      success: false,
      error: 'Failed to proxy image'
    }, 500)
  }
})

export { aiRouter as aiRoutes } 