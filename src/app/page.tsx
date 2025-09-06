import Link from 'next/link'
import { Sparkles, Wand2, Image as ImageIcon, Zap, Star, ArrowRight, Palette, Edit3, Layers, Type, Brush, Shapes, Play, Users, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Image Editor</h1>
                <p className="text-xs text-gray-500">智能图像编辑平台</p>
              </div>
            </div>
            
            <Link
              href="/standard-editor"
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>开始编辑</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              <span>基于 Google Vertex AI 技术</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AI 驱动的
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                智能图像编辑
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              使用最先进的 Gemini 2.5 Flash Image Preview 模型，为创作者提供专业级的 AI 图像处理体验
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/standard-editor"
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-semibold"
            >
              <Wand2 className="w-5 h-5" />
              <span>立即开始编辑</span>
            </Link>
            <button className="flex items-center justify-center space-x-2 px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg border border-gray-200 text-lg font-semibold">
              <ImageIcon className="w-5 h-5" />
              <span>查看示例</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              强大的 AI 功能
            </h2>
            <p className="text-xl text-gray-600">
              体验下一代图像编辑技术
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI 图像生成</h3>
              <p className="text-gray-600">
                使用自然语言描述，AI 将为您生成高质量的图像内容
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">智能图像编辑</h3>
              <p className="text-gray-600">
                选择图像中的任意对象，AI 将根据您的描述进行精确编辑
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">实时处理</h3>
              <p className="text-gray-600">
                基于 Google Vertex AI 的强大算力，提供快速的图像处理体验
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="examples" className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Gemini 2.5 Flash Image 能力展示
            </h2>
            <p className="text-xl text-gray-600">
              探索 Google 最先进的多模态图像模型的强大功能
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-6xl">📸</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">照片级真实场景</h3>
                <p className="text-gray-600 mb-4">生成具有精确相机角度、光照和精细细节的惊人照片级真实图像。</p>
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500 mb-4">
                  <p className="text-sm text-gray-700 italic">
                    &ldquo;一位年长的日本陶艺师的照片级特写肖像，深深的皱纹和温暖的笑容，在阳光充足的工作室里检查茶碗。柔和的黄金时光照明，85mm镜头，散景背景。&rdquo;
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">肖像</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">光照</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">专业</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
                <span className="text-6xl">✏️</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">自然语言编辑</h3>
                <p className="text-gray-600 mb-4">使用简单的文本命令编辑图像。自然地添加、删除或修改元素。</p>
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-pink-500 mb-4">
                  <p className="text-sm text-gray-700 italic">
                    &ldquo;使用提供的我的猫的图像，请在它的头上添加一顶小的针织巫师帽。让它看起来舒适并与柔和的光线相匹配。&rdquo;
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">添加元素</span>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">移除对象</span>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">风格转换</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-6xl">👤</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">角色一致性</h3>
                <p className="text-gray-600 mb-4">在多个图像中保持相同的角色，用于故事叙述和品牌建设。</p>
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-cyan-500 mb-4">
                  <p className="text-sm text-gray-700 italic">
                    &ldquo;显示前一张图像中的同一个角色现在坐在舒适的咖啡店里，读着一本书。保持相同的面部特征和服装风格。&rdquo;
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">故事叙述</span>
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">品牌</span>
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">一致性</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              专业编辑工具
            </h2>
            <p className="text-xl text-gray-600">
              完整的图像编辑工具套件，满足所有创作需求
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">选择工具</h3>
              <p className="text-sm text-gray-600">选择、移动和变换对象</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brush className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">画笔工具</h3>
              <p className="text-sm text-gray-600">自由绘制和涂鸦</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Type className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">文本工具</h3>
              <p className="text-sm text-gray-600">添加和编辑文本内容</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shapes className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">形状工具</h3>
              <p className="text-sm text-gray-600">创建矩形、圆形等形状</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              强大的技术支持
            </h2>
            <p className="text-xl text-indigo-100">
              基于 Google 最先进的 AI 技术
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">多模态</div>
              <div className="text-indigo-200">原生架构</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">$0.039</div>
              <div className="text-indigo-200">每张图片</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">实时</div>
              <div className="text-indigo-200">生成速度</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">Google AI</div>
              <div className="text-indigo-200">技术驱动</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold">AI Image Editor</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 AI Image Editor. Powered by Google Vertex AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
