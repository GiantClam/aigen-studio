## 目标
- 将 `https://github.com/GiantClam/nanocanvas` 接入为 Git 子模块，作为项目的唯一 NanoCanvas 源。
- `/standard-editor` 与 `/test-nanocanvas` 使用子模块中的组件，AIPanel 和 Toolbar 的布局/交互与上游强一致。

## 实施步骤
### 添加子模块
- 在项目根添加子模块：
  - `git submodule add https://github.com/GiantClam/nanocanvas submodules/nanocanvas`
  - `git submodule update --init --recursive`
- 验证子模块目录结构（预期 `submodules/nanocanvas/src/` 内含 `App.tsx`、`types.ts` 及组件）。如路径不同，记录实际入口文件。

### 别名映射到子模块
- 更新 `tsconfig.json` 的路径别名：
  - 将 `@nanocanvas/*` 指向 `./submodules/nanocanvas/src/*`
- 保持页面中动态导入代码不变：
  - `src/pages/standard-editor.tsx` 和 `src/pages/test-nanocanvas.tsx` 使用 `dynamic(() => import('@nanocanvas/App'), { ssr: false })`。

### 移除本地定制影响
- 停用 `src/external/nanocanvas/*` 作为来源（保留文件但不再通过别名引用）。
- 删除或更新临时桥接文件（若已存在）：
  - `submodules/nanocanvas/src/App.tsx`、`submodules/nanocanvas/src/types.ts` 不再导向本地 external，改为真实子模块源。

### 路由隔离与样式
- 确认两路由页面包含顶层固定覆盖容器与高度样式，避免外围布局影响：
  - `html, body, #__next { height: 100% }`；容器 `fixed inset-0 z-[9999] isolate`。
- 如使用 App 路由包裹组件（`src/app/LayoutBody.tsx`），将 `/standard-editor` 纳入独立显示判断，避免页脚/容器干扰。
- 若出现样式冲突（Tailwind base 的 `border-border` 等），在 NanoCanvas 根容器下增加局部 reset，确保与上游一致的颜色/边框。

### 验证与对比
- 启动本地开发并验证：
  - `/standard-editor` 与 `/test-nanocanvas` 的 AIPanel/Toolbar 与 GitHub 上游一致：
    - 模型选择 UI（芯片与文案）、Tasks/Templates 页签、视口上下文开关
    - 工具栏按钮顺序与交互（Select/Move/Brush/Rect/Circle/Text、保存/下载/上传/删除等）
    - 右键上下文菜单、背景网格、对象控制点样式
- 若存在差异：
  - 检查是否仍引用本地 external 组件或有局部覆盖样式；
  - 校正导入路径与样式隔离后再次验证。

### 回滚与保障
- 如子模块接入后影响现有功能，可临时将 `@nanocanvas/*` 别名恢复到本地 external 路径，并记录差异点以逐项修复。

## 交付
- 完成子模块接入与别名切换；页面验证通过并截图对比关键 UI；提交变更清单与维护说明（含子模块更新命令与路径说明）。