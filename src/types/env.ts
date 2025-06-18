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
  [key: string]: any
} 