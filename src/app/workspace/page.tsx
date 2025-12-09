'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/lib/slug-utils'
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar'
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader'
import { CanvasCard } from '@/components/workspace/CanvasCard'
import { listUserCanvases, createCanvasForUser, updateCanvasTitle, deleteCanvas, fetchLastTaskStatusByCanvasIds } from '@/services/workspace-service'
import { fetchTemplates, toggleTemplateFavorite, fetchUserFavoriteTemplates, fetchTemplateCategories, fetchTemplatesByCategory } from '@/services/template-service'
import { 
  Sparkles, 
  Palette,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import LoginDialog from '@/components/LoginDialog'
import { Badge } from '@/components/ui/badge'

interface Canvas {
  id: string
  title: string
  type: 'template'
  thumbnail?: string
  lastModified: string
  isNew?: boolean
  taskStatus?: 'pending' | 'in_progress' | 'failed' | 'succeeded'
  description?: string
  rating?: number
  ratingCount?: number
  usageCount?: number
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime?: number
  authorName?: string
  tags?: string[]
  isFavorited?: boolean
}

interface Template {
  id: string
  name: string
  image_url: string
  prompt: string
  type: string
  description?: string
  category_id?: string
  tags?: string[]
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
  estimated_time?: number
  is_featured?: boolean
  usage_count?: number
  rating?: number
  rating_count?: number
  author_name?: string
  updated_at: string
}

export default function WorkspacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('templates')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [canvases, setCanvases] = useState<Canvas[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [myCanvases, setMyCanvases] = useState<Canvas[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [favoriteTemplateIds, setFavoriteTemplateIds] = useState<Set<string>>(new Set())
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [userPoints, setUserPoints] = useState<number | null>(null)

  // 加载模板画布数据和用户收藏
  useEffect(() => {
    const load = async () => {
      const userId = (session?.user as any)?.id as string | undefined
      
      // 加载模板数据
      const response = await fetchTemplates()
      const publicTemplates = response.data
      setTemplates(publicTemplates)
      // 加载分类
      const cats = await fetchTemplateCategories()
      setCategories(cats.map(c => ({ id: c.id, name: c.name })))
      
      // 加载用户收藏（如果已登录）
      if (userId) {
        const favorites = await fetchUserFavoriteTemplates(userId)
        setFavoriteTemplateIds(new Set(favorites.map(t => t.id)))
      }
      
      if (!userId) {
        const templateCanvases: Canvas[] = publicTemplates.map((tpl: Template) => ({
          id: tpl.id,
          title: tpl.name,
          type: 'template',
          thumbnail: tpl.image_url,
          lastModified: new Date(tpl.updated_at).toLocaleString(),
          description: tpl.description,
          rating: tpl.rating || 0,
          ratingCount: tpl.rating_count || 0,
          usageCount: tpl.usage_count || 0,
          difficultyLevel: tpl.difficulty_level || 'beginner',
          estimatedTime: tpl.estimated_time || 15,
          authorName: tpl.author_name || 'AI设计师',
          tags: tpl.tags || [],
          isFavorited: favoriteTemplateIds.has(tpl.id)
        }))
        let localCanvases: Canvas[] = []
        try {
          const raw = typeof window !== 'undefined' ? localStorage.getItem('nc_projects') : null
          if (raw) {
            const projects = JSON.parse(raw)
            localCanvases = (projects || []).map((p: any) => ({
              id: `local-${p.id}`,
              title: p.name || '未命名画布',
              type: 'template' as const,
              thumbnail: p.thumbnail,
              lastModified: new Date(p.updatedAt || Date.now()).toLocaleString()
            }))
          }
        } catch {}
        setMyCanvases(localCanvases)
        setCanvases(templateCanvases)
        return
      }
      
      // 已登录用户：加载用户画布和模板
      const userCanvases = await listUserCanvases(userId)
      
      const userCanvasCards: Canvas[] = userCanvases.map((r) => ({
        id: r.id,
        title: r.canvas_title || '未命名画布',
        type: 'template' as const,
        lastModified: new Date(r.updated_at).toLocaleString(),
        difficultyLevel: 'beginner' as const,
        estimatedTime: 15,
        authorName: '我'
      }))
      let templateCanvases: Canvas[] = [
        ...publicTemplates.map((tpl: Template) => ({
          id: tpl.id,
          title: tpl.name,
          type: 'template' as const,
          thumbnail: tpl.image_url,
          lastModified: new Date(tpl.updated_at).toLocaleString(),
          description: tpl.description,
          rating: tpl.rating || 0,
          ratingCount: tpl.rating_count || 0,
          usageCount: tpl.usage_count || 0,
          difficultyLevel: tpl.difficulty_level || 'beginner',
          estimatedTime: tpl.estimated_time || 15,
          authorName: tpl.author_name || 'AI设计师',
          tags: tpl.tags || [],
          isFavorited: favoriteTemplateIds.has(tpl.id)
        }))
      ]
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('nc_projects') : null
        if (raw) {
          const projects = JSON.parse(raw)
          const localCanvases: Canvas[] = (projects || []).map((p: any) => ({
            id: `local-${p.id}`,
            title: p.name || '未命名画布',
            type: 'template' as const,
            thumbnail: p.thumbnail,
            lastModified: new Date(p.updatedAt || Date.now()).toLocaleString()
          }))
          setMyCanvases([...localCanvases, ...userCanvasCards])
        } else {
          setMyCanvases(userCanvasCards)
        }
      } catch {}
      setCanvases(templateCanvases)

      const statuses = await fetchLastTaskStatusByCanvasIds(userCanvases.map(r => r.id))
      setCanvases(prev => prev.map(c => ({ 
        ...c, 
        taskStatus: statuses[c.id]?.status as any || c.taskStatus
      })))
      setMyCanvases(prev => prev.map(c => ({
        ...c,
        taskStatus: statuses[c.id]?.status as any || c.taskStatus
      })))
    }
    
    load()
  }, [session, favoriteTemplateIds])

  useEffect(() => {
    const run = async () => {
      if (status !== 'authenticated') return
      try {
        const r1 = await fetch('/api/points', { method: 'GET' })
        if (r1.ok) {
          const j = await r1.json()
          if (j?.success && j?.data?.current_points != null) setUserPoints(j.data.current_points)
        }
        const r2 = await fetch('/api/points', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'daily_login' }) })
        if (r2.ok) {
          const j2 = await r2.json()
          if (j2?.data?.message) {
            window.dispatchEvent(new CustomEvent('global-toast', { detail: { message: j2.data.message, type: 'success' } }))
          }
          const r3 = await fetch('/api/points', { method: 'GET' })
          if (r3.ok) {
            const j3 = await r3.json()
            if (j3?.success && j3?.data?.current_points != null) setUserPoints(j3.data.current_points)
          }
        } else {
          try {
            const jErr = await r2.json()
            if (jErr?.error) {
              window.dispatchEvent(new CustomEvent('global-toast', { detail: { message: String(jErr.error), type: 'info' } }))
            }
          } catch {}
        }
      } catch {}
    }
    run()
  }, [status])

  // 首次进入 workspace 的引导弹窗（可关闭）
  useEffect(() => {
    try {
      const key = 'workspace_onboarding_seen'
      const seen = typeof window !== 'undefined' ? localStorage.getItem(key) : '1'
      if (!seen) {
        setShowOnboarding(true)
        localStorage.setItem(key, '1')
      }
    } catch {}
  }, [])

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  const filteredCanvases = canvases.filter(canvas => {
    const matchesSearch = canvas.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         canvas.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         canvas.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })
  const filteredMyCanvases = myCanvases.filter(canvas => {
    const matchesSearch = canvas.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         canvas.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         canvas.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  const handleCreateCanvas = async (data: any) => {
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) {
      // 匿名：不持久化，仅临时跳转编辑器
      const id = `local-${crypto.randomUUID()}`
      router.push(`/standard-editor`)
      return
    }
    // 已登录：云端创建
    const created = await createCanvasForUser({ userId, title: data.name, type: 'template' })
    if (created) {
      const newCanvas: Canvas = {
        id: created.id,
        title: created.canvas_title || data.name,
        type: 'template',
        lastModified: '刚刚',
        isNew: true,
        difficultyLevel: 'beginner',
        estimatedTime: 15,
        authorName: '我'
      }
      setCanvases([newCanvas, ...canvases])
      router.push(`/standard-editor`)
  }
  }

  const quickCreateCanvas = async () => {
    const userId = (session?.user as any)?.id as string | undefined
    const name = '未命名画布'
    if (!userId) {
      const id = `local-${crypto.randomUUID()}`
      router.push(`/standard-editor`)
      return
    }
    const created = await createCanvasForUser({ userId, title: name, type: 'template' })
    if (created) {
      const newCanvas: Canvas = {
        id: created.id,
        title: created.canvas_title || name,
        type: 'template',
        lastModified: '刚刚',
        isNew: true,
        difficultyLevel: 'beginner',
        estimatedTime: 15,
        authorName: '我'
      }
      setCanvases([newCanvas, ...canvases])
      router.push(`/standard-editor`)
    }
  }

  const handleOpenCanvas = (canvasId: string) => {
    // 如果点击的是模板项，跳到模板详情（slug）
    const tpl = templates.find(t => t.id === canvasId)
    if (tpl) {
      const slug = generateSlug(tpl.name)
      router.push(`/templates/${slug}`)
      return
    }
    // 否则视为用户画布，进入编辑器
    if (canvasId.startsWith('local-')) {
      const pid = canvasId.replace('local-', '')
      router.push(`/standard-editor?localProjectId=${pid}`)
      return
    }
    router.push(`/standard-editor?canvasId=${canvasId}&tpl=template`)
  }

  const handleToggleFavorite = async (templateId: string) => {
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) {
      setLoginOpen(true)
      return
    }
    
    const success = await toggleTemplateFavorite(userId, templateId)
    if (success) {
      // 更新本地状态
      const newFavoriteIds = new Set(favoriteTemplateIds)
      if (newFavoriteIds.has(templateId)) {
        newFavoriteIds.delete(templateId)
      } else {
        newFavoriteIds.add(templateId)
      }
      setFavoriteTemplateIds(newFavoriteIds)
      
      // 更新画布列表中的收藏状态
      setCanvases(prev => prev.map(canvas => 
        canvas.id === templateId 
          ? { ...canvas, isFavorited: !canvas.isFavorited }
          : canvas
      ))
    }
  }

  const handleRename = async (id: string) => {
    if (!session) { setLoginOpen(true); return }
    const current = canvases.find(c => c.id === id)
    setRenamingId(id)
    setRenameValue(current?.title || '')
  }

  const confirmRename = async () => {
    if (!renamingId || !renameValue.trim()) { setRenamingId(null); return }
    const ok = await updateCanvasTitle(renamingId, renameValue.trim())
    if (ok) {
      setCanvases(prev => prev.map(c => c.id === renamingId ? { ...c, title: renameValue.trim() } : c))
    }
    setRenamingId(null)
    setRenameValue('')
  }

  const handleDelete = async (id: string) => {
    if (!session) { setLoginOpen(true); return }
    const ok = await deleteCanvas(id)
    if (ok) setCanvases(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <WorkspaceSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onCreateCanvas={quickCreateCanvas}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <WorkspaceHeader 
          onCreateCanvas={quickCreateCanvas}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          userPoints={userPoints ?? undefined}
        />
        
        <div className="flex-1 overflow-y-auto p-8">
          {/* Quick Actions */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center">
                <Palette className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-xl font-medium text-gray-900">模板画布创作</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: '模板快速创建', desc: '专业效果轻松获得', color: 'bg-orange-50 border-orange-100 hover:bg-orange-100', iconColor: 'text-orange-600', action: () => quickCreateCanvas() }
              ].map((action, index) => {
                return (
                  <button
                    key={index}
                    className={`p-4 rounded-xl border ${action.color} transition-all duration-200 hover:shadow-sm flex flex-col items-start gap-3 text-left group`}
                    onClick={action.action}
                  >
                    <div className={`p-2 rounded-lg bg-white border shadow-sm ${action.iconColor} group-hover:shadow`}>
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">我的画布</h2>
              </div>
            </div>
            {filteredMyCanvases.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {filteredMyCanvases.map((canvas) => (
                  <CanvasCard 
                    key={`my-${canvas.id}`} 
                    {...canvas} 
                    onOpen={handleOpenCanvas} 
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">暂无我的画布</div>
            )}
          </div>

          {/* Featured Templates */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">精选模板</h2>
              </div>
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {templates.filter(t => t.is_featured).slice(0, 8).map((tpl) => (
                <CanvasCard
                  key={`featured-${tpl.id}`}
                  id={tpl.id}
                  title={tpl.name}
                  type={'template'}
                  thumbnail={tpl.image_url}
                  lastModified={new Date(tpl.updated_at).toLocaleString()}
                  description={tpl.description}
                  rating={tpl.rating || 0}
                  ratingCount={tpl.rating_count || 0}
                  usageCount={tpl.usage_count || 0}
                  difficultyLevel={tpl.difficulty_level || 'beginner'}
                  estimatedTime={tpl.estimated_time || 15}
                  authorName={tpl.author_name || 'AI设计师'}
                  tags={tpl.tags || []}
                  isFavorited={favoriteTemplateIds.has(tpl.id)}
                  onOpen={handleOpenCanvas}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              className={`px-3 py-1.5 text-xs rounded-md border ${!activeCategory ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              onClick={async () => {
                setActiveCategory(null)
                const response = await fetchTemplates()
                setTemplates(response.data)
              }}
            >全部</button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`px-3 py-1.5 text-xs rounded-md border ${activeCategory === c.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                onClick={async () => {
                  setActiveCategory(c.id)
                  const byCat = await fetchTemplatesByCategory(c.id)
                  setTemplates(byCat)
                }}
              >{c.name}</button>
            ))}
          </div>

          {/* Template Canvas Gallery */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center">
                  <Palette className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-xl font-medium text-gray-900">模板画布库</h2>
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0 rounded-md px-2 py-1">{filteredCanvases.length}</Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900" onClick={() => router.push('/templates')}>
                查看全部
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {filteredCanvases.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {filteredCanvases.map((canvas) => (
                  <CanvasCard 
                    key={canvas.id} 
                    {...canvas} 
                    onOpen={handleOpenCanvas} 
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">还没有模板画布</h3>
                <p className="text-gray-500 mb-6">创建你的第一个模板画布，开始 AI 创作吧</p>
                <Button 
                  onClick={quickCreateCanvas}
                  className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  创建画布
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      

      {/* 重命名弹窗 */}
      {renamingId && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRenamingId(null)} />
          <div className="relative z-10 w-[360px] max-w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
            <div className="text-sm font-medium text-gray-900 mb-2">重命名画布</div>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setRenamingId(null)}>取消</Button>
              <Button size="sm" className="bg-gray-900 hover:bg-gray-800" onClick={confirmRename}>保存</Button>
            </div>
          </div>
        </div>
      )}

      {/* 登录弹窗（匿名用户执行写操作时触发） */}
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* 首次进入引导弹窗（可关闭） */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowOnboarding(false)} />
          <div className="relative z-10 w-[460px] max-w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900">欢迎来到模板画布工作区</h3>
              <p className="text-sm text-gray-600 mt-1">创建你的第一个模板画布，开始 AI 创作之旅。</p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowOnboarding(false)}>稍后再说</Button>
              <Button className="bg-gray-900 hover:bg-gray-800" onClick={async () => {
                setShowOnboarding(false)
                await quickCreateCanvas()
              }}>创建画布</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
