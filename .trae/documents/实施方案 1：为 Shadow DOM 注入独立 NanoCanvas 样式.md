## 产出目标
- 从子模块提取 NanoCanvas 的独立样式文件（如 `public/nanocanvas.css`），仅包含子模块实际用到的类
- 在 `/standard-editor` 与 `/test-nanocanvas` 的 ShadowRoot 挂载时，动态注入该 CSS，确保 Toolbar/AIPanel 完整呈现且不受主工程影响

## 样式构建
- 子模块独立构建 CSS（任选一种）：
  - 方案 A（Tailwind 构建）：
    - 新增 `tailwind.nanocanvas.config.js`，`content` 指向 `submodules/nanocanvas/**/*.{ts,tsx}`
    - 生成 `public/nanocanvas.css`：运行 `tailwindcss -c tailwind.nanocanvas.config.js -i ./submodules/nanocanvas/styles/input.css -o ./public/nanocanvas.css --minify`
  - 方案 B（Vite 构建提取）：
    - 在子模块 `vite.config.ts` 产出样式资产，复制生成的 CSS 到主工程 `public/nanocanvas.css`
- 内容范围：包含布局、颜色、边框、阴影、字号等工具类；以及 `#nc-root` 的基础 reset 片段

## 页面注入
- 在页面 `useEffect`（ready && hostRef）创建 ShadowRoot，并注入 CSS：
  - 通过 `fetch('/nanocanvas.css')` 获取文本内容
  - 创建 `<style>` 并将内容追加到 `shadowRoot`（或构造 `CSSStyleSheet` 使用 `shadowRoot.adoptedStyleSheets = [sheet]`）
  - 然后用 `createPortal` 将子模块 `App` 渲染到 ShadowRoot 的 `mountNode`
- Fallback：若 CSS 加载失败，注入最小必要内联样式（`#nc-root` reset、核心颜色与边框类）以保持基本可用

## 依赖与事件
- 子模块不引入前端 SDK；AI 调用统一走主工程 `/api/ai/*`
- 保留 `window` 级事件（键盘、`openPromptPopup`）确保跨 Shadow 正常工作

## 验证
- 路由 `/standard-editor` 和 `/test-nanocanvas`：
  - 样式一致：Toolbar/AIPanel 与上游完全一致（芯片、页签、阴影、边框、字号）
  - 功能一致：Select/Move/Draw/Rect/Circle/Text、右键菜单、AIPanel 任务/模板/发送均正常

## 交付
- 新增 Tailwind 构建配置或 Vite 构建提取脚本，以及生成的 `public/nanocanvas.css`
- 页面注入逻辑（仅客户端）与验证说明；保留 iframe 作为后备方案