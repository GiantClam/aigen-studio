import Link from 'next/link'
import { Sparkles, Wand2, Image as ImageIcon, Zap, Star, ArrowRight, Palette, Type, Brush, Shapes } from 'lucide-react'
import TemplatesGrid from './templates-grid'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Top Navigation */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gemini Image Editor</h1>
                <p className="text-xs text-gray-500">gemini-2.5-image-preview (nano-banana)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="#templates" className="text-sm text-gray-700 hover:text-gray-900">Templates</Link>
              <Link href="#features" className="text-sm text-gray-700 hover:text-gray-900">Features</Link>
              <Link href="#guides" className="text-sm text-gray-700 hover:text-gray-900">Guides</Link>
              <Link
                href="/standard-editor"
                className="ml-2 flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.25),transparent_40%),radial-gradient(ellipse_at_bottom_left,rgba(147,51,234,0.25),transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              <span>Powered by gemini-2.5-image-preview (nano-banana)</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
              Fashionable Image Creation & Editing
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Faster · More Accurate · More Flexible</span>
            </h2>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Inspired by Pixlr’s modern visual design. Showcase differences and advantages with image-text cards. Supports single-image, multi-image, and text-to-image templates.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/standard-editor"
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-semibold"
              >
                <Wand2 className="w-5 h-5" />
                <span>Start Now</span>
              </Link>
              <a href="#templates" className="flex items-center justify-center space-x-2 px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg border border-gray-200 text-lg font-semibold">
                <ImageIcon className="w-5 h-5" />
                <span>Browse Templates</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators & Advantages */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Differentiators & Advantages</h3>
            <p className="text-lg text-gray-600">AI imaging workflow designed for creators</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl overflow-hidden p-8 hover:shadow-xl transition-all">
              <div className="h-48 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-6xl">📸</div>
              <h4 className="mt-6 text-xl font-semibold text-gray-900">Photorealism & Stylization</h4>
              <p className="mt-2 text-gray-600">Switch freely between photorealistic and illustration styles. Composition, lighting, and lens parameters are controllable.</p>
            </div>
            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl overflow-hidden p-8 hover:shadow-xl transition-all">
              <div className="h-48 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-6xl">✏️</div>
              <h4 className="mt-6 text-xl font-semibold text-gray-900">Natural Language Editing</h4>
              <p className="mt-2 text-gray-600">Describe in plain English to add/remove elements or change styles. What you say is what you get.</p>
            </div>
            <div className="group bg-gradient-to-br from-cyan-50 to-emerald-50 border border-cyan-100 rounded-2xl overflow-hidden p-8 hover:shadow-xl transition-all">
              <div className="h-48 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-6xl">👤</div>
              <h4 className="mt-6 text-xl font-semibold text-gray-900">Character Consistency</h4>
              <p className="mt-2 text-gray-600">Maintain consistent characters across images for branding and storytelling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Grid (SSR/ISR via Supabase) */}
      <section id="templates" className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Templates</h3>
              <p className="text-gray-600">Single-image · Multi-image · Text-to-image</p>
            </div>
            <Link href="/standard-editor" className="text-indigo-600 hover:text-indigo-700 font-medium">Open Editor</Link>
          </div>

          <TemplatesGrid />
        </div>
      </section>

      {/* Tooling Overview */}
      <section id="guides" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Professional Tools</h3>
            <p className="text-lg text-gray-600">A complete toolkit for diverse creative needs</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Selection Tool</h4>
              <p className="text-sm text-gray-600">Select, move and transform objects</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brush className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Brush Tool</h4>
              <p className="text-sm text-gray-600">Free drawing and sketching</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Type className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Text Tool</h4>
              <p className="text-sm text-gray-600">Add and edit text</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shapes className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Shape Tool</h4>
              <p className="text-sm text-gray-600">Rectangles, circles and more</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
