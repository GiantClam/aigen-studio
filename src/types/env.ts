export interface Env {
  AI: {
    run: (model: string, options: any) => Promise<any>
  }
  DB: {
    prepare: (query: string) => {
      bind: (...params: any[]) => {
        run: () => Promise<any>
        all: () => Promise<any>
        first: () => Promise<any>
      }
      run: () => Promise<any>
      all: () => Promise<any>
      first: () => Promise<any>
    }
  }
  STORAGE: {
    put: (key: string, value: any, options?: any) => Promise<void>
    get: (key: string) => Promise<any>
    delete: (key: string) => Promise<void>
    list: (options?: any) => Promise<any>
  }
  FILES: {
    get: (key: string) => Promise<string | null>
    put: (key: string, value: string) => Promise<void>
    delete: (key: string) => Promise<void>
  }
  JWT_SECRET: string
  REPLICATE_API_TOKEN?: string
  // Google Cloud / Vertex AI 配置
  GOOGLE_CLOUD_PROJECT?: string
  GOOGLE_CLOUD_LOCATION?: string
  GOOGLE_APPLICATION_CREDENTIALS?: string
  // 或者使用服务账号密钥 JSON
  GOOGLE_SERVICE_ACCOUNT_KEY?: string
  [key: string]: any
}