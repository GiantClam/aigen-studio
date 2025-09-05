'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Save, FolderOpen, Trash2, Eye, EyeOff, Plus } from 'lucide-react'

interface Project {
  id: string
  title: string
  description?: string
  thumbnail?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

interface ProjectManagerProps {
  currentImageData?: string
  currentCanvasData?: string
  onLoadProject?: (project: any) => void
}

export function ProjectManager({
  currentImageData,
  currentCanvasData,
  onLoadProject
}: ProjectManagerProps) {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveTitle, setSaveTitle] = useState('')
  const [saveDescription, setSaveDescription] = useState('')
  const [saveIsPublic, setSaveIsPublic] = useState(false)

  useEffect(() => {
    if (session) {
      loadProjects()
    }
  }, [session])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveProject = async () => {
    if (!saveTitle.trim() || !currentImageData) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: saveTitle,
          description: saveDescription,
          imageData: currentImageData,
          canvasData: currentCanvasData,
          isPublic: saveIsPublic
        })
      })

      if (response.ok) {
        setSaveTitle('')
        setSaveDescription('')
        setSaveIsPublic(false)
        setShowSaveDialog(false)
        loadProjects()
      }
    } catch (error) {
      console.error('Failed to save project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        onLoadProject?.(data.project)
      }
    } catch (error) {
      console.error('Failed to load project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!confirm('确定要删除这个项目吗？')) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadProjects()
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60 mb-4">请先登录以保存和管理您的作品</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 保存按钮 */}
      <button
        onClick={() => setShowSaveDialog(true)}
        disabled={!currentImageData || isLoading}
        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded-xl transition-colors"
      >
        <Save className="w-4 h-4" />
        <span>保存作品</span>
      </button>

      {/* 项目列表 */}
      <div className="space-y-2">
        <h3 className="text-white font-semibold flex items-center space-x-2">
          <FolderOpen className="w-4 h-4" />
          <span>我的作品</span>
        </h3>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-white/60 text-sm py-4 text-center">暂无保存的作品</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{project.title}</h4>
                    {project.description && (
                      <p className="text-white/60 text-xs truncate">{project.description}</p>
                    )}
                    <p className="text-white/40 text-xs">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    {project.isPublic ? (
                      <Eye className="w-3 h-3 text-green-400" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-gray-400" />
                    )}
                    
                    <button
                      onClick={() => loadProject(project.id)}
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <FolderOpen className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 保存对话框 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 border border-white/20">
            <h3 className="text-white font-semibold mb-4">保存作品</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">作品标题</label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="输入作品标题..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm mb-2">描述（可选）</label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="描述您的作品..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={saveIsPublic}
                  onChange={(e) => setSaveIsPublic(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isPublic" className="text-white/80 text-sm">
                  公开作品
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={saveProject}
                disabled={!saveTitle.trim() || isLoading}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded-lg transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
