import { GoogleGenAI } from '@google/genai';
import type { Env } from '../types/env';

/**
 * Vertex AI 服务类
 * 集成 Google Vertex AI 的 Gemini 2.5 Flash Image Preview 模型
 */
export class VertexAIService {
  private ai: GoogleGenAI | null = null;
  private env: Env;

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

      if (!project) {
        console.warn('GOOGLE_CLOUD_PROJECT not configured, Vertex AI will not be available');
        return;
      }

      // 初始化 Vertex AI 客户端
      this.ai = new GoogleGenAI({
        vertexai: true,
        project: project,
        location: location
      });

      console.log(`Vertex AI initialized for project: ${project}, location: ${location}`);
    } catch (error) {
      console.error('Failed to initialize Vertex AI:', error);
      this.ai = null;
    }
  }

  /**
   * 检查 Vertex AI 是否可用
   */
  isAvailable(): boolean {
    return this.ai !== null;
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
   * 使用 Gemini 2.5 Flash Image Preview 进行图像编辑
   */
  async editImage(imageData: string, instruction: string): Promise<{
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
      
      // 准备文本指令
      const text = { text: instruction };

      // 构建请求
      const req: any = {
        model: model,
        contents: [
          { role: 'user', parts: [image, text] }
        ],
        config: this.getGenerationConfig(),
      };

      console.log('Sending request to Vertex AI Gemini 2.5 Flash Image Preview...');

      // 调用 Vertex AI
      const streamingResp = await this.ai!.models.generateContentStream(req);

      let textResponse = '';
      let imageResponse = null;

      // 处理流式响应
      for await (const chunk of streamingResp) {
        if (chunk.text) {
          textResponse += chunk.text;
        } else if (chunk.candidates && chunk.candidates[0]?.content?.parts) {
          // 检查是否有图像响应
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

      // 构建响应数据
      const responseData: any = {
        textResponse: textResponse,
        imageResponse: imageResponse,
        model: model,
        instruction: instruction,
        timestamp: new Date().toISOString()
      };

      // 如果有图像响应，转换为 data URL
      if (imageResponse) {
        responseData.editedImageUrl = `data:${imageResponse.mimeType};base64,${imageResponse.data}`;
      }

      return {
        success: true,
        data: responseData
      };

    } catch (error) {
      console.error('Vertex AI image editing error:', error);
      return {
        success: false,
        error: `Failed to edit image with Vertex AI: ${error.message || 'Unknown error'}`
      };
    }
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

      // 调用 Vertex AI
      const streamingResp = await this.ai!.models.generateContentStream(req);

      let textResponse = '';

      // 处理流式响应
      for await (const chunk of streamingResp) {
        if (chunk.text) {
          textResponse += chunk.text;
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
        error: `Failed to analyze image with Vertex AI: ${error.message || 'Unknown error'}`
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

      // 调用 Vertex AI
      const streamingResp = await this.ai!.models.generateContentStream(req);

      let textResponse = '';
      let imageResponse = null;

      // 处理流式响应
      for await (const chunk of streamingResp) {
        if (chunk.text) {
          textResponse += chunk.text;
        } else if (chunk.candidates && chunk.candidates[0]?.content?.parts) {
          // 检查是否有图像响应
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
        error: `Failed to generate image with Vertex AI: ${error.message || 'Unknown error'}`
      };
    }
  }
}
