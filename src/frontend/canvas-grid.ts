export function generateCanvasGridPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎨 Canvas - 创意画布</title>
    
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #ffffff;
            color: #1a1a1a;
            line-height: 1.6;
            overflow-x: hidden;
        }
        
        /* 导航栏 */
        .navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #e5e5e5;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1000;
            height: 60px;
        }
        
        .nav-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .nav-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
        }
        
        .nav-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .nav-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            border: 1px solid #e5e5e5;
            background: white;
            border-radius: 6px;
            color: #666;
            text-decoration: none;
            font-size: 14px;
            transition: all 0.2s ease;
        }
        
        .nav-btn:hover {
            background: #f8f8f8;
            border-color: #d1d1d1;
            color: #1a1a1a;
        }
        
        .nav-btn.primary {
            background: #1a1a1a;
            border-color: #1a1a1a;
            color: white;
        }
        
        .nav-btn.primary:hover {
            background: #333;
        }
        
        /* 主容器 */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 80px 24px 40px;
        }
        
        /* 页面标题 */
        .page-header {
            text-align: center;
            margin-bottom: 48px;
        }
        
        .page-title {
            font-size: 32px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 12px;
        }
        
        .page-subtitle {
            font-size: 16px;
            color: #666;
            max-width: 600px;
            margin: 0 auto;
        }
        
        /* 画布网格 */
        .canvas-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            margin-bottom: 48px;
        }
        
        .canvas-item {
            background: white;
            border: 2px solid #f0f0f0;
            border-radius: 12px;
            padding: 24px;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        
        .canvas-item:hover {
            border-color: #1a1a1a;
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        .canvas-illustration {
            width: 100%;
            height: 160px;
            background: #f8f8f8;
            border-radius: 8px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
        }
        
        .illustration-icon {
            font-size: 48px;
            color: #1a1a1a;
            opacity: 0.8;
        }
        
        .canvas-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
        }
        
        .canvas-description {
            font-size: 14px;
            color: #666;
            line-height: 1.5;
        }
        
        /* 简约插图样式 */
        .simple-illustration {
            width: 100%;
            height: 100%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .illustration-svg {
            width: 120px;
            height: 120px;
            stroke: #1a1a1a;
            stroke-width: 2;
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        
        /* 工具栏 */
        .tools-bar {
            background: white;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 32px;
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .tool-group {
            display: flex;
            align-items: center;
            gap: 8px;
            padding-right: 16px;
            border-right: 1px solid #e5e5e5;
        }
        
        .tool-group:last-child {
            border-right: none;
        }
        
        .tool-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border: 1px solid #e5e5e5;
            background: white;
            border-radius: 6px;
            color: #666;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .tool-btn:hover {
            background: #f8f8f8;
            border-color: #1a1a1a;
            color: #1a1a1a;
        }
        
        .tool-btn.active {
            background: #1a1a1a;
            border-color: #1a1a1a;
            color: white;
        }
        
        .tool-slider {
            width: 80px;
            height: 4px;
            border-radius: 2px;
            background: #e5e5e5;
            outline: none;
            cursor: pointer;
        }
        
        .color-picker {
            width: 32px;
            height: 32px;
            border: 2px solid #e5e5e5;
            border-radius: 50%;
            cursor: pointer;
            overflow: hidden;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .container {
                padding: 80px 16px 40px;
            }
            
            .canvas-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }
            
            .page-title {
                font-size: 28px;
            }
            
            .tools-bar {
                flex-direction: column;
                align-items: stretch;
            }
            
            .tool-group {
                border-right: none;
                border-bottom: 1px solid #e5e5e5;
                padding-bottom: 12px;
                margin-bottom: 12px;
            }
            
            .tool-group:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
        }
        
        /* 动画效果 */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .canvas-item {
            animation: fadeIn 0.6s ease forwards;
        }
        
        .canvas-item:nth-child(1) { animation-delay: 0.1s; }
        .canvas-item:nth-child(2) { animation-delay: 0.2s; }
        .canvas-item:nth-child(3) { animation-delay: 0.3s; }
        .canvas-item:nth-child(4) { animation-delay: 0.4s; }
        .canvas-item:nth-child(5) { animation-delay: 0.5s; }
        .canvas-item:nth-child(6) { animation-delay: 0.6s; }
        .canvas-item:nth-child(7) { animation-delay: 0.7s; }
    </style>
</head>
<body>
    <!-- 导航栏 -->
    <nav class="navbar">
        <div class="nav-left">
            <div class="nav-title">🎨 Canvas</div>
        </div>
        <div class="nav-right">
            <a href="/" class="nav-btn">
                <i class="fas fa-home"></i>
                首页
            </a>
            <a href="/chat" class="nav-btn">
                <i class="fas fa-comments"></i>
                聊天
            </a>
            <a href="/editor" class="nav-btn">
                <i class="fas fa-edit"></i>
                编辑器
            </a>
            <button class="nav-btn primary" onclick="startDrawing()">
                <i class="fas fa-plus"></i>
                开始创作
            </button>
        </div>
    </nav>
    
    <!-- 主容器 -->
    <div class="container">
        <!-- 页面标题 -->
        <div class="page-header">
            <h1 class="page-title">创意画布</h1>
            <p class="page-subtitle">
                选择您喜欢的绘图工具，开始您的创意之旅。简约设计，专注创作。
            </p>
        </div>
        
        <!-- 工具栏 -->
        <div class="tools-bar">
            <div class="tool-group">
                <button class="tool-btn active" title="选择工具">
                    <i class="fas fa-mouse-pointer"></i>
                </button>
                <button class="tool-btn" title="画笔">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="tool-btn" title="橡皮擦">
                    <i class="fas fa-eraser"></i>
                </button>
            </div>
            
            <div class="tool-group">
                <button class="tool-btn" title="矩形">
                    <i class="far fa-square"></i>
                </button>
                <button class="tool-btn" title="圆形">
                    <i class="far fa-circle"></i>
                </button>
                <button class="tool-btn" title="直线">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="tool-btn" title="文本">
                    <i class="fas fa-font"></i>
                </button>
            </div>
            
            <div class="tool-group">
                <span style="font-size: 14px; color: #666;">笔刷</span>
                <input type="range" class="tool-slider" min="1" max="20" value="2">
                <span style="font-size: 12px; color: #999;">2px</span>
            </div>
            
            <div class="tool-group">
                <span style="font-size: 14px; color: #666;">颜色</span>
                <input type="color" class="color-picker" value="#1a1a1a">
            </div>
            
            <div class="tool-group">
                <button class="tool-btn" title="撤销">
                    <i class="fas fa-undo"></i>
                </button>
                <button class="tool-btn" title="重做">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="tool-btn" title="清空">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        
        <!-- 画布网格 -->
        <div class="canvas-grid">
            <!-- 阅读插图 -->
            <div class="canvas-item" onclick="openCanvas('reading')">
                <div class="canvas-illustration">
                    <div class="simple-illustration">
                        <svg class="illustration-svg" viewBox="0 0 100 100">
                            <!-- 人物轮廓 -->
                            <path d="M25 70 Q25 65 30 65 L35 65 Q40 65 40 70 L40 85 Q40 90 35 90 L30 90 Q25 90 25 85 Z"/>
                            <!-- 头部 -->
                            <circle cx="32" cy="50" r="8"/>
                            <!-- 书本 -->
                            <rect x="45" y="45" width="25" height="20" rx="2"/>
                            <line x1="57" y1="45" x2="57" y2="65"/>
                            <line x1="47" y1="50" x2="55" y2="50"/>
                            <line x1="47" y1="55" x2="55" y2="55"/>
                            <line x1="59" y1="50" x2="68" y2="50"/>
                            <line x1="59" y1="55" x2="68" y2="55"/>
                            <line x1="59" y1="60" x2="68" y2="60"/>
                        </svg>
                    </div>
                </div>
                <h3 class="canvas-title">阅读时光</h3>
                <p class="canvas-description">享受静谧的阅读时光，沉浸在知识的海洋中</p>
            </div>
            
            <!-- 烹饪插图 -->
            <div class="canvas-item" onclick="openCanvas('cooking')">
                <div class="canvas-illustration">
                    <div class="simple-illustration">
                        <svg class="illustration-svg" viewBox="0 0 100 100">
                            <!-- 人物 -->
                            <circle cx="25" cy="45" r="8"/>
                            <path d="M25 55 Q25 50 30 50 L35 50 Q40 50 40 55 L40 75 Q40 80 35 80 L30 80 Q25 80 25 75 Z"/>
                            <!-- 锅子 -->
                            <ellipse cx="65" cy="75" rx="20" ry="8"/>
                            <path d="M45 75 Q45 60 65 60 Q85 60 85 75"/>
                            <!-- 锅柄 -->
                            <line x1="85" y1="70" x2="95" y2="65"/>
                            <!-- 食物 -->
                            <circle cx="60" cy="70" r="3"/>
                            <circle cx="70" cy="68" r="3"/>
                            <circle cx="65" cy="72" r="2"/>
                            <!-- 蒸汽 -->
                            <path d="M55 55 Q57 50 55 45" stroke-width="1"/>
                            <path d="M65 55 Q67 50 65 45" stroke-width="1"/>
                            <path d="M75 55 Q77 50 75 45" stroke-width="1"/>
                        </svg>
                    </div>
                </div>
                <h3 class="canvas-title">美食制作</h3>
                <p class="canvas-description">在厨房中创造美味，享受烹饪的乐趣</p>
            </div>
            
            <!-- 运动插图 -->
            <div class="canvas-item" onclick="openCanvas('exercise')">
                <div class="canvas-illustration">
                    <div class="simple-illustration">
                        <svg class="illustration-svg" viewBox="0 0 100 100">
                            <!-- 人物 -->
                            <circle cx="50" cy="35" r="8"/>
                            <!-- 身体 -->
                            <path d="M50 45 L50 65"/>
                            <!-- 手臂 (举起的姿势) -->
                            <path d="M50 50 L35 40"/>
                            <path d="M50 50 L65 40"/>
                            <!-- 腿部 (跑步姿势) -->
                            <path d="M50 65 L40 85"/>
                            <path d="M50 65 L60 85"/>
                            <!-- 哑铃 -->
                            <circle cx="30" cy="40" r="4"/>
                            <line x1="30" y1="36" x2="30" y2="44"/>
                            <line x1="28" y1="36" x2="32" y2="36"/>
                            <line x1="28" y1="44" x2="32" y2="44"/>
                            <!-- 运动轨迹线 -->
                            <path d="M20 70 Q30 60 40 70 Q50 80 60 70 Q70 60 80 70" stroke-width="1" stroke-dasharray="2,2"/>
                        </svg>
                    </div>
                </div>
                <h3 class="canvas-title">健身运动</h3>
                <p class="canvas-description">保持健康的生活方式，享受运动的快乐</p>
            </div>
            
            <!-- 工作插图 -->
            <div class="canvas-item" onclick="openCanvas('work')">
                <div class="canvas-illustration">
                    <div class="simple-illustration">
                        <svg class="illustration-svg" viewBox="0 0 100 100">
                            <!-- 人物 -->
                            <circle cx="30" cy="40" r="8"/>
                            <path d="M30 50 Q30 45 35 45 L40 45 Q45 45 45 50 L45 75 Q45 80 40 80 L35 80 Q30 80 30 75 Z"/>
                            <!-- 笔记本电脑 -->
                            <rect x="55" y="60" width="35" height="20" rx="2"/>
                            <!-- 屏幕 -->
                            <rect x="55" y="45" width="35" height="22" rx="2" fill="none"/>
                            <rect x="58" y="48" width="29" height="16" rx="1" fill="none"/>
                            <!-- 屏幕内容 -->
                            <line x1="60" y1="52" x2="85" y2="52" stroke-width="1"/>
                            <line x1="60" y1="56" x2="80" y2="56" stroke-width="1"/>
                            <line x1="60" y1="60" x2="85" y2="60" stroke-width="1"/>
                            <!-- 键盘 -->
                            <rect x="58" y="62" width="29" height="12" rx="1" fill="none"/>
                            <circle cx="75" cy="68" r="1"/>
                        </svg>
                    </div>
                </div>
                <h3 class="canvas-title">专注工作</h3>
                <p class="canvas-description">高效办公，专注创造价值</p>
            </div>
            
            <!-- 咖啡插图 -->
            <div class="canvas-item" onclick="openCanvas('coffee')">
                <div class="canvas-illustration">
                    <div class="simple-illustration">
                        <svg class="illustration-svg" viewBox="0 0 100 100">
                            <!-- 人物 -->
                            <circle cx="25" cy="40" r="8"/>
                            <path d="M25 50 Q25 45 30 45 L35 45 Q40 45 40 50 L40 75 Q40 80 35 80 L30 80 Q25 80 25 75 Z"/>
                            <!-- 咖啡杯 -->
                            <ellipse cx="65" cy="75" rx="12" ry="5"/>
                            <path d="M53 75 Q53 60 65 58 Q77 60 77 75"/>
                            <!-- 杯柄 -->
                            <path d="M77 70 Q85 70 85 78 Q85 85 77 80" fill="none"/>
                            <!-- 咖啡液面 -->
                            <ellipse cx="65" cy="62" rx="10" ry="3" fill="none"/>
                            <!-- 蒸汽 -->
                            <path d="M60 55 Q62 50 60 45" stroke-width="1"/>
                            <path d="M65 55 Q67 50 65 45" stroke-width="1"/>
                            <path d="M70 55 Q72 50 70 45" stroke-width="1"/>
                        </svg>
                    </div>
                </div>
                <h3 class="canvas-title">咖啡时光</h3>
                <p class="canvas-description">品味浓郁咖啡，享受悠闲时光</p>
            </div>
            
            <!-- 创业插图 -->
            <div class="canvas-item" onclick="openCanvas('startup')">
                <div class="canvas-illustration">
                    <div class="simple-illustration">
                        <svg class="illustration-svg" viewBox="0 0 100 100">
                            <!-- 手机轮廓 -->
                            <rect x="40" y="25" width="25" height="45" rx="5"/>
                            <!-- 屏幕 -->
                            <rect x="42" y="30" width="21" height="35" rx="2" fill="none"/>
                            <!-- 对话框 -->
                            <rect x="45" y="35" width="15" height="8" rx="2" fill="none"/>
                            <path d="M52 43 L52 46 L49 43" fill="none"/>
                            <!-- STARTUP 文字区域 -->
                            <rect x="45" y="50" width="15" height="6" rx="1" fill="none"/>
                            <!-- 创意灯泡 -->
                            <circle cx="75" cy="45" r="8" fill="none"/>
                            <path d="M70 53 L80 53" stroke-width="2"/>
                            <path d="M72 56 L78 56" stroke-width="2"/>
                            <path d="M73 59 L77 59" stroke-width="2"/>
                            <!-- 灯泡光芒 -->
                            <line x1="65" y1="35" x2="68" y2="38" stroke-width="1"/>
                            <line x1="82" y1="38" x2="85" y2="35" stroke-width="1"/>
                            <line x1="85" y1="52" x2="88" y2="52" stroke-width="1"/>
                            <line x1="65" y1="52" x2="62" y2="52" stroke-width="1"/>
                        </svg>
                    </div>
                </div>
                <h3 class="canvas-title">创业灵感</h3>
                <p class="canvas-description">迸发创新思维，实现创业梦想</p>
            </div>
            
            <!-- 工作学习插图 -->
            <div class="canvas-item" onclick="openCanvas('workspace')">
                <div class="canvas-illustration">
                    <div class="simple-illustration">
                        <svg class="illustration-svg" viewBox="0 0 100 100">
                            <!-- 笔记本电脑 -->
                            <rect x="25" y="50" width="40" height="25" rx="2"/>
                            <rect x="25" y="35" width="40" height="20" rx="2" fill="none"/>
                            <rect x="28" y="38" width="34" height="14" rx="1" fill="none"/>
                            <!-- 屏幕内容 -->
                            <line x1="30" y1="42" x2="60" y2="42" stroke-width="1"/>
                            <line x1="30" y1="46" x2="55" y2="46" stroke-width="1"/>
                            <line x1="30" y1="50" x2="60" y2="50" stroke-width="1"/>
                            <!-- 键盘 -->
                            <rect x="28" y="52" width="34" height="18" rx="1" fill="none"/>
                            <circle cx="45" cy="61" r="1"/>
                            <!-- 咖啡杯 -->
                            <ellipse cx="75" cy="65" rx="8" ry="3"/>
                            <path d="M67 65 Q67 52 75 50 Q83 52 83 65"/>
                            <path d="M83 60 Q88 60 88 66 Q88 71 83 69" fill="none"/>
                            <!-- 蒸汽 -->
                            <path d="M72 45 Q74 40 72 35" stroke-width="1"/>
                            <path d="M78 45 Q80 40 78 35" stroke-width="1"/>
                        </svg>
                    </div>
                </div>
                <h3 class="canvas-title">高效工作</h3>
                <p class="canvas-description">平衡工作与生活，提升工作效率</p>
            </div>
        </div>
        
        <!-- 底部说明 -->
        <div style="text-align: center; padding: 32px 0; color: #999; font-size: 14px;">
            <p>点击任意插图开始创作，或使用顶部工具栏进行绘制</p>
        </div>
    </div>
    
    <script>
        // 工具状态管理
        let currentTool = 'select';
        let currentColor = '#1a1a1a';
        let currentBrushSize = 2;
        let canvas = null;
        let ctx = null;
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        
        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Canvas页面已加载');
            initializeTools();
        });
        
        // 初始化工具
        function initializeTools() {
            // 工具按钮事件
            document.querySelectorAll('.tool-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    // 移除其他按钮的激活状态
                    btn.parentNode.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    // 激活当前按钮
                    btn.classList.add('active');
                    
                    // 设置工具
                    const icon = btn.querySelector('i');
                    if (icon.classList.contains('fa-mouse-pointer')) currentTool = 'select';
                    else if (icon.classList.contains('fa-pencil-alt')) currentTool = 'draw';
                    else if (icon.classList.contains('fa-eraser')) currentTool = 'erase';
                    else if (icon.classList.contains('fa-square')) currentTool = 'rectangle';
                    else if (icon.classList.contains('fa-circle')) currentTool = 'circle';
                    else if (icon.classList.contains('fa-minus')) currentTool = 'line';
                    else if (icon.classList.contains('fa-font')) currentTool = 'text';
                    
                    console.log('当前工具:', currentTool);
                });
            });
            
            // 滑块事件
            document.querySelector('.tool-slider').addEventListener('input', function(e) {
                currentBrushSize = e.target.value;
                e.target.nextElementSibling.textContent = currentBrushSize + 'px';
            });
            
            // 颜色选择器事件
            document.querySelector('.color-picker').addEventListener('change', function(e) {
                currentColor = e.target.value;
            });
        }
        
        // 打开特定画布
        function openCanvas(type) {
            console.log('打开画布类型:', type);
            
            // 创建全屏画布模态框
            const modal = document.createElement('div');
            modal.style.cssText = \`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: white;
                z-index: 2000;
                display: flex;
                flex-direction: column;
            \`;
            
            modal.innerHTML = \`
                <div style="padding: 16px; border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; justify-content: space-between;">
                    <h2 style="margin: 0; font-size: 18px;">画布编辑器 - \${getCanvasTitle(type)}</h2>
                    <button onclick="closeCanvas()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
                </div>
                <div style="flex: 1; position: relative; background: #f8f8f8;">
                    <canvas id="main-canvas" style="background: white; border: 1px solid #e5e5e5; margin: 20px; border-radius: 8px;"></canvas>
                </div>
            \`;
            
            document.body.appendChild(modal);
            
            // 初始化画布
            initializeCanvas();
        }
        
        // 开始绘制
        function startDrawing() {
            openCanvas('general');
        }
        
        // 获取画布标题
        function getCanvasTitle(type) {
            const titles = {
                reading: '阅读时光',
                cooking: '美食制作',
                exercise: '健身运动',
                work: '专注工作',
                coffee: '咖啡时光',
                startup: '创业灵感',
                workspace: '高效工作',
                general: '自由创作'
            };
            return titles[type] || '创意画布';
        }
        
        // 初始化画布
        function initializeCanvas() {
            canvas = document.getElementById('main-canvas');
            if (!canvas) return;
            
            ctx = canvas.getContext('2d');
            
            // 设置画布大小
            const container = canvas.parentNode;
            canvas.width = container.clientWidth - 40;
            canvas.height = container.clientHeight - 40;
            
            // 设置绘图属性
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // 绑定事件
            canvas.addEventListener('mousedown', startDraw);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDraw);
            canvas.addEventListener('mouseout', stopDraw);
        }
        
        // 开始绘制
        function startDraw(e) {
            if (currentTool !== 'draw') return;
            
            isDrawing = true;
            [lastX, lastY] = [e.offsetX, e.offsetY];
            
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = currentBrushSize;
        }
        
        // 绘制
        function draw(e) {
            if (!isDrawing || currentTool !== 'draw') return;
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            
            [lastX, lastY] = [e.offsetX, e.offsetY];
        }
        
        // 停止绘制
        function stopDraw() {
            isDrawing = false;
        }
        
        // 关闭画布
        function closeCanvas() {
            const modal = document.querySelector('div[style*="z-index: 2000"]');
            if (modal) {
                modal.remove();
            }
        }
        
        // 清空画布
        function clearCanvas() {
            if (canvas && ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        
        // 响应式处理
        window.addEventListener('resize', function() {
            if (canvas) {
                const container = canvas.parentNode;
                canvas.width = container.clientWidth - 40;
                canvas.height = container.clientHeight - 40;
            }
        });
    </script>
</body>
</html>`
} 