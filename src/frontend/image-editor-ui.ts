// AI Image Editor with Infinite Canvas and Professional Design
// Enhanced with infinite canvas functionality inspired by infinite-canvas-tutorial
// Features: Unlimited zoom/pan, grid background, professional UI matching reference design

export function generateImageEditorPage(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Image Editor - 无限画布图像编辑器</title>
    <link rel="icon" href="/unicorn.png" type="image/png">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        :root {
            /* 与首页一致的配色方案 */
            --primary-color: #6366f1;
            --primary-hover: #4f46e5;
            --secondary-color: #8b5cf6;
            --accent-color: #06b6d4;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --error-color: #ef4444;
            --background: #ffffff;
            --surface: #fafbfc;
            --surface-hover: #f1f5f9;
            --surface-card: #ffffff;
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-muted: #94a3b8;
            --border: #e2e8f0;
            --border-light: #f1f5f9;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            --gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);

            /* 编辑器特定变量 */
            --bg-primary: var(--surface);
            --bg-secondary: var(--surface-card);
            --bg-tertiary: var(--surface-hover);
            --bg-sidebar: var(--surface);
            --bg-canvas: #ffffff;
            --border-color: var(--border);
            --accent-blue: var(--primary-color);
            --accent-blue-hover: var(--primary-hover);
            --accent-orange: var(--warning-color);
            --shadow-light: var(--shadow-sm);
            --shadow-medium: var(--shadow);
            --grid-color: rgba(200, 200, 200, 0.3);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            overflow: hidden;
            margin: 0;
            padding: 0;
        }

        /* 顶部菜单栏 - 参考设计图样式 */
        .top-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 48px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border-light);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            z-index: 1000;
            box-shadow: var(--shadow);
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .logo {
            font-size: 18px;
            font-weight: 600;
            color: var(--accent-blue);
        }

        .header-actions {
            display: flex;
            gap: 10px;
        }

        .header-btn {
            background: var(--surface-card);
            color: var(--text-primary);
            border: 1px solid var(--border);
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: var(--shadow-sm);
        }

        .header-btn:hover {
            background: var(--surface-hover);
            transform: translateY(-1px);
            box-shadow: var(--shadow);
        }

        .header-btn.primary {
            background: var(--gradient-primary);
            color: white;
            border: none;
        }

        .header-btn.primary:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-lg);
        }

        .header-btn i {
            font-size: 12px;
        }

        .logo {
            font-size: 1.75rem;
            font-weight: 800;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-decoration: none;
            transition: transform 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .logo:hover {
            transform: scale(1.05);
        }

        .logo i {
            font-size: 1.5rem;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header-actions {
            display: flex;
            gap: 8px;
        }

        /* 主布局 - 参考设计图的三栏布局 */
        .editor-layout {
            display: flex;
            height: 100vh;
            padding-top: 48px;
            position: relative;
            background: var(--bg-primary);
        }

        /* 左侧工具栏浮窗 */
        .left-sidebar {
            position: fixed;
            top: 80px;
            left: 20px;
            width: 56px;
            max-height: calc(100vh - 120px);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border);
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 6px 4px;
            gap: 2px;
            z-index: 1000;
            box-shadow: var(--shadow-xl);
            transition: all 0.3s ease;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .left-sidebar.collapsed {
            width: 48px;
            height: 48px;
            padding: 8px;
            overflow: hidden;
        }

        .left-sidebar.collapsed .sidebar-tool:not(:first-child) {
            display: none;
        }

        .left-sidebar.collapsed .sidebar-tool:first-child {
            width: 28px;
            height: 28px;
            font-size: 12px;
        }

        /* 工具栏滚动条样式 */
        .left-sidebar::-webkit-scrollbar {
            width: 4px;
        }

        .left-sidebar::-webkit-scrollbar-track {
            background: transparent;
        }

        .left-sidebar::-webkit-scrollbar-thumb {
            background: var(--border);
            border-radius: 2px;
        }

        .left-sidebar::-webkit-scrollbar-thumb:hover {
            background: var(--text-secondary);
        }

        /* 工具按钮样式 */
        .sidebar-tool {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.8);
            color: var(--text-primary);
            border: 1px solid var(--border);
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: var(--shadow-sm);
            margin: 2px;
        }

        .sidebar-tool:hover {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
            transform: translateY(-2px);
            box-shadow: var(--shadow);
        }

        .sidebar-tool.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
            box-shadow: var(--shadow);
        }

        .sidebar-tool.toggle-btn {
            background: var(--surface-hover);
            border: 2px solid var(--border);
        }

        .sidebar-tool.toggle-btn:hover {
            background: var(--primary-color);
            border-color: var(--primary-color);
        }

        /* 工具提示 */
        .sidebar-tool::after {
            content: attr(data-tooltip);
            position: absolute;
            left: 60px;
            top: 50%;
            transform: translateY(-50%);
            background: var(--text-primary);
            color: var(--bg-secondary);
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            z-index: 1000;
            box-shadow: 0 2px 8px var(--shadow-medium);
        }

        .sidebar-tool:hover::after {
            opacity: 1;
            visibility: visible;
        }

        /* 工具分隔符 */
        .tool-separator {
            width: 32px;
            height: 1px;
            background: var(--border-color);
            margin: 4px 0;
        }
        
        .left-sidebar.collapsed {
            width: 50px;
            padding: 15px 0;
        }
        
        .left-sidebar.collapsed .sidebar-tool {
            width: 35px;
            height: 35px;
            font-size: 14px;
        }

        /* 中央画布区域 - 无限画布实现 */
        .main-content {
            flex: 1;
            height: calc(100vh - 48px);
            display: flex;
            flex-direction: column;
            background: var(--bg-canvas);
            position: relative;
            overflow: hidden;
        }

        /* 无限画布容器 */
        .infinite-canvas-container {
            flex: 1;
            position: relative;
            overflow: hidden;
            background: #ffffff;
            cursor: grab;
        }

        .infinite-canvas-container.panning {
            cursor: grabbing;
        }

        .infinite-canvas-container.drag-over {
            background: #f0f8ff;
            border: 2px dashed var(--accent-blue);
        }

        /* 拖放覆盖层 */
        .drop-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(99, 102, 241, 0.1);
            backdrop-filter: blur(8px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            border: 2px dashed var(--primary-color);
            border-radius: 12px;
            margin: 20px;
        }

        .drop-content {
            text-align: center;
            color: var(--primary-color);
            background: rgba(255, 255, 255, 0.9);
            padding: 40px;
            border-radius: 16px;
            box-shadow: var(--shadow-lg);
        }

        .drop-content i {
            font-size: 48px;
            margin-bottom: 16px;
            display: block;
        }

        .drop-content h3 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--text-primary);
        }

        .drop-content p {
            font-size: 14px;
            color: var(--text-secondary);
            margin: 0;
        }

        /* 画布网格背景 */
        .canvas-grid {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.5;
            pointer-events: none;
        }

        /* Fabric.js 画布样式 */
        .canvas-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            transform-origin: 0 0;
        }

        /* 画布控制器 */
        .canvas-controls {
            position: absolute;
            bottom: 20px;
            right: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 8px;
            box-shadow: 0 2px 8px var(--shadow-medium);
        }

        .control-btn {
            width: 32px;
            height: 32px;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-primary);
            font-size: 14px;
            transition: all 0.2s ease;
        }

        .control-btn:hover {
            background: var(--accent-blue);
            color: white;
            border-color: var(--accent-blue);
        }

        .zoom-level {
            font-size: 12px;
            color: var(--text-secondary);
            min-width: 40px;
            text-align: center;
        }

        .image-item {
            position: relative;
            background: var(--bg-secondary);
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 2px solid transparent;
            aspect-ratio: 1;
        }

        .image-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px var(--shadow-dark);
        }

        .image-item.selected {
            border-color: var(--accent-blue);
        }

        .image-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .image-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 200px;
            background: var(--bg-secondary);
            border: 2px dashed var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .image-placeholder:hover {
            border-color: var(--accent-blue);
            background: rgba(0, 122, 204, 0.1);
        }

        .image-placeholder i {
            font-size: 48px;
            color: var(--text-secondary);
            margin-bottom: 16px;
        }

        .image-placeholder span {
            color: var(--text-secondary);
            font-size: 14px;
        }

        /* Sidebar Tools */
        .sidebar-tool {
            width: 60px;
            height: 60px;
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .sidebar-tool:hover {
            background: var(--accent-blue);
            border-color: var(--accent-blue);
            transform: translateY(-2px);
        }

        .sidebar-tool.active {
            background: var(--accent-blue);
            border-color: var(--accent-blue);
        }

        .sidebar-tool::after {
            content: attr(data-tooltip);
            position: absolute;
            left: 60px;
            top: 50%;
            transform: translateY(-50%);
            background: var(--bg-secondary);
            color: var(--text-primary);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            z-index: 1000;
            box-shadow: 0 4px 12px var(--shadow-dark);
        }

        .sidebar-tool:hover::after {
            opacity: 1;
            visibility: visible;
        }
        
        /* Floating Panel Controls */
        .panel-toggle {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 20px;
            height: 20px;
            background: var(--accent-blue);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transition: all 0.2s ease;
        }
        
        .panel-toggle:hover {
            background: var(--accent-blue-hover);
            transform: scale(1.1);
        }
        
        .panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-tertiary);
            border-radius: 12px 12px 0 0;
        }
        
        .panel-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
        }

        /* 右侧AI聊天浮窗 */
        .right-panel {
            position: fixed;
            top: 80px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border);
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            z-index: 1000;
            box-shadow: var(--shadow-xl);
            transition: all 0.3s ease;
            resize: both;
            overflow: hidden;
            min-width: 300px;
            min-height: 200px;
            max-width: 500px;
            max-height: 80vh;
        }

        .right-panel.collapsed {
            height: 48px;
            min-height: 48px;
        }

        .right-panel.collapsed .chat-content,
        .right-panel.collapsed .chat-input-container {
            display: none;
        }

        .right-panel.collapsed .ai-chat-panel {
            height: 48px;
            min-height: 48px;
        }

        /* AI聊天面板 */
        .ai-chat-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            height: 100%;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 0 0 16px 16px;
            overflow: hidden;
        }

        /* 面板头部 */
        .panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.8);
            border-bottom: 1px solid var(--border);
            min-height: 48px;
            border-radius: 16px 16px 0 0;
            cursor: move;
            user-select: none;
        }

        .panel-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .panel-title i {
            color: var(--primary-color);
        }

        .panel-controls {
            display: flex;
            gap: 4px;
        }

        .panel-toggle {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 6px;
            border-radius: 6px;
            transition: all 0.2s ease;
            font-size: 12px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .panel-toggle:hover {
            background: var(--surface-hover);
            color: var(--text-primary);
        }

        .panel-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 6px;
            border-radius: 6px;
            transition: all 0.2s ease;
            font-size: 12px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .panel-close:hover {
            background: var(--error-color);
            color: white;
        }

        .ai-chat-panel.collapsed {
            width: 60px;
            min-width: 60px;
            resize: none;
        }

        .ai-chat-panel.collapsed .chat-content,
        .ai-chat-panel.collapsed .chat-title {
            display: none;
        }

        .chat-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            height: calc(100% - 48px);
            min-height: 0;
        }

        .chat-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            overflow-x: hidden;
            background: rgba(248, 250, 252, 0.8);
            display: flex;
            flex-direction: column;
            gap: 12px;
            min-height: 0;
            border-radius: 8px;
            margin: 8px 8px 0 8px;
        }

        .chat-messages::-webkit-scrollbar {
            width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
            background: var(--bg-tertiary);
            border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
            background: var(--text-secondary);
        }

        .message {
            padding: 12px 16px;
            border-radius: 12px;
            max-width: 85%;
            word-wrap: break-word;
            line-height: 1.5;
            font-size: 14px;
            position: relative;
            margin-bottom: 0;
        }

        .message.ai {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }

        .message.ai::before {
            content: '🤖';
            position: absolute;
            left: -8px;
            top: -8px;
            background: var(--accent-blue);
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }

        .message.user {
            background: var(--accent-blue);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
            margin-left: 0;
        }

        .message-content {
            color: var(--text-primary);
            font-size: 14px;
            line-height: 1.4;
        }

        .message-time {
            color: var(--text-secondary);
            font-size: 11px;
            margin-top: 6px;
            opacity: 0.7;
        }

        .message.user .message-time {
            text-align: right;
            color: rgba(255, 255, 255, 0.8);
        }

        .message.ai .message-time {
            text-align: left;
        }

        .chat-input-container {
            padding: 12px 16px 16px 16px;
            border-top: 1px solid var(--border);
            display: flex;
            gap: 8px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 0 0 16px 16px;
            flex-shrink: 0;
        }

        #chat-input {
            flex: 1;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid var(--border);
            color: var(--text-primary);
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: all 0.2s ease;
            box-shadow: var(--shadow-sm);
        }

        #chat-input:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        #chat-input::placeholder {
            color: var(--text-secondary);
        }

        #send-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 10px 14px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
            min-width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow-sm);
        }

        #send-btn:hover {
            background: rgba(99, 102, 241, 0.9);
            transform: translateY(-1px);
            box-shadow: var(--shadow);
        }
        /* Responsive Design */
        @media (max-width: 1400px) {
            .ai-chat-panel {
                width: 350px;
                min-width: 280px;
            }
        }

        @media (max-width: 1200px) {
            .ai-chat-panel {
                width: 320px;
                min-width: 250px;
            }

            .left-sidebar {
                width: 60px;
            }

            .header-actions {
                gap: 8px;
            }

            .header-btn {
                padding: 6px 12px;
                font-size: 13px;
            }
        }

        @media (max-width: 1024px) {
            .editor-layout {
                flex-direction: column;
            }

            .ai-chat-panel {
                width: 100%;
                min-width: 100%;
                max-width: 100%;
                height: 300px;
                border-left: none;
                border-top: 1px solid var(--border-color);
                top: auto;
                bottom: 20px;
                right: 20px;
                left: 20px;
            }

            .main-content {
                height: calc(100vh - 380px);
            }

            .left-sidebar {
                width: 100%;
                height: 60px;
                flex-direction: row;
                padding: 0 20px;
                top: 60px;
                left: 0;
                right: 0;
                justify-content: center;
                border-radius: 0;
            }
        }

        @media (max-width: 768px) {
            .top-header {
                padding: 0 10px;
                height: 50px;
            }

            .editor-layout {
                padding-top: 50px;
            }

            .header-left {
                gap: 10px;
            }

            .logo {
                font-size: 16px;
            }

            .header-actions {
                gap: 5px;
            }

            .header-btn {
                padding: 5px 8px;
                font-size: 12px;
            }

            .header-btn i {
                margin-right: 3px;
            }

            .ai-chat-panel {
                height: 250px;
            }

            .main-content {
                height: calc(100vh - 320px);
            }

            .left-sidebar {
                height: 50px;
                padding: 0 10px;
                gap: 10px;
                top: 50px;
            }

            .sidebar-tool {
                width: 35px;
                height: 35px;
                font-size: 14px;
            }
        }

        @media (max-width: 480px) {
            .top-header {
                flex-direction: column;
                height: auto;
                padding: 5px;
            }

            .header-left,
            .header-actions {
                width: 100%;
                justify-content: center;
                margin: 5px 0;
            }

            .editor-layout {
                padding-top: 80px;
            }

            .ai-chat-panel {
                height: 200px;
            }

            .main-content {
                height: calc(100vh - 300px);
            }

            .header-btn {
                flex: 1;
                text-align: center;
            }

            .left-sidebar {
                top: 80px;
            }
        }
    </style>
</head>
<body>
    <!-- Top Header -->
    <div class="top-header">
        <div class="header-left">
            <div class="logo">
                <i class="fas fa-magic"></i> AI Image Editor
            </div>
        </div>
        <div class="header-actions">
            <button class="header-btn" id="undo-btn">
                <i class="fas fa-undo"></i> Undo
            </button>
            <button class="header-btn" id="redo-btn">
                <i class="fas fa-redo"></i> Redo
            </button>
            <button class="header-btn" id="save-btn">
                <i class="fas fa-save"></i> Save
            </button>
            <button class="header-btn" id="export-btn">
                <i class="fas fa-download"></i> Export
            </button>
        </div>
    </div>

    <div class="editor-layout">
        <!-- Floating Left Toolbar -->
        <div class="left-sidebar" id="left-toolbar">
            <button class="panel-toggle" id="left-panel-toggle" title="折叠/展开">
                <i class="fas fa-bars"></i>
            </button>
            <button class="sidebar-tool active" data-tool="select" data-tooltip="选择工具">
                <i class="fas fa-mouse-pointer"></i>
            </button>

            <button class="sidebar-tool" data-tool="brush" data-tooltip="画笔工具">
                <i class="fas fa-paint-brush"></i>
            </button>
            <button class="sidebar-tool" data-tool="eraser" data-tooltip="橡皮擦">
                <i class="fas fa-eraser"></i>
            </button>
            <button class="sidebar-tool" data-tool="text" data-tooltip="文本工具">
                <i class="fas fa-font"></i>
            </button>
            <button class="sidebar-tool" data-tool="rectangle" data-tooltip="矩形工具">
                <i class="far fa-square"></i>
            </button>
            <button class="sidebar-tool" data-tool="circle" data-tooltip="圆形工具">
                <i class="far fa-circle"></i>
            </button>
            <button class="sidebar-tool" data-tool="line" data-tooltip="直线工具">
                <i class="fas fa-minus"></i>
            </button>
            <button class="sidebar-tool" data-tool="arrow" data-tooltip="箭头工具">
                <i class="fas fa-long-arrow-alt-right"></i>
            </button>

            <button class="sidebar-tool" data-tool="crop" data-tooltip="裁剪工具">
                <i class="fas fa-crop"></i>
            </button>
        </div>

        <!-- 中央无限画布区域 -->
        <div class="main-content">
            <div class="infinite-canvas-container" id="infinite-canvas-container">
                <!-- 网格背景 -->
                <canvas class="canvas-grid" id="canvas-grid"></canvas>

                <!-- Fabric.js 画布包装器 -->
                <div class="canvas-wrapper" id="canvas-wrapper">
                    <canvas id="infinite-canvas"></canvas>
                </div>

                <!-- 画布控制器 -->
                <div class="canvas-controls">
                    <button class="control-btn" id="zoom-in-btn" title="放大">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="control-btn" id="zoom-out-btn" title="缩小">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="control-btn" id="fit-screen-btn" title="适应屏幕">
                        <i class="fas fa-expand"></i>
                    </button>
                    <span class="zoom-level" id="zoom-level">100%</span>
                </div>
            </div>
        </div>

        <!-- 右侧AI聊天浮窗 -->
        <div class="right-panel" id="aiChatPanel">
            <div class="ai-chat-panel" id="ai-chat-panel">
            <div class="panel-header" id="aiChatHeader">
                <div class="panel-title">
                    <i class="fas fa-robot"></i> AI Assistant
                </div>
                <div class="panel-controls">
                    <button class="panel-toggle" id="aiChatToggle" title="折叠/展开">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                    <button class="panel-close" id="aiChatClose" title="关闭" style="display: none;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="chat-content">
                <div class="chat-messages" id="chat-messages">
                    <!-- Chat messages will be added here -->
                </div>
                <div class="chat-input-container">
                    <input type="text" id="chat-input" placeholder="询问AI助手任何问题...">
                    <button id="send-btn" title="发送消息"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    </div>

    <!-- Hidden file input -->
    <input type="file" id="file-input" accept="image/*" multiple style="display: none;">

    <script>
        // 无限画布图像编辑器类
        class InfiniteCanvasEditor {
            constructor() {
                this.canvas = null;
                this.gridCanvas = null;
                this.canvasWrapper = null;
                this.container = null;

                // 视口状态
                this.viewport = {
                    x: 0,
                    y: 0,
                    zoom: 1,
                    minZoom: 0.1,
                    maxZoom: 10
                };

                // 交互状态
                this.isPanning = false;
                this.lastPanPoint = { x: 0, y: 0 };
                this.currentTool = 'select';

                // 历史记录
                this.history = {
                    undo: [],
                    redo: [],
                    maxSize: 50
                };

                // 性能优化相关
                this.resizeTimeout = null;
                this.renderTimeout = null;
                this.lastRenderTime = 0;

                this.init();
            }

            init() {
                this.initializeCanvas();
                this.initializeGrid();
                this.setupEventListeners();
                this.setupCanvasEvents();
                this.setupFileInput();
                this.updateViewport();
            }

            // 初始化Fabric.js画布
            initializeCanvas() {
                this.container = document.getElementById('infinite-canvas-container');
                this.canvasWrapper = document.getElementById('canvas-wrapper');

                if (!this.container || !this.canvasWrapper) {
                    console.error('Canvas container not found');
                    return;
                }

                // 获取容器尺寸
                const rect = this.container.getBoundingClientRect();

                // 创建Fabric.js画布，尺寸与容器一致
                this.canvas = new fabric.Canvas('infinite-canvas', {
                    width: rect.width,
                    height: rect.height,
                    backgroundColor: 'transparent',
                    selection: true,
                    preserveObjectStacking: true,
                    enableRetinaScaling: true,
                    allowTouchScrolling: true,
                    moveCursor: 'grab',
                    moveOnDrag: true
                });

                // 设置画布居中（基于实际容器尺寸）
                this.viewport.x = 0;
                this.viewport.y = 0;

                // 移除对象移动限制，允许在整个画布中自由移动
                this.canvas.on('object:moving', (e) => {
                    // 不限制对象移动范围，允许在整个无限画布中移动
                });

                console.log('Infinite canvas initialized');
            }

            // 初始化网格背景
            initializeGrid() {
                this.gridCanvas = document.getElementById('canvas-grid');
                if (!this.gridCanvas) return;

                const rect = this.container.getBoundingClientRect();
                this.gridCanvas.width = rect.width;
                this.gridCanvas.height = rect.height;

                this.drawGrid();
            }



            // 绘制网格背景
            drawGrid() {
                if (!this.gridCanvas) return;

                const ctx = this.gridCanvas.getContext('2d');
                const rect = this.container.getBoundingClientRect();

                ctx.clearRect(0, 0, rect.width, rect.height);
                ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)'; // 浅灰色
                ctx.lineWidth = 1;
                ctx.setLineDash([2, 2]); // 虚线样式

                const gridSize = 20 * this.viewport.zoom;
                const offsetX = (this.viewport.x * this.viewport.zoom) % gridSize;
                const offsetY = (this.viewport.y * this.viewport.zoom) % gridSize;

                // 绘制垂直线
                for (let x = offsetX; x < rect.width; x += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, rect.height);
                    ctx.stroke();
                }

                // 绘制水平线
                for (let y = offsetY; y < rect.height; y += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(rect.width, y);
                    ctx.stroke();
                }

                ctx.setLineDash([]); // 重置虚线样式
            }

            // 更新视口变换
            updateViewport() {
                if (!this.canvasWrapper) return;

                const transform = \`translate(\${this.viewport.x}px, \${this.viewport.y}px) scale(\${this.viewport.zoom})\`;
                this.canvasWrapper.style.transform = transform;

                this.drawGrid();
                this.updateZoomLevel();
            }

            // 更新缩放级别显示
            updateZoomLevel() {
                const zoomLevel = document.getElementById('zoom-level');
                if (zoomLevel) {
                    zoomLevel.textContent = Math.round(this.viewport.zoom * 100) + '%';
                }
            }

            // 设置画布事件监听
            setupCanvasEvents() {
                if (!this.container) return;

                // 图片拖拽功能
                this.setupDragAndDrop();

                // 鼠标滚轮缩放
                this.container.addEventListener('wheel', (e) => {
                    e.preventDefault();

                    const rect = this.container.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
                    this.zoomAt(mouseX, mouseY, zoomFactor);
                });

                // 鼠标拖拽平移
                this.container.addEventListener('mousedown', (e) => {
                    if (e.button === 1 || (e.button === 0 && e.altKey)) { // 中键或Alt+左键
                        e.preventDefault();
                        this.startPanning(e);
                    }
                });

                document.addEventListener('mousemove', (e) => {
                    if (this.isPanning) {
                        this.updatePanning(e);
                    }
                });

                document.addEventListener('mouseup', () => {
                    this.stopPanning();
                });

                // 窗口大小改变
                window.addEventListener('resize', () => {
                    this.handleResize();
                });
            }

            setupEventListeners() {
                // 工具选择
                document.querySelectorAll('.sidebar-tool').forEach(tool => {
                    tool.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const toolName = e.currentTarget.getAttribute('data-tool');
                        if (toolName && toolName !== 'toggle') {
                            this.selectTool(toolName);
                            console.log('Tool selected:', toolName);
                        }
                    });
                });

                // 画布控制按钮
                const zoomInBtn = document.getElementById('zoom-in-btn');
                const zoomOutBtn = document.getElementById('zoom-out-btn');
                const fitScreenBtn = document.getElementById('fit-screen-btn');

                if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoomIn());
                if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoomOut());
                if (fitScreenBtn) fitScreenBtn.addEventListener('click', () => this.fitToScreen());

                // 键盘快捷键
                document.addEventListener('keydown', (e) => {
                    // 删除选中对象 (Delete 或 Backspace)
                    if ((e.key === 'Delete' || e.key === 'Backspace') && this.canvas.getActiveObject()) {
                        e.preventDefault();
                        this.deleteSelectedObjects();
                    }
                    else if (e.ctrlKey || e.metaKey) {
                        switch(e.key) {
                            case 'z':
                                e.preventDefault();
                                if (e.shiftKey) {
                                    this.redo();
                                } else {
                                    this.undo();
                                }
                                break;
                            case 's':
                                e.preventDefault();
                                this.save();
                                break;
                            case '0':
                                e.preventDefault();
                                this.resetView();
                                break;
                        }
                    }

                    // 空格键平移模式
                    if (e.code === 'Space' && !e.repeat) {
                        e.preventDefault();
                        this.container.style.cursor = 'grab';
                    }
                });

                document.addEventListener('keyup', (e) => {
                    if (e.code === 'Space') {
                        this.container.style.cursor = 'default';
                    }
                });
            }

            // 拖拽上传功能
            setupDragAndDrop() {
                const dropZone = this.container;
                let dragCounter = 0;

                // 防止默认拖拽行为
                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    dropZone.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                });

                // 拖拽进入时的视觉反馈
                dropZone.addEventListener('dragenter', (e) => {
                    dragCounter++;
                    if (e.dataTransfer.types.includes('Files')) {
                        dropZone.classList.add('drag-over');
                        this.showDropOverlay();
                    }
                });

                dropZone.addEventListener('dragover', (e) => {
                    if (e.dataTransfer.types.includes('Files')) {
                        dropZone.classList.add('drag-over');
                    }
                });

                dropZone.addEventListener('dragleave', () => {
                    dragCounter--;
                    if (dragCounter === 0) {
                        dropZone.classList.remove('drag-over');
                        this.hideDropOverlay();
                    }
                });

                // 处理文件拖放
                dropZone.addEventListener('drop', (e) => {
                    dragCounter = 0;
                    dropZone.classList.remove('drag-over');
                    this.hideDropOverlay();

                    const files = Array.from(e.dataTransfer.files);
                    files.forEach(file => {
                        if (file.type.startsWith('image/')) {
                            this.addImageToCanvas(file);
                        }
                    });
                });
            }

            // 显示拖放提示覆盖层
            showDropOverlay() {
                if (!this.dropOverlay) {
                    this.dropOverlay = document.createElement('div');
                    this.dropOverlay.className = 'drop-overlay';
                    this.dropOverlay.innerHTML =
                        '<div class="drop-content">' +
                            '<i class="fas fa-cloud-upload-alt"></i>' +
                            '<h3>拖放图片到此处</h3>' +
                            '<p>支持 JPG、PNG、GIF 等格式</p>' +
                        '</div>';
                    this.container.appendChild(this.dropOverlay);
                }
                this.dropOverlay.style.display = 'flex';
            }

            // 隐藏拖放提示覆盖层
            hideDropOverlay() {
                if (this.dropOverlay) {
                    this.dropOverlay.style.display = 'none';
                }
            }

            // 缩放功能
            zoomAt(mouseX, mouseY, zoomFactor) {
                const newZoom = Math.max(this.viewport.minZoom,
                    Math.min(this.viewport.maxZoom, this.viewport.zoom * zoomFactor));

                if (newZoom === this.viewport.zoom) return;

                // 计算缩放中心点
                const zoomRatio = newZoom / this.viewport.zoom;
                this.viewport.x = mouseX - (mouseX - this.viewport.x) * zoomRatio;
                this.viewport.y = mouseY - (mouseY - this.viewport.y) * zoomRatio;
                this.viewport.zoom = newZoom;

                this.updateViewport();
            }

            zoomIn() {
                const rect = this.container.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                this.zoomAt(centerX, centerY, 1.2);
            }

            zoomOut() {
                const rect = this.container.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                this.zoomAt(centerX, centerY, 0.8);
            }

            // 平移功能
            startPanning(e) {
                this.isPanning = true;
                this.lastPanPoint = { x: e.clientX, y: e.clientY };
                this.container.classList.add('panning');
            }

            updatePanning(e) {
                if (!this.isPanning) return;

                const deltaX = e.clientX - this.lastPanPoint.x;
                const deltaY = e.clientY - this.lastPanPoint.y;

                this.viewport.x += deltaX;
                this.viewport.y += deltaY;

                this.lastPanPoint = { x: e.clientX, y: e.clientY };
                this.updateViewport();
            }

            stopPanning() {
                this.isPanning = false;
                this.container.classList.remove('panning');
            }

            // 视图控制
            resetView() {
                this.viewport.x = -1000;
                this.viewport.y = -1000;
                this.viewport.zoom = 1;
                this.updateViewport();
            }

            fitToScreen() {
                if (!this.canvas) return;

                const objects = this.canvas.getObjects();
                if (objects.length === 0) {
                    this.resetView();
                    return;
                }

                // 计算所有对象的边界框
                let minX = Infinity, minY = Infinity;
                let maxX = -Infinity, maxY = -Infinity;

                objects.forEach(obj => {
                    const bounds = obj.getBoundingRect();
                    minX = Math.min(minX, bounds.left);
                    minY = Math.min(minY, bounds.top);
                    maxX = Math.max(maxX, bounds.left + bounds.width);
                    maxY = Math.max(maxY, bounds.top + bounds.height);
                });

                const contentWidth = maxX - minX;
                const contentHeight = maxY - minY;
                const rect = this.container.getBoundingClientRect();

                const scaleX = (rect.width * 0.8) / contentWidth;
                const scaleY = (rect.height * 0.8) / contentHeight;
                const scale = Math.min(scaleX, scaleY);

                this.viewport.zoom = Math.max(this.viewport.minZoom,
                    Math.min(this.viewport.maxZoom, scale));

                this.viewport.x = rect.width / 2 - (minX + contentWidth / 2) * this.viewport.zoom;
                this.viewport.y = rect.height / 2 - (minY + contentHeight / 2) * this.viewport.zoom;

                this.updateViewport();
            }

            setupFileInput() {
                const fileInput = document.getElementById('file-input');
                if (fileInput) {
                    fileInput.addEventListener('change', (e) => {
                        this.handleFileSelect(e.target.files);
                    });
                }
            }

            // 文件处理
            openFileDialog() {
                const fileInput = document.getElementById('file-input');
                if (fileInput) fileInput.click();
            }

            handleFileSelect(files) {
                Array.from(files).forEach(file => {
                    if (file.type.startsWith('image/')) {
                        this.addImageToCanvas(file);
                    }
                });
            }

            // 添加图像到画布
            addImageToCanvas(file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    fabric.Image.fromURL(e.target.result, (img) => {
                        // 获取画布中心点
                        const canvasCenter = this.getCanvasCenter();

                        // 获取画布容器的尺寸
                        const containerRect = this.container.getBoundingClientRect();
                        const maxWidth = containerRect.width * 0.8; // 最大宽度为容器的80%
                        const maxHeight = containerRect.height * 0.8; // 最大高度为容器的80%

                        // 计算缩放比例，保持原始比例
                        let scaleX = 1;
                        let scaleY = 1;

                        if (img.width > maxWidth || img.height > maxHeight) {
                            const scaleRatio = Math.min(maxWidth / img.width, maxHeight / img.height);
                            scaleX = scaleRatio;
                            scaleY = scaleRatio;
                        }

                        // 设置图像属性
                        img.set({
                            left: canvasCenter.x - (img.width * scaleX) / 2,
                            top: canvasCenter.y - (img.height * scaleY) / 2,
                            scaleX: scaleX,
                            scaleY: scaleY,
                            selectable: true,
                            moveCursor: 'move',
                            hoverCursor: 'move'
                        });

                        this.canvas.add(img);
                        this.canvas.setActiveObject(img);
                        this.canvas.renderAll();
                        this.saveState();

                        console.log('Image added to canvas:', file.name,
                                  'Original size:', img.width, 'x', img.height,
                                  'Scale:', scaleX.toFixed(2));
                    }, {
                        crossOrigin: 'anonymous'
                    });
                };
                reader.readAsDataURL(file);
            }

            // 获取画布中心点（世界坐标）
            getCanvasCenter() {
                const rect = this.container.getBoundingClientRect();
                const centerX = (rect.width / 2 - this.viewport.x) / this.viewport.zoom;
                const centerY = (rect.height / 2 - this.viewport.y) / this.viewport.zoom;
                return { x: centerX, y: centerY };
            }

            // 工具选择
            selectTool(toolName) {
                console.log('Selecting tool:', toolName);
                this.currentTool = toolName;

                // 更新工具按钮状态
                document.querySelectorAll('.sidebar-tool').forEach(tool => {
                    tool.classList.remove('active');
                });
                const toolElement = document.querySelector('[data-tool="' + toolName + '"]');
                if (toolElement) {
                    toolElement.classList.add('active');
                    console.log('Tool button activated:', toolName);
                }

                // 更新画布模式
                this.updateCanvasMode(toolName);
            }

            updateCanvasMode(toolName) {
                console.log('Updating canvas mode for tool:', toolName);
                if (!this.canvas) {
                    console.log('Canvas not available');
                    return;
                }

                // 重置画布模式
                this.canvas.isDrawingMode = false;
                this.canvas.selection = false;
                this.canvas.defaultCursor = 'default';

                // 取消所有对象的选中状态
                this.canvas.discardActiveObject();
                this.canvas.renderAll();

                // 清除之前的事件监听器
                this.canvas.off('mouse:down');
                this.canvas.off('mouse:move');
                this.canvas.off('mouse:up');

                // 禁用画布拖拽（除了选择工具）
                if (toolName !== 'select') {
                    this.canvas.allowTouchScrolling = false;
                    // 禁用所有对象的可移动性
                    this.canvas.forEachObject((obj) => {
                        obj.set({
                            selectable: false,
                            evented: false
                        });
                    });
                } else {
                    this.canvas.allowTouchScrolling = true;
                    // 恢复对象的可选择性
                    this.canvas.forEachObject((obj) => {
                        obj.set({
                            selectable: true,
                            evented: true
                        });
                    });
                }

                switch(toolName) {
                    case 'select':
                        this.canvas.selection = true;
                        this.canvas.defaultCursor = 'default';
                        this.canvas.allowTouchScrolling = true;

                        // 启用框选功能的相关设置
                        this.canvas.selectionBorderColor = 'rgba(100, 149, 237, 0.8)';
                        this.canvas.selectionLineWidth = 2;
                        this.canvas.selectionColor = 'rgba(100, 149, 237, 0.3)';
                        this.canvas.selectionFullyContained = false; // 允许部分选择

                        // 恢复所有对象的可选择性和事件响应
                        this.canvas.forEachObject((obj) => {
                            obj.set({
                                selectable: true,
                                evented: true
                            });
                        });
                        this.canvas.renderAll();
                        console.log('Select tool activated - objects can be selected and moved, drag to select multiple');
                        break;
                    case 'brush':
                        this.canvas.isDrawingMode = true;
                        this.canvas.selection = false;
                        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
                        this.canvas.freeDrawingBrush.width = 5;
                        this.canvas.freeDrawingBrush.color = '#000000';
                        console.log('Brush tool activated - drawing mode');
                        break;
                    case 'eraser':
                        this.canvas.isDrawingMode = false;
                        this.canvas.selection = false;
                        this.canvas.defaultCursor = 'crosshair';
                        // 为擦除工具临时启用对象事件响应
                        this.canvas.forEachObject((obj) => {
                            obj.set({
                                selectable: false,
                                evented: true  // 保持事件响应以便点击删除
                            });
                        });
                        this.canvas.renderAll();
                        this.setupEraserTool();
                        console.log('Eraser tool activated - click to erase objects');
                        break;
                    case 'text':
                        this.canvas.selection = false;
                        this.canvas.defaultCursor = 'text';
                        this.setupTextTool();
                        console.log('Text tool activated - click to add text');
                        break;
                    case 'rectangle':
                        this.canvas.selection = false;
                        this.canvas.defaultCursor = 'crosshair';
                        this.setupShapeTool('rectangle');
                        console.log('Rectangle tool activated - drag to draw');
                        break;
                    case 'circle':
                        this.canvas.selection = false;
                        this.canvas.defaultCursor = 'crosshair';
                        this.setupShapeTool('circle');
                        console.log('Circle tool activated - drag to draw');
                        break;
                    case 'line':
                        this.canvas.selection = false;
                        this.canvas.defaultCursor = 'crosshair';
                        this.setupShapeTool('line');
                        console.log('Line tool activated - drag to draw');
                        break;
                    case 'arrow':
                        this.canvas.selection = false;
                        this.canvas.defaultCursor = 'crosshair';
                        this.setupShapeTool('arrow');
                        console.log('Arrow tool activated - drag to draw');
                        break;

                    case 'crop':
                        this.canvas.selection = false;
                        this.canvas.defaultCursor = 'crosshair';
                        this.setupCropTool();
                        console.log('Crop tool activated');
                        break;
                    default:
                        this.canvas.selection = true;
                        console.log('Unknown tool, defaulting to select mode:', toolName);
                }
            }

            // 设置文本工具
            setupTextTool() {
                // 移除之前的事件监听器
                if (this.textClickHandler) {
                    this.canvas.off('mouse:down', this.textClickHandler);
                }

                // 使用箭头函数保持this上下文
                this.textClickHandler = (e) => {
                    if (this.currentTool === 'text') {
                        // 阻止默认的对象选择行为
                        e.e.preventDefault();
                        console.log('Text tool clicked, canvas available:', !!this.canvas);
                        const pointer = this.canvas.getPointer(e.e);

                        // 直接在这里实现文本添加，避免this上下文问题
                        if (!this.canvas) {
                            console.error('Canvas not available for text tool');
                            addMessage('ai', '❌ 画布未初始化，无法添加文本');
                            return;
                        }

                        try {
                            const text = new fabric.IText('点击编辑文本', {
                                left: pointer.x,
                                top: pointer.y,
                                fontFamily: 'Arial',
                                fontSize: 20,
                                fill: '#000000',
                                selectable: true,
                                editable: true
                            });

                            this.canvas.add(text);
                            this.canvas.setActiveObject(text);

                            // 延迟进入编辑模式
                            setTimeout(() => {
                                if (text && text.enterEditing) {
                                    text.enterEditing();
                                }
                            }, 100);

                            this.saveState();
                            console.log('Text added successfully');
                            addMessage('ai', '📝 文本已添加，可以开始编辑');
                        } catch (error) {
                            console.error('Error adding text:', error);
                            addMessage('ai', '❌ 添加文本时出错');
                        }
                    }
                };

                this.canvas.on('mouse:down', this.textClickHandler);
            }

            // 添加文本
            addTextAtPosition(x, y) {
                console.log('Adding text at position:', x, y);
                console.log('Canvas available:', !!this.canvas);

                if (!this.canvas) {
                    console.error('Canvas not available for text tool');
                    addMessage('ai', '❌ 画布未初始化，无法添加文本');
                    return;
                }

                try {
                    const text = new fabric.IText('点击编辑文本', {
                        left: x,
                        top: y,
                        fontFamily: 'Arial',
                        fontSize: 20,
                        fill: '#000000',
                        selectable: true,
                        editable: true
                    });

                    this.canvas.add(text);
                    this.canvas.setActiveObject(text);

                    // 延迟进入编辑模式，确保对象已添加到画布
                    setTimeout(() => {
                        if (text && text.enterEditing) {
                            text.enterEditing();
                        }
                    }, 100);

                    this.saveState();
                    console.log('Text added successfully');
                    addMessage('ai', '📝 文本已添加，可以开始编辑');
                } catch (error) {
                    console.error('Error adding text:', error);
                    addMessage('ai', '❌ 添加文本时出错');
                }
            }

            // 设置形状工具
            setupShapeTool(shapeType) {
                this.canvas.off('mouse:down', this.shapeStartHandler);
                this.canvas.off('mouse:move', this.shapeMoveHandler);
                this.canvas.off('mouse:up', this.shapeEndHandler);

                let isDrawing = false;
                let startPoint = null;
                let shape = null;

                this.shapeStartHandler = (e) => {
                    if (this.currentTool === shapeType) {
                        // 阻止默认的对象选择行为
                        e.e.preventDefault();

                        isDrawing = true;
                        startPoint = this.canvas.getPointer(e.e);

                        if (shapeType === 'rectangle') {
                            shape = new fabric.Rect({
                                left: startPoint.x,
                                top: startPoint.y,
                                width: 0,
                                height: 0,
                                fill: 'transparent',
                                stroke: '#000000',
                                strokeWidth: 2
                            });
                        } else if (shapeType === 'circle') {
                            shape = new fabric.Circle({
                                left: startPoint.x,
                                top: startPoint.y,
                                radius: 0,
                                fill: 'transparent',
                                stroke: '#000000',
                                strokeWidth: 2
                            });
                        } else if (shapeType === 'line') {
                            shape = new fabric.Line([startPoint.x, startPoint.y, startPoint.x, startPoint.y], {
                                stroke: '#000000',
                                strokeWidth: 2
                            });
                        } else if (shapeType === 'arrow') {
                            // 创建简单的箭头线条
                            shape = new fabric.Line([startPoint.x, startPoint.y, startPoint.x, startPoint.y], {
                                stroke: '#000000',
                                strokeWidth: 2,
                                strokeLineCap: 'round'
                            });
                        }

                        this.canvas.add(shape);
                    }
                };

                this.shapeMoveHandler = (e) => {
                    if (!isDrawing || !shape) return;

                    const pointer = this.canvas.getPointer(e.e);

                    if (shapeType === 'rectangle') {
                        const width = Math.abs(pointer.x - startPoint.x);
                        const height = Math.abs(pointer.y - startPoint.y);
                        shape.set({
                            width: width,
                            height: height,
                            left: Math.min(startPoint.x, pointer.x),
                            top: Math.min(startPoint.y, pointer.y)
                        });
                    } else if (shapeType === 'circle') {
                        const radius = Math.sqrt(
                            Math.pow(pointer.x - startPoint.x, 2) +
                            Math.pow(pointer.y - startPoint.y, 2)
                        ) / 2;
                        shape.set({
                            radius: radius,
                            left: startPoint.x - radius,
                            top: startPoint.y - radius
                        });
                    } else if (shapeType === 'line') {
                        shape.set({
                            x2: pointer.x,
                            y2: pointer.y
                        });
                    } else if (shapeType === 'arrow') {
                        // 更新箭头线条
                        shape.set({
                            x2: pointer.x,
                            y2: pointer.y
                        });
                    }

                    this.canvas.renderAll();
                };

                this.shapeEndHandler = (e) => {
                    if (isDrawing && shape) {
                        isDrawing = false;

                        // 如果是箭头，添加箭头头部
                        if (shapeType === 'arrow') {
                            const pointer = e.pointer;
                            const angle = Math.atan2(pointer.y - startPoint.y, pointer.x - startPoint.x);
                            const headLength = 15;
                            const headAngle = Math.PI / 6;

                            // 创建箭头头部
                            const arrowHead1 = new fabric.Line([
                                pointer.x - headLength * Math.cos(angle - headAngle),
                                pointer.y - headLength * Math.sin(angle - headAngle),
                                pointer.x,
                                pointer.y
                            ], {
                                stroke: '#000000',
                                strokeWidth: 2,
                                strokeLineCap: 'round'
                            });

                            const arrowHead2 = new fabric.Line([
                                pointer.x - headLength * Math.cos(angle + headAngle),
                                pointer.y - headLength * Math.sin(angle + headAngle),
                                pointer.x,
                                pointer.y
                            ], {
                                stroke: '#000000',
                                strokeWidth: 2,
                                strokeLineCap: 'round'
                            });

                            // 将箭头组合成一个组
                            const arrowGroup = new fabric.Group([shape, arrowHead1, arrowHead2]);
                            this.canvas.remove(shape);
                            this.canvas.add(arrowGroup);
                        }

                        this.saveState();
                    }
                };

                this.canvas.on('mouse:down', this.shapeStartHandler);
                this.canvas.on('mouse:move', this.shapeMoveHandler);
                this.canvas.on('mouse:up', this.shapeEndHandler);
            }

            // AI增强面板


            // 滤镜效果
            showFiltersPanel() {
                const activeObject = this.canvas.getActiveObject();
                if (!activeObject) {
                    addMessage('ai', '⚠️ 请先选择一个对象来应用滤镜');
                    return;
                }

                addMessage('ai', '🎨 可用滤镜效果:');
                addMessage('ai', '1️⃣ 模糊效果');
                addMessage('ai', '2️⃣ 亮度调整');
                addMessage('ai', '3️⃣ 对比度调整');
                addMessage('ai', '4️⃣ 饱和度调整');

                // 应用示例滤镜
                this.applyFilter(activeObject, 'brightness', 0.1);
            }

            // 应用滤镜
            applyFilter(obj, filterType, value) {
                if (!obj || obj.type !== 'image') return;

                let filter;
                switch(filterType) {
                    case 'brightness':
                        filter = new fabric.Image.filters.Brightness({ brightness: value });
                        break;
                    case 'contrast':
                        filter = new fabric.Image.filters.Contrast({ contrast: value });
                        break;
                    case 'blur':
                        filter = new fabric.Image.filters.Blur({ blur: value });
                        break;
                }

                if (filter) {
                    obj.filters = obj.filters || [];
                    obj.filters.push(filter);
                    obj.applyFilters();
                    this.canvas.renderAll();
                    this.saveState();
                    addMessage('ai', '✅ 已应用' + filterType + '滤镜');
                }
            }

            // 变换模式
            enableTransformMode() {
                const activeObject = this.canvas.getActiveObject();
                if (!activeObject) {
                    addMessage('ai', '⚠️ 请先选择一个对象进行变换');
                    return;
                }

                addMessage('ai', '🔄 变换模式已启用');
                addMessage('ai', '📐 可用操作: 旋转、缩放、倾斜');

                // 启用所有变换控件
                activeObject.set({
                    hasControls: true,
                    hasBorders: true,
                    hasRotatingPoint: true
                });

                this.canvas.renderAll();
            }

            // 设置擦除工具
            setupEraserTool() {
                this.canvas.off('mouse:down', this.eraserClickHandler);
                this.eraserClickHandler = (e) => {
                    if (this.currentTool === 'eraser' && e.target) {
                        // 只擦除用户绘制的对象，不擦除图片
                        if (e.target.type === 'path' || e.target.type === 'i-text' ||
                            e.target.type === 'rect' || e.target.type === 'circle' ||
                            e.target.type === 'line' || e.target.type === 'group') {
                            this.canvas.remove(e.target);
                            this.canvas.renderAll();
                            this.saveState();
                            addMessage('ai', '🗑️ 已擦除对象');
                        }
                    }
                };
                this.canvas.on('mouse:down', this.eraserClickHandler);
            }

            // 设置裁剪工具
            setupCropTool() {
                addMessage('ai', '✂️ 裁剪工具已启用');
                addMessage('ai', '📏 选择一个图片对象进行裁剪');

                // 检查是否有选中的图片对象
                const activeObject = this.canvas.getActiveObject();
                if (activeObject && activeObject.type === 'image') {
                    this.startCropping(activeObject);
                } else {
                    addMessage('ai', '⚠️ 请先选择一个图片对象');
                    // 切换回选择工具
                    this.selectTool('select');
                }
            }

            // 开始裁剪
            startCropping(imageObj) {
                addMessage('ai', '🎯 裁剪模式已启用');
                addMessage('ai', '📐 调整图片的选择框来定义裁剪区域');
                addMessage('ai', '✅ 完成后点击其他工具来应用裁剪');

                // 确保图片可以被选择和调整
                imageObj.set({
                    selectable: true,
                    evented: true,
                    hasControls: true,
                    hasBorders: true
                });

                this.canvas.setActiveObject(imageObj);
                this.canvas.renderAll();
            }

            // 删除选中的对象
            deleteSelectedObjects() {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject) {
                    if (activeObject.type === 'activeSelection') {
                        // 删除多个选中的对象
                        const objects = activeObject.getObjects();
                        objects.forEach(obj => {
                            this.canvas.remove(obj);
                        });
                        this.canvas.discardActiveObject();
                    } else {
                        // 删除单个对象
                        this.canvas.remove(activeObject);
                    }
                    this.canvas.renderAll();
                    this.saveState();
                    addMessage('ai', '🗑️ 已删除选中的对象');
                    console.log('Deleted selected objects');
                }
            }

            // 历史记录管理
            saveState() {
                if (!this.canvas) return;

                const state = JSON.stringify(this.canvas.toJSON());
                this.history.undo.push(state);

                // 限制历史记录大小
                if (this.history.undo.length > this.history.maxSize) {
                    this.history.undo.shift();
                }

                // 清空重做历史
                this.history.redo = [];
            }

            undo() {
                if (this.history.undo.length <= 1) return;

                const currentState = this.history.undo.pop();
                this.history.redo.push(currentState);

                const previousState = this.history.undo[this.history.undo.length - 1];
                this.canvas.loadFromJSON(previousState, () => {
                    this.canvas.renderAll();
                });
            }

            redo() {
                if (this.history.redo.length === 0) return;

                const nextState = this.history.redo.pop();
                this.history.undo.push(nextState);

                this.canvas.loadFromJSON(nextState, () => {
                    this.canvas.renderAll();
                });
            }

            // 项目管理
            newProject() {
                if (this.canvas) {
                    this.canvas.clear();
                    this.history.undo = [];
                    this.history.redo = [];
                    this.saveState();
                    this.resetView();
                }
            }

            save() {
                if (!this.canvas) return;

                try {
                    const projectData = {
                        canvas: this.canvas.toJSON(),
                        viewport: this.viewport,
                        timestamp: Date.now()
                    };

                    localStorage.setItem('infinite-canvas-project', JSON.stringify(projectData));
                    console.log('Project saved successfully');
                } catch (error) {
                    console.error('Failed to save project:', error);
                }
            }

            openProject() {
                try {
                    const projectData = localStorage.getItem('infinite-canvas-project');
                    if (projectData) {
                        const data = JSON.parse(projectData);

                        this.canvas.loadFromJSON(data.canvas, () => {
                            this.canvas.renderAll();
                            if (data.viewport) {
                                this.viewport = { ...this.viewport, ...data.viewport };
                                this.updateViewport();
                            }
                            this.saveState();
                        });

                        console.log('Project loaded successfully');
                    }
                } catch (error) {
                    console.error('Failed to load project:', error);
                }
            }

            export() {
                if (!this.canvas) return;

                try {
                    const dataURL = this.canvas.toDataURL({
                        format: 'png',
                        quality: 1.0,
                        multiplier: 2 // 高分辨率导出
                    });

                    const link = document.createElement('a');
                    link.download = \`infinite-canvas-\${Date.now()}.png\`;
                    link.href = dataURL;
                    link.click();

                    console.log('Canvas exported successfully');
                } catch (error) {
                    console.error('Failed to export canvas:', error);
                }
            }

            // 窗口大小改变处理（防抖优化）
            handleResize() {
                if (!this.gridCanvas || !this.container) return;

                // 防抖处理，避免频繁重绘
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    const rect = this.container.getBoundingClientRect();
                    this.gridCanvas.width = rect.width;
                    this.gridCanvas.height = rect.height;

                    // 更新画布尺寸，确保upper-canvas与容器一致
                    if (this.canvas) {
                        this.canvas.setDimensions({
                            width: rect.width,
                            height: rect.height
                        });

                        // 设置画布的实际绘制区域为更大的虚拟空间
                        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
                    }

                    this.drawGrid();
                }, 100);
            }

            // 性能优化：虚拟化渲染
            optimizeRendering() {
                if (!this.canvas) return;

                // 启用对象缓存
                this.canvas.getObjects().forEach(obj => {
                    obj.set({
                        objectCaching: true,
                        statefullCache: true
                    });
                });

                // 优化渲染性能
                this.canvas.renderOnAddRemove = false;
                this.canvas.skipTargetFind = false;

                // 批量渲染
                this.canvas.requestRenderAll();
            }

            // 事件节流
            throttle(func, limit) {
                let inThrottle;
                return function() {
                    const args = arguments;
                    const context = this;
                    if (!inThrottle) {
                        func.apply(context, args);
                        inThrottle = true;
                        setTimeout(() => inThrottle = false, limit);
                    }
                }
            }

            renderImage(imageData) {
                const imageItem = document.createElement('div');
                imageItem.className = 'image-item';
                imageItem.dataset.imageId = imageData.id;

                const img = document.createElement('img');
                img.src = imageData.src;
                img.alt = imageData.file.name;

                imageItem.appendChild(img);

                // Single click to select
                imageItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleImageSelection(imageData.id);
                });

                // Double click to edit
                imageItem.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    this.openImageEditor(imageData);
                });

                this.canvasContainer.appendChild(imageItem);
            }

            toggleImageSelection(imageId) {
                const imageData = this.images.find(img => img.id === imageId);
                const imageElement = document.querySelector(\`[data-image-id="\${imageId}"]\`);

                if (imageData.selected) {
                    imageData.selected = false;
                    imageElement.classList.remove('selected');
                    this.selectedImages = this.selectedImages.filter(id => id !== imageId);
                } else {
                    imageData.selected = true;
                    imageElement.classList.add('selected');
                    this.selectedImages.push(imageId);
                }
            }



            openImageEditor(imageData) {
                this.currentEditingImage = imageData;
                this.createEditingOverlay(imageData);
            }

            createEditingOverlay(imageData) {
                // Remove existing overlay
                if (this.editingOverlay) {
                    this.editingOverlay.remove();
                }

                // Create overlay
                this.editingOverlay = document.createElement('div');
                this.editingOverlay.style.cssText = \`
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                \`;

                // Create canvas container
                const canvasContainer = document.createElement('div');
                canvasContainer.style.cssText = \`
                    position: relative;
                    background: #2a2a2a;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                \`;

                // Create canvas element
                const canvasElement = document.createElement('canvas');
                canvasElement.id = 'editing-canvas';
                canvasContainer.appendChild(canvasElement);

                // Create close button
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                closeBtn.style.cssText =
                    'position: absolute;' +
                    'top: 10px;' +
                    'right: 10px;' +
                    'background: var(--error-color);' +
                    'color: white;' +
                    'border: none;' +
                    'width: 30px;' +
                    'height: 30px;' +
                    'border-radius: 50%;' +
                    'cursor: pointer;' +
                    'font-size: 14px;' +
                    'display: flex;' +
                    'align-items: center;' +
                    'justify-content: center;';
                closeBtn.addEventListener('click', () => this.closeImageEditor());
                canvasContainer.appendChild(closeBtn);

                this.editingOverlay.appendChild(canvasContainer);
                document.body.appendChild(this.editingOverlay);

                // Initialize Fabric.js canvas
                this.editingCanvas = new fabric.Canvas('editing-canvas');

                // Load the image with better error handling
                console.log('Loading image for editing:', {
                    hasImageData: !!imageData,
                    hasSrc: !!imageData.src,
                    srcType: imageData.src ? (imageData.src.startsWith('data:') ? 'base64' : 'url') : 'none',
                    srcLength: imageData.src ? imageData.src.length : 0
                });

                if (!imageData.src) {
                    console.error('No image source data available');
                    const errorMsg = document.createElement('div');
                    errorMsg.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 18px; text-align: center;';
                    errorMsg.innerHTML = 'No image data available<br><small>Please try uploading the image again</small>';
                    canvasContainer.appendChild(errorMsg);
                    return;
                }

                fabric.Image.fromURL(imageData.src, (img) => {
                    console.log('Fabric.js image load result:', {
                        success: !!img,
                        width: img ? img.width : 'N/A',
                        height: img ? img.height : 'N/A'
                    });

                    if (!img) {
                        console.error('Failed to load image with Fabric.js, trying fallback method:', imageData.src.substring(0, 100) + '...');

                        // Fallback: Create HTML img element and display it directly
                        const fallbackImg = document.createElement('img');
                        fallbackImg.src = imageData.src;
                        fallbackImg.style.cssText = 'max-width: 90%; max-height: 90%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';

                        fallbackImg.onload = () => {
                            console.log('Fallback image loaded successfully');
                            canvasContainer.appendChild(fallbackImg);

                            // Add a note about limited editing capabilities
                            const note = document.createElement('div');
                            note.style.cssText = 'position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); color: white; background: rgba(0,0,0,0.7); padding: 8px 16px; border-radius: 4px; font-size: 12px;';
                            note.innerHTML = 'Image displayed in preview mode - editing tools may be limited';
                            canvasContainer.appendChild(note);
                        };

                        fallbackImg.onerror = () => {
                            console.error('Fallback image also failed to load');
                            const errorMsg = document.createElement('div');
                            errorMsg.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 18px; text-align: center;';
                            errorMsg.innerHTML = 'Failed to load image<br><small>The image data may be corrupted</small>';
                            canvasContainer.appendChild(errorMsg);
                        };

                        return;
                    }

                    // Scale image to fit available space
                    const maxWidth = window.innerWidth - 200;
                    const maxHeight = window.innerHeight - 150;
                    const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 0.8);

                    const scaledWidth = img.width * scale;
                    const scaledHeight = img.height * scale;

                    // Set canvas size to match scaled image
                    this.editingCanvas.setWidth(scaledWidth);
                    this.editingCanvas.setHeight(scaledHeight);

                    // Scale and position the image
                    img.set({
                        left: 0,
                        top: 0,
                        scaleX: scale,
                        scaleY: scale,
                        selectable: false,
                        evented: false,
                        hoverCursor: 'default',
                        moveCursor: 'default'
                    });

                    this.editingCanvas.add(img);
                    this.editingCanvas.sendToBack(img);
                    this.editingCanvas.renderAll();

                    // Load existing annotations if any
                    if (imageData.annotations && imageData.annotations.length > 0) {
                        this.loadAnnotations(imageData);
                    }

                    // Setup canvas events for editing
                    this.setupCanvasEventsForEditing();

                    // Initialize history tracking
                    this.initializeCanvasHistory();

                    console.log('Editing canvas initialized:', scaledWidth + 'x' + scaledHeight);
                }, {
                    crossOrigin: 'anonymous'
                });
            }

            initializeCanvasHistory() {
                if (!this.editingCanvas) return;

                // Initialize history arrays
                this.editingCanvas._historyUndo = [];
                this.editingCanvas._historyRedo = [];
                this.editingCanvas._historyStep = 0;

                // Save initial state
                this.editingCanvas._historyUndo.push(JSON.stringify(this.editingCanvas.toJSON()));

                // Track canvas changes for undo/redo
                this.editingCanvas.on('path:created', () => this.saveCanvasState());
                this.editingCanvas.on('object:added', () => this.saveCanvasState());
                this.editingCanvas.on('object:removed', () => this.saveCanvasState());
                this.editingCanvas.on('object:modified', () => this.saveCanvasState());
            }

            saveCanvasState() {
                if (!this.editingCanvas) return;

                // Limit history size to prevent memory issues
                const maxHistorySize = 50;

                if (this.editingCanvas._historyUndo.length >= maxHistorySize) {
                    this.editingCanvas._historyUndo.shift();
                }

                // Clear redo history when new action is performed
                this.editingCanvas._historyRedo = [];

                // Save current state
                this.editingCanvas._historyUndo.push(JSON.stringify(this.editingCanvas.toJSON()));
            }

            updateCanvasModeForTool(toolName) {
                if (!this.editingCanvas) return;

                // Reset canvas modes
                this.editingCanvas.isDrawingMode = false;
                this.editingCanvas.selection = true;

                switch(toolName) {
                    case 'select':
                        this.editingCanvas.selection = true;
                        break;
                    case 'brush':
                        this.editingCanvas.isDrawingMode = true;
                        this.editingCanvas.freeDrawingBrush.width = 5;
                        this.editingCanvas.freeDrawingBrush.color = '#ff0000';
                        break;
                    case 'eraser':
                        this.editingCanvas.isDrawingMode = true;
                        this.editingCanvas.freeDrawingBrush.width = 10;
                        this.editingCanvas.freeDrawingBrush.color = 'rgba(0,0,0,0)';
                        break;
                    case 'text':
                        this.addText();
                        break;
                    case 'rectangle':
                        this.addRectangle();
                        break;
                    case 'circle':
                        this.addCircle();
                        break;
                    case 'ai-enhance':
                        this.aiEnhanceImage();
                        break;
                }
            }

            // AI增强功能 - 连接后端API
            async aiEnhanceImage() {
                if (!this.currentEditingImage) {
                    addMessage('ai', '请先选择一张图片进行AI增强');
                    return;
                }

                try {
                    addMessage('ai', '🤖 正在分析图像...');

                    // 先分析图像
                    const analysisResponse = await fetch('/api/ai/image/analyze', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            imageData: this.currentEditingImage.src
                        })
                    });

                    const analysisResult = await analysisResponse.json();

                    if (analysisResult.success) {
                        const analysis = analysisResult.data.analysis;
                        addMessage('ai', \`📊 图像分析完成：\${analysis.description}\`);

                        // 显示建议
                        analysis.suggestions.forEach((suggestion, index) => {
                            setTimeout(() => {
                                addMessage('ai', \`💡 建议 \${index + 1}: \${suggestion}\`);
                            }, (index + 1) * 500);
                        });

                        // 执行AI增强
                        setTimeout(async () => {
                            addMessage('ai', '🎨 正在应用AI增强...');

                            const editResponse = await fetch('/api/ai/image/edit', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    imageData: this.currentEditingImage.src,
                                    instruction: 'Enhance image quality, improve colors and contrast, apply professional enhancements',
                                    model: 'gemini-2.5-flash-image-preview'
                                })
                            });

                            const editResult = await editResponse.json();

                            if (editResult.success) {
                                addMessage('ai', '✨ AI增强完成！');
                                editResult.data.changes.forEach((change, index) => {
                                    setTimeout(() => {
                                        addMessage('ai', \`✅ \${change}\`);
                                    }, (index + 1) * 300);
                                });
                            } else {
                                const errorMsg = editResult.error || 'AI增强失败，请稍后重试';
                                if (errorMsg.includes('Vertex AI is not configured')) {
                                    addMessage('ai', '❌ Vertex AI 未配置。请设置 GOOGLE_CLOUD_PROJECT 和 GOOGLE_SERVICE_ACCOUNT_KEY 环境变量。');
                                } else {
                                    addMessage('ai', '❌ ' + errorMsg);
                                }
                            }
                        }, 3000);
                    } else {
                        addMessage('ai', '❌ 图像分析失败: ' + analysisResult.error);
                    }
                } catch (error) {
                    console.error('AI enhance error:', error);
                    addMessage('ai', '❌ AI增强过程中出现错误');
                }
            }

            setupCanvasEventsForEditing() {
                if (!this.editingCanvas) return;

                this.editingCanvas.on('mouse:down', (e) => {
                    if (this.currentTool === 'text' && !e.target) {
                        this.addTextAtPosition(e.pointer.x, e.pointer.y);
                    }
                });
            }

            addText() {
                const text = new fabric.IText('Click to edit text', {
                    left: 100,
                    top: 100,
                    fontFamily: 'Arial',
                    fontSize: 20,
                    fill: '#ffffff'
                });
                this.editingCanvas.add(text);
                this.editingCanvas.setActiveObject(text);
                text.enterEditing();
            }

            addTextAtPosition(x, y) {
                const text = new fabric.IText('Click to edit text', {
                    left: x,
                    top: y,
                    fontFamily: 'Arial',
                    fontSize: 20,
                    fill: '#ffffff'
                });
                this.editingCanvas.add(text);
                this.editingCanvas.setActiveObject(text);
                text.enterEditing();
            }

            addRectangle() {
                const rect = new fabric.Rect({
                    left: 100,
                    top: 100,
                    width: 100,
                    height: 60,
                    fill: 'transparent',
                    stroke: '#ff0000',
                    strokeWidth: 2
                });
                this.editingCanvas.add(rect);
                this.editingCanvas.setActiveObject(rect);
            }

            addCircle() {
                const circle = new fabric.Circle({
                    left: 100,
                    top: 100,
                    radius: 50,
                    fill: 'transparent',
                    stroke: '#ff0000',
                    strokeWidth: 2
                });
                this.editingCanvas.add(circle);
                this.editingCanvas.setActiveObject(circle);
            }

            closeImageEditor() {
                if (this.editingOverlay) {
                    this.editingOverlay.remove();
                    this.editingOverlay = null;
                }
                this.editingCanvas = null;
                this.currentEditingImage = null;
            }

            saveAnnotations(imageData) {
                if (!this.editingCanvas || !imageData) return;

                // Save canvas state as annotations
                imageData.annotations = this.editingCanvas.toJSON();
                console.log('Annotations saved for image:', imageData.file.name);
            }

            loadAnnotations(imageData) {
                if (!this.editingCanvas || !imageData.annotations) return;

                this.editingCanvas.loadFromJSON(imageData.annotations, () => {
                    this.editingCanvas.renderAll();
                    console.log('Annotations loaded for image:', imageData.file.name);
                });
            }

            getSelectedImages() {
                return this.images.filter(img => img.selected);
            }

            undo() {
                if (this.editingCanvas && this.editingCanvas._historyUndo && this.editingCanvas._historyUndo.length > 1) {
                    const currentState = this.editingCanvas._historyUndo.pop();
                    if (!this.editingCanvas._historyRedo) {
                        this.editingCanvas._historyRedo = [];
                    }
                    this.editingCanvas._historyRedo.push(currentState);

                    const previousState = this.editingCanvas._historyUndo[this.editingCanvas._historyUndo.length - 1];
                    this.editingCanvas.loadFromJSON(previousState, () => {
                        this.editingCanvas.renderAll();
                    });
                }
            }

            redo() {
                if (this.editingCanvas && this.editingCanvas._historyRedo && this.editingCanvas._historyRedo.length > 0) {
                    const state = this.editingCanvas._historyRedo.pop();
                    this.editingCanvas._historyUndo.push(state);
                    this.editingCanvas.loadFromJSON(state, () => {
                        this.editingCanvas.renderAll();
                    });
                }
            }

            save() {
                if (this.currentEditingImage) {
                    this.saveAnnotations(this.currentEditingImage);
                    addMessage('ai', 'Annotations saved for current image.');
                } else if (this.images.length > 0) {
                    try {
                        const saveData = {
                            images: this.images,
                            timestamp: new Date().toISOString()
                        };
                        localStorage.setItem('ai-image-editor-save', JSON.stringify(saveData));
                        addMessage('ai', \`Saved \${this.images.length} images with annotations to browser storage.\`);
                    } catch (error) {
                        addMessage('ai', 'Failed to save: ' + error.message);
                    }
                } else {
                    addMessage('ai', 'No images to save. Please upload some images first.');
                }
            }

            export() {
                if (this.currentEditingImage && this.editingCanvas) {
                    const dataURL = this.editingCanvas.toDataURL({
                        format: 'png',
                        quality: 1.0
                    });

                    const link = document.createElement('a');
                    link.download = \`edited-\${this.currentEditingImage.file?.name || 'image'}.png\`;
                    link.href = dataURL;
                    link.click();

                    addMessage('ai', 'Exported current edited image.');
                } else if (this.getSelectedImages().length > 0) {
                    const selectedImages = this.getSelectedImages();
                    selectedImages.forEach((imageData, index) => {
                        const link = document.createElement('a');
                        link.download = \`image-\${index + 1}-\${imageData.file?.name || 'export'}.png\`;
                        link.href = imageData.src;
                        link.click();
                    });

                    addMessage('ai', 'Exported ' + selectedImages.length + ' selected images.');
                } else {
                    addMessage('ai', 'Please select images to export or open an image for editing.');
                }
            }
        }

        // 初始化无限画布编辑器
        let infiniteEditor = null;

        // DOM加载完成后初始化
        document.addEventListener('DOMContentLoaded', () => {
            infiniteEditor = new InfiniteCanvasEditor();
            setupHeaderButtons();
            setupFloatingPanels();
            setupChatFunctionality();

            // 设置默认工具
            infiniteEditor.selectTool('select');

            // 设置画布事件监听
            if (infiniteEditor.canvas) {
                infiniteEditor.canvas.on('path:created', () => infiniteEditor.saveState());
                infiniteEditor.canvas.on('object:added', () => infiniteEditor.saveState());
                infiniteEditor.canvas.on('object:removed', () => infiniteEditor.saveState());
                infiniteEditor.canvas.on('object:modified', () => infiniteEditor.saveState());
            }

            console.log('Infinite Canvas Editor initialized successfully');

            // 确保聊天面板可见并添加欢迎消息
            setTimeout(() => {
                ensureChatPanelVisible();
                addMessage('ai', '🎨 无限画布AI图像编辑器已就绪！');
                addMessage('ai', '💡 你可以：');
                addMessage('ai', '📤 上传图片到无限画布进行编辑');
                addMessage('ai', '💬 与AI助手对话获取帮助');
                addMessage('ai', '✨ 使用AI增强工具优化图片');
                addMessage('ai', '🖱️ 使用鼠标滚轮缩放，拖拽平移画布');
                addMessage('ai', '⌨️ 按空格键进入平移模式，Ctrl+0重置视图');
            }, 500);
        });

        // Header button functionality
        function setupHeaderButtons() {
            const undoBtn = document.getElementById('undo-btn');
            const redoBtn = document.getElementById('redo-btn');
            const saveBtn = document.getElementById('save-btn');
            const exportBtn = document.getElementById('export-btn');

            if (undoBtn) {
                undoBtn.addEventListener('click', () => {
                    if (infiniteEditor) infiniteEditor.undo();
                });
            }

            if (redoBtn) {
                redoBtn.addEventListener('click', () => {
                    if (infiniteEditor) infiniteEditor.redo();
                });
            }

            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    if (infiniteEditor) infiniteEditor.save();
                });
            }

            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    if (infiniteEditor) infiniteEditor.export();
                });
            }
        }

        // 浮窗功能
        function setupFloatingPanels() {
            setupToolsPanel();
            setupAIChatPanel();
        }

        // 工具栏浮窗功能
        function setupToolsPanel() {
            const toolsPanel = document.getElementById('toolsPanel') || document.querySelector('.left-sidebar');
            if (toolsPanel) {
                makePanelDraggable(toolsPanel);
            }
        }

        // AI聊天浮窗功能
        function setupAIChatPanel() {
            const aiChatPanel = document.getElementById('aiChatPanel') || document.getElementById('right-panel');
            const aiChatToggle = document.getElementById('aiChatToggle') || document.getElementById('chat-panel-toggle');
            const aiChatHeader = document.getElementById('aiChatHeader') || aiChatPanel?.querySelector('.panel-header');

            if (!aiChatPanel) return;

            // 折叠/展开功能
            if (aiChatToggle) {
                aiChatToggle.addEventListener('click', () => {
                    aiChatPanel.classList.toggle('collapsed');
                    const icon = aiChatToggle.querySelector('i');
                    if (aiChatPanel.classList.contains('collapsed')) {
                        icon.className = 'fas fa-chevron-down';
                    } else {
                        icon.className = 'fas fa-chevron-up';
                    }
                });
            }

            // 添加拖拽功能
            if (aiChatHeader) {
                makePanelDraggable(aiChatPanel, aiChatHeader);
            } else {
                makePanelDraggable(aiChatPanel);
            }
        }

        // 工具栏折叠功能
        function toggleToolsPanel() {
            const toolsPanel = document.getElementById('toolsPanel') || document.querySelector('.left-sidebar');
            if (toolsPanel) {
                toolsPanel.classList.toggle('collapsed');
            }
        }

        function makePanelDraggable(panel) {
            if (!panel) return;

            let isDragging = false;
            let startX, startY, startLeft, startTop;

            const header = panel.querySelector('.panel-header') || panel;

            header.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('panel-toggle')) return;

                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startLeft = parseInt(window.getComputedStyle(panel).left, 10);
                startTop = parseInt(window.getComputedStyle(panel).top, 10);

                panel.style.cursor = 'grabbing';
                document.body.style.userSelect = 'none';
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                const newLeft = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, startLeft + deltaX));
                const newTop = Math.max(60, Math.min(window.innerHeight - panel.offsetHeight, startTop + deltaY));

                panel.style.left = newLeft + 'px';
                panel.style.top = newTop + 'px';
                panel.style.right = 'auto';
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    panel.style.cursor = '';
                    document.body.style.userSelect = '';
                }
            });
        }

        // AI聊天功能
        function setupChatFunctionality() {
            const chatInput = document.getElementById('chat-input');
            const sendBtn = document.getElementById('send-btn');

            // 发送聊天消息或处理选中对象
            async function sendMessage() {
                const message = chatInput.value.trim();
                if (!message) return;

                // 确保聊天面板可见
                ensureChatPanelVisible();

                // 检查画布是否有选中对象
                const activeObject = infiniteEditor.canvas.getActiveObject();

                if (activeObject) {
                    // 有选中对象，进行AI图像处理
                    await processSelectedObjectWithAI(activeObject, message);
                } else {
                    // 没有选中对象，进行普通聊天
                    await sendChatMessage(message);
                }

                chatInput.value = '';
            }

            // 普通聊天消息
            async function sendChatMessage(message) {
                addMessage('user', message);

                try {
                    addMessage('ai', '🤔 正在思考...');

                    const response = await fetch('/api/ai/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            messages: [
                                { role: 'user', content: message }
                            ]
                        })
                    });

                    const result = await response.json();

                    // 移除"正在思考"消息
                    const messages = document.querySelectorAll('.message.ai');
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage && lastMessage.textContent.includes('正在思考')) {
                        lastMessage.remove();
                    }

                    if (result.success) {
                        addMessage('ai', result.data.content);
                    } else {
                        addMessage('ai', '抱歉，我现在无法回应。请稍后再试。');
                    }
                } catch (error) {
                    console.error('Chat error:', error);
                    addMessage('ai', '网络连接出现问题，请检查网络后重试。');
                }
            }

            // 处理选中对象的AI图像处理
            async function processSelectedObjectWithAI(selectedObject, prompt) {
                addMessage('user', '对选中对象应用: ' + prompt);

                try {
                    addMessage('ai', '📸 正在生成选中对象的图片...');

                    // 生成选中对象的图片
                    const objectImage = await generateObjectImage(selectedObject);

                    // 在聊天窗口中展示生成的图片
                    addImageMessage('ai', '📷 选中对象的图片：', objectImage);

                    addMessage('ai', '🤖 正在使用AI处理图片...');

                    // 调用AI接口处理图片
                    const processedImage = await callAIImageAPI(objectImage, prompt);

                    if (processedImage) {
                        // 在聊天窗口中展示处理后的图片
                        addImageMessage('ai', '✨ AI处理后的图片：', processedImage);

                        // 在选中对象右侧添加处理后的图片
                        await addProcessedImageToCanvas(selectedObject, processedImage);
                        addMessage('ai', '✅ AI处理完成！新图片已添加到画布右侧');
                    } else {
                        addMessage('ai', '❌ AI图片处理失败，请重试');
                    }

                } catch (error) {
                    console.error('AI image processing error:', error);
                    addMessage('ai', '❌ AI图片处理出错，请重试');
                }
            }

            // 生成选中对象的图片
            async function generateObjectImage(obj) {
                return new Promise((resolve) => {
                    // 临时取消选择状态，避免包含选择控件
                    const wasSelected = obj === infiniteEditor.canvas.getActiveObject();
                    if (wasSelected) {
                        infiniteEditor.canvas.discardActiveObject();
                        infiniteEditor.canvas.renderAll();
                    }

                    let objectsToRender = [];
                    let bounds;

                    // 检查是否是多选对象
                    if (obj.type === 'activeSelection') {
                        // 多选情况：获取所有选中的对象
                        objectsToRender = obj.getObjects();

                        // 计算所有对象的整体边界框
                        let minLeft = Infinity, minTop = Infinity;
                        let maxRight = -Infinity, maxBottom = -Infinity;

                        objectsToRender.forEach(object => {
                            const objectBounds = object.getBoundingRect();
                            minLeft = Math.min(minLeft, objectBounds.left);
                            minTop = Math.min(minTop, objectBounds.top);
                            maxRight = Math.max(maxRight, objectBounds.left + objectBounds.width);
                            maxBottom = Math.max(maxBottom, objectBounds.top + objectBounds.height);
                        });

                        bounds = {
                            left: minLeft,
                            top: minTop,
                            width: maxRight - minLeft,
                            height: maxBottom - minTop
                        };
                    } else {
                        // 单选情况：只有一个对象
                        objectsToRender = [obj];
                        bounds = obj.getBoundingRect();
                    }

                    // 创建临时画布，尺寸稍大一些以包含完整对象
                    const padding = 20;
                    const tempCanvas = document.createElement('canvas');
                    const ctx = tempCanvas.getContext('2d');
                    tempCanvas.width = bounds.width + padding * 2;
                    tempCanvas.height = bounds.height + padding * 2;

                    // 设置白色背景
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

                    // 保存上下文状态
                    ctx.save();

                    // 移动坐标系，以边界框的左上角为原点
                    ctx.translate(padding - bounds.left, padding - bounds.top);

                    // 渲染所有对象到临时画布
                    objectsToRender.forEach(object => {
                        object.render(ctx);
                    });

                    // 恢复上下文状态
                    ctx.restore();

                    // 如果之前是选中状态，恢复选中
                    if (wasSelected) {
                        infiniteEditor.canvas.setActiveObject(obj);
                        infiniteEditor.canvas.renderAll();
                    }

                    // 转换为base64并返回
                    const dataURL = tempCanvas.toDataURL('image/png');

                    console.log('Generated image for objects:', {
                        objectCount: objectsToRender.length,
                        bounds: bounds,
                        canvasSize: { width: tempCanvas.width, height: tempCanvas.height }
                    });

                    resolve(dataURL);
                });
            }

            // 调用AI图像处理接口
            async function callAIImageAPI(imageData, prompt) {
                try {
                    const response = await fetch('/api/ai/image/edit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            imageData: imageData,
                            instruction: prompt,
                            model: 'gemini-2.5-flash-image-preview'
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        return result.data.editedImageUrl;
                    } else {
                        console.error('AI API error:', result.error);
                        if (result.error && result.error.includes('Vertex AI is not configured')) {
                            addMessage('ai', '❌ Vertex AI 未配置。请设置 GOOGLE_CLOUD_PROJECT 和 GOOGLE_SERVICE_ACCOUNT_KEY 环境变量。');
                        } else {
                            addMessage('ai', '❌ AI处理失败: ' + (result.error || '未知错误'));
                        }
                        return null;
                    }
                } catch (error) {
                    console.error('AI API call failed:', error);
                    return null;
                }
            }

            // 将处理后的图片添加到画布
            async function addProcessedImageToCanvas(originalObject, processedImageUrl) {
                return new Promise((resolve) => {
                    fabric.Image.fromURL(processedImageUrl, (img) => {
                        // 获取原始对象的位置和尺寸
                        const bounds = originalObject.getBoundingRect();

                        // 设置新图片的位置（在原对象右侧）
                        img.set({
                            left: bounds.left + bounds.width + 50, // 右侧50px间距
                            top: bounds.top,
                            scaleX: bounds.width / img.width,
                            scaleY: bounds.height / img.height
                        });

                        // 添加到画布
                        infiniteEditor.canvas.add(img);
                        infiniteEditor.canvas.renderAll();
                        infiniteEditor.saveState();

                        resolve();
                    }, {
                        crossOrigin: 'anonymous'
                    });
                });
            }

            // 事件监听
            if (sendBtn) {
                sendBtn.addEventListener('click', sendMessage);
            }

            if (chatInput) {
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                });
            }
        }

        // 聊天消息功能
        function addMessage(sender, message) {
            const chatMessages = document.getElementById('chat-messages');
            if (!chatMessages) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + sender;
            messageDiv.innerHTML =
                '<div class="message-content">' + message + '</div>' +
                '<div class="message-time">' + new Date().toLocaleTimeString() + '</div>';

            chatMessages.appendChild(messageDiv);

            // 自动滚动到底部
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }

        // 添加带图片的聊天消息
        function addImageMessage(sender, text, imageUrl) {
            const chatMessages = document.getElementById('chat-messages');
            if (!chatMessages) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + sender;

            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';

            // 添加文本
            const textDiv = document.createElement('div');
            textDiv.textContent = text;
            messageContent.appendChild(textDiv);

            // 添加图片
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.maxWidth = '200px';
            img.style.maxHeight = '200px';
            img.style.marginTop = '8px';
            img.style.borderRadius = '8px';
            img.style.border = '1px solid #ddd';
            img.style.cursor = 'pointer';
            img.style.display = 'block';

            // 点击图片放大查看
            img.onclick = () => {
                const modal = document.createElement('div');
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
                modal.style.display = 'flex';
                modal.style.alignItems = 'center';
                modal.style.justifyContent = 'center';
                modal.style.zIndex = '10000';
                modal.style.cursor = 'pointer';

                const modalImg = document.createElement('img');
                modalImg.src = imageUrl;
                modalImg.style.maxWidth = '90%';
                modalImg.style.maxHeight = '90%';
                modalImg.style.borderRadius = '8px';

                modal.appendChild(modalImg);
                document.body.appendChild(modal);

                modal.onclick = () => {
                    document.body.removeChild(modal);
                };
            };

            messageContent.appendChild(img);

            // 添加时间戳
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.textContent = new Date().toLocaleTimeString();

            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(timeDiv);

            chatMessages.appendChild(messageDiv);

            // 自动滚动到底部
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }

        // 确保聊天面板正确显示
        function ensureChatPanelVisible() {
            const aiChatPanel = document.getElementById('aiChatPanel');
            const chatContent = aiChatPanel?.querySelector('.chat-content');
            const chatInputContainer = aiChatPanel?.querySelector('.chat-input-container');

            if (aiChatPanel && aiChatPanel.classList.contains('collapsed')) {
                // 如果面板是折叠的，展开它
                aiChatPanel.classList.remove('collapsed');
                const toggleBtn = document.getElementById('aiChatToggle');
                if (toggleBtn) {
                    const icon = toggleBtn.querySelector('i');
                    if (icon) {
                        icon.className = 'fas fa-chevron-up';
                    }
                }
            }

            // 确保内容区域可见
            if (chatContent) {
                chatContent.style.display = 'flex';
            }
            if (chatInputContainer) {
                chatInputContainer.style.display = 'flex';
            }
        }

        console.log('AI Image Editor fully loaded');
    </script>
</body>
`;
}
