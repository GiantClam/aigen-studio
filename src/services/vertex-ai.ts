import { GoogleAuth } from 'google-auth-library';
import { GoogleGenAI } from '@google/genai';
import type { Env } from '../types/env';

/**
 * Vertex AI 服务类
 * 集成 Google Vertex AI 的 Gemini 2.5 Flash Image Preview 模型
 */
export class VertexAIService {
  private auth: GoogleAuth | null = null;
  private genAI: GoogleGenAI | null = null;
  private env: Env;
  private projectId: string | null = null;
  private location: string = 'global';

  constructor(env: Env) {
    this.env = env;
    this.initializeVertexAI();
  }

  /**
   * 初始化 Vertex AI 客户端
   */
  private initializeVertexAI() {
    try {
      // 检查必要的环境变量
      const project = this.env.GOOGLE_CLOUD_PROJECT;
      const location = this.env.GOOGLE_CLOUD_LOCATION || 'global';
      const serviceAccountKey = this.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      const nodeEnv = this.env.NODE_ENV || 'production';

      if (!project || !serviceAccountKey) {
        console.warn('GOOGLE_CLOUD_PROJECT or GOOGLE_SERVICE_ACCOUNT_KEY not configured, Vertex AI will not be available');
        return;
      }

      this.projectId = project;
      this.location = location;

      console.log(`Vertex AI initialized for project: ${project}, location: ${location}`);

      // 解析服务账号密钥
      let credentials;
      try {
        credentials = typeof serviceAccountKey === 'string'
          ? JSON.parse(serviceAccountKey)
          : serviceAccountKey;
      } catch (error) {
        console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', error);
        return;
      }

      // 初始化 Google Auth 客户端
      this.auth = new GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });

      // 创建临时的认证文件路径（在内存中）
      const tempCredentialsPath = '/tmp/google-credentials.json';

      // 在服务器环境中写入认证文件
      if (typeof window === 'undefined') {
        const fs = require('fs');
        const path = require('path');

        // 确保目录存在
        const dir = path.dirname(tempCredentialsPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // 写入认证文件
        fs.writeFileSync(tempCredentialsPath, JSON.stringify(credentials));

        // 设置环境变量
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tempCredentialsPath;
        process.env.GOOGLE_CLOUD_PROJECT = project;
      }

      // 初始化 Google GenAI 客户端
      this.genAI = new GoogleGenAI({
        vertexai: true,
        project: project,
        location: location
      });

      console.log('Vertex AI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Vertex AI:', error instanceof Error ? error.message : String(error));
      this.auth = null;
    }
  }

  /**
   * 检查 Vertex AI 是否可用
   * 严格模式：如果不可用则抛出错误，不允许降级或模拟
   */
  isAvailable(): boolean {
    const isConfigured = this.auth !== null && this.genAI !== null && this.projectId !== null;

    if (!isConfigured) {
      const missingVars = [];
      if (!this.env.GOOGLE_CLOUD_PROJECT) missingVars.push('GOOGLE_CLOUD_PROJECT');
      if (!this.env.GOOGLE_SERVICE_ACCOUNT_KEY) missingVars.push('GOOGLE_SERVICE_ACCOUNT_KEY');

      throw new Error(
        `Vertex AI is not properly configured. Missing environment variables: ${missingVars.join(', ')}. ` +
        `This application requires real Vertex AI access and does not support simulation mode.`
      );
    }

    return true;
  }



  /**
   * 获取访问令牌
   */
  private async getAccessToken(): Promise<string> {
    if (!this.auth) {
      throw new Error('Google Auth not initialized');
    }

    const client = await this.auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error('Failed to get access token');
    }

    return accessToken.token;
  }

  /**
   * 带重试机制的 fetch
   */
  private async fetchWithRetry(url: string, options: any, maxRetries: number = 3): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} to call Vertex AI API...`);
        console.log(`Target URL: ${url}`);

        // 创建 AbortController 用于超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

        // 添加更详细的请求日志
        console.log('Request headers:', JSON.stringify(options.headers, null, 2));
        console.log('Request body length:', options.body?.length || 0);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log(`Response status: ${response.status} ${response.statusText}`);

        if (response.ok) {
          console.log('✅ Vertex AI API call successful');
          return response;
        } else {
          const errorText = await response.text();
          console.error('❌ API Error Response:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
      } catch (error: any) {
        lastError = error;
        console.warn(`❌ Attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error));

        // 特殊处理网络连接错误
        if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
          console.error('🌐 Network connectivity issue detected. Please check:');
          console.error('   1. Internet connection');
          console.error('   2. DNS resolution for googleapis.com');
          console.error('   3. Network firewall settings');
        }

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 指数退避
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`❌ All ${maxRetries} attempts failed`);
    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * 生成配置对象
   */
  private getGenerationConfig() {
    return {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ["TEXT", "IMAGE"] as any,
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH' as any,
          threshold: 'OFF' as any,
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any,
          threshold: 'OFF' as any,
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any,
          threshold: 'OFF' as any,
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT' as any,
          threshold: 'OFF' as any,
        }
      ] as any,
    };
  }

  /**
   * 将 base64 图片转换为 Vertex AI 格式
   */
  private base64ToVertexAIImage(base64Data: string) {
    // 移除 data:image/xxx;base64, 前缀
    const base64Content = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // 检测 MIME 类型
    let mimeType = 'image/jpeg';
    if (base64Data.startsWith('data:image/png')) {
      mimeType = 'image/png';
    } else if (base64Data.startsWith('data:image/webp')) {
      mimeType = 'image/webp';
    }

    return {
      inlineData: {
        mimeType: mimeType,
        data: base64Content
      }
    };
  }



  /**
   * 使用 Gemini 进行图像分析
   */
  async analyzeImage(imageData: string, prompt: string = "Describe this image in detail"): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Vertex AI is not available. Please check your configuration.'
      };
    }

    try {
      const model = 'gemini-2.5-flash-image-preview';
      
      // 准备图像数据
      const image = this.base64ToVertexAIImage(imageData);
      
      // 准备分析提示
      const text = { text: prompt };

      // 构建请求
      const req: any = {
        model: model,
        contents: [
          { role: 'user', parts: [image, text] }
        ],
        config: {
          ...this.getGenerationConfig(),
          responseModalities: ["TEXT"] // 只需要文本响应
        },
      };

      console.log('Analyzing image with Vertex AI Gemini...');

      // 调用 Vertex AI REST API
      const accessToken = await this.getAccessToken();
      const url = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${model}:generateContent`;

      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: req.contents,
          generationConfig: req.config
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vertex AI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json() as any;
      let textResponse = '';

      // 处理响应
      if (result.candidates && result.candidates[0]?.content?.parts) {
        for (const part of result.candidates[0].content.parts) {
          if (part.text) {
            textResponse += part.text;
          }
        }
      }

      return {
        success: true,
        data: {
          analysis: textResponse,
          model: model,
          prompt: prompt,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Vertex AI image analysis error:', error);
      return {
        success: false,
        error: `Failed to analyze image with Vertex AI: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * 生成图像（如果模型支持）
   */
  async generateImage(prompt: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Vertex AI is not available. Please check your configuration.'
      };
    }

    try {
      const model = 'gemini-2.5-flash-image-preview';

      console.log('🎨 Generating image with Google GenAI SDK...');
      console.log('   Model:', model);
      console.log('   Prompt:', prompt.substring(0, 100) + '...');

      // 准备生成配置
      const generationConfig = {
        maxOutputTokens: 32768,
        temperature: 1,
        topP: 0.95,
        responseModalities: ["TEXT", "IMAGE"],
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH' as any,
            threshold: 'OFF' as any,
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any,
            threshold: 'OFF' as any,
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any,
            threshold: 'OFF' as any,
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT' as any,
            threshold: 'OFF' as any,
          }
        ],
      };

      // 构建请求
      const req = {
        model: model,
        contents: [
          {
            role: 'user',
            parts: [{ text: `Generate an image: ${prompt}` }]
          }
        ],
        config: generationConfig,
      };

      // 使用 Google GenAI SDK 调用
      const streamingResp = await this.genAI!.models.generateContentStream(req);

      let textResponse = '';
      let imageResponse = null;

      // 处理流式响应
      for await (const chunk of streamingResp) {
        if (chunk.text) {
          textResponse += chunk.text;
        } else if (chunk.candidates && chunk.candidates[0]?.content?.parts) {
          for (const part of chunk.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
              imageResponse = {
                mimeType: part.inlineData.mimeType,
                data: part.inlineData.data
              };
            }
          }
        }
      }

      console.log('✅ Image generation completed');
      console.log('   Text response length:', textResponse.length);
      console.log('   Has image:', !!imageResponse);

      // 构建响应数据
      const responseData: any = {
        textResponse: textResponse,
        imageResponse: imageResponse,
        model: model,
        prompt: prompt,
        timestamp: new Date().toISOString()
      };

      // 如果有图像响应，转换为 data URL
      if (imageResponse) {
        responseData.imageUrl = `data:${imageResponse.mimeType};base64,${imageResponse.data}`;
        console.log('✅ Generated image URL created');
      } else {
        console.log('⚠️ No image data in response');
      }

      return {
        success: true,
        data: responseData
      };

    } catch (error) {
      console.error('Vertex AI image generation error:', error);
      return {
        success: false,
        error: `Failed to generate image with Vertex AI: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * 编辑图像（基于输入图像和提示）
   */
  async editImage(prompt: string, inputImage: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Vertex AI is not available. Please check your configuration.'
      };
    }

    try {
      const model = 'gemini-2.5-flash-image-preview';

      // 处理输入图像（移除data URL前缀）
      const imageData = inputImage.includes(',') ? inputImage.split(',')[1] : inputImage;
      const mimeType = inputImage.includes('data:')
        ? inputImage.split(';')[0].replace('data:', '')
        : 'image/png';

      // 构建更明确的图像编辑提示词
      const editingPrompt = `Please edit this image according to the following instruction: "${prompt}".

Important: You must return an edited version of the image. Do not just provide text explanations. Apply the requested changes directly to the image and return the modified image.

If the instruction is:
- "清除背景" or "remove background": Remove the background and make it transparent or white
- "换背景" or "change background": Change the background to a different scene
- "修改颜色" or "change color": Modify the colors as requested
- "添加效果" or "add effects": Apply visual effects to the image
- Any other editing request: Apply the changes directly to the image

Please process the image and return the edited result.`;

      // 准备请求内容
      const parts = [
        {
          inlineData: {
            mimeType: mimeType,
            data: imageData
          }
        },
        {
          text: editingPrompt
        }
      ];

      console.log('🖼️ Editing image with Google GenAI SDK...');
      console.log('   Model:', model);
      console.log('   Prompt:', prompt.substring(0, 100) + '...');
      console.log('   Image type:', mimeType);

      // 准备生成配置
      const generationConfig = {
        maxOutputTokens: 32768,
        temperature: 1,
        topP: 0.95,
        responseModalities: ["TEXT", "IMAGE"],
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH' as any,
            threshold: 'OFF' as any,
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any,
            threshold: 'OFF' as any,
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any,
            threshold: 'OFF' as any,
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT' as any,
            threshold: 'OFF' as any,
          }
        ],
      };

      // 构建请求
      const req = {
        model: model,
        contents: [
          { role: 'user', parts: parts }
        ],
        config: generationConfig,
      };

      // 使用 Google GenAI SDK 调用
      const streamingResp = await this.genAI!.models.generateContentStream(req);

      let textResponse = '';
      let imageResponse = null;

      // 处理流式响应
      for await (const chunk of streamingResp) {
        if (chunk.text) {
          textResponse += chunk.text;
        } else if (chunk.candidates && chunk.candidates[0]?.content?.parts) {
          for (const part of chunk.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
              imageResponse = {
                mimeType: part.inlineData.mimeType,
                data: part.inlineData.data
              };
            }
          }
        }
      }

      console.log('✅ Image editing completed');
      console.log('   Text response length:', textResponse.length);
      console.log('   Has edited image:', !!imageResponse);

      // 构建响应数据
      const responseData: any = {
        textResponse: textResponse,
        imageResponse: imageResponse,
        model: model,
        prompt: prompt,
        timestamp: new Date().toISOString()
      };

      // 如果有图像响应，转换为 data URL
      if (imageResponse) {
        responseData.generatedImageUrl = `data:${imageResponse.mimeType};base64,${imageResponse.data}`;
        console.log('✅ Edited image URL created');
      } else {
        console.log('⚠️ No edited image data in response');
      }

      return {
        success: true,
        data: responseData
      };

    } catch (error) {
      console.error('Vertex AI image editing error:', error);
      return {
        success: false,
        error: `Failed to edit image with Vertex AI: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
