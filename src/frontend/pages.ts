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
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Gen Studio - AI 驱动的创意生成工作室</title>
    <link rel="icon" href="/unicorn.png" type="image/png">
    <meta name="description" content="强大的多平台内容创作工具，支持AI对话、画布绘制、文档编辑等功能">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #ffffff;
            color: #37352f;
            line-height: 1.6;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            padding: 80px 0 60px 0;
            background: #fafafa;
            border-radius: 12px;
            margin-bottom: 60px;
        }

        .header h1 {
            font-size: 3rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: #2e2e2e;
            letter-spacing: -0.02em;
        }

        .header p {
            font-size: 1.1rem;
            color: #787774;
            max-width: 600px;
            margin: 0 auto;
            font-weight: 400;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 24px;
            margin: 60px 0;
        }
        
        .feature-card {
            background: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 32px 24px;
            transition: all 0.2s ease;
            cursor: pointer;
        }
        
        .feature-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
            border-color: #d0d0d0;
        }
        
        .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 16px;
            display: block;
        }
        
        .feature-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 8px;
            color: #2e2e2e;
        }
        
        .feature-description {
            color: #787774;
            line-height: 1.5;
            font-size: 0.95rem;
        }

        .cta-section {
            text-align: center;
            padding: 60px 0;
            background: #fafafa;
            border-radius: 12px;
            margin-top: 40px;
        }

        .cta-section h2 {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 12px;
            color: #2e2e2e;
        }

        .cta-buttons {
            display: flex;
            justify-content: center;
            gap: 16px;
            flex-wrap: wrap;
            margin-top: 32px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            padding: 12px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            transition: all 0.2s ease;
            border: 1px solid;
        }

        .btn-primary {
            background: #2e2e2e;
            color: white;
            border-color: #2e2e2e;
        }

        .btn-primary:hover {
            background: #1a1a1a;
            border-color: #1a1a1a;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .btn-secondary {
            background: white;
            color: #37352f;
            border-color: #e0e0e0;
        }

        .btn-secondary:hover {
            background: #f7f7f7;
            border-color: #d0d0d0;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 2.5rem;
            }
            
            .features {
                grid-template-columns: 1fr;
                gap: 16px;
            }
            
            .cta-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .container {
                padding: 20px 16px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🎨 AI Gen Studio</h1>
            <p>强大的多平台内容创作工具，集成AI对话、智能画布、文档编辑等多种功能，让创作更高效</p>
        </header>
        
        <section class="features">
                <div class="feature-card">
                <span class="feature-icon">💬</span>
                <h3 class="feature-title">AI 智能对话</h3>
                <p class="feature-description">与先进的AI助手对话，获得创作灵感、技术支持、学习指导等全方位帮助</p>
                </div>

            <div class="feature-card">
                <span class="feature-icon">🎨</span>
                <h3 class="feature-title">智能画布</h3>
                <p class="feature-description">AI驱动的绘图工具，支持CoT思维链分析和FLUX图片生成，让创作更智能</p>
            </div>

            <div class="feature-card">
                <span class="feature-icon">📝</span>
                <h3 class="feature-title">文档编辑</h3>
                <p class="feature-description">强大的在线文档编辑器，支持Markdown、富文本等多种格式，协作编辑更简单</p>
            </div>
        </section>
        
        <section class="cta-section">
            <h2>开始您的创作之旅</h2>
            <div class="cta-buttons">
                <a href="/chat" class="btn btn-primary">💬 开始对话</a>
                <a href="/canvas-multi" class="btn btn-primary">🎨 AI 画布</a>
                <a href="/canvas" class="btn btn-secondary">🖌️ 基础画布</a>
                <a href="/editor" class="btn btn-secondary">📝 文档编辑</a>
            </div>
        </section>
    </div>
</body>
</html>`;
}

export function generateChatPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 对话 - AI Gen Studio</title>
    <link rel="icon" href="/unicorn.png" type="image/png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            background: #fafafa; 
            height: 100vh; 
            display: flex; 
            flex-direction: column; 
            color: #37352f;
        }
        
        .header { 
            background: white; 
            padding: 16px 24px; 
            border-bottom: 1px solid #e0e0e0; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        
        .title { 
            font-size: 1.25rem; 
            font-weight: 600;
            color: #2e2e2e;
        }
        
        .nav-btn { 
            padding: 8px 16px; 
            background: white; 
            border: 1px solid #e0e0e0; 
            border-radius: 6px;
            text-decoration: none;
            color: #37352f; 
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.2s ease;
        }

        .nav-btn:hover {
            background: #f7f7f7;
            border-color: #d0d0d0;
            transform: translateY(-1px);
        }
        
        .chat-container { 
            flex: 1; 
            display: flex; 
            flex-direction: column; 
            max-width: 900px; 
            margin: 0 auto; 
            width: 100%; 
            padding: 24px; 
            background: white;
            border-radius: 12px;
            margin: 24px auto;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            border: 1px solid #e0e0e0;
        }
        
        .messages { 
            flex: 1;
            overflow-y: auto; 
            margin-bottom: 24px; 
            padding: 16px 0;
        }
        
        .message { 
            margin-bottom: 16px; 
        }
        
        .user { 
            text-align: right; 
        }
        
        .message-content { 
            display: inline-block; 
            max-width: 80%; 
            padding: 12px 16px; 
            border-radius: 8px; 
            line-height: 1.5;
            font-size: 0.95rem;
        }
        
        .user .message-content { 
            background: #2e2e2e; 
            color: white;
        }
        
        .assistant .message-content { 
            background: #f7f7f7; 
            color: #37352f; 
            border: 1px solid #e0e0e0; 
        }
        
        .input-area { 
            display: flex;
            gap: 12px; 
            align-items: flex-end;
            padding: 16px;
            background: #fafafa;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        
        .input { 
            flex: 1; 
            padding: 12px 16px; 
            border: 1px solid #e0e0e0; 
            border-radius: 8px; 
            outline: none; 
            font-family: inherit;
            font-size: 0.95rem;
            background: white;
            transition: border-color 0.2s ease;
        }

        .input:focus {
            border-color: #2e2e2e;
            box-shadow: 0 0 0 2px rgba(46, 46, 46, 0.1);
        }
        
        .send-btn { 
            padding: 12px 20px; 
            background: #2e2e2e; 
            color: white;
            border: none;
            border-radius: 8px; 
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .send-btn:hover {
            background: #1a1a1a;
            transform: translateY(-1px);
        }

        .send-btn:disabled {
            background: #d0d0d0;
            cursor: not-allowed;
            transform: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">💬 AI 对话助手</div>
        <a href="/" class="nav-btn">🏠 返回首页</a>
                    </div>
    <div class="chat-container">
        <div class="messages" id="messages">
            <div class="message assistant">
                <div class="message-content">👋 您好！我是AI助手，很高兴为您服务。您可以向我询问任何问题，我会尽力帮助您。</div>
                </div>
                    </div>
        <div class="input-area">
            <input type="text" class="input" id="messageInput" placeholder="输入您的问题..." />
            <button class="send-btn" id="sendBtn">发送</button>
                </div>
            </div>
    <script>
        const messages = document.getElementById('messages');
        const input = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        function addMessage(content, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + (isUser ? 'user' : 'assistant');
            messageDiv.innerHTML = '<div class="message-content">' + content + '</div>';
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }
        
        async function sendMessage() {
            const message = input.value.trim();
            if (!message) return;
            
            addMessage(message, true);
            input.value = '';
            sendBtn.disabled = true;
            
            try {
                const response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });
                
                const data = await response.json();
                addMessage(data.success ? data.data.content : '抱歉，发生了错误，请重试。');
            } catch (error) {
                addMessage('网络错误，请检查连接后重试。');
            } finally {
                sendBtn.disabled = false;
            }
        }
        
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    </script>
</body>
</html>`;
}

export function generateEditorPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>文档编辑器 - AI Gen Studio</title>
    <link rel="icon" href="/unicorn.png" type="image/png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            background: #fafafa; 
            height: 100vh; 
            display: flex; 
            flex-direction: column; 
            color: #37352f;
        }
        
        .header { 
            background: white; 
            padding: 16px 24px; 
            border-bottom: 1px solid #e0e0e0; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        
        .title { 
            font-size: 1.25rem; 
            font-weight: 600; 
            color: #2e2e2e;
        }
        
        .nav-btn { 
            padding: 8px 16px; 
            background: white; 
            border: 1px solid #e0e0e0; 
            border-radius: 6px; 
            text-decoration: none; 
            color: #37352f; 
            margin-left: 8px; 
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .nav-btn:hover {
            background: #f7f7f7;
            border-color: #d0d0d0;
            transform: translateY(-1px);
        }
        
        .editor-container { 
            flex: 1; 
            display: flex; 
            max-width: 1400px; 
            margin: 0 auto; 
            width: 100%; 
            gap: 24px;
            padding: 24px;
        }
        
        .editor { 
            flex: 1; 
            padding: 0; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.04); 
            border: 1px solid #e0e0e0;
            overflow: hidden;
        }
        
        .editor textarea { 
            width: 100%; 
            height: 100%; 
            border: none; 
            outline: none; 
            font-family: 'Inter', 'Monaco', 'Courier New', monospace; 
            font-size: 14px; 
            line-height: 1.6; 
            resize: none; 
            padding: 24px;
            color: #37352f;
            background: white;
        }
        
        .preview { 
            flex: 1; 
            padding: 24px; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.04); 
            overflow-y: auto;
            border: 1px solid #e0e0e0;
        }

        .preview h1, .preview h2, .preview h3 {
            color: #2e2e2e;
            margin-bottom: 12px;
            font-weight: 600;
        }

        .preview h1 { font-size: 1.75rem; }
        .preview h2 { font-size: 1.5rem; }
        .preview h3 { font-size: 1.25rem; }

        .preview p {
            color: #37352f;
            line-height: 1.6;
            margin-bottom: 16px;
        }

        .preview strong {
            color: #2e2e2e;
            font-weight: 600;
        }

        .preview em {
            font-style: italic;
            color: #787774;
        }

        .placeholder {
            color: #9b9a97;
            text-align: center;
            margin-top: 3rem;
            font-style: italic;
        }

        @media (max-width: 768px) {
            .editor-container {
                flex-direction: column;
                padding: 16px;
                gap: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">📝 文档编辑器</div>
        <div>
            <a href="/" class="nav-btn">🏠 首页</a>
            <button class="nav-btn" onclick="saveDocument()">💾 保存</button>
        </div>
    </div>
    <div class="editor-container">
        <div class="editor">
            <textarea id="editor" placeholder="开始编写您的文档...支持 Markdown 语法

# 标题示例
## 二级标题
### 三级标题

**粗体文本** 和 *斜体文本*

这是一个段落示例..."></textarea>
                        </div>
        <div class="preview" id="preview">
            <p class="placeholder">实时预览将显示在这里</p>
        </div>
    </div>
    <script>
        const editor = document.getElementById('editor');
        const preview = document.getElementById('preview');
        
        // 简单的 Markdown 转换
        function markdownToHtml(text) {
            return text
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                .replace(/\*(.*)\*/gim, '<em>$1</em>')
                .replace(/\n\n/gim, '</p><p>')
                .replace(/\n/gim, '<br>');
        }
        
        editor.addEventListener('input', () => {
            const html = markdownToHtml(editor.value);
            if (html.trim()) {
                preview.innerHTML = '<p>' + html + '</p>';
            } else {
                preview.innerHTML = '<p class="placeholder">实时预览将显示在这里</p>';
            }
        });
        
        function saveDocument() {
            const content = editor.value;
            if (!content.trim()) {
                alert('文档内容为空，无法保存');
                return;
            }
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'document.md';
            a.click();
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>`;
}

export function generateCanvasPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>画布编辑器 - AI Gen Studio</title>
    <link rel="icon" href="/unicorn.png" type="image/png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            background: #fafafa; 
            height: 100vh; 
            display: flex; 
            flex-direction: column; 
            color: #37352f;
        }
        
        .header { 
            background: white; 
            padding: 16px 24px; 
            border-bottom: 1px solid #e0e0e0; 
            display: flex;
            justify-content: space-between; 
            align-items: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        
        .title { 
            font-size: 1.25rem; 
            font-weight: 600; 
            color: #2e2e2e;
        }
        
        .nav-btn { 
            padding: 8px 16px; 
            background: white; 
            border: 1px solid #e0e0e0; 
            border-radius: 6px; 
            text-decoration: none; 
            color: #37352f; 
            margin-left: 8px; 
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .nav-btn:hover {
            background: #f7f7f7;
            border-color: #d0d0d0;
            transform: translateY(-1px);
        }
        
        .canvas-container { 
            flex: 1; 
            display: flex;
            flex-direction: column;
            padding: 24px;
            gap: 16px;
        }
        
        .toolbar { 
            background: white; 
            padding: 16px 24px; 
            border: 1px solid #e0e0e0; 
            display: flex;
            gap: 16px; 
            align-items: center;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        
        .tool-btn { 
            padding: 8px 16px; 
            border: 1px solid #e0e0e0; 
            background: white; 
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .tool-btn.active { 
            background: #2e2e2e; 
            color: white; 
            border-color: #2e2e2e;
        }

        .tool-btn:hover:not(.active) {
            background: #f7f7f7;
            border-color: #d0d0d0;
            transform: translateY(-1px);
        }
        
        .canvas-area { 
            flex: 1; 
            padding: 0;
        }
        
        .canvas-wrapper { 
            width: 100%; 
            height: 100%; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.04); 
            position: relative; 
            border: 1px solid #e0e0e0;
            overflow: hidden;
        }
        
        #canvas { 
            width: 100%; 
            height: 100%; 
            border-radius: 12px; 
            cursor: crosshair; 
            display: block;
        }

        .control-group {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: #fafafa;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
        }

        .control-label {
            font-size: 0.85rem;
            color: #787774;
            font-weight: 500;
        }

        input[type="color"] {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        input[type="range"] {
            width: 80px;
            height: 4px;
            border-radius: 2px;
            background: #e0e0e0;
            outline: none;
            cursor: pointer;
        }

        @media (max-width: 768px) {
            .toolbar {
                flex-wrap: wrap;
                gap: 8px;
                padding: 12px 16px;
            }
            
            .canvas-container {
                padding: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">🎨 画布编辑器</div>
        <div>
            <a href="/" class="nav-btn">🏠 首页</a>
            <a href="/canvas-multi" class="nav-btn">🧠 AI 画布</a>
            <button class="nav-btn" onclick="clearCanvas()">🗑️ 清空</button>
        </div>
                </div>
    <div class="canvas-container">
        <div class="toolbar">
            <button class="tool-btn active" onclick="setTool('draw')">✏️ 画笔</button>
            <button class="tool-btn" onclick="setTool('erase')">🧽 橡皮擦</button>
            <button class="tool-btn" onclick="setTool('line')">📏 直线</button>
                
                <div class="control-group">
                <span class="control-label">颜色</span>
                <input type="color" id="colorPicker" value="#2e2e2e">
                </div>
                
                <div class="control-group">
                <span class="control-label">粗细</span>
                <input type="range" id="brushSize" min="1" max="50" value="3">
                </div>
                </div>
        <div class="canvas-area">
                <div class="canvas-wrapper">
                <canvas id="canvas"></canvas>
                </div>
                </div>
                </div>
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let currentTool = 'draw';
        let lastX = 0, lastY = 0;
        
        function resizeCanvas() {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width - 2;
            canvas.height = rect.height - 2;
        }
        
        function setTool(tool) {
            currentTool = tool;
            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        }
        
        function startDrawing(e) {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
        }
        
        function draw(e) {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ctx.lineWidth = document.getElementById('brushSize').value;
            ctx.strokeStyle = document.getElementById('colorPicker').value;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            if (currentTool === 'erase') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineWidth = parseInt(document.getElementById('brushSize').value) * 3;
                } else {
                ctx.globalCompositeOperation = 'source-over';
            }
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            lastX = x;
            lastY = y;
        }
        
        function stopDrawing() {
            isDrawing = false;
        }
        
        function clearCanvas() {
            if (confirm('确定要清空画布吗？')) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // 触摸事件支持
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener('touchend', (e) => {
                            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            canvas.dispatchEvent(mouseEvent);
        });
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    </script>
</body>
</html>`;
}

export function generateMultiEngineCanvasPage(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎨 AI Canvas Multi - 智能画布编辑器</title>
    <link rel="icon" href="/unicorn.png" type="image/png">
    <meta name="description" content="AI驱动的智能画布编辑器，支持CoT思维链分析和FLUX图片生成">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #fafafa;
            color: #37352f;
            line-height: 1.6;
            height: 100vh;
            overflow: hidden;
        }

        .canvas-container {
            display: flex;
            height: 100vh;
            background: #fafafa;
            gap: 1px;
        }

        /* 画布区域 */
        .canvas-area {
            flex: 1;
            position: relative;
            overflow: hidden;
            background: white;
            padding: 24px;
        }

        .canvas-wrapper {
            width: 100%;
            height: 100%;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid #e5e5e5;
            position: relative;
            overflow: hidden;
        }

        #main-canvas {
            width: 100%;
            height: 100%;
            display: block;
            border-radius: 12px;
        }

        /* AI聊天侧边栏 */
        .ai-sidebar {
            width: 400px;
            border-left: 1px solid #e5e5e5;
            background: white;
            display: flex;
            flex-direction: column;
        }

        .sidebar-header {
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
            background: #fafafa;
        }

        .sidebar-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #2e2e2e;
        }

        .sidebar-subtitle {
            font-size: 0.85rem;
            color: #787774;
        }

        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            max-height: calc(100vh - 200px);
        }

        .message {
            margin-bottom: 16px;
        }

        .message.user {
            text-align: right;
        }

        .message-content {
            display: inline-block;
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.4;
        }

        .message.user .message-content {
            background: #2e2e2e;
            color: white;
        }

        .message.assistant .message-content {
            background: #f7f7f7;
            color: #37352f;
            border: 1px solid #e0e0e0;
        }

        .message.analysis .message-content {
            background: #e3f2fd;
            color: #1565c0;
            border-left: 4px solid #2196f3;
        }

        .message.image .message-content {
            background: #e8f5e8;
            color: #2e7d32;
            border-left: 4px solid #4caf50;
        }

        .chat-input-area {
            padding: 20px;
            border-top: 1px solid #e0e0e0;
            background: #fafafa;
        }

        .input-container {
            display: flex;
            gap: 12px;
            align-items: flex-end;
        }

        .chat-input {
            flex: 1;
            min-height: 40px;
            max-height: 120px;
            padding: 12px 16px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            outline: none;
            resize: none;
            font-family: inherit;
            font-size: 0.9rem;
            line-height: 1.4;
            background: white;
            transition: border-color 0.2s ease;
        }

        .chat-input:focus {
            border-color: #2e2e2e;
            box-shadow: 0 0 0 2px rgba(46, 46, 46, 0.1);
        }

        .send-btn {
            width: 40px;
            height: 40px;
            border: none;
            background: #2e2e2e;
            color: white;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .send-btn:hover:not(:disabled) {
            background: #1a1a1a;
            transform: translateY(-1px);
        }

        .send-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .loading-indicator {
            display: none;
            padding: 16px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }

        .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #e0e0e0;
            border-top: 2px solid #2e2e2e;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 8px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .toolbar {
            position: absolute;
            top: 20px;
            left: 20px;
            background: white;
            border-radius: 8px;
            padding: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e5e5;
            z-index: 10;
        }

        .tool-btn {
            width: 36px;
            height: 36px;
            border: none;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin: 2px;
            transition: background 0.2s;
        }

        .tool-btn:hover {
            background: #f0f0f0;
        }

        .tool-btn.active {
            background: #2e2e2e;
            color: white;
            border-color: #2e2e2e;
        }

        .nav-header {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 10;
        }

        .nav-btn {
            padding: 8px 16px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            text-decoration: none;
            color: #37352f;
            font-size: 0.85rem;
            margin-left: 8px;
            transition: all 0.2s ease;
            font-weight: 500;
        }

        .nav-btn:hover {
            background: #f7f7f7;
            color: #2e2e2e;
            border-color: #d0d0d0;
            transform: translateY(-1px);
        }

        .image-preview {
            max-width: 200px;
            border-radius: 8px;
            margin-top: 8px;
        }

        .cot-analysis {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 12px;
            margin: 8px 0;
            font-size: 12px;
        }

        .cot-title {
            font-weight: 600;
            color: #495057;
            margin-bottom: 4px;
        }

        .prompt-display {
            background: #e3f2fd;
            border-radius: 6px;
            padding: 8px;
            margin-top: 4px;
            font-family: monospace;
            font-size: 11px;
            color: #1565c0;
        }
    </style>
</head>
<body>
    <div class="canvas-container">
        <!-- 画布区域 -->
        <div class="canvas-area">
            <div class="canvas-wrapper">
                <canvas id="main-canvas"></canvas>

        <!-- 工具栏 -->
        <div class="toolbar">
                    <button class="tool-btn active" data-tool="select" title="选择">👆</button>
                    <button class="tool-btn" data-tool="draw" title="画笔">✏️</button>
                    <button class="tool-btn" data-tool="eraser" title="橡皮擦">🧽</button>
                    <button class="tool-btn" onclick="clearCanvas()" title="清空">🗑️</button>
            </div>

                <!-- 导航按钮 -->
                <div class="nav-header">
                    <a href="/" class="nav-btn">🏠 首页</a>
                    <a href="/canvas" class="nav-btn">🎨 基础画布</a>
            </div>
            </div>
        </div>

        <!-- AI聊天侧边栏 -->
        <div class="ai-sidebar">
            <div class="sidebar-header">
                <div class="sidebar-title">
                    🧠 AI 图片生成助手
                    </div>
                <div class="sidebar-subtitle">
                    使用 CoT 思维链分析，智能生成高质量图片
                    </div>
                </div>
                
            <div class="chat-messages" id="chat-messages">
                <div class="message assistant">
                    <div class="message-content">
                        👋 您好！我是AI图片生成助手。请描述您想要生成的图片，我会：<br><br>
                        🔍 分析您的需求<br>
                        🎨 优化提示词<br>
                        ✨ 生成高质量图片<br><br>
                        试试说："生成一个可爱的小猫咪"
                </div>
            </div>
        </div>

            <div class="loading-indicator" id="loading-indicator">
                <div class="loading-spinner"></div>
                正在处理您的请求...
            </div>

            <div class="chat-input-area">
                <div class="input-container">
                    <textarea 
                        id="chat-input" 
                        class="chat-input" 
                        placeholder="描述您想要生成的图片，或与我对话..."
                        rows="1"
                    ></textarea>
                    <button id="send-btn" class="send-btn">
                        📤
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // 全局变量
        let canvas = null;
        let ctx = null;
        let currentTool = 'select';
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        let messages = [];
        let isGenerating = false;

        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            initializeCanvas();
            initializeChat();
        });

        // 初始化画布
        function initializeCanvas() {
            canvas = document.getElementById('main-canvas');
            if (!canvas) return;

            ctx = canvas.getContext('2d');
            resizeCanvas();
            
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2;
            
            // 事件监听
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            
            // 工具按钮
            document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
                btn.addEventListener('click', () => selectTool(btn.dataset.tool));
            });
            
            window.addEventListener('resize', resizeCanvas);
        }

        function resizeCanvas() {
            const wrapper = canvas.parentElement;
            const rect = wrapper.getBoundingClientRect();
            canvas.width = rect.width - 2;
            canvas.height = rect.height - 2;
        }

        function selectTool(tool) {
            currentTool = tool;
            document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tool === tool);
            });
        }

        function startDrawing(e) {
            if (currentTool !== 'draw' && currentTool !== 'eraser') return;
            
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
        }

        function draw(e) {
            if (!isDrawing) return;
            
            const rect = canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(currentX, currentY);
            
            if (currentTool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineWidth = 20;
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.lineWidth = 2;
            }
            
            ctx.stroke();
            
            lastX = currentX;
            lastY = currentY;
        }

        function stopDrawing() {
                isDrawing = false;
        }

        function clearCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // 添加图片到画布
        function addImageToCanvas(imageUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            // 使用图像代理API处理可能的跨域问题
            const proxyUrl = '/api/ai/proxy-image?url=' + encodeURIComponent(imageUrl);
            
            img.onload = function() {
                const maxWidth = canvas.width * 0.8;
                const maxHeight = canvas.height * 0.8;
                
                let { width, height } = img;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
                
                const x = (canvas.width - width) / 2;
                const y = (canvas.height - height) / 2;
                
                ctx.drawImage(img, x, y, width, height);
            };
            
            img.onerror = function() {
                console.error('图片加载失败:', proxyUrl);
                // 如果代理加载失败，尝试直接加载原始URL
                if (img.src !== imageUrl) {
                    console.log('尝试直接加载原始URL');
                    img.src = imageUrl;
                } else {
                    addMessage('图片加载失败，请重试。', 'assistant');
                }
            };
            
            img.src = proxyUrl;
        }

        // 初始化聊天功能
        function initializeChat() {
            const chatInput = document.getElementById('chat-input');
            const sendBtn = document.getElementById('send-btn');
            
            // 自动调整输入框高度
            chatInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });
            
            // 发送消息
            function sendMessage() {
                const message = chatInput.value.trim();
                if (!message || isGenerating) return;
                
                addMessage(message, 'user');
                chatInput.value = '';
                chatInput.style.height = 'auto';
                
                processMessage(message);
            }
            
            sendBtn.addEventListener('click', sendMessage);
            chatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        // 添加消息到聊天记录
        function addMessage(content, type, analysis = null, imageUrl = null) {
            const messagesContainer = document.getElementById('chat-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + type;
            
            let messageContent = '<div class="message-content">' + content;
            
            if (analysis) {
                messageContent += '<div class="cot-analysis">' + 
                    '<div class="cot-title">🧠 AI思维分析</div>' + 
                    '<div>' + analysis.thinking + '</div>' + 
                    '<div class="prompt-display">优化提示词: ' + analysis.imagePrompt + '</div>' + 
                    '</div>';
            }
            
            if (imageUrl) {
                messageContent += '<br><img src="' + imageUrl + '" class="image-preview" alt="Generated Image">';
            }
            
            messageContent += '</div>';
            messageDiv.innerHTML = messageContent;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            messages.push({ content, type, analysis, imageUrl });
        }

        // 处理用户消息
        async function processMessage(message) {
            const isImageRequest = /生成|画|创建|制作|图片|图像|generate|create|draw/i.test(message);
            
            if (isImageRequest) {
                await generateImage(message);
            } else {
                await chatWithAI(message);
            }
        }

        // AI对话
        async function chatWithAI(message) {
            setLoading(true);
            
            try {
                const response = await fetch('/api/ai/chat-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: messages.map(m => ({ content: m.content, role: m.type === 'user' ? 'user' : 'assistant' }))
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    addMessage(data.data.content, 'assistant');
                } else {
                    addMessage('抱歉，我遇到了一个错误。请重试。', 'assistant');
                }
            } catch (error) {
                console.error('Chat error:', error);
                addMessage('抱歉，我遇到了一个错误。请重试。', 'assistant');
            } finally {
                setLoading(false);
            }
        }

        // 生成图片
        async function generateImage(prompt) {
            setLoading(true);
            
            try {
                const response = await fetch('/api/ai/generate-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userPrompt: prompt,
                        conversationHistory: messages.slice(-5)
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // 显示CoT分析
                    addMessage('正在分析您的需求...', 'analysis', data.data.cotAnalysis);
                    
                    // 处理图片生成
                    if (data.data.isSimulated || data.data.status === 'succeeded') {
                        const imageUrl = Array.isArray(data.data.output) ? data.data.output[0] : data.data.output;
                        
                        setTimeout(() => {
                            addMessage('图片生成完成！已添加到画布。', 'image', null, imageUrl);
                            addImageToCanvas(imageUrl);
                        }, 1000);
                    } else {
                        // 轮询状态
                        pollImageStatus(data.data.predictionId);
                    }
                } else {
                    addMessage('图片生成失败，请重试。', 'assistant');
                }
            } catch (error) {
                console.error('Image generation error:', error);
                addMessage('图片生成失败，请检查网络连接。', 'assistant');
            } finally {
                setLoading(false);
            }
        }

        // 轮询图片生成状态
        async function pollImageStatus(predictionId) {
            const maxAttempts = 30;
            let attempts = 0;
            
            const checkStatus = async () => {
                try {
                    const response = await fetch('/api/ai/image-status/' + predictionId);
                    const data = await response.json();
                    
                    if (data.success) {
                        console.log('获取到图片状态:', data.data);
                        
                        if (data.data.status === 'succeeded' && data.data.output) {
                            console.log('图片生成成功，output数据:', data.data.output);
                            
                            // 先尝试获取output数组中的第一个URL
                            let imageUrl;
                            if (Array.isArray(data.data.output) && data.data.output.length > 0) {
                                imageUrl = data.data.output[0];
                                console.log('使用数组中的第一个URL:', imageUrl);
                            } else if (typeof data.data.output === 'string') {
                                imageUrl = data.data.output;
                                console.log('使用字符串URL:', imageUrl);
                            } else {
                                console.error('无法识别的output格式');
                                addMessage('图片格式错误，请重试。', 'assistant');
                                return;
                            }
                            
                            // 添加消息和图像
                            addMessage('图片生成完成！已添加到画布。', 'image', null, imageUrl);
                            addImageToCanvas(imageUrl);
                            return;
                        } else if (data.data.status === 'failed') {
                            console.error('图片生成API返回失败状态');
                            addMessage('图片生成失败，请重试。', 'assistant');
                            return;
                        } else {
                            console.log('图片仍在处理中，状态:', data.data.status);
                        }
                    }
                    
                    attempts++;
                    if (attempts < maxAttempts) {
                        setTimeout(checkStatus, 2000);
                    } else {
                        addMessage('图片生成超时，请重试。', 'assistant');
                    }
                } catch (error) {
                    console.error('Status check error:', error);
                    addMessage('图片生成状态检查失败。', 'assistant');
                }
            };
            
            setTimeout(checkStatus, 2000);
        }

        // 设置加载状态
        function setLoading(loading) {
            isGenerating = loading;
            const loadingIndicator = document.getElementById('loading-indicator');
            const sendBtn = document.getElementById('send-btn');
            
            loadingIndicator.style.display = loading ? 'block' : 'none';
            sendBtn.disabled = loading;
        }
    </script>
 </body>
 </html>`;
 } 