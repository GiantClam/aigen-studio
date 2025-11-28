## 挂载时机修正
- 在 `useEffect(() => { if (ready && hostRef.current) { ... } }, [ready])` 中创建 `shadowRoot`，不要依赖 `onLoadCapture`（div 不触发 load）。
- 逻辑：
  1) `const sr = hostRef.current.attachShadow({mode:'open'})`
  2) `const rootDiv = document.createElement('div')`，追加到 `sr`，保存为 `mountNode`
  3) 使用 `createPortal(<NanoCanvasApp .../>, mountNode)` 渲染子模块
- 清理：在组件卸载时，不销毁 `shadowRoot`，仅清空 `mountNode` 引用

## 样式注入到 Shadow
- 问题：Tailwind 的样式在 document 级；Shadow 内不可用，导致 Toolbar/AIPanel“无样式”。
- 解决：为 NanoCanvas 生成并注入独立样式到 shadowRoot。
  - 方案1（最稳）：为子模块建立独立 Tailwind 构建（mini config），扫描 `submodules/nanocanvas/**/*.{ts,tsx}`，产出 `nc.css`（只包含使用的类）。
    - 在页面 `useEffect` 中通过 `fetch('/path/to/nc.css')` 获取内容并注入 `<style>` 到 `shadowRoot`，或使用 `adoptedStyleSheets`：创建 `CSSStyleSheet` 并 `shadowRoot.adoptedStyleSheets = [sheet]`
  - 方案2（过渡）：复制子模块内现有内联样式（如 `#nc-root` reset）并追加必要的关键样式片段（边框/背景/阴影/字号）到 `<style>`，快速恢复视觉；对缺失的 Tailwind 工具类进行最小补全

## 事件与弹层保持可用
- 继续使用 `window` 级事件（如 `openPromptPopup`、keydown），在 Shadow 内照常工作
- 弹层（ContextMenu、PromptPopup）在 Shadow 内渲染，维持 `z-index` 与 `pointer-events` 一致，不穿出 Shadow

## 依赖与类型隔离
- 子模块不引入前端 SDK；AI 调用统一走主工程 `/api/ai/*`
- 主工程 `tsconfig.json` 保持 `exclude: ['submodules/**']`，避免类型检查触达子模块源码

## 验证步骤
- 页面 `/standard-editor`、`/test-nanocanvas`：
  - 样式：Toolbar/AIPanel 在 Shadow 内完整呈现（模型芯片、页签、输入区、阴影与边框）
  - 功能：Select/Move/Draw/Rect/Circle/Text、右键菜单、AIPanel 任务/模板/发送均正常
- 回退方案：若样式注入在当前构建链路难以完成，先应用“强作用域样式”（非 Shadow）作为过渡，随后再切回 Shadow

## 交付
- 修正挂载时机的代码
- 子模块样式的 Shadow 注入（选择方案1或方案2），并提供验证说明与截图
- 保留 iframe 作为后备，仅在必须极致隔离时启用