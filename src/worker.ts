import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { aiRoutes } from './routes/ai'
import { authRoutes } from './routes/auth'
import { contentRoutes } from './routes/content'
import { storageRoutes } from './routes/storage'
import { fileRoutes } from './routes/files'
import { uploadRoutes } from './routes/upload'
import { electronRoutes } from './routes/electron'
import { generateIndexPage, generateChatPage, generateEditorPage, generateCanvasPage, generateMultiEngineCanvasPage } from './frontend/pages'

type Bindings = {
  ASSETS: Fetcher
  DB: D1Database
  STORAGE: R2Bucket
  CACHE: KVNamespace
  AI: any
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', cors())
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const end = Date.now()
  c.header('X-Response-Time', `${end - start}ms`)
})

// API Routes (higher priority)
app.route('/api/ai', aiRoutes)
app.route('/api/auth', authRoutes)
app.route('/api/content', contentRoutes)
app.route('/api/storage', storageRoutes)
app.route('/api/upload', uploadRoutes)
app.route('/api/electron', electronRoutes)
app.route('/api', fileRoutes)

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

// Frontend Routes
app.get('/chat', (c) => {
  return new Response(generateChatPage(), {
    headers: { 'Content-Type': 'text/html' }
  })
})

app.get('/editor', (c) => {
  return new Response(generateEditorPage(), {
    headers: { 'Content-Type': 'text/html' }
  })
})

app.get('/canvas', (c) => {
      return new Response(generateCanvasPage(), {
    headers: { 'Content-Type': 'text/html' }
  })
})

app.get('/canvas-multi', (c) => {
  return new Response(generateMultiEngineCanvasPage(), {
    headers: { 'Content-Type': 'text/html' }
  })
})

// Index page
app.get('/', (c) => {
  return new Response(generateIndexPage(), {
    headers: { 'Content-Type': 'text/html' }
  })
})

// Handle static assets and 404
app.get('*', async (c) => {
  const url = new URL(c.req.url)
  const pathname = url.pathname
  
  if (pathname === '/unicorn.png' || pathname === '/favicon.ico') {
    try {
      const staticFile = await c.env.STORAGE.get(`static${pathname}`)
      if (staticFile) {
        return new Response(staticFile.body, {
          headers: {
            'Content-Type': getContentType(pathname),
            'Cache-Control': 'public, max-age=86400',
            'ETag': staticFile.etag || '',
          },
        })
      }
    } catch (e) {
      console.error('Error fetching static file from R2:', e)
    }
  }
  
  // Fallback to index page for any other path (serves as a 404 handler)
  const html = generateIndexPage()
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=300',
    },
  })
})

// Helper function to determine content type
function getContentType(pathname: string): string {
  const ext = pathname.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'ttf': 'font/ttf',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'map': 'application/json',
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

export default app 