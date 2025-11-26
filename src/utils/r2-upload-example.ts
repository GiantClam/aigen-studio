/**
 * R2 上传使用示例
 */

import { smartUploadToR2Direct, uploadFileDirectToR2, uploadFileChunkedToR2 } from './r2-direct-upload'

/**
 * 示例 1: 小文件上传（自动选择方式）
 */
export async function exampleSmallFileUpload() {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  const file = fileInput?.files?.[0]

  if (!file) return

  try {
    // 自动选择最佳上传方式
    const result = await smartUploadToR2Direct(file, 'uploads', (progress) => {
      console.log(`上传进度: ${progress.toFixed(2)}%`)
    })

    console.log('上传成功:', result)
    // result.url 是文件的公开访问 URL
  } catch (error) {
    console.error('上传失败:', error)
  }
}

/**
 * 示例 2: 大文件直接上传（使用预签名 URL）
 */
export async function exampleLargeFileDirectUpload() {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  const file = fileInput?.files?.[0]

  if (!file) return

  try {
    // 直接上传，不经过 Next.js 服务器
    const result = await uploadFileDirectToR2(file, 'uploads', (progress) => {
      console.log(`上传进度: ${progress.toFixed(2)}%`)
    })

    console.log('上传成功:', result)
  } catch (error) {
    console.error('上传失败:', error)
  }
}

/**
 * 示例 3: 超大文件分块上传
 */
export async function exampleChunkedUpload() {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  const file = fileInput?.files?.[0]

  if (!file) return

  try {
    // 分块上传，适用于超大文件
    const result = await uploadFileChunkedToR2(
      file,
      'uploads',
      10 * 1024 * 1024, // 10MB per chunk
      (progress) => {
        console.log(`上传进度: ${progress.toFixed(2)}%`)
        // 更新 UI 进度条
        const progressBar = document.getElementById('upload-progress')
        if (progressBar) {
          progressBar.style.width = `${progress}%`
        }
      }
    )

    console.log('上传成功:', result)
  } catch (error) {
    console.error('上传失败:', error)
  }
}

/**
 * 示例 4: 在 React 组件中使用
 * 
 * import { smartUploadToR2 } from '@/utils/r2-direct-upload'
 * 
 * function UploadComponent() {
 *   const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
 *     const file = event.target.files?.[0]
 *     if (!file) return
 * 
 *     try {
 *       const result = await smartUploadToR2(
 *         file,
 *         'uploads',
 *         (progress) => {
 *           // 更新状态
 *           console.log(`上传进度: ${progress}%`)
 *         }
 *       )
 * 
 *       console.log('文件上传成功:', result.url)
 *     } catch (error) {
 *       console.error('上传失败:', error)
 *     }
 *   }
 * 
 *   return (
 *     <input
 *       type="file"
 *       onChange={handleFileUpload}
 *       accept="image/*"
 *     />
 *   )
 * }
 */

