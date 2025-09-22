'use client'

import { useState, useEffect } from 'react'
import { Upload, X, Check, AlertCircle } from 'lucide-react'

interface TemplateType {
  key: string
  value: string
  label: string
}

interface UploadResponse {
  success: boolean
  data?: {
    id: string
    name: string
    image_url: string
    prompt: string
    type: string
    created_at: string
  }
  error?: string
}

interface TemplateUploadProps {
  onSuccess?: (template: any) => void
  onClose?: () => void
}

export default function TemplateUpload({ onSuccess, onClose }: TemplateUploadProps) {
  const [formData, setFormData] = useState({
    name: '',
    prompt: '',
    type: 'TEXT_TO_IMAGE',
    image: null as File | null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [templateTypes, setTemplateTypes] = useState<TemplateType[]>([])
  const [supportedImageTypes, setSupportedImageTypes] = useState<string[]>([])
  const [maxFileSize, setMaxFileSize] = useState(0)

  // 加载配置信息
  useEffect(() => {
    fetch('/api/templates/upload')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTemplateTypes(data.data.types)
          setSupportedImageTypes(data.data.supportedImageTypes)
          setMaxFileSize(data.data.maxFileSize)
        }
      })
      .catch(err => console.error('加载配置失败:', err))
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 验证文件类型
      if (!supportedImageTypes.includes(file.type)) {
        setError(`不支持的图片格式。支持格式: ${supportedImageTypes.join(', ')}`)
        return
      }
      
      // 验证文件大小
      if (file.size > maxFileSize) {
        setError(`图片文件过大。最大支持: ${Math.round(maxFileSize / 1024 / 1024)}MB`)
        return
      }
      
      setFormData(prev => ({
        ...prev,
        image: file
      }))
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.prompt.trim() || !formData.image) {
      setError('请填写所有必需字段')
      return
    }

    setLoading(true)
    setError('')

    try {
      const submitData = new FormData()
      submitData.append('name', formData.name.trim())
      submitData.append('prompt', formData.prompt.trim())
      submitData.append('type', formData.type)
      submitData.append('image', formData.image)

      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        body: submitData
      })

      const result: UploadResponse = await response.json()

      if (result.success && result.data) {
        setSuccess(true)
        onSuccess?.(result.data)
        
        // 重置表单
        setTimeout(() => {
          setFormData({
            name: '',
            prompt: '',
            type: 'TEXT_TO_IMAGE',
            image: null
          })
          setSuccess(false)
        }, 2000)
      } else {
        setError(result.error || '上传失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
      console.error('上传错误:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)}MB`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">上传模板</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 模板名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              模板名称 *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="请输入模板名称"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* 提示词 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提示词 *
            </label>
            <textarea
              name="prompt"
              value={formData.prompt}
              onChange={handleInputChange}
              placeholder="请输入提示词内容"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* 模板类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              模板类型 *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {templateTypes.map(type => (
                <option key={type.key} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* 图片上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              封面图片 *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept={supportedImageTypes.join(',')}
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                required
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {formData.image ? formData.image.name : '点击选择图片'}
                </span>
                <span className="text-xs text-gray-500">
                  支持 {supportedImageTypes.join(', ')}，最大 {formatFileSize(maxFileSize)}
                </span>
              </label>
            </div>
            {formData.image && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                <Check className="w-4 h-4" />
                <span>已选择: {formData.image.name} ({formatFileSize(formData.image.size)})</span>
              </div>
            )}
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* 成功信息 */}
          {success && (
            <div className="flex items-center space-x-2 text-green-600 text-sm">
              <Check className="w-4 h-4" />
              <span>模板上传成功！</span>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.prompt.trim() || !formData.image}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>上传中...</span>
                </>
              ) : (
                <span>上传模板</span>
              )}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
