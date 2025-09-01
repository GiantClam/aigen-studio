// 页面模板生成器
export interface PageData {
  title?: string
  description?: string
  features?: Array<{
    icon: string
    title: string
    description: string
  }>
}

export function generateIndexPage(data?: PageData): string {
  const defaultData: PageData = {
    title: 'AI Gen Studio - 免费在线 AI 图像编辑器和生成工具',
    description: '强大的AI驱动创意工具，支持智能图像生成、专业编辑、实时协作。无需下载，浏览器直接使用。',
    features: [
      {
        icon: '🤖',
        title: 'AI 图像生成器',
        description: '使用最新的 Vertex AI 和 FLUX 模型，从文本描述生成高质量图像，支持多种风格和尺寸'
      },
      {
        icon: '✨',
        title: 'AI 智能增强',
        description: '一键智能优化图像质量，自动调整亮度、对比度、色彩饱和度，让照片更加专业'
      },
      {
        icon: '🎨',
        title: '专业编辑工具',
        description: '完整的图像编辑套件，包括画笔、文字、形状、滤镜等专业工具，支持图层操作'
      },
      {
        icon: '🧠',
        title: 'CoT 智能推理',
        description: '先进的思维链推理技术，自动优化用户提示词，提升AI生成效果和准确性'
      },
      {
        icon: '☁️',
        title: '云端协作',
        description: '基于 Cloudflare 全球网络，支持实时同步、多设备访问、安全存储和团队协作'
      },
      {
        icon: '📱',
        title: '跨平台支持',
        description: '响应式设计，完美适配桌面、平板、手机，随时随地进行创意工作'
      }
    ]
  }

  const pageData = { ...defaultData, ...data }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageData.title}</title>
    <meta name="description" content="${pageData.description}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <style>
        :root {
            --primary-color: #2563eb;
            --primary-hover: #1d4ed8;
            --secondary-color: #64748b;
            --accent-color: #f59e0b;
            --success-color: #10b981;
            --background: #ffffff;
            --surface: #f8fafc;
            --surface-hover: #f1f5f9;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --text-muted: #94a3b8;
            --border: #e2e8f0;
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            background: var(--background);
            min-height: 100vh;
        }

        /* Navigation */
        .navbar {
            background: var(--background);
            border-bottom: 1px solid var(--border);
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.95);
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
            text-decoration: none;
        }

        .nav-menu {
            display: flex;
            align-items: center;
            gap: 2rem;
            list-style: none;
        }

        .nav-link {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s ease;
        }

        .nav-link:hover {
            color: var(--primary-color);
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;
            font-size: 0.875rem;
        }

        .btn-primary {
            background: var(--primary-color);
            color: white;
        }

        .btn-primary:hover {
            background: var(--primary-hover);
            transform: translateY(-1px);
            box-shadow: var(--shadow-lg);
        }

        .btn-outline {
            background: transparent;
            color: var(--text-primary);
            border: 1px solid var(--border);
        }

        .btn-outline:hover {
            background: var(--surface-hover);
        }

        .btn-google {
            background: white;
            color: var(--text-primary);
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
        }

        .btn-google:hover {
            box-shadow: var(--shadow-lg);
            transform: translateY(-1px);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        /* Hero Section */
        .hero {
            padding: 4rem 0 6rem 0;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            position: relative;
            overflow: hidden;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }

        .hero-content {
            position: relative;
            z-index: 1;
        }

        .hero-title {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 1.5rem;
            line-height: 1.1;
        }

        .hero-subtitle {
            font-size: 1.25rem;
            opacity: 0.9;
            margin-bottom: 2.5rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .hero-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 3rem;
        }

        .btn-hero {
            padding: 1rem 2rem;
            font-size: 1.1rem;
            border-radius: 0.75rem;
        }

        .btn-hero-primary {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
        }

        .btn-hero-primary:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }

        .btn-hero-secondary {
            background: white;
            color: var(--primary-color);
            border: 1px solid white;
        }

        .btn-hero-secondary:hover {
            background: var(--surface);
            transform: translateY(-2px);
        }
        
        /* Features Section */
        .features-section {
            padding: 6rem 0;
            background: var(--surface);
        }

        .section-header {
            text-align: center;
            margin-bottom: 4rem;
        }

        .section-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .section-subtitle {
            font-size: 1.125rem;
            color: var(--text-secondary);
            max-width: 600px;
            margin: 0 auto;
        }

        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }

        .feature-card {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            border: 1px solid var(--border);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .feature-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
            border-color: var(--primary-color);
        }

        .feature-card:hover::before {
            transform: scaleX(1);
        }

        .feature-icon {
            font-size: 3rem;
            margin-bottom: 1.5rem;
            display: block;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .feature-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .feature-description {
            color: var(--text-secondary);
            line-height: 1.6;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
            .nav-menu {
                display: none;
            }

            .hero-title {
                font-size: 2.5rem;
            }

            .features {
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            }
        }

        @media (max-width: 768px) {
            .nav-container {
                padding: 0 1rem;
            }

            .nav-actions {
                gap: 0.5rem;
            }

            .btn-google {
                padding: 0.5rem 1rem;
                font-size: 0.8rem;
            }

            .hero {
                padding: 3rem 0 4rem 0;
            }

            .hero-title {
                font-size: 2rem;
            }

            .hero-subtitle {
                font-size: 1rem;
            }

            .hero-actions {
                flex-direction: column;
                align-items: center;
            }

            .btn-hero {
                width: 100%;
                max-width: 280px;
            }

            .section-title {
                font-size: 2rem;
            }

            .features {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .container {
                padding: 0 1rem;
            }
        }

        @media (max-width: 480px) {
            .logo {
                font-size: 1.25rem;
            }

            .hero-title {
                font-size: 1.75rem;
            }

            .section-title {
                font-size: 1.75rem;
            }

            .feature-card {
                padding: 1.5rem;
            }

            .btn-google svg {
                width: 16px;
                height: 16px;
            }
        }
        
        .actions {
            text-align: center;
            margin: 3rem 0;
        }
        
        .btn {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            text-decoration: none;
            margin: 0.5rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #ff6b6b, #ffa500);
            border: none;
        }
        
        .btn-primary:hover {
            background: linear-gradient(45deg, #ff5252, #ff9800);
        }
        
        .chat-container {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 2rem;
            margin: 2rem 0;
            backdrop-filter: blur(10px);
        }
        
        .chat-messages {
            max-height: 400px;
            overflow-y: auto;
            margin-bottom: 1rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        
        .chat-input-container {
            display: flex;
            gap: 1rem;
        }
        
        .chat-input {
            flex: 1;
            padding: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 1rem;
        }
        
        .chat-input::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }
        
        .chat-send {
            padding: 1rem 2rem;
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        
        .chat-send:hover {
            background: linear-gradient(45deg, #45a049, #4CAF50);
            transform: translateY(-2px);
        }
        
        .status {
            text-align: center;
            margin: 2rem 0;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .title {
                font-size: 2.5rem;
            }
            
            .features {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .feature-card {
                padding: 1.5rem;
            }
            
            .chat-input-container {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <a href="/" class="logo">
                <i class="fas fa-magic"></i>
                AI Gen Studio
            </a>

            <ul class="nav-menu">
                <li><a href="#features" class="nav-link">功能</a></li>
                <li><a href="#tools" class="nav-link">工具</a></li>
                <li><a href="#pricing" class="nav-link">定价</a></li>
                <li><a href="#help" class="nav-link">帮助</a></li>
            </ul>

            <div class="nav-actions">
                <button class="btn btn-google" onclick="signInWithGoogle()">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google 登录
                </button>
                <a href="/chat" class="btn btn-primary">
                    <i class="fas fa-rocket"></i>
                    开始创作
                </a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <h1 class="hero-title">免费在线 AI 图像编辑器</h1>
                <p class="hero-subtitle">
                    强大的AI驱动创意工具，支持智能图像生成、专业编辑、实时协作。无需下载，浏览器直接使用。
                </p>

                <div class="hero-actions">
                    <a href="/image-editor" class="btn btn-hero btn-hero-primary">
                        <i class="fas fa-magic"></i>
                        开始编辑
                    </a>
                    <a href="/canvas-multi" class="btn btn-hero btn-hero-secondary">
                        <i class="fas fa-palette"></i>
                        AI 画布
                    </a>
                </div>
            </div>
        </div>
    </section>
        
    <!-- Features Section -->
    <section class="features-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">强大的 AI 创意工具</h2>
                <p class="section-subtitle">
                    集成最新的人工智能技术，为您提供专业级的图像编辑和生成体验
                </p>
            </div>

            <div class="features">
                ${pageData.features?.map(feature => `
                    <div class="feature-card">
                        <span class="feature-icon">${feature.icon}</span>
                        <h3 class="feature-title">${feature.title}</h3>
                        <p class="feature-description">${feature.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
        
        <section class="chat-container">
            <h2 style="margin-bottom: 1rem;">💬 智能聊天体验</h2>
            <div class="chat-messages" id="chatMessages">
                <p style="opacity: 0.7;">欢迎使用 Jaaz 智能聊天功能！请输入您的问题。</p>
            </div>
            <div class="chat-input-container">
                <input type="text" class="chat-input" id="chatInput" placeholder="请输入您的消息..." />
                <button class="chat-send" onclick="sendMessage()">发送</button>
            </div>
        </section>
        
    <!-- Tools Section -->
    <section class="tools-section" style="padding: 4rem 0; background: white;">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">选择您的创作工具</h2>
                <p class="section-subtitle">
                    从简单的快速编辑到专业的设计创作，我们为每种需求提供完美的工具
                </p>
            </div>

            <div class="tools-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 3rem;">
                <a href="/image-editor" class="tool-card" style="display: block; background: var(--surface); padding: 2rem; border-radius: 1rem; text-decoration: none; border: 1px solid var(--border); transition: all 0.3s ease;">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem;">🖼️</div>
                    <h3 style="color: var(--text-primary); font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">AI 图像编辑器</h3>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">专业的图像编辑工具，支持AI增强和智能修复</p>
                </a>

                <a href="/canvas-multi" class="tool-card" style="display: block; background: var(--surface); padding: 2rem; border-radius: 1rem; text-decoration: none; border: 1px solid var(--border); transition: all 0.3s ease;">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem;">🎨</div>
                    <h3 style="color: var(--text-primary); font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">AI 多引擎画布</h3>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">集成CoT推理和FLUX模型的智能画布</p>
                </a>

                <a href="/chat" class="tool-card" style="display: block; background: var(--surface); padding: 2rem; border-radius: 1rem; text-decoration: none; border: 1px solid var(--border); transition: all 0.3s ease;">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem;">💬</div>
                    <h3 style="color: var(--text-primary); font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">AI 智能对话</h3>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">与AI助手对话，获取创意灵感和技术支持</p>
                </a>

                <a href="/canvas-modern" class="tool-card" style="display: block; background: var(--surface); padding: 2rem; border-radius: 1rem; text-decoration: none; border: 1px solid var(--border); transition: all 0.3s ease;">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem;">🖌️</div>
                    <h3 style="color: var(--text-primary); font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">现代画布</h3>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">现代化的绘图工具，支持专业创作</p>
                </a>

                <a href="/editor" class="tool-card" style="display: block; background: var(--surface); padding: 2rem; border-radius: 1rem; text-decoration: none; border: 1px solid var(--border); transition: all 0.3s ease;">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem;">📝</div>
                    <h3 style="color: var(--text-primary); font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">文档编辑器</h3>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">强大的Markdown编辑器，支持实时预览</p>
                </a>

                <a href="/canvas" class="tool-card" style="display: block; background: var(--surface); padding: 2rem; border-radius: 1rem; text-decoration: none; border: 1px solid var(--border); transition: all 0.3s ease;">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem;">🎯</div>
                    <h3 style="color: var(--text-primary); font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">基础画布</h3>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">简单易用的绘图工具，快速创作原型</p>
                </a>
            </div>
        </div>
    </section>
        
        <section class="status">
            <h3>🚀 技术架构</h3>
            <p><strong>后端：</strong> Cloudflare Workers + Hono 框架</p>
            <p><strong>AI 服务：</strong> Cloudflare AI Gateway + Replicate FLUX</p>
            <p><strong>数据存储：</strong> Cloudflare D1 + R2 + KV 存储</p>
            <p><strong>画布引擎：</strong> Fabric.js + TLDraw 提供流畅创意体验</p>
        </section>
    </div>
    
    <script>
        let isLoading = false;
        
        async function sendMessage() {
            const input = document.getElementById('chatInput');
            const messages = document.getElementById('chatMessages');
            const message = input.value.trim();
            
            if (!message || isLoading) return;
            
            isLoading = true;
            input.value = '';
            
            // 添加用户消息
            addMessage(message, 'user');
            
            try {
                const response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: [{ content: message, role: 'user' }]
                    })
                });
                
                const data = await response.json();
                const reply = data.success ? data.data.content : '抱歉，我遇到了一个错误。';
                addMessage(reply, 'assistant');
            } catch (error) {
                addMessage('抱歉，我遇到了网络错误。请重试。', 'assistant');
            } finally {
                isLoading = false;
            }
        }
        
        function addMessage(content, role) {
            const messages = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = \`
                margin: 0.5rem 0;
                padding: 0.8rem;
                border-radius: 8px;
                background: \${role === 'user' ? 'rgba(70, 130, 180, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
                border-left: 3px solid \${role === 'user' ? '#4682b4' : '#ffa500'};
            \`;
            messageDiv.innerHTML = \`<strong>\${role === 'user' ? '您' : 'AI'}：</strong> \${content}\`;
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }
        
        // 支持回车发送
        document.getElementById('chatInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Google Auth 配置
        window.onload = function() {
            google.accounts.id.initialize({
                client_id: '${process.env.GOOGLE_CLIENT_ID || "your-google-client-id"}',
                callback: handleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true
            });
        };

        function handleCredentialResponse(response) {
            console.log('Google Auth Response:', response);

            // 解析JWT token
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            console.log('User Info:', payload);

            // 存储用户信息
            localStorage.setItem('user', JSON.stringify({
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                loginTime: new Date().toISOString()
            }));

            // 更新UI
            updateUserUI(payload);

            // 显示欢迎消息
            showNotification(\`欢迎，\${payload.name}！您已成功登录。\`, 'success');
        }

        function signInWithGoogle() {
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // 如果弹窗没有显示，使用备用方法
                    google.accounts.id.renderButton(
                        document.createElement('div'),
                        { theme: 'outline', size: 'large' }
                    );
                }
            });
        }

        function updateUserUI(user) {
            const navActions = document.querySelector('.nav-actions');
            if (navActions) {
                navActions.innerHTML = \`
                    <div class="user-info" style="display: flex; align-items: center; gap: 1rem;">
                        <img src="\${user.picture}" alt="\${user.name}" style="width: 32px; height: 32px; border-radius: 50%;">
                        <span style="color: var(--text-primary); font-weight: 500;">\${user.name}</span>
                        <button class="btn btn-outline" onclick="signOut()">
                            <i class="fas fa-sign-out-alt"></i>
                            退出
                        </button>
                    </div>
                \`;
            }
        }

        function signOut() {
            localStorage.removeItem('user');
            location.reload();
        }

        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                background: \${type === 'success' ? 'var(--success-color)' : 'var(--primary-color)'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                box-shadow: var(--shadow-lg);
                z-index: 1000;
                animation: slideIn 0.3s ease;
            \`;
            notification.textContent = message;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // 工具卡片悬停效果
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🎨 AI Gen Studio 应用已加载');

            // 检查用户登录状态
            const user = localStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                updateUserUI(userData);
            }

            // 添加工具卡片悬停效果
            const toolCards = document.querySelectorAll('.tool-card');
            toolCards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-4px)';
                    this.style.boxShadow = 'var(--shadow-lg)';
                    this.style.borderColor = 'var(--primary-color)';
                });

                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = 'none';
                    this.style.borderColor = 'var(--border)';
                });
            });

            // 检查 API 状态
            fetch('/api/health')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'ok') {
                        console.log('✅ API 服务正常');
                    }
                })
                .catch(error => {
                    console.warn('⚠️ API 服务检查失败:', error);
                });
        });

        // 添加CSS动画
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }

            .tool-card:hover {
                transform: translateY(-4px) !important;
                box-shadow: var(--shadow-lg) !important;
                border-color: var(--primary-color) !important;
            }
        \`;
        document.head.appendChild(style);
    </script>
</body>
</html>`
}

export function generateChatPage(): string {
  return generateIndexPage({
    title: '💬 AI Gen Studio Chat - AI 智能聊天',
    description: '基于 Cloudflare AI 的智能聊天界面，支持CoT推理和图像生成'
  })
}

export function generateEditorPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📝 Jaaz Editor - 文档编辑器</title>
    <!-- SimpleMDE CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css">
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 1rem; height: 100vh; display: flex; flex-direction: column; }
        .header { text-align: center; margin-bottom: 1rem; }
        .title { font-size: 2.5rem; margin-bottom: 0.5rem; }
        
        .editor-layout { display: flex; gap: 1rem; flex: 1; min-height: 0; }
        .main-editor { flex: 1; display: flex; flex-direction: column; }
        .sidebar { width: 350px; display: flex; flex-direction: column; gap: 1rem; }
        
        .editor-header {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1rem;
            backdrop-filter: blur(10px);
            margin-bottom: 1rem;
        }
        
        .title-input {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            padding: 0.75rem;
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
            width: 100%;
            margin-bottom: 1rem;
        }
        .title-input::placeholder { color: rgba(255, 255, 255, 0.7); }
        
        .toolbar {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-bottom: 1rem;
        }
        
        .btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
        }
        .btn:hover { background: rgba(255, 255, 255, 0.3); }
        .btn.primary { background: linear-gradient(45deg, #667eea, #764ba2); }
        .btn.success { background: linear-gradient(45deg, #56ab2f, #a8e6cf); }
        .btn.danger { background: linear-gradient(45deg, #ff6b6b, #ffa500); }
        
        .editor-container {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1rem;
            backdrop-filter: blur(10px);
            flex: 1;
            min-height: 0;
        }
        
        /* SimpleMDE 样式覆盖 */
        .CodeMirror {
            background: rgba(0, 0, 0, 0.3) !important;
            color: white !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            height: auto !important;
            min-height: 400px !important;
        }
        .CodeMirror-cursor { border-color: white !important; }
        .CodeMirror-selected { background: rgba(255, 255, 255, 0.2) !important; }
        .CodeMirror-line { color: white !important; }
        
        .editor-toolbar {
            background: rgba(255, 255, 255, 0.1) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            border-bottom: none !important;
            border-radius: 8px 8px 0 0 !important;
            padding: 0.5rem !important;
        }
        .editor-toolbar a {
            color: rgba(255, 255, 255, 0.8) !important;
            border-radius: 4px !important;
            padding: 0.25rem !important;
        }
        .editor-toolbar a:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
        }
        .editor-toolbar a.active {
            background: rgba(255, 255, 255, 0.3) !important;
            color: white !important;
        }
        
        .panel {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1rem;
            backdrop-filter: blur(10px);
        }
        
        .panel h3 {
            margin-bottom: 1rem;
            color: white;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .file-list {
            max-height: 200px;
            overflow-y: auto;
        }
        
        .file-item {
            padding: 0.5rem;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.25rem;
        }
        .file-item:hover { background: rgba(255, 255, 255, 0.1); }
        .file-item.active { background: rgba(255, 255, 255, 0.2); }
        
        .publish-platforms {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .platform-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            padding: 0.5rem;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
            font-size: 0.8rem;
        }
        .platform-btn:hover { background: rgba(255, 255, 255, 0.2); }
        
        .media-preview {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        .media-item {
            position: relative;
            width: 80px;
            height: 80px;
            border-radius: 6px;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .media-item img, .media-item video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .media-remove {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ff4757;
            color: white;
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
        
        .nav-links {
            text-align: center;
            margin-top: 1rem;
        }
        
        @media (max-width: 1024px) {
            .editor-layout { flex-direction: column; }
            .sidebar { width: 100%; }
        }
        
        .status-bar {
            background: rgba(0, 0, 0, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 0 0 8px 8px;
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.7);
            display: flex;
            justify-content: space-between;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1 class="title">📝 AI Gen Studio Editor</h1>
            <p>强大的 Markdown 编辑器，支持实时预览和多平台发布</p>
        </header>
        
        <div class="editor-layout">
            <!-- 主编辑器区域 -->
            <div class="main-editor">
                <div class="editor-header">
                    <input type="text" class="title-input" id="documentTitle" placeholder="输入文档标题..." value="">
                    
                    <div class="toolbar">
                        <button class="btn" onclick="newDocument()">
                            <i class="fas fa-file"></i> 新建
                        </button>
                        <button class="btn" onclick="saveDocument()">
                            <i class="fas fa-save"></i> 保存
                        </button>
                        <button class="btn" onclick="loadDocument()">
                            <i class="fas fa-folder-open"></i> 打开
                        </button>
                        <button class="btn" onclick="exportDocument()">
                            <i class="fas fa-download"></i> 导出
                        </button>
                        <button class="btn" onclick="togglePreview()">
                            <i class="fas fa-eye"></i> 预览
                        </button>
                        <button class="btn" onclick="insertImage()">
                            <i class="fas fa-image"></i> 图片
                        </button>
                        <button class="btn" onclick="insertVideo()">
                            <i class="fas fa-video"></i> 视频
                        </button>
                    </div>
                </div>
                
                <div class="editor-container">
                    <textarea id="editor"></textarea>
                    <div class="status-bar">
                        <span id="statusText">就绪</span>
                        <span id="wordCount">0 字符</span>
                    </div>
                </div>
            </div>
            
            <!-- 侧边栏 -->
            <div class="sidebar">
                <!-- 文件列表 -->
                <div class="panel">
                    <h3>
                        <i class="fas fa-folder"></i>
                        文件列表
                    </h3>
                    <div class="file-list" id="fileList">
                        <div class="file-item">
                            <span>📄 加载中...</span>
                        </div>
                    </div>
                </div>
                
                <!-- 媒体文件 -->
                <div class="panel">
                    <h3>
                        <i class="fas fa-images"></i>
                        媒体文件
                    </h3>
                    <div class="media-preview" id="mediaPreview">
                        <!-- 媒体文件预览将在这里显示 -->
                    </div>
                </div>
                
                <!-- 发布平台 -->
                <div class="panel">
                    <h3>
                        <i class="fas fa-share"></i>
                        发布到平台
                    </h3>
                    <div class="publish-platforms">
                        <button class="platform-btn" onclick="publishTo('xiaohongshu')">小红书</button>
                        <button class="platform-btn" onclick="publishTo('bilibili')">Bilibili</button>
                        <button class="platform-btn" onclick="publishTo('x')">X (Twitter)</button>
                        <button class="platform-btn" onclick="publishTo('youtube')">YouTube</button>
                        <button class="platform-btn" onclick="publishTo('douyin')">抖音</button>
                        <button class="platform-btn" onclick="publishTo('weixin_channels')">微信视频号</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="nav-links">
            <a href="/" class="btn">🏠 返回首页</a>
            <a href="/chat" class="btn">💬 智能聊天</a>
            <a href="/canvas" class="btn">🎨 画布绘制</a>
        </div>
    </div>
    
    <!-- SimpleMDE JS -->
    <script src="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.js"></script>
    
    <script>
        let simplemde;
        let currentFile = null;
        let mediaFiles = [];
        let isPreviewMode = false;
        
        // 初始化 SimpleMDE 编辑器
        function initializeEditor() {
            simplemde = new SimpleMDE({
                element: document.getElementById('editor'),
                placeholder: '开始编写您的内容...',
                spellChecker: false,
                autofocus: true,
                status: false, // 我们使用自定义状态栏
                toolbar: [
                    'bold', 'italic', 'heading', '|',
                    'quote', 'unordered-list', 'ordered-list', '|',
                    'link', 'image', 'table', '|',
                    'preview', 'side-by-side', 'fullscreen', '|',
                    'guide'
                ],
                renderingConfig: {
                    singleLineBreaks: false,
                    codeSyntaxHighlighting: true,
                },
                shortcuts: {
                    'drawTable': 'Cmd-Alt-T',
                    'toggleBlockquote': 'Cmd-\\'',
                    'toggleBold': 'Cmd-B',
                    'cleanBlock': 'Cmd-E',
                    'toggleHeadingSmaller': 'Cmd-H',
                    'toggleItalic': 'Cmd-I',
                    'drawLink': 'Cmd-K',
                    'toggleUnorderedList': 'Cmd-L',
                    'togglePreview': 'Cmd-P',
                    'toggleCodeBlock': 'Cmd-Alt-C',
                    'toggleOrderedList': 'Cmd-Alt-L',
                    'drawHorizontalRule': 'Cmd-R',
                    'toggleSideBySide': 'F9',
                    'toggleFullScreen': 'F11'
                }
            });
            
            // 监听编辑器变化
            simplemde.codemirror.on('change', function() {
                updateWordCount();
                updateStatus('编辑中...');
                debouncedSave();
            });
            
            // 监听标题变化
            document.getElementById('documentTitle').addEventListener('input', function() {
                updateStatus('编辑中...');
                debouncedSave();
            });
        }
        
        // 防抖保存
        let saveTimeout;
        function debouncedSave() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                if (currentFile) {
                    saveDocument();
                }
            }, 1000);
        }
        
        // 更新字数统计
        function updateWordCount() {
            const content = simplemde.value();
            const charCount = content.length;
            const wordCount = content.split(/\\s+/).filter(word => word.length > 0).length;
            document.getElementById('wordCount').textContent = \`\${charCount} 字符, \${wordCount} 词\`;
        }
        
        // 更新状态
        function updateStatus(status) {
            document.getElementById('statusText').textContent = status;
        }
        
        // 新建文档
        function newDocument() {
            if (confirm('确定要新建文档吗？未保存的更改将丢失。')) {
                document.getElementById('documentTitle').value = '';
                simplemde.value('');
                currentFile = null;
                mediaFiles = [];
                updateMediaPreview();
                updateStatus('新文档');
                updateWordCount();
            }
        }
        
        // 保存文档
        async function saveDocument() {
            const title = document.getElementById('documentTitle').value.trim();
            const content = simplemde.value();
            
            if (!title) {
                alert('请输入文档标题');
                return;
            }
            
            const filename = currentFile || \`\${title.replace(/[^\\w\\s-]/g, '').replace(/\\s+/g, '-')}.md\`;
            const fullContent = \`# \${title}\\n\\n\${content}\`;
            
            try {
                updateStatus('保存中...');
                const response = await fetch('/api/update_file', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        path: filename,
                        content: fullContent
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    currentFile = filename;
                    updateStatus('已保存');
                    loadFileList();
                } else {
                    updateStatus('保存失败');
                    alert('保存失败: ' + (result.error || '未知错误'));
                }
            } catch (error) {
                updateStatus('保存失败');
                alert('保存失败: ' + error.message);
            }
        }
        
        // 加载文档
        function loadDocument() {
            const filename = prompt('请输入要打开的文件名:');
            if (filename) {
                loadFileContent(filename);
            }
        }
        
        // 加载文件内容
        async function loadFileContent(filename) {
            try {
                updateStatus('加载中...');
                const response = await fetch(\`/api/read_file?path=\${encodeURIComponent(filename)}\`);
                const result = await response.json();
                
                if (result.success) {
                    const content = result.content;
                    const lines = content.split('\\n');
                    const title = lines[0].replace(/^#+\\s*/, '').trim();
                    const body = lines.slice(lines[0].startsWith('#') ? 2 : 0).join('\\n');
                    
                    document.getElementById('documentTitle').value = title;
                    simplemde.value(body);
                    currentFile = filename;
                    updateStatus('已加载');
                    updateWordCount();
                } else {
                    updateStatus('加载失败');
                    alert('加载失败: ' + (result.error || '文件不存在'));
                }
            } catch (error) {
                updateStatus('加载失败');
                alert('加载失败: ' + error.message);
            }
        }
        
        // 导出文档
        function exportDocument() {
            const title = document.getElementById('documentTitle').value.trim() || 'untitled';
            const content = simplemde.value();
            const fullContent = \`# \${title}\\n\\n\${content}\`;
            
            const blob = new Blob([fullContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`\${title.replace(/[^\\w\\s-]/g, '').replace(/\\s+/g, '-')}.md\`;
            a.click();
            URL.revokeObjectURL(url);
        }
        
        // 切换预览
        function togglePreview() {
            simplemde.togglePreview();
        }
        
        // 插入图片
        function insertImage() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            
            input.onchange = function(e) {
                const files = e.target.files;
                for (let file of files) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const mediaFile = {
                            type: 'image',
                            name: file.name,
                            url: e.target.result,
                            file: file
                        };
                        mediaFiles.push(mediaFile);
                        updateMediaPreview();
                        
                        // 在编辑器中插入图片
                        const cm = simplemde.codemirror;
                        const pos = cm.getCursor();
                        cm.replaceRange(\`![图片](\${e.target.result})\\n\`, pos);
                    };
                    reader.readAsDataURL(file);
                }
            };
            
            input.click();
        }
        
        // 插入视频
        function insertVideo() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'video/*';
            
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const mediaFile = {
                            type: 'video',
                            name: file.name,
                            url: e.target.result,
                            file: file
                        };
                        mediaFiles.push(mediaFile);
                        updateMediaPreview();
                        
                        // 在编辑器中插入视频链接
                        const cm = simplemde.codemirror;
                        const pos = cm.getCursor();
                        cm.replaceRange(\`[视频: \${file.name}](\${e.target.result})\\n\`, pos);
                    };
                    reader.readAsDataURL(file);
                }
            };
            
            input.click();
        }
        
        // 更新媒体预览
        function updateMediaPreview() {
            const container = document.getElementById('mediaPreview');
            container.innerHTML = '';
            
            mediaFiles.forEach((media, index) => {
                const item = document.createElement('div');
                item.className = 'media-item';
                
                if (media.type === 'image') {
                    item.innerHTML = \`
                        <img src="\${media.url}" alt="\${media.name}" title="\${media.name}">
                        <button class="media-remove" onclick="removeMedia(\${index})">×</button>
                    \`;
                } else if (media.type === 'video') {
                    item.innerHTML = \`
                        <video src="\${media.url}" title="\${media.name}"></video>
                        <button class="media-remove" onclick="removeMedia(\${index})">×</button>
                    \`;
                }
                
                container.appendChild(item);
            });
        }
        
        // 移除媒体文件
        function removeMedia(index) {
            mediaFiles.splice(index, 1);
            updateMediaPreview();
        }
        
        // 发布到平台
        async function publishTo(platform) {
            const title = document.getElementById('documentTitle').value.trim();
            const content = simplemde.value();
            
            if (!title || !content) {
                alert('请输入标题和内容');
                return;
            }
            
            try {
                updateStatus('发布中...');
                const response = await fetch('/api/electron/publish', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        channel: platform,
                        title: title,
                        content: content
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    updateStatus('发布成功');
                    alert(\`发布到 \${platform} 成功！\`);
                } else {
                    updateStatus('发布失败');
                    alert(\`发布失败: \${result.error || '未知错误'}\`);
                }
            } catch (error) {
                updateStatus('发布失败');
                alert('发布失败: ' + error.message);
            }
        }
        
        // 加载文件列表
        async function loadFileList() {
            try {
                const response = await fetch('/api/list');
                const result = await response.json();
                
                if (result.success && result.files) {
                    const fileList = document.getElementById('fileList');
                    fileList.innerHTML = result.files.map(file => \`
                        <div class="file-item \${currentFile === file.name ? 'active' : ''}" onclick="loadFileContent('\${file.name}')">
                            <span>📄 \${file.name}</span>
                            <span>\${(file.size / 1024).toFixed(1)}KB</span>
                        </div>
                    \`).join('');
                }
            } catch (error) {
                console.error('加载文件列表失败:', error);
            }
        }
        
        // 页面加载时初始化
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📝 Jaaz Editor 高级版已加载');
            initializeEditor();
            loadFileList();
            updateWordCount();
        });
    </script>
</body>
</html>`
}

export function generateCanvasPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Canvas - 创意画布</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- 2D 绘图工具库 -->
    <script src="https://unpkg.com/perfect-freehand@1.2.0/dist/perfect-freehand.umd.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
            overflow: hidden;
        }
        
        .canvas-layout { 
            display: flex; 
            height: 100vh; 
        }
        
        .toolbar-left {
            width: 80px;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem 0.5rem;
            gap: 0.5rem;
        }
        
        .main-canvas-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        
        .toolbar-top {
            height: 60px;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            padding: 0 1rem;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .canvas-container {
            flex: 1;
            position: relative;
            overflow: hidden;
            background: #f8f9fa;
        }
        
        .sidebar-right {
            width: 320px;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
        }
        
        /* 工具按钮样式 */
        .tool-btn {
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 1.2rem;
        }
        .tool-btn:hover { background: rgba(255, 255, 255, 0.2); }
        .tool-btn.active { 
            background: linear-gradient(45deg, #667eea, #764ba2);
            border-color: #667eea;
        }
        
        .btn {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
        }
        .btn:hover { background: rgba(255, 255, 255, 0.2); }
        .btn.primary { background: linear-gradient(45deg, #667eea, #764ba2); }
        .btn.danger { background: linear-gradient(45deg, #ff6b6b, #ffa500); }
        .btn.success { background: linear-gradient(45deg, #56ab2f, #a8e6cf); }
        
        /* 颜色选择器和滑块 */
        .control-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .color-picker {
            width: 40px;
            height: 40px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            cursor: pointer;
            background: #000;
        }
        
        .slider {
            width: 120px;
            margin: 0 0.5rem;
        }
        
        .slider-label {
            font-size: 0.8rem;
            opacity: 0.8;
            min-width: 80px;
        }
        
        /* 侧边栏面板 */
        .panel {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1rem;
        }
        
        .panel h3 {
            margin-bottom: 1rem;
            font-size: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .panel-content {
            max-height: 200px;
            overflow-y: auto;
        }
        
        /* 图层列表 */
        .layer-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem;
            border-radius: 4px;
            margin-bottom: 0.25rem;
            cursor: pointer;
            transition: background 0.2s;
        }
        .layer-item:hover { background: rgba(255, 255, 255, 0.1); }
        .layer-item.active { background: rgba(255, 255, 255, 0.2); }
        
        .layer-controls {
            display: flex;
            gap: 0.25rem;
        }
        
        .layer-btn {
            width: 24px;
            height: 24px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 0.8rem;
        }
        
        /* AI 聊天面板 */
        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .chat-messages {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
            max-height: 300px;
        }
        
        .message {
            margin-bottom: 1rem;
            padding: 0.5rem;
            border-radius: 8px;
            font-size: 0.9rem;
        }
        .message.user {
            background: rgba(102, 126, 234, 0.3);
            margin-left: 1rem;
        }
        .message.assistant {
            background: rgba(255, 255, 255, 0.1);
            margin-right: 1rem;
        }
        
        .chat-input-area {
            padding: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            gap: 0.5rem;
        }
        
        .chat-input {
            flex: 1;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            padding: 0.5rem;
            color: white;
            font-size: 0.9rem;
        }
        .chat-input::placeholder { color: rgba(255, 255, 255, 0.6); }
        
        /* 响应式设计 */
        @media (max-width: 1024px) {
            .canvas-layout { flex-direction: column; }
            .toolbar-left { 
                width: 100%; 
                height: auto; 
                flex-direction: row; 
                justify-content: center;
                order: 2;
            }
            .sidebar-right { 
                width: 100%; 
                height: 200px;
                order: 3;
            }
            .main-canvas-area { order: 1; }
        }
        
        /* Canvas 特定样式 */
        .canvas-wrapper {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: auto;
        }
        
        #fabricCanvas {
            border: none;
            background: white;
        }
        
        /* 状态栏 */
        .status-bar {
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            backdrop-filter: blur(10px);
        }
        
        /* 缩放控制 */
        .zoom-controls {
            position: absolute;
            bottom: 10px;
            right: 10px;
            display: flex;
            gap: 0.5rem;
        }
        
        .zoom-btn {
            width: 40px;
            height: 40px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    </style>
</head>
<body>
    <div class="canvas-layout">
        <!-- 左侧工具栏 -->
        <div class="toolbar-left">
            <button class="tool-btn active" id="selectTool" onclick="setTool('select')" title="选择工具">
                <i class="fas fa-mouse-pointer"></i>
            </button>
            <button class="tool-btn" id="drawTool" onclick="setTool('draw')" title="自由绘制">
                <i class="fas fa-pen"></i>
            </button>
            <button class="tool-btn" id="lineTool" onclick="setTool('line')" title="直线">
                <i class="fas fa-minus"></i>
            </button>
            <button class="tool-btn" id="rectTool" onclick="setTool('rect')" title="矩形">
                <i class="far fa-square"></i>
            </button>
            <button class="tool-btn" id="circleTool" onclick="setTool('circle')" title="圆形">
                <i class="far fa-circle"></i>
            </button>
            <button class="tool-btn" id="textTool" onclick="setTool('text')" title="文本">
                <i class="fas fa-font"></i>
            </button>
            <button class="tool-btn" id="arrowTool" onclick="setTool('arrow')" title="箭头">
                <i class="fas fa-arrow-right"></i>
            </button>
            <button class="tool-btn" id="eraserTool" onclick="setTool('eraser')" title="橡皮擦">
                <i class="fas fa-eraser"></i>
            </button>
        </div>
        
        <!-- 主画布区域 -->
        <div class="main-canvas-area">
            <!-- 顶部工具栏 -->
            <div class="toolbar-top">
                <div class="control-group">
                    <button class="btn" onclick="newCanvas()">
                        <i class="fas fa-file"></i> 新建
                    </button>
                    <button class="btn" onclick="saveCanvas()">
                        <i class="fas fa-save"></i> 保存
                    </button>
                    <button class="btn" onclick="loadCanvas()">
                        <i class="fas fa-folder-open"></i> 打开
                    </button>
                    <button class="btn" onclick="exportCanvas()">
                        <i class="fas fa-download"></i> 导出
                    </button>
                </div>
                
                <div class="control-group">
                    <button class="btn" onclick="undo()">
                        <i class="fas fa-undo"></i> 撤销
                    </button>
                    <button class="btn" onclick="redo()">
                        <i class="fas fa-redo"></i> 重做
                    </button>
                </div>
                
                <div class="control-group">
                    <span class="slider-label">颜色:</span>
                    <input type="color" class="color-picker" id="colorPicker" value="#000000" onchange="setColor(this.value)">
                </div>
                
                <div class="control-group">
                    <span class="slider-label">粗细:</span>
                    <input type="range" class="slider" id="strokeWidth" min="1" max="20" value="2" onchange="setStrokeWidth(this.value)">
                    <span id="strokeWidthDisplay">2px</span>
                </div>
                
                <div class="control-group">
                    <span class="slider-label">透明度:</span>
                    <input type="range" class="slider" id="opacity" min="0" max="1" step="0.1" value="1" onchange="setOpacity(this.value)">
                    <span id="opacityDisplay">100%</span>
                </div>
            </div>
            
            <!-- 画布容器 -->
            <div class="canvas-container">
                <div class="canvas-wrapper">
                    <canvas id="fabricCanvas"></canvas>
                </div>
                
                <!-- 状态栏 -->
                <div class="status-bar" id="statusBar">
                    就绪 - 选择工具已激活
                </div>
                
                <!-- 缩放控制 -->
                <div class="zoom-controls">
                    <button class="zoom-btn" onclick="zoomOut()" title="缩小">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="zoom-btn" onclick="resetZoom()" title="适应窗口">
                        <i class="fas fa-expand"></i>
                    </button>
                    <button class="zoom-btn" onclick="zoomIn()" title="放大">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- 右侧边栏 -->
        <div class="sidebar-right">
            <!-- 图层面板 -->
            <div class="panel">
                <h3>
                    <i class="fas fa-layer-group"></i>
                    图层
                </h3>
                <div class="panel-content" id="layersPanel">
                    <div class="layer-item active">
                        <span>📄 背景层</span>
                        <div class="layer-controls">
                            <button class="layer-btn" title="显示/隐藏">👁️</button>
                            <button class="layer-btn" title="锁定">🔒</button>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 0.5rem;">
                    <button class="btn" onclick="addLayer()" style="width: 100%;">
                        <i class="fas fa-plus"></i> 新建图层
                    </button>
                </div>
            </div>
            
            <!-- 形状库面板 -->
            <div class="panel">
                <h3>
                    <i class="fas fa-shapes"></i>
                    形状库
                </h3>
                <div class="panel-content">
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;">
                        <button class="tool-btn" onclick="addShape('circle')" title="圆形">
                            <i class="far fa-circle"></i>
                        </button>
                        <button class="tool-btn" onclick="addShape('rect')" title="矩形">
                            <i class="far fa-square"></i>
                        </button>
                        <button class="tool-btn" onclick="addShape('triangle')" title="三角形">
                            <i class="fas fa-play" style="transform: rotate(90deg);"></i>
                        </button>
                        <button class="tool-btn" onclick="addShape('star')" title="星形">
                            <i class="far fa-star"></i>
                        </button>
                        <button class="tool-btn" onclick="addShape('heart')" title="心形">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="tool-btn" onclick="addShape('hexagon')" title="六边形">
                            <i class="fas fa-hexagon"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- AI 助手面板 -->
            <div class="panel">
                <h3>
                    <i class="fas fa-robot"></i>
                    AI 助手
                </h3>
                <div class="chat-container">
                    <div class="chat-messages" id="chatMessages">
                        <div class="message assistant">
                            👋 我是您的绘图助手！我可以帮您：<br>
                            • 生成创意图形<br>
                            • 优化设计布局<br>
                            • 提供绘图建议
                        </div>
                    </div>
                    <div class="chat-input-area">
                        <input type="text" class="chat-input" id="chatInput" placeholder="描述您想要的图形..." onkeydown="handleChatKeydown(event)">
                        <button class="btn" onclick="sendChatMessage()">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- 导航链接 -->
            <div class="panel">
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <a href="/" class="btn" style="text-decoration: none;">🏠 首页</a>
                    <a href="/chat" class="btn" style="text-decoration: none;">💬 聊天</a>
                    <a href="/editor" class="btn" style="text-decoration: none;">📝 编辑</a>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let canvas;
        let currentTool = 'select';
        let isDrawing = false;
        let drawingPath = [];
        let currentColor = '#000000';
        let currentStrokeWidth = 2;
        let currentOpacity = 1;
        let undoStack = [];
        let redoStack = [];
        let chatMessages = [];
        
        // 初始化 Fabric.js 画布
        function initializeCanvas() {
            console.log('开始初始化 Canvas...');
            
            // 等待 Fabric.js 加载
            if (typeof fabric === 'undefined') {
                console.error('Fabric.js 未加载');
                setTimeout(initializeCanvas, 100);
                return;
            }
            
            const canvasElement = document.getElementById('fabricCanvas');
            if (!canvasElement) {
                console.error('Canvas 元素未找到');
                return;
            }
            
            const container = canvasElement.parentElement;
            
            // 设置画布大小
            const containerWidth = container.clientWidth || 800;
            const containerHeight = container.clientHeight || 600;
            
            console.log('Canvas 尺寸:', containerWidth, 'x', containerHeight);
            
            canvas = new fabric.Canvas('fabricCanvas', {
                width: containerWidth,
                height: containerHeight,
                backgroundColor: 'white',
                selection: true,
                preserveObjectStacking: true
            });
            
            console.log('Canvas 对象创建成功:', canvas);
            
            // 设置画布事件
            setupCanvasEvents();
            
            // 保存初始状态
            saveCanvasState();
            
            updateStatus('画布初始化完成 ✓');
            console.log('Canvas 初始化完成');
        }
        
        // 设置画布事件
        function setupCanvasEvents() {
            console.log('设置画布事件...');
            
            // 鼠标按下事件
            canvas.on('mouse:down', function(options) {
                console.log('鼠标按下，当前工具:', currentTool);
                
                if (currentTool === 'draw') {
                    isDrawing = true;
                    const pointer = canvas.getPointer(options.e);
                    drawingPath = [pointer];
                    console.log('开始绘制，坐标:', pointer);
                } else if (currentTool === 'line' || currentTool === 'rect' || currentTool === 'circle' || currentTool === 'arrow') {
                    startDrawingShape(options);
                } else if (currentTool === 'text') {
                    addText(options);
                }
            });
            
            // 鼠标移动事件
            canvas.on('mouse:move', function(options) {
                if (isDrawing && currentTool === 'draw') {
                    const pointer = canvas.getPointer(options.e);
                    drawingPath.push(pointer);
                    drawFreehand();
                }
            });
            
            // 鼠标抬起事件
            canvas.on('mouse:up', function(options) {
                if (isDrawing) {
                    isDrawing = false;
                    drawingPath = [];
                    saveCanvasState();
                }
            });
            
            // 对象选择事件
            canvas.on('selection:created', function(options) {
                updateStatus(\`已选择 \${options.selected.length} 个对象\`);
            });
            
            canvas.on('selection:cleared', function() {
                updateStatus('未选择任何对象');
            });
        }
        
        // 设置工具
        function setTool(tool) {
            // 更新工具按钮状态
            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById(tool + 'Tool').classList.add('active');
            
            currentTool = tool;
            
            // 设置画布交互模式
            if (tool === 'select') {
                canvas.isDrawingMode = false;
                canvas.selection = true;
                canvas.forEachObject(obj => obj.selectable = true);
            } else {
                canvas.isDrawingMode = false;
                canvas.selection = false;
                canvas.discardActiveObject();
                canvas.forEachObject(obj => obj.selectable = false);
            }
            
            canvas.renderAll();
            updateStatus(\`已切换到\${getToolName(tool)}工具\`);
        }
        
        // 获取工具名称
        function getToolName(tool) {
            const names = {
                'select': '选择',
                'draw': '绘制',
                'line': '直线',
                'rect': '矩形',
                'circle': '圆形',
                'text': '文本',
                'arrow': '箭头',
                'eraser': '橡皮擦'
            };
            return names[tool] || tool;
        }
        
        // 自由绘制
        function drawFreehand() {
            if (drawingPath.length < 2) return;
            
            // 移除之前的临时路径
            const tempObjects = canvas.getObjects().filter(obj => obj.isTemporary);
            tempObjects.forEach(obj => canvas.remove(obj));
            
            const pathString = \`M \${drawingPath[0].x} \${drawingPath[0].y} \` + 
                drawingPath.slice(1).map(point => \`L \${point.x} \${point.y}\`).join(' ');
            
            const path = new fabric.Path(pathString, {
                stroke: currentColor,
                strokeWidth: currentStrokeWidth,
                fill: '',
                opacity: currentOpacity,
                selectable: false,
                isTemporary: true
            });
            
            canvas.add(path);
            canvas.renderAll();
            console.log('绘制路径:', pathString);
        }
        
        // 开始绘制形状
        let startPoint = null;
        let tempShape = null;
        
        function startDrawingShape(options) {
            const pointer = canvas.getPointer(options.e);
            startPoint = pointer;
            
            // 添加临时形状
            if (currentTool === 'line') {
                tempShape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                    stroke: currentColor,
                    strokeWidth: currentStrokeWidth,
                    opacity: currentOpacity,
                    selectable: false,
                    isTemporary: true
                });
            } else if (currentTool === 'rect') {
                tempShape = new fabric.Rect({
                    left: pointer.x,
                    top: pointer.y,
                    width: 0,
                    height: 0,
                    stroke: currentColor,
                    strokeWidth: currentStrokeWidth,
                    fill: 'transparent',
                    opacity: currentOpacity,
                    selectable: false,
                    isTemporary: true
                });
            } else if (currentTool === 'circle') {
                tempShape = new fabric.Circle({
                    left: pointer.x,
                    top: pointer.y,
                    radius: 0,
                    stroke: currentColor,
                    strokeWidth: currentStrokeWidth,
                    fill: 'transparent',
                    opacity: currentOpacity,
                    selectable: false,
                    isTemporary: true
                });
            }
            
            if (tempShape) {
                canvas.add(tempShape);
                
                // 绑定鼠标移动事件来更新形状
                const updateShape = function(options) {
                    const pointer = canvas.getPointer(options.e);
                    
                    if (currentTool === 'line') {
                        tempShape.set({
                            x2: pointer.x,
                            y2: pointer.y
                        });
                    } else if (currentTool === 'rect') {
                        const width = Math.abs(pointer.x - startPoint.x);
                        const height = Math.abs(pointer.y - startPoint.y);
                        tempShape.set({
                            left: Math.min(startPoint.x, pointer.x),
                            top: Math.min(startPoint.y, pointer.y),
                            width: width,
                            height: height
                        });
                    } else if (currentTool === 'circle') {
                        const radius = Math.sqrt(Math.pow(pointer.x - startPoint.x, 2) + Math.pow(pointer.y - startPoint.y, 2));
                        tempShape.set({
                            radius: radius
                        });
                    }
                    
                    canvas.renderAll();
                };
                
                const finishShape = function() {
                    canvas.off('mouse:move', updateShape);
                    canvas.off('mouse:up', finishShape);
                    
                    if (tempShape) {
                        tempShape.set({
                            selectable: currentTool === 'select',
                            isTemporary: false
                        });
                        saveCanvasState();
                    }
                };
                
                canvas.on('mouse:move', updateShape);
                canvas.on('mouse:up', finishShape);
            }
        }
        
        // 添加文本
        function addText(options) {
            const pointer = canvas.getPointer(options.e);
            const text = prompt('请输入文本:', '文本') || '文本';
            
            const textObj = new fabric.Text(text, {
                left: pointer.x,
                top: pointer.y,
                fontSize: 20,
                fill: currentColor,
                opacity: currentOpacity,
                selectable: currentTool === 'select'
            });
            
            canvas.add(textObj);
            canvas.renderAll();
            saveCanvasState();
            updateStatus(\`已添加文本: \${text}\`);
        }
        
        // 添加文本
        function addText(options) {
            const pointer = canvas.getPointer(options.e);
            const text = prompt('请输入文本:', '文本') || '文本';
            
            const textObj = new fabric.Text(text, {
                left: pointer.x,
                top: pointer.y,
                fontSize: 20,
                fill: currentColor,
                opacity: currentOpacity,
                selectable: currentTool === 'select'
            });
            
            canvas.add(textObj);
            saveCanvasState();
        }
        
        // 添加预定义形状
        function addShape(shapeType) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            let shape;
            
            switch(shapeType) {
                case 'circle':
                    shape = new fabric.Circle({
                        radius: 50,
                        left: centerX - 50,
                        top: centerY - 50,
                        stroke: currentColor,
                        strokeWidth: currentStrokeWidth,
                        fill: 'transparent',
                        opacity: currentOpacity
                    });
                    break;
                case 'rect':
                    shape = new fabric.Rect({
                        width: 100,
                        height: 60,
                        left: centerX - 50,
                        top: centerY - 30,
                        stroke: currentColor,
                        strokeWidth: currentStrokeWidth,
                        fill: 'transparent',
                        opacity: currentOpacity
                    });
                    break;
                case 'triangle':
                    shape = new fabric.Triangle({
                        width: 80,
                        height: 80,
                        left: centerX - 40,
                        top: centerY - 40,
                        stroke: currentColor,
                        strokeWidth: currentStrokeWidth,
                        fill: 'transparent',
                        opacity: currentOpacity
                    });
                    break;
                case 'star':
                    shape = createStar(centerX, centerY, 5, 40, 20);
                    break;
                case 'heart':
                    shape = createHeart(centerX, centerY);
                    break;
                case 'hexagon':
                    shape = createPolygon(centerX, centerY, 6, 40);
                    break;
            }
            
            if (shape) {
                canvas.add(shape);
                saveCanvasState();
                updateStatus(\`添加了\${shapeType}形状\`);
            }
        }
        
        // 创建星形
        function createStar(centerX, centerY, points, outerRadius, innerRadius) {
            const starPoints = [];
            const step = Math.PI / points;
            
            for (let i = 0; i < 2 * points; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = i * step - Math.PI / 2;
                starPoints.push({
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                });
            }
            
            return new fabric.Polygon(starPoints, {
                stroke: currentColor,
                strokeWidth: currentStrokeWidth,
                fill: 'transparent',
                opacity: currentOpacity
            });
        }
        
        // 创建心形
        function createHeart(centerX, centerY) {
            const heartPath = \`M \${centerX},\${centerY + 10} C \${centerX - 20},\${centerY - 10} \${centerX - 40},\${centerY - 10} \${centerX - 20},\${centerY - 30} C \${centerX - 20},\${centerY - 40} \${centerX},\${centerY - 30} \${centerX},\${centerY - 10} C \${centerX},\${centerY - 30} \${centerX + 20},\${centerY - 40} \${centerX + 20},\${centerY - 30} C \${centerX + 40},\${centerY - 10} \${centerX + 20},\${centerY - 10} \${centerX},\${centerY + 10} Z\`;
            
            return new fabric.Path(heartPath, {
                stroke: currentColor,
                strokeWidth: currentStrokeWidth,
                fill: 'transparent',
                opacity: currentOpacity
            });
        }
        
        // 创建多边形
        function createPolygon(centerX, centerY, sides, radius) {
            const points = [];
            for (let i = 0; i < sides; i++) {
                const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
                points.push({
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                });
            }
            
            return new fabric.Polygon(points, {
                stroke: currentColor,
                strokeWidth: currentStrokeWidth,
                fill: 'transparent',
                opacity: currentOpacity
            });
        }
        
        // 设置颜色
        function setColor(color) {
            currentColor = color;
            
            // 更新选中对象的颜色
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                if (activeObject.type === 'text') {
                    activeObject.set('fill', color);
                } else {
                    activeObject.set('stroke', color);
                }
                canvas.renderAll();
                saveCanvasState();
            }
            
            updateStatus(\`颜色已设置为 \${color}\`);
        }
        
        // 设置笔刷宽度
        function setStrokeWidth(width) {
            currentStrokeWidth = width;
            document.getElementById('strokeWidthDisplay').textContent = width + 'px';
            
            // 更新选中对象的线宽
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.set) {
                activeObject.set('strokeWidth', parseInt(width));
                canvas.renderAll();
                saveCanvasState();
            }
        }
        
        // 设置透明度
        function setOpacity(opacity) {
            currentOpacity = opacity;
            document.getElementById('opacityDisplay').textContent = Math.round(opacity * 100) + '%';
            
            // 更新选中对象的透明度
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set('opacity', parseFloat(opacity));
                canvas.renderAll();
                saveCanvasState();
            }
        }
        
        // 画布操作
        function newCanvas() {
            if (confirm('确定要新建画布吗？当前内容将被清除。')) {
                canvas.clear();
                canvas.backgroundColor = 'white';
                undoStack = [];
                redoStack = [];
                saveCanvasState();
                updateStatus('已新建画布');
            }
        }
        
        function saveCanvas() {
            try {
                const jsonData = JSON.stringify(canvas.toJSON());
                localStorage.setItem('jaaz-canvas-data', jsonData);
                updateStatus('画布已保存到本地存储');
            } catch (error) {
                updateStatus('保存失败: ' + error.message);
            }
        }
        
        function loadCanvas() {
            try {
                const jsonData = localStorage.getItem('jaaz-canvas-data');
                if (jsonData) {
                    canvas.loadFromJSON(jsonData, function() {
                        canvas.renderAll();
                        saveCanvasState();
                        updateStatus('画布已加载');
                    });
                } else {
                    updateStatus('没有找到保存的画布');
                }
            } catch (error) {
                updateStatus('加载失败: ' + error.message);
            }
        }
        
        function exportCanvas() {
            try {
                const dataURL = canvas.toDataURL({
                    format: 'png',
                    quality: 1.0
                });
                
                const link = document.createElement('a');
                link.download = 'jaaz-canvas-' + new Date().getTime() + '.png';
                link.href = dataURL;
                link.click();
                
                updateStatus('画布已导出');
            } catch (error) {
                updateStatus('导出失败: ' + error.message);
            }
        }
        
        // 撤销/重做
        function saveCanvasState() {
            const state = JSON.stringify(canvas.toJSON());
            undoStack.push(state);
            
            // 限制撤销堆栈大小
            if (undoStack.length > 50) {
                undoStack.shift();
            }
            
            // 清空重做堆栈
            redoStack = [];
        }
        
        function undo() {
            if (undoStack.length > 1) {
                redoStack.push(undoStack.pop());
                const previousState = undoStack[undoStack.length - 1];
                
                canvas.loadFromJSON(previousState, function() {
                    canvas.renderAll();
                    updateStatus('已撤销操作');
                });
            }
        }
        
        function redo() {
            if (redoStack.length > 0) {
                const nextState = redoStack.pop();
                undoStack.push(nextState);
                
                canvas.loadFromJSON(nextState, function() {
                    canvas.renderAll();
                    updateStatus('已重做操作');
                });
            }
        }
        
        // 缩放功能
        function zoomIn() {
            const zoom = canvas.getZoom();
            canvas.setZoom(zoom * 1.1);
            updateStatus(\`缩放: \${Math.round(zoom * 110)}%\`);
        }
        
        function zoomOut() {
            const zoom = canvas.getZoom();
            canvas.setZoom(zoom * 0.9);
            updateStatus(\`缩放: \${Math.round(zoom * 90)}%\`);
        }
        
        function resetZoom() {
            canvas.setZoom(1);
            canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
            canvas.renderAll();
            updateStatus('缩放已重置');
        }
        
        // 图层管理
        function addLayer() {
            const layerName = prompt('请输入图层名称:', '新图层') || '新图层';
            // 图层功能的实现可以通过分组对象来模拟
            updateStatus(\`已添加图层: \${layerName}\`);
        }
        
        // AI 聊天功能
        function handleChatKeydown(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendChatMessage();
            }
        }
        
        async function sendChatMessage() {
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            
            if (!message) return;
            
            // 添加用户消息
            addChatMessage('user', message);
            input.value = '';
            
            try {
                // 发送到 AI API
                const response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个专业的绘图助手，帮助用户创建和优化图形设计。请提供简洁有用的建议。'
                            },
                            ...chatMessages.slice(-5), // 只发送最近5条消息
                            {
                                role: 'user',
                                content: message
                            }
                        ]
                    })
                });
                
                const data = await response.json();
                const aiResponse = data.success ? data.data.content : '抱歉，我暂时无法回应。';
                
                addChatMessage('assistant', aiResponse);
            } catch (error) {
                addChatMessage('assistant', '抱歉，连接AI助手时出现错误。');
            }
        }
        
        function addChatMessage(role, content) {
            const messagesContainer = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${role}\`;
            messageDiv.innerHTML = content.replace(/\\n/g, '<br>');
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // 保存到聊天历史
            chatMessages.push({ role, content });
            
            // 限制聊天历史长度
            if (chatMessages.length > 20) {
                chatMessages.shift();
            }
        }
        
        // 更新状态
        function updateStatus(message) {
            document.getElementById('statusBar').textContent = message;
        }
        
        // 响应式处理
        function handleResize() {
            const container = document.querySelector('.canvas-wrapper');
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            
            canvas.setDimensions({
                width: newWidth,
                height: newHeight
            });
            
            canvas.renderAll();
        }
        
        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🎨 Jaaz Canvas 专业版已加载');
            initializeCanvas();
            
            // 绑定窗口大小改变事件
            window.addEventListener('resize', handleResize);
            
            // 绑定键盘快捷键
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey || e.metaKey) {
                    switch(e.key) {
                        case 'z':
                            e.preventDefault();
                            if (e.shiftKey) {
                                redo();
                            } else {
                                undo();
                            }
                            break;
                        case 's':
                            e.preventDefault();
                            saveCanvas();
                            break;
                        case 'o':
                            e.preventDefault();
                            loadCanvas();
                            break;
                        case 'e':
                            e.preventDefault();
                            exportCanvas();
                            break;
                    }
                }
            });
        });
    </script>
</body>
</html>`
}

export function generateMultiEngineCanvasPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎨 AI Canvas - 多引擎画布</title>
    <link rel="icon" href="/unicorn.png" type="image/png">
    <meta name="description" content="集成多种AI引擎的智能画布，支持CoT推理和FLUX图像生成">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
        }

        .canvas-area {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 2rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            margin-bottom: 2rem;
        }

        .canvas-wrapper {
            background: white;
            border-radius: 8px;
            padding: 1rem;
            min-height: 500px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
        }

        .ai-panel {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 2rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .chat-input {
            width: 100%;
            padding: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 1rem;
            margin-bottom: 1rem;
        }

        .chat-input::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }

        .btn {
            background: linear-gradient(45deg, #ff6b6b, #ffa500);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }

        .status {
            margin-top: 1rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">🎨 AI Canvas</h1>
            <p class="subtitle">多引擎智能画布 - CoT推理 + FLUX生成</p>
        </div>

        <div class="canvas-area">
            <div class="canvas-wrapper">
                <p>AI画布正在加载中...</p>
            </div>
        </div>

        <div class="ai-panel">
            <h3>🧠 AI助手</h3>
            <input type="text" class="chat-input" placeholder="描述你想要生成的图像..." id="promptInput">
            <button class="btn" onclick="generateImage()">🎨 生成图像</button>
            <div class="status" id="status">准备就绪</div>
        </div>
    </div>

    <script>
        async function generateImage() {
            const prompt = document.getElementById('promptInput').value;
            const status = document.getElementById('status');
            const canvasWrapper = document.querySelector('.canvas-wrapper');

            if (!prompt.trim()) {
                status.textContent = '请输入图像描述';
                return;
            }

            try {
                status.textContent = '🧠 正在使用CoT推理优化提示词...';

                // 使用CoT增强提示词
                const cotResponse = await fetch('/api/ai/cot/enhance-prompt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt: prompt,
                        type: 'image'
                    })
                });

                const cotResult = await cotResponse.json();

                if (cotResult.success) {
                    status.textContent = \`✨ 提示词已优化: \${cotResult.data.enhancedPrompt.substring(0, 50)}...\`;

                    setTimeout(async () => {
                        status.textContent = '🎨 正在生成图像 (Vertex AI gemini-2.5-flash-image-preview)...';

                        // 生成图像
                        const imageResponse = await fetch('/api/ai/image/generate', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                prompt: cotResult.data.enhancedPrompt,
                                model: 'gemini-2.5-flash-image-preview',
                                width: 512,
                                height: 512
                            })
                        });

                        const imageResult = await imageResponse.json();

                        if (imageResult.success) {
                            const imageData = imageResult.data;
                            status.textContent = '🖼️ 图像生成完成！正在加载到画布...';

                            // 在画布中显示生成的图像
                            canvasWrapper.innerHTML = \`
                                <div style="text-align: center;">
                                    <img src="\${imageData.imageUrl}" alt="Generated Image" style="max-width: 100%; max-height: 400px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                                    <div style="margin-top: 1rem; color: #333; font-size: 14px;">
                                        <p><strong>原始提示:</strong> \${imageData.originalPrompt}</p>
                                        <p><strong>模型:</strong> \${imageData.model}</p>
                                        <p><strong>尺寸:</strong> \${imageData.dimensions.width}x\${imageData.dimensions.height}</p>
                                    </div>
                                </div>
                            \`;

                            status.textContent = \`✅ 生成完成！模型: \${imageData.model} | 时间: \${new Date(imageData.timestamp).toLocaleTimeString()}\`;
                        } else {
                            status.textContent = '❌ 图像生成失败: ' + imageResult.error;
                        }
                    }, 1500);
                } else {
                    status.textContent = '❌ 提示词优化失败: ' + cotResult.error;
                }
            } catch (error) {
                console.error('Generation error:', error);
                status.textContent = '❌ 生成过程中出现错误，请检查网络连接';
            }
        }

        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', function() {
            const promptInput = document.getElementById('promptInput');

            // 回车键提交
            promptInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    generateImage();
                }
            });

            // 添加一些示例提示词
            const examples = [
                '一只可爱的小猫在花园里玩耍',
                '未来科技城市的夜景',
                '梦幻般的森林中的小屋',
                '宇宙中的星云和行星'
            ];

            let exampleIndex = 0;
            promptInput.placeholder = examples[exampleIndex];

            // 每5秒切换示例
            setInterval(() => {
                exampleIndex = (exampleIndex + 1) % examples.length;
                if (!promptInput.value) {
                    promptInput.placeholder = examples[exampleIndex];
                }
            }, 5000);
        });
    </script>
</body>
</html>`
}