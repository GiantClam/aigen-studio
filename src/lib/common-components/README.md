# 通用组件库

这个通用组件库包含了以下功能模块：

## 功能模块

### 1. Cloudflare R2 存储 (`storage/r2-storage.ts`)
- 文件上传（支持 File、Buffer、Base64）
- 文件删除
- 预签名 URL 生成
- 文件存在性检查

### 2. Stripe 支付服务 (`payment/stripe-service.ts`)
- 创建支付会话
- 创建支付意图
- Webhook 签名验证

### 3. RunningHub API (`api/runninghub-api.ts`)
- 创建任务
- 获取任务状态
- 取消任务

### 4. 图片生成任务管理 (`tasks/image-task-manager.ts`)
- 创建图片生成任务
- 任务状态管理
- 与 RunningHub 集成

## 使用方法

### R2 存储

#### 服务器端使用

```typescript
import { R2StorageService } from '@/lib/common-components'

const storage = new R2StorageService({
  accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID!,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
  publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
})

// 上传文件
const result = await storage.uploadFile(file, 'image.png', 'uploads')

// 生成预签名上传 URL（用于前端直接上传）
const uploadUrl = await storage.getPresignedUploadUrl('uploads/image.png', 'image/png', file.size)
```

#### 客户端使用（大文件直接上传）

```typescript
import { smartUploadToR2, uploadFileDirectToR2 } from '@/utils/r2-direct-upload'

// 方式 1: 智能上传（自动选择最佳方式）
const result = await smartUploadToR2(file, 'uploads', (progress) => {
  console.log(`上传进度: ${progress}%`)
})

// 方式 2: 直接上传（使用预签名 URL，不经过服务器）
const result = await uploadFileDirectToR2(file, 'uploads', (progress) => {
  console.log(`上传进度: ${progress}%`)
})
```

#### 上传方式选择

- **小文件（<10MB）**: 使用 `uploadFileToR2()` 通过 Next.js API 上传
- **中等文件（10-100MB）**: 使用 `uploadFileDirectToR2()` 直接上传到 R2
- **大文件（>100MB）**: 使用 `uploadFileChunkedToR2()` 分块上传
- **自动选择**: 使用 `smartUploadToR2()` 自动选择最佳方式

### Stripe 支付

```typescript
import { StripeService } from '@/lib/common-components'

const stripe = new StripeService({
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
})

// 创建支付会话
const session = await stripe.createCheckoutSession(10.00, 'usd')
```

### RunningHub API

```typescript
import { RunningHubAPIService } from '@/lib/common-components'

const runninghub = new RunningHubAPIService({
  apiKey: process.env.RUNNINGHUB_API_KEY!,
  baseUrl: process.env.RUNNINGHUB_BASE_URL!,
})

// 创建任务
const task = await runninghub.createTask('image_generation', {
  prompt: 'A beautiful sunset',
  model: 'gemini-3-pro-image-preview',
})
```

## 环境变量配置

请参考 `ENV.example` 文件中的配置说明。

## 注意事项

- R2 存储服务只能在服务器端使用（Next.js API Routes）
- 客户端应通过 API 路由来使用这些服务
- 确保所有必要的环境变量都已正确配置

