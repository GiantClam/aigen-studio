## 现状与差异定位
- 路由实现：`/standard-editor` 使用 Pages 路由文件 `src/pages/standard-editor.tsx:4,29–35`，通过动态加载 `@nanocanvas/App` 并覆盖全屏容器。
- 组件来源：当前 `@nanocanvas/*` 指向本地定制版 `src/external/nanocanvas/*`，而不是 GitHub 的上游仓库，这会导致 AIPanel/Toolbar 与上游不一致。
- 样式影响：全局样式 `src/app/globals.css:7–61` 会影响页面的默认颜色与边框；虽然编辑器容器有 `#nc-root` 的内联 reset，但仍可能受 Tailwind 基础层影响（如 `border-border`）。
- 布局包裹：App 路由的 `src/app/LayoutBody.tsx:8–14` 仅对 `/test-nanocanvas` 做了“独立显示”处理；若未来将 `/standard-editor` 切换到 App 路由，未独立处理会引入外围布局差异。
- 编辑器切面：当前本地 `AIPanel` 与 `Toolbar` 的实现与上游存在差异（模型选择 UI/页签/视口开关/工具项），并且 `App.tsx` 还包含 `Workspace` 视图切换逻辑（`src/external/nanocanvas/App.tsx:12–19,236–252`），与上游编辑器直达模式可能不同。

## 方案目标
- 以 GitHub 仓库为准，对 `AIPanel` 与 `Toolbar` 的布局、交互、文案强一致对齐。
- 保证 `/standard-editor` 与 `/test-nanocanvas` 两路由均加载相同的上游模块，且不受全局布局/样式干扰。

## 实施步骤
1. 子模块接入（来源统一到上游）
- 添加 Git 子模块：将 GitHub 上的 `nanocanvas` 仓库接入到 `submodules/nanocanvas`。
- 将 `tsconfig.json` 中的别名 `@nanocanvas/*` 指向 `./submodules/nanocanvas/src/*`，替换当前指向 `src/external/nanocanvas/*` 的本地定制路径。
- 保留 Pages 路由中对 `@nanocanvas/App` 的动态导入，不改动调用侧代码。

2. 路由与隔离
- `/standard-editor` 与 `/test-nanocanvas` 保持覆盖容器（`fixed inset-0 z-[9999] isolate`）与 `html, body, #__next { height: 100% }` 样式，确保不受外围布局影响（参考 `src/pages/standard-editor.tsx:29–33`）。
- 若切换到 App 路由版本的 `/standard-editor`，在 `src/app/LayoutBody.tsx` 将独立判断扩展为 `pathname?.startsWith('/standard-editor')`，避免被页脚/容器包裹。

3. 组件强一致对齐
- 完全采用上游子模块内的 `AIPanel` 与 `Toolbar` 组件实现，移除本地定制差异（例如 `compact` 属性、Move 工具的非上游交互、不同的模型标签文案等）。
- `App.tsx` 中的编辑器视图逻辑与上游保持一致：是否包含 `Workspace` 视图取决于上游实现；若上游为“编辑器直达”，则移除/关闭本地的 `workspace` 切换（`src/external/nanocanvas/App.tsx:12–19,236–252`）。
- 保持生成逻辑签名与上游一致。若上游支持视口上下文（如 `includeViewport`），则在调用侧按上游的 API 传参；否则移除本地扩展。

4. 样式一致与冲突排查
- 复核上游 `#nc-root` reset 及组件类名，确保不被全局 `@tailwind base` 的 `border-border` 等策略改变边框/颜色。
- 如果需要，限定编辑器根容器下的 CSS Scope（仅在子模块内提供），避免被项目 Tailwind 主题变量覆盖。

5. 验证与对比
- 本地启动后分别访问 `/standard-editor` 与 `/test-nanocanvas`，对比 GitHub 版的 AIPanel/Toolbar：
  - 模型选择 UI/文案、页签切换、按钮布局、工具项与交互一致；
  - 右键菜单、提示条与背景网格呈现一致；
  - 无全局 Footer/容器包裹导致的位移或阴影差异。
- 若仍出现差异，记录具体组件层级与 CSS 冲突（定位到类名与选择器），微调隔离策略。

## 变更点概览（按需执行）
- `tsconfig.json`：更新 `paths` 中的 `@nanocanvas/*` 指向子模块路径。
- `submodules/nanocanvas`：新增 Git 子模块（上游完整代码）。
- `src/app/LayoutBody.tsx`（仅在切换到 App 路由时）：添加 `/standard-editor` 的独立展示判断。
- 移除/停用 `src/external/nanocanvas/*` 的本地定制，改为纯上游实现。

## 交付
- 完成代码更新与验证，对齐结果截图/说明。
- 提供简要差异对照与后续维护建议（子模块更新流程说明）。

请确认以上方案，我将据此进行子模块接入与强一致对齐实现，并提交可验证的结果。