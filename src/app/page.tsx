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
                <p className="text-xs text-gray-500">Intelligent Image Editing Platform</p>
              </div>
            </div>
            
            <Link
              href="/standard-editor"
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Start Editing</span>
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
              <span>Powered by Google Vertex AI</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Smart Image Editing
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Experience professional-grade AI image processing with the cutting-edge Gemini 2.5 Flash Image Preview model for creators
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/standard-editor"
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-semibold"
            >
              <Wand2 className="w-5 h-5" />
              <span>Start Editing Now</span>
            </Link>
            <button className="flex items-center justify-center space-x-2 px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg border border-gray-200 text-lg font-semibold">
              <ImageIcon className="w-5 h-5" />
              <span>View Examples</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful AI Features
            </h2>
            <p className="text-xl text-gray-600">
              Experience next-generation image editing technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Image Generation</h3>
              <p className="text-gray-600">
                Use natural language descriptions to generate high-quality image content with AI
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Image Editing</h3>
              <p className="text-gray-600">
                Select any object in the image, and AI will perform precise edits based on your description
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Processing</h3>
              <p className="text-gray-600">
                Powered by Google Vertex AI&apos;s robust computing power for fast image processing experience
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
              Gemini 2.5 Flash Image Capabilities
            </h2>
            <p className="text-xl text-gray-600">
              Explore the powerful features of Google&apos;s most advanced multimodal image model
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-6xl">📸</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Photorealistic Scenes</h3>
                <p className="text-gray-600 mb-4">Generate stunning photorealistic images with precise camera angles, lighting, and fine details.</p>
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500 mb-4">
                  <p className="text-sm text-gray-700 italic">
                    &ldquo;A photorealistic close-up portrait of an elderly Japanese potter with deep wrinkles and a warm smile, examining a tea bowl in a sunlit studio. Soft golden hour lighting, 85mm lens, bokeh background.&rdquo;
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Portrait</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Lighting</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Professional</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
                <span className="text-6xl">✏️</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Natural Language Editing</h3>
                <p className="text-gray-600 mb-4">Edit images using simple text commands. Naturally add, remove, or modify elements.</p>
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-pink-500 mb-4">
                  <p className="text-sm text-gray-700 italic">
                    &ldquo;Using the provided image of my cat, please add a small knitted wizard hat on its head. Make it look cozy and match the soft lighting.&rdquo;
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">Add Elements</span>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">Remove Objects</span>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">Style Transfer</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-6xl">👤</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Character Consistency</h3>
                <p className="text-gray-600 mb-4">Maintain the same character across multiple images for storytelling and branding.</p>
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-cyan-500 mb-4">
                  <p className="text-sm text-gray-700 italic">
                    &ldquo;Show the same character from the previous image now sitting in a cozy coffee shop, reading a book. Keep the same facial features and clothing style.&rdquo;
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">Storytelling</span>
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">Branding</span>
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">Consistency</span>
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
              Professional Editing Tools
            </h2>
            <p className="text-xl text-gray-600">
              Complete image editing toolkit for all creative needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Selection Tool</h3>
              <p className="text-sm text-gray-600">Select, move and transform objects</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brush className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Brush Tool</h3>
              <p className="text-sm text-gray-600">Free drawing and sketching</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Type className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Text Tool</h3>
              <p className="text-sm text-gray-600">Add and edit text content</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shapes className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Shape Tool</h3>
              <p className="text-sm text-gray-600">Create rectangles, circles and other shapes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Technical Support
            </h2>
            <p className="text-xl text-indigo-100">
              Based on Google&apos;s most advanced AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">Multimodal</div>
              <div className="text-indigo-200">Native Architecture</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">$0.039</div>
              <div className="text-indigo-200">Per Image</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">Real-time</div>
              <div className="text-indigo-200">Generation Speed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">Google AI</div>
              <div className="text-indigo-200">Technology Powered</div>
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
