// AI Image Editor with Floating Panels and Responsive Design
// This file contains the complete image editor implementation

export function generateImageEditorPage(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Image Editor - 智能图像编辑器</title>
    <link rel="icon" href="/unicorn.png" type="image/png">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        :root {
            --bg-primary: #1a1a1a;
            --bg-secondary: #2d2d2d;
            --bg-tertiary: #3d3d3d;
            --bg-sidebar: #252525;
            --text-primary: #ffffff;
            --text-secondary: #b0b0b0;
            --border-color: #404040;
            --accent-blue: #007acc;
            --accent-blue-hover: #005a9e;
            --accent-green: #28a745;
            --accent-red: #dc3545;
            --shadow-light: rgba(0, 0, 0, 0.1);
            --shadow-dark: rgba(0, 0, 0, 0.3);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            overflow: hidden;
        }

        /* Top Header */
        .top-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            z-index: 1000;
            box-shadow: 0 2px 8px var(--shadow-dark);
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
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .header-btn:hover {
            background: var(--accent-blue);
            border-color: var(--accent-blue);
        }

        .header-btn i {
            font-size: 12px;
        }

        /* Main Layout */
        .editor-layout {
            display: flex;
            height: 100vh;
            padding-top: 60px;
            position: relative;
        }
        
        /* Floating Left Toolbar */
        .left-sidebar {
            position: fixed;
            left: 20px;
            top: 80px;
            width: 80px;
            background: var(--bg-sidebar);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 0;
            gap: 20px;
            box-shadow: 0 4px 20px var(--shadow-dark);
            border-radius: 12px;
            z-index: 100;
            transition: all 0.3s ease;
            border: 1px solid var(--border-color);
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

        /* Main Content Area - Full Width */
        .main-content {
            width: 100%;
            height: calc(100vh - 60px);
            display: flex;
            flex-direction: column;
            background: var(--bg-primary);
            position: relative;
        }

        .canvas-container {
            flex: 1;
            background: #2a2a2a;
            border-radius: 8px;
            padding: 20px;
            overflow: auto;
            position: relative;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
            justify-content: center;
            align-content: start;
            min-height: 100%;
            background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
            background-size: 20px 20px;
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

        /* Floating Right AI Chat Panel */
        .ai-chat-panel {
            position: fixed;
            right: 20px;
            top: 80px;
            width: 400px;
            height: calc(100vh - 120px);
            min-width: 300px;
            max-width: 600px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 20px var(--shadow-dark);
            border-radius: 12px;
            z-index: 100;
            transition: all 0.3s ease;
            resize: horizontal;
            overflow: hidden;
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
            height: 100%;
        }

        .chat-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: var(--bg-primary);
        }

        .message {
            margin-bottom: 16px;
            padding: 12px;
            border-radius: 8px;
            background: var(--bg-tertiary);
        }

        .message.ai {
            background: var(--bg-tertiary);
            border-left: 3px solid var(--accent-blue);
        }

        .message.user {
            background: var(--accent-blue);
            margin-left: 20px;
        }

        .message-content {
            color: var(--text-primary);
            font-size: 14px;
            line-height: 1.4;
        }

        .message-time {
            color: var(--text-secondary);
            font-size: 11px;
            margin-top: 4px;
        }

        .chat-input-container {
            padding: 16px;
            border-top: 1px solid var(--border-color);
            display: flex;
            gap: 8px;
        }

        #chat-input {
            flex: 1;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
        }

        #chat-input:focus {
            outline: none;
            border-color: var(--accent-blue);
        }

        #send-btn {
            background: var(--accent-blue);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }

        #send-btn:hover {
            background: var(--accent-blue-hover);
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
            <button class="panel-toggle" id="left-panel-toggle" title="Toggle Toolbar">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="sidebar-tool active" data-tool="select" data-tooltip="Select">
                <i class="fas fa-mouse-pointer"></i>
            </button>
            <button class="sidebar-tool" data-tool="move" data-tooltip="Move">
                <i class="fas fa-arrows-alt"></i>
            </button>
            <button class="sidebar-tool" data-tool="brush" data-tooltip="Brush">
                <i class="fas fa-paint-brush"></i>
            </button>
            <button class="sidebar-tool" data-tool="eraser" data-tooltip="Eraser">
                <i class="fas fa-eraser"></i>
            </button>
            <button class="sidebar-tool" data-tool="text" data-tooltip="Text">
                <i class="fas fa-font"></i>
            </button>
            <button class="sidebar-tool" data-tool="rectangle" data-tooltip="Rectangle">
                <i class="far fa-square"></i>
            </button>
            <button class="sidebar-tool" data-tool="circle" data-tooltip="Circle">
                <i class="far fa-circle"></i>
            </button>
            <button class="sidebar-tool" data-tool="ai-enhance" data-tooltip="AI Enhance">
                <i class="fas fa-magic"></i>
            </button>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <div class="canvas-container" id="canvas-container">
                <!-- Images will be dynamically added here -->
            </div>
        </div>

        <!-- Floating Right AI Chat Panel -->
        <div class="ai-chat-panel" id="ai-chat-panel">
            <div class="panel-header">
                <div class="panel-title">
                    <i class="fas fa-robot"></i> AI Assistant
                </div>
                <button class="panel-toggle" id="chat-panel-toggle" title="Toggle Chat">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="chat-content">
                <div class="chat-messages" id="chat-messages">
                    <!-- Chat messages will be added here -->
                </div>
                <div class="chat-input-container">
                    <input type="text" id="chat-input" placeholder="Ask AI for help...">
                    <button id="send-btn"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    </div>

    <!-- Hidden file input -->
    <input type="file" id="file-input" accept="image/*" multiple style="display: none;">

    <script>
        // AI Image Editor Class
        class AIImageEditor {
            constructor() {
                this.images = [];
                this.selectedImages = [];
                this.currentTool = 'select';
                this.canvasContainer = null;
                this.editingCanvas = null;
                this.currentEditingImage = null;
                this.editingOverlay = null;

                this.init();
            }

            init() {
                this.initializeGrid();
                this.setupEventListeners();
                this.setupFileInput();
            }

            initializeGrid() {
                this.canvasContainer = document.querySelector('.canvas-container');
                if (!this.canvasContainer) return;

                this.canvasContainer.innerHTML = '';
                this.addPlaceholder();
            }

            addPlaceholder() {
                const placeholder = document.createElement('div');
                placeholder.className = 'image-placeholder';
                placeholder.innerHTML = \`
                    <i class="fas fa-plus"></i>
                    <span>Click to add images</span>
                \`;
                placeholder.addEventListener('click', () => this.openFileDialog());
                this.canvasContainer.appendChild(placeholder);
            }

            setupEventListeners() {
                // Tool selection
                document.querySelectorAll('.sidebar-tool').forEach(tool => {
                    tool.addEventListener('click', (e) => {
                        const toolName = e.currentTarget.getAttribute('data-tool');
                        this.selectTool(toolName);
                    });
                });

                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => {
                    if (e.ctrlKey || e.metaKey) {
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
                        }
                    }
                });
            }

            setupFileInput() {
                const fileInput = document.getElementById('file-input');
                fileInput.addEventListener('change', (e) => {
                    this.handleFileSelect(e.target.files);
                });
            }

            openFileDialog() {
                document.getElementById('file-input').click();
            }

            handleFileSelect(files) {
                Array.from(files).forEach(file => {
                    if (file.type.startsWith('image/')) {
                        this.addImage(file);
                    }
                });
            }

            addImage(file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = {
                        id: Date.now() + Math.random(),
                        file: file,
                        src: e.target.result,
                        annotations: [],
                        selected: false
                    };

                    this.images.push(imageData);
                    this.renderImage(imageData);

                    // Remove placeholder if this is the first image
                    if (this.images.length === 1) {
                        const placeholder = this.canvasContainer.querySelector('.image-placeholder');
                        if (placeholder) {
                            placeholder.remove();
                        }
                    }
                };
                reader.readAsDataURL(file);
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

            selectTool(toolName) {
                this.currentTool = toolName;

                // Update UI
                document.querySelectorAll('.sidebar-tool').forEach(tool => {
                    tool.classList.remove('active');
                });
                document.querySelector(\`[data-tool="\${toolName}"]\`).classList.add('active');

                // Update canvas mode if editing
                if (this.editingCanvas) {
                    this.updateCanvasModeForTool(toolName);
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
                closeBtn.style.cssText = \`
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: var(--accent-red);
                    color: white;
                    border: none;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                \`;
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

                    addMessage('ai', \`Exported \${selectedImages.length} selected images.\`);
                } else {
                    addMessage('ai', 'Please select images to export or open an image for editing.');
                }
            }
        }

        // Initialize the AI Image Editor
        let aiEditor = null;

        // Initialize everything when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            aiEditor = new AIImageEditor();
            setupHeaderButtons();
            setupFloatingPanels();

            // Set default tool
            aiEditor.selectTool('select');

            addMessage('ai', 'AI Image Editor ready! Upload images and use the editing tools to annotate them.');
        });

        // Header button functionality
        function setupHeaderButtons() {
            const undoBtn = document.getElementById('undo-btn');
            const redoBtn = document.getElementById('redo-btn');
            const saveBtn = document.getElementById('save-btn');
            const exportBtn = document.getElementById('export-btn');

            if (undoBtn) {
                undoBtn.addEventListener('click', () => {
                    if (aiEditor) aiEditor.undo();
                });
            }

            if (redoBtn) {
                redoBtn.addEventListener('click', () => {
                    if (aiEditor) aiEditor.redo();
                });
            }

            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    if (aiEditor) aiEditor.save();
                });
            }

            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    if (aiEditor) aiEditor.export();
                });
            }
        }

        // Floating panels functionality
        function setupFloatingPanels() {
            const leftToolbar = document.getElementById('left-toolbar');
            const leftToggle = document.getElementById('left-panel-toggle');
            const chatPanel = document.getElementById('ai-chat-panel');
            const chatToggle = document.getElementById('chat-panel-toggle');

            // Left toolbar toggle
            if (leftToggle && leftToolbar) {
                leftToggle.addEventListener('click', () => {
                    leftToolbar.classList.toggle('collapsed');
                    const icon = leftToggle.querySelector('i');
                    if (leftToolbar.classList.contains('collapsed')) {
                        icon.className = 'fas fa-chevron-right';
                        leftToolbar.style.left = '-40px';
                    } else {
                        icon.className = 'fas fa-chevron-left';
                        leftToolbar.style.left = '20px';
                    }
                });
            }

            // Chat panel toggle
            if (chatToggle && chatPanel) {
                chatToggle.addEventListener('click', () => {
                    chatPanel.classList.toggle('collapsed');
                    const icon = chatToggle.querySelector('i');
                    if (chatPanel.classList.contains('collapsed')) {
                        icon.className = 'fas fa-chevron-left';
                        chatPanel.style.right = '-340px';
                    } else {
                        icon.className = 'fas fa-chevron-right';
                        chatPanel.style.right = '20px';
                    }
                });
            }

            // Make panels draggable
            makePanelDraggable(leftToolbar);
            makePanelDraggable(chatPanel);
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

        // Simple chat functionality
        function addMessage(sender, message) {
            const chatMessages = document.getElementById('chat-messages');
            if (!chatMessages) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${sender}\`;
            messageDiv.innerHTML = \`
                <div class="message-content">\${message}</div>
                <div class="message-time">\${new Date().toLocaleTimeString()}</div>
            \`;

            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        console.log('AI Image Editor fully loaded');
    </script>
</body>
</html>`;
}
