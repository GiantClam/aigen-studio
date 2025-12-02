import { GoogleAuth } from 'google-auth-library';
import { GoogleGenAI } from '@google/genai'
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
        
        // 验证服务账号密钥格式
        if (!credentials.type || !credentials.project_id || !credentials.private_key || !credentials.client_email) {
          throw new Error('Invalid service account key format');
        }
        
        console.log(`Service account: ${credentials.client_email}`);
        console.log(`Project ID: ${credentials.project_id}`);
      } catch (error) {
        console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', error);
        return;
      }

      // 清除可能冲突的环境变量
      if (typeof window === 'undefined') {
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      }

      // 初始化 Google Auth 客户端
      this.auth = new GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        projectId: project
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

      console.log('Vertex AI initialized successfully (REST client)');
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
    const hasRest = this.auth !== null && this.projectId !== null;
    const hasGenAIKey = !!this.env.GOOGLE_CLOUD_API_KEY || !!process.env.GOOGLE_CLOUD_API_KEY;

    if (!hasRest && !hasGenAIKey) {
      const missingVars: string[] = [];
      if (!this.env.GOOGLE_CLOUD_PROJECT) missingVars.push('GOOGLE_CLOUD_PROJECT');
      if (!this.env.GOOGLE_SERVICE_ACCOUNT_KEY) missingVars.push('GOOGLE_SERVICE_ACCOUNT_KEY');
      if (!this.env.GOOGLE_CLOUD_API_KEY && !process.env.GOOGLE_CLOUD_API_KEY) missingVars.push('GOOGLE_CLOUD_API_KEY');

      throw new Error(
        `Vertex/GenAI not configured. Missing: ${missingVars.join(', ')}.`
      );
    }

    return true;
  }

  /**
   * 初始化 Google GenAI SDK 客户端（按需）
   */
  private initializeGenAI() {
    if (this.genAI) return;
    const apiKey = this.env.GOOGLE_CLOUD_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_CLOUD_API_KEY is not configured for GenAI SDK');
    }
    this.genAI = new GoogleGenAI({ apiKey });
  }



  /**
   * 获取访问令牌
   */
  private async getAccessToken(): Promise<string> {
    if (!this.auth) {
      throw new Error('Google Auth not initialized');
    }

    let lastError: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Attempt ${attempt}/3 to get Google access token...`);
        const client = await this.auth.getClient();
        const accessToken = await client.getAccessToken();

        if (!accessToken.token) {
          throw new Error('Failed to get access token');
        }

        return accessToken.token;
      } catch (error: any) {
        lastError = error;
        console.warn(`Get access token attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error));
        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Waiting ${delay}ms before retrying access token...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    console.error('Failed to get access token after retries:', lastError);

    if (lastError instanceof Error) {
      if (lastError.message.includes('invalid_grant') || lastError.message.includes('account not found')) {
        throw new Error(
          'Google Cloud authentication failed. Please check:\n' +
          '1. Service account key is valid and not expired\n' +
          '2. Service account has proper permissions\n' +
          '3. Project ID is correct\n' +
          '4. No conflicting GOOGLE_APPLICATION_CREDENTIALS environment variable\n' +
          `Original error: ${lastError.message}`
        );
      }
    }

    throw lastError || new Error('Unknown error when getting access token');
  }

  /**
   * 根据模型选择合适的可用区域
   */
  private resolveLocationForModel(model: string): string {
    const m = (model || '').toLowerCase();
    // 预览/高质量图像模型通常仅在 us-central1 提供
    if (m.includes('gemini-3-pro-image-preview')) return 'us-central1';
    if (m.includes('gemini-2.5-flash-image')) return this.location || 'us-central1';
    return this.location || 'us-central1';
  }

  private getLocationsForModel(model: string): string[] {
    const m = (model || '').toLowerCase();
    if (m.includes('gemini-3-pro-image-preview')) return ['us-east4', 'us-central1'];
    return [this.resolveLocationForModel(model)];
  }

  private getModelSettings(model: string) {
    const m = (model || '').toLowerCase();
    if (m.includes('gemini-3-pro-image-preview')) {
      return {
        generationConfig: {
          maxOutputTokens: 32768,
          temperature: 1,
          topP: 0.95,
          responseMimeType: 'image/png'
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
        ]
      }
    }
    return {
      generationConfig: {
        maxOutputTokens: 32768,
        temperature: 1,
        topP: 0.95
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
      ]
    }
  }

  private getEditModelSettings(model: string) {
    const m = (model || '').toLowerCase();
    if (m.includes('gemini-3-pro-image-preview')) {
      return this.getModelSettings(model)
    }
    return {
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.4,
        topP: 0.95
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
      ]
    }
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
      topP: 0.95
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
      const model = 'gemini-2.5-flash-image';
      
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
          ...this.getGenerationConfig()
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
          generationConfig: req.config,
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH' as any, threshold: 'BLOCK_NONE' as any },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any, threshold: 'BLOCK_NONE' as any },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any, threshold: 'BLOCK_NONE' as any },
            { category: 'HARM_CATEGORY_HARASSMENT' as any, threshold: 'BLOCK_NONE' as any }
          ] as any
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
  async generateImage(prompt: string, model?: string): Promise<{
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
      const useModel = (model && model.trim()) || 'gemini-2.5-flash-image'
      const cleanPrompt = prompt.trim();

      // HQ 模型使用 Google GenAI SDK，其它模型使用 Vertex REST
      const isHQ = useModel.toLowerCase().includes('gemini-3-pro-image-preview');
      const settings = this.getModelSettings(useModel);
      const generationConfig = settings.generationConfig;

      if (isHQ) {
        console.log('🎨 Generating image with Google GenAI SDK...');
        console.log('   Model:', useModel);
        console.log('   Prompt:', prompt.substring(0, 100) + '...');

        this.initializeGenAI();
        const ai = this.genAI as any;

        const contents = [
          { role: 'user', parts: [{ text: cleanPrompt }] }
        ];

        const safetySettings = [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' }
        ];

        const result = await ai.models.generateContent({
          model: useModel,
          contents,
          generationConfig,
          safetySettings,
          responseModalities: ['IMAGE']
        });

        const res = (result?.response || result) as any;

        let textResponse = '';
        let imageResponse: any = null;

        const parts = res?.candidates?.[0]?.content?.parts || res?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.text) textResponse += part.text;
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            imageResponse = {
              mimeType: part.inlineData.mimeType,
              data: part.inlineData.data
            };
          }
        }

        const responseData: any = {
          textResponse,
          imageResponse,
          model: useModel,
          prompt,
          timestamp: new Date().toISOString()
        };
        if (imageResponse) {
          responseData.imageUrl = `data:${imageResponse.mimeType};base64,${imageResponse.data}`;
        }
        return { success: true, data: responseData };
      }

      console.log('🎨 Generating image with Vertex AI REST API...');
      console.log('   Model:', useModel);
      console.log('   Prompt:', prompt.substring(0, 100) + '...');

      const req = {
        model: useModel,
        contents: [
          { role: 'user', parts: [{ text: `Generate an image: ${cleanPrompt}` }] }
        ],
        config: generationConfig,
      };

      const accessToken = await this.getAccessToken();
      const locs = this.getLocationsForModel(useModel);
      let response: Response | null = null;
      let lastErr: any = null;
      for (const loc of locs) {
        try {
          const url = `https://${loc}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${loc}/publishers/google/models/${useModel}:generateContent`;
          response = await this.fetchWithRetry(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: req.contents,
              generationConfig: req.config,
              safetySettings: settings.safetySettings as any
            })
          });
          if (response && response.ok) break;
        } catch (e: any) {
          lastErr = e;
          const msg = String(e?.message || '');
          if (msg.includes('HTTP 404') || msg.includes('Not Found')) {
            continue;
          }
          throw e;
        }
      }
      if (!response) {
        throw lastErr || new Error('No response from Vertex AI');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vertex AI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json() as any;

      let textResponse = '';
      let imageResponse = null as any;

      if (result.candidates && result.candidates[0]?.content?.parts) {
        for (const part of result.candidates[0].content.parts) {
          if (part.text) {
            textResponse += part.text;
          }
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            imageResponse = {
              mimeType: part.inlineData.mimeType,
              data: part.inlineData.data
            };
          }
        }
      }

      const responseData: any = {
        textResponse: textResponse,
        imageResponse: imageResponse,
        model: useModel,
        prompt: prompt,
        timestamp: new Date().toISOString()
      };

      if (imageResponse) {
        responseData.imageUrl = `data:${imageResponse.mimeType};base64,${imageResponse.data}`;
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
  async editImage(imageOrPrompt: string, promptOrImage: string, model?: string): Promise<{
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
      const useModel = (model && model.trim()) || 'gemini-2.5-flash-image'
      const firstIsImage = typeof imageOrPrompt === 'string' && (imageOrPrompt.startsWith('data:image') || imageOrPrompt.includes('data:image/') || imageOrPrompt.startsWith('http'))
      const inputImage = firstIsImage ? imageOrPrompt : promptOrImage
      const prompt = firstIsImage ? promptOrImage : imageOrPrompt
      const cleanInstruction = (prompt || '').trim();

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
          text: cleanInstruction
        }
      ];

      const settings = this.getEditModelSettings(useModel)
      const generationConfig = settings.generationConfig

      const isHQ = useModel.toLowerCase().includes('gemini-3-pro-image-preview');
      if (isHQ) {
        this.initializeGenAI();
        const ai = this.genAI as any;

        const contents = [
          { role: 'user', parts }
        ];

        const safetySettings = [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' }
        ];

        const result = await ai.models.generateContent({
          model: useModel,
          contents,
          generationConfig,
          safetySettings,
          responseModalities: ['IMAGE']
        });

        const res = (result?.response || result) as any;
        let textResponse = '';
        let imageResponse: any = null;
        const resultParts = res?.candidates?.[0]?.content?.parts || [];
        for (const part of resultParts) {
          if (part.text) textResponse += part.text;
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            imageResponse = {
              mimeType: part.inlineData.mimeType,
              data: part.inlineData.data
            };
          }
        }

        const responseData: any = {
          textResponse,
          imageResponse,
          model: useModel,
          prompt: prompt,
          timestamp: new Date().toISOString()
        };
        if (imageResponse) {
          responseData.generatedImageUrl = `data:${imageResponse.mimeType};base64,${imageResponse.data}`;
          responseData.imageUrl = responseData.generatedImageUrl;
        }

        return {
          success: true,
          data: responseData
        };
      }

      const req = {
        model: useModel,
        contents: [
          { role: 'user', parts: parts }
        ],
        config: generationConfig,
      };

      const accessToken = await this.getAccessToken();
      const locsEdit = this.getLocationsForModel(useModel);
      let response: Response | null = null;
      let lastErr: any = null;
      for (const loc of locsEdit) {
        try {
          const url = `https://${loc}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${loc}/publishers/google/models/${useModel}:generateContent`;
          response = await this.fetchWithRetry(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: req.contents,
              generationConfig: req.config,
              safetySettings: settings.safetySettings as any
            })
          });
          if (response && response.ok) break;
        } catch (e: any) {
          lastErr = e;
          const msg = String(e?.message || '');
          if (msg.includes('HTTP 404') || msg.includes('Not Found')) {
            continue;
          }
          throw e;
        }
      }
      if (!response) {
        throw lastErr || new Error('No response from Vertex AI');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vertex AI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json() as any;

      let textResponse = '';
      let imageResponse = null as any;

      if (result.candidates && result.candidates[0]?.content?.parts) {
        const resultParts = result.candidates[0].content.parts;
        console.log(`🔍 Examining ${resultParts.length} parts in REST response`);
        for (const part of resultParts) {
          if (part.text) {
            textResponse += part.text;
          }
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            console.log('🖼️ Found image data (REST):', {
              mimeType: part.inlineData.mimeType,
              dataLength: part.inlineData.data?.length || 0
            });
            imageResponse = {
              mimeType: part.inlineData.mimeType,
              data: part.inlineData.data
            };
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
        model: useModel,
        prompt: prompt,
        timestamp: new Date().toISOString()
      };

      // 如果有图像响应，转换为 data URL
      if (imageResponse) {
        responseData.generatedImageUrl = `data:${imageResponse.mimeType};base64,${imageResponse.data}`;
        console.log('✅ Edited image URL created');
        console.log('   Image size (bytes):', imageResponse.data?.length || 0);
        console.log('   MIME type:', imageResponse.mimeType);

        // 检查是否是空白图像（通过数据大小判断）
        const imageSize = imageResponse.data?.length || 0;
        if (imageSize < 1000) {
          console.log('⚠️ Warning: Generated image is very small, might be blank');
        }
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
  
