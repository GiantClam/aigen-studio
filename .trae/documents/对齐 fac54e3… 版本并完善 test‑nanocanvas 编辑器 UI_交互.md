## 总览
- 目标：对比 GitHub fac54e3… 版本，让 `/test-nanocanvas` 独立呈现 NanoCanvas 编辑器，并与参考版本在 UI 与交互保持一致，确保从项目 `/workspace` 跳转到 `/standard-editor` 的初始化稳定。
- 范围：仅修改前端页面与 NanoCanvas 组件 UI/交互，不触及后端接口与数据结构。

## 现状与差异
- 现状：
  - `/test-nanocanvas` 已动态加载 `fabric` 并使用覆盖容器，但仍需对 UI 与交互细节对齐参考版本。
  - `NanoCanvas` 内置 workspace 已移除，编辑器应直接初始化；组件端采用等待 `window.fabric.Canvas` 的方式避免竞态。
- 差异点（需要对齐）：
  - 编辑器根容器与样式：确保高度链路闭合、背景网格与提示条样式一致。
  - 工具栏外观与分组：按钮尺寸、激活状态样式、分隔与阴影一致化。
  - 右键菜单触发与动作：在对象右键时保证弹出菜单，并正确处理 Compose/Matting/Flatten/Delete 行为。
  - AI 面板细节：模板选择区、Prompt 文本域、模型下拉项顺序与命名、生成按钮状态与文案。
  - 画布交互：拖拽（Alt+Drag）、缩放（Wheel）、吸附（Moving Snap）、形状绘制（Rect/Circle）、文本插入（IText）。
  - 生成结果布局：图片/视频插入的位置与尺寸规则（相对选区右侧对齐），以及 Gallery 入库逻辑。

## 实施方案
### 1. 独立页面完善
- 在 `/test-nanocanvas`：
  - 顶层覆盖容器保持 `fixed inset-0`，注入 `html, body { height:100% }`，避免项目布局影响。
  - 页面级动态导入 `fabric`，注入 `window.fabric` 后再渲染编辑器。
  - 可选：在本页注入仅限该页的样式片段，确保 UI 与参考版本一致（字体、阴影、颜色）。

### 2. 编辑器根容器与初始化
- 在 `NanoCanvas App`：
  - 根容器 `#nc-root` 使用 `w-full h-full`，内部画布容器 `absolute inset-0`，保证实际可用尺寸。
  - 初始化时设置背景网格（`fabric.Pattern`），加载初始 JSON（若有），并启动 render loop。
  - 保持 `window.fabric.Canvas` 就绪轮询等待，移除组件内部动态导入，避免初始化异常。

### 3. 工具栏 UI/交互对齐
- 按钮集合：Select/Brush/Rect/Circle/Text；分隔后为 Save/Download/Upload/Home（或隐藏）/Delete。
- 对齐样式：按钮大小（20px 图标）、激活态背景与文字颜色、分隔线与容器阴影、圆角与过渡。
- 交互：
  - `onSelectTool` 切换工具时更新 `customTool` 与绘制模式。
  - 形状绘制时禁用选择、松开后设置活动对象；Brush 时配置 `freeDrawingBrush.color/width`。

### 4. 右键菜单与动作
- 右键触发：对象右键时显示 ContextMenu，并在点击动作后关闭菜单。
- 行为：
  - Compose：对选区进行合成（生成新图像并插入右侧）。
  - Matting：扣除背景（生成新图像并覆盖或右侧插入）。
  - Flatten：把选区转为位图再插入（`toDataURL` + `fabric.Image.fromURL`）。
  - Delete：删除选区对象。

### 5. AI 面板一致化
- 模板区：调用 `TemplateSelector`，支持 `hasSelection` 影响模板类型（edit/generate）。
- Prompt 文本域：样式与高度统一；模型下拉项包括 `Image (fast/quality)` 与 `Video (fast/hq)`。
- 生成按钮：禁用态与文案一致；生成后更新 Gallery 并插入画布。

### 6. 生成结果与 Gallery
- 位置规则：若有选区，结果插入在其右侧并按选区宽度缩放；无选区则中心附近插入。
- 图片：`fabric.Image.fromURL` 插入；视频：创建 `video` 元素并用 `new fabric.Image(videoEl)`。
- Gallery 更新：插入条目（image/video）、记录模型与 prompt、时间戳。

### 7. 跳转链路核验
- 从项目 `/workspace` 点击“新建画布/打开画布” → 进入 `/standard-editor`，页面层动态注入 `fabric` 后编辑器渲染。
- 使用 `/test-nanocanvas` 直接验证编辑器，不受 Layout 干扰。

### 8. 验证与回归
- 本地启动开发服务，分别访问 `/standard-editor` 与 `/test-nanocanvas`，验证：
  - 画布尺寸与网格背景正确
  - 工具栏、右键菜单、AI 面板交互正常
  - 生成图片/视频插入逻辑与 Gallery 更新正常
  - 无控制台错误（特别是 `fabric` 相关）

## 交付
- 完成上述对齐后，提供：
  - 变更清单（文件与行号）
  - 验证步骤与截图建议
  - 若需要，继续优化 `/workspace` → `/standard-editor` 的跳转体验（例如在跳转前预注入 `fabric`）

## 确认
- 请确认是否按以上方案执行。如果确认，我将开始具体代码修改与验证。