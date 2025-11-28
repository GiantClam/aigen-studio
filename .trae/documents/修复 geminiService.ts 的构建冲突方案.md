## 问题概述
- 子模块 `submodules/nanocanvas/services/geminiService.ts` 直接 `import '@google/genai'`，主工程不安装该 SDK 时，Next.js 类型/模块解析会报错。
- 即便该文件未被运行时引入，Next 的类型检查或构建扫描仍可能触达子模块源码，导致构建失败。

## 解决策略（二选一，建议优先方案A）
### 方案A：保留独立能力，避免主工程构建触达
1. 运行时分离：仅在“独立模式”（Vite/Standalone）使用 `geminiService.ts`，在主工程集成模式使用 `aiService.ts`（调用主工程 `/api/ai/*`）。
2. 动态引入SDK：把 `geminiService.ts` 中的 `import { GoogleGenAI } from '@google/genai'` 改为函数内部动态导入：`const { GoogleGenAI }: any = await import('@google/genai')`，并在入口通过 `process.env.NANOCANVAS_RUNTIME==='standalone'` 或 `typeof window!=='undefined'` 才执行；这样避免静态模块解析。
3. 文件隔离：将 `geminiService.ts` 重命名为 `geminiService.standalone.ts`，并确保主路径（`App.tsx`）在主工程集成时不引用该文件，仅引用 `services/aiService.ts`。
4. 类型检查隔离：主工程 `tsconfig.json` 已排除 `submodules/**`，确保 Next 不对独立文件做类型检查；继续保持这一设置。

### 方案B：移除SDK路径（更彻底但影响独立运行）
1. 直接删除或注释掉 `geminiService.ts` 的 SDK 引入与相关逻辑，统一改为 REST/主工程 API 调用；
2. 影响：子模块在纯独立运行场景将失去直接使用 SDK 的能力，需通过后端代理或提供 API 才能工作。

## 具体改动点（按方案A）
- `submodules/nanocanvas/services/geminiService.ts`
  - 将顶层静态 `import '@google/genai'` 改为函数内部动态导入，并在独立模式判定后使用。
  - 若处于主工程（Next）集成模式，不触发该动态导入，改走 `aiService.ts`。
- `submodules/nanocanvas/App.tsx`
  - 确认仅引用 `services/aiService.ts`（主工程路径），而不是 `geminiService.ts`；保留独立运行时的入口文件 `index.tsx` 指向 standalone 配置。
- 主工程 `tsconfig.json`
  - 保持 `exclude: ['submodules/**']`，避免类型检查扫描子模块源码。

## 验证
- 在主工程模式下：`npm run dev` 编译通过，`/standard-editor`、`/test-nanocanvas` 正常；不再出现 `@google/genai` 模块未找到错误。
- 在独立模式下（Vite 运行子模块）：动态导入 SDK 正常，`geminiService.standalone.ts` 被使用，功能可用。

## 交付
- 提交上述修改，注明两种运行模式的差异与配置方法（环境变量/入口文件）。
- 保留子模块的独立能力，同时主工程不再需要引入 Google SDK。