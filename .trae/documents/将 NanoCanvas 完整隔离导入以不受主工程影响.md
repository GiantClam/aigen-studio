## 目标
- 实现 NanoCanvas 的 Toolbar 与 AIPanel 强一致、完全不受主工程样式/依赖/类型的影响。
- 保留与主工程的必要通信（生成、编辑、下载等）但隔离 UI 与运行时环境。

## 推荐方案 A：Shadow DOM 隔离挂载（无 iframe，保留同页交互）
1. 页面容器创建 ShadowRoot：在 `/standard-editor` 和 `/test-nanocanvas` 的容器节点上调用 `element.attachShadow({ mode:'open' })`。
2. 在 ShadowRoot 内渲染 NanoCanvas：使用 React Portal 或 `react-shadow`，将子模块的 `App` 渲染到 ShadowRoot；NanoCanvas 的所有样式以 `<style>` 注入 ShadowRoot 内部（上游提供的 CSS/内联样式）。
3. 隔离效果：
   - CSS：主工程 Tailwind base（如 `border-border`）不再影响 Shadow 内的子模块；Toolbar/AIPanel 完全按上游渲染。
   - 事件：Fabric 的 canvas、右键菜单、键盘事件仍可在 Shadow 内工作；如需跨 Shadow 与 Window 的交互（如 `openPromptPopup`），保留使用 `window.dispatchEvent`。
4. 依赖隔离：继续使用子模块源码；主工程 `tsconfig` 排除 `submodules/**`，并只通过动态导入加载；避免主工程类型扫描与 SDK 强依赖。
5. 通信接口：NanoCanvas 的 AI 服务统一调用主工程 `/api/ai/*`，不在前端引入 SDK；这已完成，保持不变。

## 备选方案 B：iframe 完全隔离（最大隔离，需消息总线）
1. 子模块独立构建为 `dist`（Vite）；Next 页面通过 `<iframe src="/nanocanvas-standalone">` 加载。
2. 确保 Toolbar/AIPanel 与主工程完全隔离；通过 `postMessage` 与主工程通信（生成/编辑/下载），主工程作为 API proxy。
3. 缺点：文件拖拽、选区等同页交互复杂度提升；优点：隔离最彻底、无样式污染。

## 技术要点与改动范围
- Shadow DOM 实现：
  - 在主工程页面中创建挂载容器并附加 ShadowRoot；将子模块 App 通过 Portal 渲染进去。
  - 在 Shadow 内注入 NanoCanvas 的 CSS（同子模块 `index.html` 或内联样式抽取）。
- 事件与焦点：
  - 键盘/右键事件已使用 `window` 级监听，继续可用；如需监听在 Shadow 内的元素，保证添加事件目标在 Shadow 容器内。
- 依赖与类型：
  - 保持 `tsconfig` 的 `exclude: ['submodules/**']`，避免类型检查触达子模块。
  - 子模块不引用 SDK，统一走主工程 API。
- 路由与隔离：
  - 维持 `/standard-editor` 与 `/test-nanocanvas` 的固定全屏容器；在容器内挂载 ShadowRoot。

## 验证
- 视觉：对比 Toolbar/AIPanel 样式与交互；确认无主工程 Tailwind 基础层影响。
- 功能：Select/Move/Draw/Rect/Circle/Text 均可用；AIPanel 模型芯片、页签、发送按钮行为一致。
- API：图片/视频生成调用主工程端点成功，Gallery 正常更新。

## 交付
- 增加 Shadow DOM 挂载实现的代码与说明（不改子模块业务逻辑）。
- 提供验证截图与说明；保留 iframe 方案作为后备（如未来需要极致隔离）。