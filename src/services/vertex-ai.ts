import { GoogleAuth } from 'google-auth-library';
import type { Env } from '../types/env';

/**
 * Vertex AI 服务类
 * 集成 Google Vertex AI 的 Gemini 2.5 Flash Image Preview 模型
 */
export class VertexAIService {
  private auth: GoogleAuth | null = null;
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

      console.log('Vertex AI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Vertex AI:', error instanceof Error ? error.message : String(error));
      this.auth = null;
    }
  }

  /**
   * 检查 Vertex AI 是否可用
   */
  isAvailable(): boolean {
    return this.auth !== null && this.projectId !== null;
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

        // 创建 AbortController 用于超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log('Vertex AI API call successful');
          return response;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error: any) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error));

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 指数退避
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`All ${maxRetries} attempts failed`);
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
      
      // 准备生成提示
      const text = { text: `Generate an image: ${prompt}` };

      // 构建请求
      const req: any = {
        model: model,
        contents: [
          { role: 'user', parts: [text] }
        ],
        config: this.getGenerationConfig(),
      };

      console.log('Generating image with Vertex AI Gemini...');

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
      let imageResponse = null;

      // 处理响应
      if (result.candidates && result.candidates[0]?.content?.parts) {
        for (const part of result.candidates[0].content.parts) {
          if (part.text) {
            textResponse += part.text;
          } else if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            imageResponse = {
              mimeType: part.inlineData.mimeType,
              data: part.inlineData.data
            };
          }
        }
      }

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

      // 准备请求内容
      const parts = [
        {
          inlineData: {
            mimeType: mimeType,
            data: imageData
          }
        },
        {
          text: prompt
        }
      ];

      // 构建请求
      const req: any = {
        model: model,
        contents: [
          { role: 'user', parts: parts }
        ],
        config: {
          ...this.getGenerationConfig(),
          responseModalities: ['TEXT', 'IMAGE']
        },
      };

      console.log('Editing image with Vertex AI Gemini...');

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
      let imageResponse = null;

      // 处理响应
      if (result.candidates && result.candidates[0]?.content?.parts) {
        for (const part of result.candidates[0].content.parts) {
          if (part.text) {
            textResponse += part.text;
          } else if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            imageResponse = {
              mimeType: part.inlineData.mimeType,
              data: part.inlineData.data
            };
          }
        }
      }

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
