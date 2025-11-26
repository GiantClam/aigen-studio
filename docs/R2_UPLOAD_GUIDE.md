# R2 大文件上传指南

## 概述

本项目支持两种 R2 文件上传方式：

1. **通过 Next.js API 上传**：适用于小文件（<10MB），文件经过服务器
2. **直接上传到 R2**：适用于大文件（>=10MB），使用预签名 URL，文件不经过服务器

## 快速开始

### 基本使用

```typescript
import { smartUploadToR2 } from '@/utils/r2-upload'

const file = // ... 获取文件

// 自动选择最佳上传方式
const result = await smartUploadToR2(file, 'uploads', (progress) => {
  console.log(`上传进度: ${progress}%`)
})

console.log('文件 URL:', result.url)
```

### 直接上传（大文件）

```typescript
import { uploadFileDirectToR2 } from '@/utils/r2-direct-upload'

const file = // ... 获取文件

// 直接上传到 R2，不经过服务器
const result = await uploadFileDirectToR2(file, 'uploads', (progress) => {
  console.log(`上传进度: ${progress}%`)
})
```

## 上传方式对比

| 方式 | 适用文件大小 | 是否经过服务器 | 优势 |
|------|------------|--------------|------|
| API 上传 | <10MB | 是 | 简单，支持 Base64 |
| 直接上传 | >=10MB | 否 | 速度快，不占用服务器带宽 |
| 分块上传 | >100MB | 否 | 支持超大文件，有进度反馈 |

## API 说明

### 1. 智能上传（推荐）

```typescript
smartUploadToR2(
  file: File | string,
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult>
```

自动根据文件大小选择最佳上传方式。

### 2. 直接上传

```typescript
uploadFileDirectToR2(
  file: File,
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<DirectUploadResult>
```

使用预签名 URL 直接上传到 R2。

### 3. 分块上传

```typescript
uploadFileChunkedToR2(
  file: File,
  folder?: string,
  chunkSize?: number,
  onProgress?: (progress: number) => void
): Promise<DirectUploadResult>
```

分块上传超大文件，支持进度反馈。

## 工作流程

### 直接上传流程

1. **前端请求预签名 URL**
   ```
   POST /api/storage/r2/presigned
   Body: { fileName, folder, contentType, fileSize }
   ```

2. **服务端生成预签名 URL**
   - 使用 R2StorageService.getPresignedUploadUrl()
   - 返回上传 URL 和文件路径

3. **前端直接上传到 R2**
   - 使用预签名 URL PUT 文件
   - 不经过 Next.js 服务器

### 流程图

```
前端 → 请求预签名 URL → Next.js API
                          ↓
                    生成预签名 URL
                          ↓
前端 ← 返回预签名 URL ← Next.js API
  ↓
直接上传到 R2（PUT 请求）
  ↓
上传完成，返回文件 URL
```

## 配置要求

### 环境变量

```bash
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.r2.dev  # 可选
```

### R2 Bucket 配置

1. **CORS 配置**：允许前端直接上传
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

2. **公开访问**（可选）：如果使用公开 URL
   - 在 R2 设置中启用公开访问
   - 或配置自定义域名

## 错误处理

```typescript
try {
  const result = await smartUploadToR2(file, 'uploads', (progress) => {
    console.log(`上传进度: ${progress}%`)
  })
  console.log('上传成功:', result.url)
} catch (error) {
  if (error instanceof Error) {
    console.error('上传失败:', error.message)
    // 处理特定错误
    if (error.message.includes('presigned')) {
      // 预签名 URL 生成失败
    } else if (error.message.includes('Upload failed')) {
      // 上传失败
    }
  }
}
```

## 最佳实践

1. **小文件（<10MB）**：使用 `smartUploadToR2()`，自动通过 API 上传
2. **中等文件（10-100MB）**：使用 `uploadFileDirectToR2()`，直接上传
3. **大文件（>100MB）**：使用 `uploadFileChunkedToR2()`，分块上传
4. **进度反馈**：始终提供 `onProgress` 回调以改善用户体验
5. **错误处理**：使用 try-catch 处理上传错误
6. **文件验证**：在上传前验证文件类型和大小

## 示例代码

### React 组件示例

```typescript
import { useState } from 'react'
import { smartUploadToR2 } from '@/utils/r2-upload'

function FileUpload() {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setProgress(0)

    try {
      const result = await smartUploadToR2(
        file,
        'uploads',
        (progress) => setProgress(progress)
      )
      console.log('上传成功:', result.url)
    } catch (error) {
      console.error('上传失败:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
        }}
        disabled={uploading}
      />
      {uploading && (
        <div>
          <progress value={progress} max={100} />
          <span>{progress}%</span>
        </div>
      )}
    </div>
  )
}
```

## 常见问题

### Q: 预签名 URL 有效期多久？
A: 默认 1 小时，可以在 API 中配置。

### Q: 支持断点续传吗？
A: 当前实现不支持，但可以通过 R2 的 Multipart Upload API 实现。

### Q: 上传速度慢怎么办？
A: 确保使用直接上传方式，文件不经过服务器。检查网络连接和 R2 区域设置。

### Q: 如何限制文件大小？
A: 在上传前检查文件大小，或使用 API 路由中的文件大小限制。

## 相关文件

- `src/lib/common-components/storage/r2-storage.ts` - R2 存储服务
- `src/app/api/storage/r2/presigned/route.ts` - 预签名 URL API
- `src/utils/r2-direct-upload.ts` - 直接上传工具函数
- `src/utils/r2-upload.ts` - 通用上传工具函数

