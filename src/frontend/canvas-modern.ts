export function generateModernCanvasPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎨 AI Gen Studio Canvas - 专业绘图工具</title>
    
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        :root {
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-tertiary: #334155;
            --text-primary: #f8fafc;
            --text-secondary: #cbd5e1;
            --text-muted: #94a3b8;
            --border-color: rgba(148, 163, 184, 0.2);
            --accent-blue: #3b82f6;
            --accent-purple: #8b5cf6;
            --accent-green: #10b981;
            --accent-orange: #f59e0b;
            --accent-red: #ef4444;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%);
            height: 100vh;
            overflow: hidden;
            color: var(--text-primary);
        }
        
        .canvas-layout {
            display: flex;
            height: 100vh;
        }
        
        /* 主画布区域 */
        .main-canvas-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
        }
        
        /* 现代化工具栏 */
        .canvas-toolbar {
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border-color);
            padding: 1rem;
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            align-items: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }
        
        .tool-section {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .tool-label {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .mode-selector {
            display: flex;
            background: rgba(30, 41, 59, 0.6);
            border-radius: 12px;
            padding: 4px;
            border: 1px solid var(--border-color);
        }
        
        .mode-btn {
            background: transparent;
            color: rgba(203, 213, 225, 0.8);
            border: none;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 0.875rem;
            font-weight: 500;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            min-width: 70px;
        }
        
        .mode-btn:hover {
            background: rgba(59, 130, 246, 0.1);
            color: white;
            transform: translateY(-1px);
        }
        
        .mode-btn.active {
            background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .mode-btn i {
            font-size: 1.25rem;
        }
        
        .tool-controls {
            display: flex;
            gap: 0.75rem;
            align-items: center;
        }
        
        .control-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        
        .control-item label {
            font-size: 0.75rem;
            color: var(--text-muted);
            font-weight: 500;
        }
        
        .slider-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .slider-group input[type="range"] {
            width: 80px;
            height: 6px;
            background: rgba(30, 41, 59, 0.6);
            border-radius: 3px;
            outline: none;
            -webkit-appearance: none;
        }
        
        .slider-group input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .color-picker-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .color-picker {
            width: 44px;
            height: 32px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            background: none;
        }
        
        .color-presets {
            display: flex;
            gap: 0.25rem;
        }
        
        .color-preset {
            width: 20px;
            height: 20px;
            border: 2px solid var(--border-color);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .color-preset:hover {
            transform: scale(1.1);
            border-color: white;
        }
        
        .action-btn {
            background: rgba(30, 41, 59, 0.6);
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
            padding: 0.75rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.875rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
        }
        
        .action-btn:hover {
            background: rgba(59, 130, 246, 0.2);
            border-color: rgba(59, 130, 246, 0.4);
            transform: translateY(-1px);
        }
        
        .action-btn.primary {
            background: linear-gradient(135deg, var(--accent-blue) 0%, #1d4ed8 100%);
            color: white;
            border-color: var(--accent-blue);
        }
        
        .action-btn.danger {
            background: linear-gradient(135deg, var(--accent-red) 0%, #dc2626 100%);
            color: white;
            border-color: var(--accent-red);
        }
        
        /* 画布容器 */
        .canvas-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
        }
        
        .canvas-wrapper {
            flex: 1;
            background: #ffffff;
            margin: 1.5rem;
            border-radius: 16px;
            box-shadow: 
                0 25px 50px -12px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(148, 163, 184, 0.1);
            overflow: hidden;
            position: relative;
            transition: all 0.3s ease;
        }
        
        .canvas-wrapper:hover {
            box-shadow: 
                0 32px 64px -12px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(59, 130, 246, 0.2);
        }
        
        .canvas-wrapper canvas {
            width: 100% !important;
            height: 100% !important;
            display: block;
        }
        
        /* 状态栏 */
        .status-bar {
            background: rgba(15, 23, 42, 0.95);
            color: var(--text-secondary);
            padding: 0.75rem 1.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            border-top: 1px solid var(--border-color);
            backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .status-bar::before {
            content: "●";
            color: var(--accent-green);
            font-size: 1rem;
        }
        
        /* 右侧边栏 */
        .sidebar-right {
            width: 380px;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            border-left: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            box-shadow: -4px 0 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        /* AI 聊天界面 */
        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 1.5rem;
            gap: 1rem;
        }
        
        .chat-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .chat-header h3 {
            font-size: 1.125rem;
            font-weight: 600;
            color: white;
            margin: 0;
        }
        
        .chat-header i {
            font-size: 1.25rem;
            color: var(--accent-blue);
        }
        
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            background: rgba(30, 41, 59, 0.3);
            border-radius: 12px;
            padding: 1rem;
            border: 1px solid rgba(148, 163, 184, 0.1);
            min-height: 0;
        }
        
        .message {
            margin-bottom: 1rem;
            padding: 1rem;
            border-radius: 12px;
            line-height: 1.6;
            font-size: 0.875rem;
            animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .message.user {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
            margin-left: 1rem;
            border-left: 3px solid var(--accent-blue);
            color: rgba(203, 213, 225, 0.95);
        }
        
        .message.assistant {
            background: rgba(30, 41, 59, 0.5);
            margin-right: 1rem;
            border-left: 3px solid var(--accent-orange);
            color: rgba(203, 213, 225, 0.9);
        }
        
        .chat-input-area {
            display: flex;
            gap: 0.75rem;
            align-items: flex-end;
        }
        
        .chat-input {
            flex: 1;
            background: rgba(30, 41, 59, 0.6);
            border: 1px solid rgba(148, 163, 184, 0.3);
            border-radius: 12px;
            padding: 1rem;
            color: white;
            font-size: 0.875rem;
            resize: none;
            min-height: 44px;
            max-height: 120px;
            transition: all 0.3s ease;
        }
        
        .chat-input:focus {
            outline: none;
            border-color: var(--accent-blue);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .chat-input::placeholder {
            color: rgba(148, 163, 184, 0.6);
        }
        
        .send-btn {
            background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%);
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .send-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }
        
        .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        /* 导航区域 */
        .navigation-area {
            padding: 1.5rem;
            border-top: 1px solid var(--border-color);
            background: rgba(15, 23, 42, 0.5);
        }
        
        .nav-links {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
        
        .nav-links a {
            background: rgba(30, 41, 59, 0.6);
            color: rgba(203, 213, 225, 0.9);
            text-decoration: none;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .nav-links a:hover {
            background: rgba(59, 130, 246, 0.2);
            border-color: rgba(59, 130, 246, 0.4);
            transform: translateY(-1px);
        }
        
        /* 滚动条样式 */
        .chat-messages::-webkit-scrollbar {
            width: 6px;
        }
        
        .chat-messages::-webkit-scrollbar-track {
            background: rgba(30, 41, 59, 0.5);
            border-radius: 3px;
        }
        
        .chat-messages::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.4);
            border-radius: 3px;
        }
        
        .chat-messages::-webkit-scrollbar-thumb:hover {
            background: rgba(148, 163, 184, 0.6);
        }
        
        /* 响应式设计 */
        @media (max-width: 1200px) {
            .sidebar-right {
                width: 320px;
            }
            
            .canvas-toolbar {
                padding: 0.75rem;
                gap: 1rem;
            }
        }
        
        @media (max-width: 768px) {
            .canvas-layout {
                flex-direction: column;
            }
            
            .sidebar-right {
                width: 100%;
                height: 250px;
            }
            
            .canvas-toolbar {
                flex-direction: column;
                align-items: stretch;
                gap: 1rem;
            }
            
            .tool-section {
                align-items: center;
            }
            
            .canvas-wrapper {
                margin: 1rem;
            }
        }
        
        /* 加载状态 */
        .loading {
            opacity: 0.6;
            pointer-events: none;
        }
        
        .loading::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border: 2px solid transparent;
            border-top: 2px solid var(--accent-blue);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .shapes-section {
            display: none;
        }
        
        .shapes-section.active {
            display: flex;
        }
    </style>
</head>
<body>
    <div class="canvas-layout">
        <!-- 主画布区域 -->
        <div class="main-canvas-area">
            <!-- 现代化工具栏 -->
            <div class="canvas-toolbar">
                <!-- 绘图模式 -->
                <div class="tool-section">
                    <div class="tool-label">绘图模式</div>
                    <div class="mode-selector">
                        <button class="mode-btn active" onclick="switchDrawMode('draw')" data-mode="draw" title="自由绘制">
                            <i class="fas fa-pen"></i>
                            <span>绘制</span>
                        </button>
                        <button class="mode-btn" onclick="switchDrawMode('shapes')" data-mode="shapes" title="形状工具">
                            <i class="fas fa-shapes"></i>
                            <span>形状</span>
                        </button>
                        <button class="mode-btn" onclick="switchDrawMode('text')" data-mode="text" title="文本工具">
                            <i class="fas fa-font"></i>
                            <span>文本</span>
                        </button>
                        <button class="mode-btn" onclick="switchDrawMode('select')" data-mode="select" title="选择工具">
                            <i class="fas fa-mouse-pointer"></i>
                            <span>选择</span>
                        </button>
                    </div>
                </div>
                
                <!-- 形状工具 -->
                <div class="tool-section shapes-section" id="shapeTools">
                    <div class="tool-label">形状</div>
                    <div class="tool-controls">
                        <button class="action-btn" onclick="addShape('rect')" title="矩形">
                            <i class="far fa-square"></i>
                        </button>
                        <button class="action-btn" onclick="addShape('circle')" title="圆形">
                            <i class="far fa-circle"></i>
                        </button>
                        <button class="action-btn" onclick="addShape('triangle')" title="三角形">
                            <i class="fas fa-play" style="transform: rotate(90deg);"></i>
                        </button>
                        <button class="action-btn" onclick="addShape('line')" title="直线">
                            <i class="fas fa-minus"></i>
                        </button>
                    </div>
                </div>
                
                <!-- 样式控制 -->
                <div class="tool-section">
                    <div class="tool-label">样式</div>
                    <div class="tool-controls">
                        <div class="control-item">
                            <label>粗细</label>
                            <div class="slider-group">
                                <input type="range" id="brushSize" min="1" max="50" value="5" 
                                       onchange="setBrushSize(this.value)" oninput="setBrushSize(this.value)">
                                <span id="brushSizeDisplay">5px</span>
                            </div>
                        </div>
                        <div class="control-item">
                            <label>颜色</label>
                            <div class="color-picker-group">
                                <input type="color" id="colorPicker" value="#000000" class="color-picker" onchange="setColor(this.value)">
                                <div class="color-presets">
                                    <button class="color-preset" style="background: #000000" onclick="setColorPreset('#000000')"></button>
                                    <button class="color-preset" style="background: #ff0000" onclick="setColorPreset('#ff0000')"></button>
                                    <button class="color-preset" style="background: #00ff00" onclick="setColorPreset('#00ff00')"></button>
                                    <button class="color-preset" style="background: #0000ff" onclick="setColorPreset('#0000ff')"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 文件操作 -->
                <div class="tool-section">
                    <div class="tool-label">文件</div>
                    <div class="tool-controls">
                        <button class="action-btn primary" onclick="newCanvas()" title="新建">
                            <i class="fas fa-file"></i>
                            <span>新建</span>
                        </button>
                        <button class="action-btn" onclick="saveCanvas()" title="保存">
                            <i class="fas fa-save"></i>
                            <span>保存</span>
                        </button>
                        <button class="action-btn" onclick="loadCanvas()" title="加载">
                            <i class="fas fa-folder-open"></i>
                            <span>加载</span>
                        </button>
                    </div>
                </div>
                
                <!-- 导出 -->
                <div class="tool-section">
                    <div class="tool-label">导出</div>
                    <div class="tool-controls">
                        <button class="action-btn" onclick="exportCanvas('png')" title="PNG">
                            <i class="fas fa-image"></i>
                            <span>PNG</span>
                        </button>
                        <button class="action-btn" onclick="exportCanvas('svg')" title="SVG">
                            <i class="fas fa-vector-square"></i>
                            <span>SVG</span>
                        </button>
                        <button class="action-btn" onclick="exportCanvas('json')" title="JSON">
                            <i class="fas fa-code"></i>
                            <span>JSON</span>
                        </button>
                    </div>
                </div>
                
                <!-- 操作 -->
                <div class="tool-section">
                    <div class="tool-label">操作</div>
                    <div class="tool-controls">
                        <button class="action-btn danger" onclick="clearCanvas()" title="清空">
                            <i class="fas fa-trash"></i>
                            <span>清空</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- 画布容器 -->
            <div class="canvas-container">
                <div class="canvas-wrapper">
                    <canvas id="fabricCanvas"></canvas>
                </div>
                
                <!-- 状态栏 -->
                <div class="status-bar" id="statusBar">
                    专业绘图工具已就绪
                </div>
            </div>
        </div>
        
        <!-- 右侧 AI 助手 -->
        <div class="sidebar-right">
            <div class="chat-container">
                <!-- 聊天头部 -->
                <div class="chat-header">
                    <i class="fas fa-robot"></i>
                    <h3>AI 绘图助手</h3>
                </div>
                
                <!-- 消息区域 -->
                <div class="chat-messages" id="chatMessages">
                    <div class="message assistant">
                        <strong>👋 欢迎使用专业绘图工具！</strong><br><br>
                        我是您的 AI 绘图助手，可以帮您：<br><br>
                        🎨 <strong>创意设计</strong> - 生成图形创意和布局建议<br>
                        📊 <strong>图表制作</strong> - 协助创建流程图、架构图<br>
                        🖼️ <strong>视觉优化</strong> - 提供色彩和排版建议<br>
                        💡 <strong>设计灵感</strong> - 分享设计技巧和最佳实践<br><br>
                        请告诉我您想要创建什么，我会提供专业的指导！
                    </div>
                </div>
                
                <!-- 输入区域 -->
                <div class="chat-input-area">
                    <textarea 
                        class="chat-input" 
                        id="chatInput" 
                        placeholder="描述您的设计需求，例如：帮我设计一个网站架构图..."
                        rows="1"
                        onkeydown="handleChatKeydown(event)"
                        oninput="autoResize(this)"
                    ></textarea>
                    <button class="send-btn" onclick="sendChatMessage()" id="sendBtn" title="发送消息">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
            
            <!-- 导航区域 -->
            <div class="navigation-area">
                <div class="nav-links">
                    <a href="/"><i class="fas fa-home"></i> 首页</a>
                    <a href="/chat"><i class="fas fa-comments"></i> 聊天</a>
                    <a href="/editor"><i class="fas fa-edit"></i> 编辑器</a>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // 全局变量
        let currentDrawMode = 'draw';
        let fabricCanvas = null;
        let chatMessages = [];
        let isLoading = false;
        let currentColor = '#000000';
        let currentBrushSize = 5;
        
        // 页面初始化
        document.addEventListener('DOMContentLoaded', async function() {
            console.log('🎨 AI Gen Studio Canvas 现代版启动中...');
            
            try {
                // 加载 Fabric.js
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js');
                console.log('✅ Fabric.js 加载完成');
                
                // 初始化画布
                initializeCanvas();
                updateStatus('专业绘图工具已就绪');
                
            } catch (error) {
                console.error('❌ 初始化失败:', error);
                updateStatus('初始化失败，请刷新页面重试');
            }
        });
        
        // 动态加载脚本
        function loadScript(src) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        
        // 初始化画布
        function initializeCanvas() {
            const container = document.querySelector('.canvas-wrapper');
            const canvas = document.getElementById('fabricCanvas');
            
            if (!container || !canvas) {
                console.error('画布容器未找到');
                return;
            }
            
            const width = container.clientWidth || 1200;
            const height = container.clientHeight || 800;
            
            fabricCanvas = new fabric.Canvas('fabricCanvas', {
                width: width,
                height: height,
                backgroundColor: 'white',
                selection: true,
                preserveObjectStacking: true
            });
            
            // 设置默认绘制模式
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush.width = currentBrushSize;
            fabricCanvas.freeDrawingBrush.color = currentColor;
            
            // 设置事件监听
            setupCanvasEvents();
            
            console.log('🎨 画布初始化完成');
        }
        
        // 设置画布事件
        function setupCanvasEvents() {
            if (!fabricCanvas) return;
            
            // 绘制完成自动保存
            fabricCanvas.on('path:created', function() {
                saveCanvasState();
            });
            
            // 对象修改自动保存
            fabricCanvas.on('object:modified', function() {
                saveCanvasState();
            });
            
            // 选择事件
            fabricCanvas.on('selection:created', function(e) {
                updateStatus(\`已选择 \${e.selected.length} 个对象\`);
            });
            
            fabricCanvas.on('selection:cleared', function() {
                updateStatus('取消选择');
            });
            
            // 双击添加文本
            fabricCanvas.on('mouse:dblclick', function(options) {
                if (currentDrawMode === 'text') {
                    const pointer = fabricCanvas.getPointer(options.e);
                    addText(pointer.x, pointer.y);
                }
            });
        }
        
        // 切换绘图模式
        function switchDrawMode(mode) {
            if (!fabricCanvas) return;
            
            currentDrawMode = mode;
            
            // 更新按钮状态
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(\`[data-mode="\${mode}"]\`).classList.add('active');
            
            // 切换工具栏显示
            const shapeTools = document.getElementById('shapeTools');
            
            switch(mode) {
                case 'draw':
                    fabricCanvas.isDrawingMode = true;
                    fabricCanvas.selection = false;
                    shapeTools.classList.remove('active');
                    updateStatus('自由绘制模式 - 在画布上绘制');
                    break;
                    
                case 'shapes':
                    fabricCanvas.isDrawingMode = false;
                    fabricCanvas.selection = true;
                    shapeTools.classList.add('active');
                    updateStatus('形状工具模式 - 点击按钮添加形状');
                    break;
                    
                case 'text':
                    fabricCanvas.isDrawingMode = false;
                    fabricCanvas.selection = true;
                    shapeTools.classList.remove('active');
                    updateStatus('文本模式 - 双击画布添加文字');
                    break;
                    
                case 'select':
                    fabricCanvas.isDrawingMode = false;
                    fabricCanvas.selection = true;
                    shapeTools.classList.remove('active');
                    updateStatus('选择模式 - 点击选择和编辑对象');
                    break;
            }
        }
        
        // 添加形状
        function addShape(type) {
            if (!fabricCanvas) return;
            
            const centerX = fabricCanvas.width / 2;
            const centerY = fabricCanvas.height / 2;
            let shape;
            
            switch(type) {
                case 'rect':
                    shape = new fabric.Rect({
                        left: centerX - 50,
                        top: centerY - 30,
                        width: 100,
                        height: 60,
                        fill: 'transparent',
                        stroke: currentColor,
                        strokeWidth: currentBrushSize
                    });
                    break;
                    
                case 'circle':
                    shape = new fabric.Circle({
                        left: centerX - 40,
                        top: centerY - 40,
                        radius: 40,
                        fill: 'transparent',
                        stroke: currentColor,
                        strokeWidth: currentBrushSize
                    });
                    break;
                    
                case 'triangle':
                    shape = new fabric.Triangle({
                        left: centerX - 40,
                        top: centerY - 35,
                        width: 80,
                        height: 70,
                        fill: 'transparent',
                        stroke: currentColor,
                        strokeWidth: currentBrushSize
                    });
                    break;
                    
                case 'line':
                    shape = new fabric.Line([centerX - 50, centerY, centerX + 50, centerY], {
                        stroke: currentColor,
                        strokeWidth: currentBrushSize
                    });
                    break;
            }
            
            if (shape) {
                fabricCanvas.add(shape);
                fabricCanvas.setActiveObject(shape);
                fabricCanvas.renderAll();
                updateStatus(\`添加了\${type}形状\`);
            }
        }
        
        // 添加文本
        function addText(x, y) {
            if (!fabricCanvas) return;
            
            const text = new fabric.IText('点击编辑文本', {
                left: x - 50,
                top: y - 10,
                fontFamily: 'Arial, sans-serif',
                fontSize: 20,
                fill: currentColor,
                editable: true
            });
            
            fabricCanvas.add(text);
            fabricCanvas.setActiveObject(text);
            text.enterEditing();
            fabricCanvas.renderAll();
            updateStatus('文本已添加');
        }
        
        // 设置画笔大小
        function setBrushSize(size) {
            currentBrushSize = parseInt(size);
            document.getElementById('brushSizeDisplay').textContent = size + 'px';
            
            if (fabricCanvas) {
                fabricCanvas.freeDrawingBrush.width = currentBrushSize;
                
                // 更新选中对象
                const activeObject = fabricCanvas.getActiveObject();
                if (activeObject && activeObject.stroke) {
                    activeObject.set('strokeWidth', currentBrushSize);
                    fabricCanvas.renderAll();
                }
            }
        }
        
        // 设置颜色
        function setColor(color) {
            currentColor = color;
            
            if (fabricCanvas) {
                fabricCanvas.freeDrawingBrush.color = currentColor;
                
                // 更新选中对象
                const activeObject = fabricCanvas.getActiveObject();
                if (activeObject) {
                    if (activeObject.stroke) {
                        activeObject.set('stroke', currentColor);
                    } else {
                        activeObject.set('fill', currentColor);
                    }
                    fabricCanvas.renderAll();
                }
            }
        }
        
        // 预设颜色
        function setColorPreset(color) {
            document.getElementById('colorPicker').value = color;
            setColor(color);
        }
        
        // 新建画布
        function newCanvas() {
            if (!confirm('确定要新建画布吗？当前内容将丢失。')) return;
            
            if (fabricCanvas) {
                fabricCanvas.clear();
                fabricCanvas.backgroundColor = 'white';
                fabricCanvas.renderAll();
                updateStatus('画布已清空');
            }
        }
        
        // 清空画布
        function clearCanvas() {
            newCanvas();
        }
        
        // 保存画布
        function saveCanvas() {
            if (fabricCanvas) {
                const data = fabricCanvas.toJSON();
                localStorage.setItem('aigen-studio-canvas-save', JSON.stringify(data));
                updateStatus('画布已保存');
            }
        }
        
        // 加载画布
        function loadCanvas() {
            const data = localStorage.getItem('aigen-studio-canvas-save');
            if (!data) {
                updateStatus('没有找到保存的画布');
                return;
            }
            
            if (fabricCanvas) {
                try {
                    fabricCanvas.loadFromJSON(JSON.parse(data), () => {
                        fabricCanvas.renderAll();
                        updateStatus('画布已加载');
                    });
                } catch (error) {
                    updateStatus('加载失败: ' + error.message);
                }
            }
        }
        
        // 导出画布
        function exportCanvas(format) {
            if (!fabricCanvas) {
                updateStatus('画布未初始化');
                return;
            }
            
            try {
                switch (format) {
                    case 'png':
                        const dataURL = fabricCanvas.toDataURL({
                            format: 'png',
                            quality: 1.0,
                            multiplier: 2
                        });
                        downloadDataURL(dataURL, 'aigen-studio-canvas.png');
                        break;
                    case 'svg':
                        const svg = fabricCanvas.toSVG();
                        downloadText(svg, 'aigen-studio-canvas.svg');
                        break;
                    case 'json':
                        downloadJSON(fabricCanvas.toJSON(), 'aigen-studio-canvas.json');
                        break;
                }
                updateStatus(\`已导出为 \${format.toUpperCase()} 格式\`);
            } catch (error) {
                updateStatus('导出失败: ' + error.message);
            }
        }
        
        // 自动保存状态
        function saveCanvasState() {
            if (fabricCanvas) {
                const state = fabricCanvas.toJSON();
                localStorage.setItem('aigen-studio-canvas-autosave', JSON.stringify(state));
            }
        }
        
        // 更新状态
        function updateStatus(message) {
            const statusBar = document.getElementById('statusBar');
            if (statusBar) {
                statusBar.textContent = message;
            }
            console.log('📝', message);
        }
        
        // AI 聊天功能
        function handleChatKeydown(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendChatMessage();
            }
        }
        
        function autoResize(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
        
        async function sendChatMessage() {
            const input = document.getElementById('chatInput');
            const sendBtn = document.getElementById('sendBtn');
            const message = input.value.trim();
            
            if (!message || isLoading) return;
            
            // 添加用户消息
            addChatMessage('user', message);
            input.value = '';
            input.style.height = 'auto';
            
            // 设置加载状态
            isLoading = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            sendBtn.disabled = true;
            
            try {
                const response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个专业的绘图助手，擅长帮助用户创建各种图形、图表和设计。请提供具体、实用的绘图建议。'
                            },
                            ...chatMessages.slice(-8),
                            { role: 'user', content: message }
                        ]
                    })
                });
                
                const data = await response.json();
                const aiResponse = data.success ? data.data.content : '抱歉，我暂时无法回应。';
                
                addChatMessage('assistant', aiResponse);
                
            } catch (error) {
                console.error('聊天错误:', error);
                addChatMessage('assistant', '抱歉，连接AI助手时出现错误。');
            } finally {
                isLoading = false;
                sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
                sendBtn.disabled = false;
            }
        }
        
        function addChatMessage(role, content) {
            const messagesContainer = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${role}\`;
            
            // 简单的 Markdown 渲染
            const formattedContent = content
                .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
                .replace(/\`(.*?)\`/g, '<code style="background: rgba(255,255,255,0.1); padding: 0.2rem; border-radius: 3px;">$1</code>')
                .replace(/\\n/g, '<br>');
            
            messageDiv.innerHTML = formattedContent;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // 保存到聊天历史
            chatMessages.push({ role, content });
            if (chatMessages.length > 20) {
                chatMessages.shift();
            }
        }
        
        // 工具函数
        function downloadJSON(data, filename) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            downloadBlob(blob, filename);
        }
        
        function downloadText(text, filename) {
            const blob = new Blob([text], { type: 'text/plain' });
            downloadBlob(blob, filename);
        }
        
        function downloadDataURL(dataURL, filename) {
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = filename;
            link.click();
        }
        
        function downloadBlob(blob, filename) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        }
        
        // 响应式处理
        window.addEventListener('resize', () => {
            if (fabricCanvas) {
                const container = document.querySelector('.canvas-wrapper');
                if (container) {
                    fabricCanvas.setDimensions({
                        width: container.clientWidth,
                        height: container.clientHeight
                    });
                }
            }
        });
    </script>
</body>
</html>`;
} 