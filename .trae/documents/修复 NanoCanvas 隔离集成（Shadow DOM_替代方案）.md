## 问题诊断
- 目前的 Shadow DOM 挂载未正常展示的核心原因：
  1) 在 `<div>` 上使用 `onLoadCapture` 不会触发，导致 `shadowRoot` 未创建、`portal` 的 `mountNode` 为 null。
  2) 即便创建了 `shadowRoot`，Tailwind 的样式是注入到文档级（document）的，Shadow 内无样式，导致 Toolbar/AIPanel 看起来“失效”。
  3) Next 的客户端挂载时机与我们创建 ShadowRoot 的时机不匹配，需要在 `useEffect`（ready == true && hostRef.current）中创建 shadow 并注入样式。

## 方案A（推荐）：改良版 Shadow DOM 隔离
### 实施点
1. 正确挂载时机：
- 在 `useEffect(() => { if (ready && hostRef.current) { ... } }, [ready, hostRef])` 中创建 `shadowRoot`，并设置 `mountNode`，移除无效的 `onLoadCapture`。
2. 样式注入到 Shadow：
- 提取 NanoCanvas 的样式为单独 CSS（如 `nanocanvas.css`，包含子模块内使用的类样式），通过 `fetch` 或 `import` 在客户端获取，然后使用 `adoptedStyleSheets`（构造 `CSSStyleSheet`）或向 shadowRoot 追加 `<style>`/`<link>` 标签注入。
- 或使用 `react-shadow` 等库，它会自动把局部样式挂到 shadow。
3. 事件与弹层：
- 继续用 `window` 级事件（如 `openPromptPopup`、keydown），保证跨 Shadow 工作；弹层（ContextMenu、PromptPopup）渲染在 Shadow 内，保持 z-index 不穿出。
4. 依赖与类型不变：
- 子模块不引入前端 SDK，AI 调用统一走主工程 `/api/ai/*`；主工程 `tsconfig exclude: ['submodules/**']` 保持隔离。

### 验证
- 样式：Toolbar/AIPanel 在 Shadow 内完整呈现，布局与交互与上游一致。
- 功能：Select/Move/Draw/Rect/Circle/Text、右键菜单、AIPanel 任务与模板、发送与生成均正常。

## 方案B（备选）：iframe 极致隔离
### 实施点
- 子模块独立构建为静态页面（Vite 打包），Next 页面通过 `<iframe src="/nanocanvas-standalone">` 加载。
- 通过 `postMessage` 与主工程通信（图像/视频生成、下载等），主工程作为 API proxy。
### 评估
- 优点：最大隔离，无样式/脚本互扰。
- 缺点：交互桥接复杂（拖拽、快捷键、剪贴板、右键等），开发复杂度与维护成本高。

## 方案C（过渡）：非 Shadow 的强作用域样式
### 实施点
- 保留普通挂载，但在 `#nc-root` 下使用作用域 reset 与明确类：在 `#nc-root` 下用 `all: unset`/局部 CSS layer，重置主工程的 preflight；对边框/背景/阴影/字号明确赋值。
- 快速达成视觉强一致，技术风险低，但不是彻底隔离。

## 建议与执行顺序
- 优先执行方案A：修正挂载时机 + 注入 NanoCanvas CSS 到 shadowRoot（采用 `adoptedStyleSheets` 或 `<style>`）。
- 如遇到浏览器兼容性或构建链路限制，再考虑方案C做过渡；对极致隔离需求保留方案B。

如确认方案A，我将：
1) 移除 `onLoadCapture`，改 `useEffect` 创建 shadowRoot；
2) 添加样式注入逻辑（`adoptedStyleSheets` 或 `<style>`）并验证两路由；
3) 保持现有 AI 通信与工具交互；
4) 提交验证结果与对比说明。