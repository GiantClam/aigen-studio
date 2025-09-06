# 🖼️ 拖放图片功能

## ✨ 功能特性

### 拖放支持
- ✅ 支持从文件管理器拖放图片到画布
- ✅ 支持从浏览器拖放图片到画布
- ✅ 支持从其他应用程序拖放图片

### 文件格式支持
- ✅ JPG/JPEG
- ✅ PNG
- ✅ GIF
- ✅ WebP
- ✅ BMP

### 智能处理
- ✅ 自动调整图片大小（最大占画布80%）
- ✅ 智能定位（拖放位置或居中）
- ✅ 文件大小限制（最大10MB）
- ✅ 错误处理和用户提示

## 🎯 使用方法

### 1. 基本拖放
1. 打开图像编辑器页面
2. 从文件管理器选择图片文件
3. 拖拽到画布区域
4. 松开鼠标完成拖放

### 2. 视觉反馈
- **拖拽进入**: 画布显示蓝色虚线边框
- **拖拽悬停**: 显示拖放提示覆盖层
- **拖拽离开**: 恢复正常状态
- **拖放完成**: 图片添加到画布

### 3. 错误处理
- 不支持的文件格式 → 提示用户
- 文件过大 → 显示大小限制
- 加载失败 → 显示错误信息

## 🔧 技术实现

### 事件处理
```typescript
// 拖拽悬停
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragOver(true)
}

// 拖拽离开
const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragOver(false)
}

// 拖放处理
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragOver(false)
  // 处理文件...
}
```

### 文件验证
- 文件类型检查: `file.type.startsWith('image/')`
- 文件大小限制: `file.size <= 10MB`
- 错误处理: 用户友好的提示信息

### 图片处理
- 使用 Fabric.js 的 `FabricImage.fromURL()`
- 自动缩放以适应画布
- 智能定位到拖放位置

## 🎨 UI/UX 设计

### 拖放状态指示
- **正常状态**: 网格背景
- **拖拽悬停**: 蓝色背景 + 虚线边框
- **拖放提示**: 动画图标 + 文字说明

### 空画布提示
- 显示"开始创作"提示
- 引导用户拖放图片或使用工具

### 全局拖放防护
- 防止在页面其他区域拖放时打开文件
- 只在画布区域响应拖放事件

## 🐛 故障排除

### 常见问题
1. **拖放无响应**
   - 检查浏览器是否支持拖放API
   - 确认文件是图片格式

2. **图片加载失败**
   - 检查文件是否损坏
   - 确认文件格式支持

3. **图片显示异常**
   - 检查图片尺寸是否过大
   - 确认画布已正确初始化

### 浏览器兼容性
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
