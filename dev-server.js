// 本地开发服务器
// 模拟 Vercel API Routes 的行为

// 加载环境变量
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS 中间件
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// 动态导入 API 处理器的辅助函数
async function loadHandler(handlerPath) {
  try {
    const module = await import(handlerPath);
    return module.default;
  } catch (error) {
    console.error(`Failed to load handler: ${handlerPath}`, error);
    return null;
  }
}

// API 路由映射
const apiRoutes = [
  { path: '/api/health', file: './dist/api/health.js' },
  { path: '/api/ai/image/edit', file: './dist/api/ai/image/edit.js' },
  { path: '/api/ai/image/analyze', file: './dist/api/ai/image/analyze.js' },
  { path: '/api/ai/image/generate', file: './dist/api/ai/image/generate.js' },
  { path: '/standard-editor', file: './dist/api/image-editor.js' },
  { path: '/', file: './dist/api/index.js' }
];

// 注册 API 路由
apiRoutes.forEach(route => {
  app.all(route.path, async (req, res) => {
    const handler = await loadHandler(route.file);
    if (handler) {
      try {
        await handler(req, res);
      } catch (error) {
        console.error(`Error in ${route.path}:`, error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      res.status(500).json({ error: 'Handler not found' });
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Development server running at http://localhost:${PORT}`);
  console.log(`📝 Image Editor: http://localhost:${PORT}/standard-editor`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('📋 Available API endpoints:');
  apiRoutes.forEach(route => {
    console.log(`   ${route.path}`);
  });
  console.log('');
  console.log('💡 Press Ctrl+C to stop the server');
});
