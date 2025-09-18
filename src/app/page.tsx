import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Wand2, Image as ImageIcon, Zap, Star, ArrowRight, Palette, Type, Brush, Shapes } from 'lucide-react'
import TemplatesGrid from './templates-grid'
import Script from 'next/script'
import HomeAuthMenu from '@/components/HomeAuthMenu'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Script id="faq-ldjson" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is Nano Banana?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Nano Banana (Gemini 2.5 Flash Image) is the image model we use to power AI image generation and editing on this site."
              }
            },
            {
              "@type": "Question",
              "name": "How do I get started on this website?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Click Get Started to open Standard Editor, sign in with GitHub or Google, then describe what you want to generate or select objects to edit with the AI Assistant."
              }
            },
            {
              "@type": "Question",
              "name": "Do I need to sign in to generate or edit images?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Image generation and editing features require sign-in. You can browse templates without signing in."
              }
            },
            {
              "@type": "Question",
              "name": "What is the Standard Editor?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The Standard Editor is a canvas-based editor built with Fabric.js. It supports AI generation, AI editing for selected objects, brush, shapes, text, arrow tools, drag-and-drop images, and exporting selections."
              }
            },
            {
              "@type": "Question",
              "name": "How do templates work?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Templates provide curated prompts and layouts. Choose a template to prefill the AI Assistant with a starting prompt, then fine-tune or edit results in the editor."
              }
            },
            {
              "@type": "Question",
              "name": "What are the strengths of Nano Banana (Gemini 2.5 Flash Image)?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Nano Banana excels at character/subject consistency across images, natural multi-image blending, precise local edits via natural language, and stable multi-round refinements. These make it ideal for creators who need coherent visual outcomes."
              }
            },
            {
              "@type": "Question",
              "name": "Are there any limitations of Nano Banana?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "While powerful for natural-language editing, very fine-grained pixel-level control and traditional cut/mask tooling may be less comprehensive than pro photo editors. For best results, use iterative, step-by-step prompts."
              }
            },
            {
              "@type": "Question",
              "name": "Any practical tips for better results with Nano Banana?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Use a step-by-step approach: first set background, then lighting, then details. Keep prompts clear and scoped. For consistency, reuse descriptors (subject, style, camera angle) across iterations."
              }
            },
            {
              "@type": "Question",
              "name": "Is Nano Banana free to use?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Availability and cost depend on account and region. Free tiers often include limited usage; paid usage is low-cost per image in typical setups."
              }
            }
          ]
        })}
      </Script>
      {/* Top Navigation */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Nano Banana Image Editor</h1>
                <p className="text-xs text-gray-500">Powered by Nano Banana (Gemini 2.5 Flash Image)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/templates" className="text-sm text-gray-700 hover:text-gray-900">Templates</Link>
              <Link href="#features" className="text-sm text-gray-700 hover:text-gray-900">Features</Link>
              <Link href="#guides" className="text-sm text-gray-700 hover:text-gray-900">Guides</Link>
              <Link
                href="/standard-editor"
                className="ml-2 flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <HomeAuthMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background Image with Multiple Overlays */}
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop&crop=center" 
            alt="AI Art Background" 
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/80 to-slate-900/90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.3),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(147,51,234,0.3),transparent_50%)]"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-indigo-500/30 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-pink-500/30 rounded-full blur-xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-40 right-1/3 w-24 h-24 bg-cyan-500/30 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6 border border-white/30">
              <Star className="w-4 h-4" />
              <span>Nano Banana (Gemini 2.5 Flash Image)</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
              Fashionable Image Creation & Editing
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Faster · More Accurate · More Flexible</span>
            </h2>
            <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
              Powered by <a href="#faq" className="underline decoration-white/40 hover:decoration-white">Nano Banana (Gemini 2.5 Flash Image)</a>. Enjoy subject consistency, natural-language local edits, and multi-image blending. Inspired by Pixlr&apos;s modern visual design.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/standard-editor"
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-semibold"
              >
                <Wand2 className="w-5 h-5" />
                <span>Start Now</span>
              </Link>
              <Link href="/templates" className="flex items-center justify-center space-x-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg border border-white/30 text-lg font-semibold">
                <ImageIcon className="w-5 h-5" />
                <span>Browse Templates</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      

      {/* Differentiators & Advantages - Pixlr Style */}
      <section id="features" className="relative py-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1503264116251-35a269479413?w=1920&h=1080&fit=crop&crop=center" 
            alt="AI Features Background" 
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-indigo-900/70 to-slate-900/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">Limitless Artistry with Nano Banana</h3>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">Explore Gemini Image Editor&apos;s AI-powered tools unleashing limitless creative possibilities. Perfect for both beginners and seasoned professionals.</p>
          </div>

          {/* Feature 1: AI Image Generation */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-8 text-white">
                  <h4 className="text-3xl font-bold mb-4">AI Image Generator Magic!</h4>
                  <p className="text-lg mb-6 opacity-90">
                    Elevate your creations with the revolutionary Text to Image AI generator, revolutionizing the way you convert simple text into visually captivating artwork.
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 rounded-full p-3">
                      <Wand2 className="w-6 h-6" />
                    </div>
                    <span className="text-lg font-semibold">Nano Banana Image Generator</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group h-48">
                      <Image 
                        src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop&crop=center" 
                        alt="AI Generated Portrait" 
                        fill
                        className="object-cover rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                      <div className="absolute bottom-2 left-2 text-white text-sm font-semibold">Portrait</div>
                    </div>
                    <div className="relative group h-48">
                      <Image 
                        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center" 
                        alt="AI Generated Landscape" 
                        fill
                        className="object-cover rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                      <div className="absolute bottom-2 left-2 text-white text-sm font-semibold">Landscape</div>
                    </div>
                    <div className="relative group h-48">
                      <Image 
                        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center" 
                        alt="AI Generated Abstract" 
                        fill
                        className="object-cover rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                      <div className="absolute bottom-2 left-2 text-white text-sm font-semibold">Abstract</div>
                    </div>
                    <div className="relative group h-48">
                      <Image 
                        src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center" 
                        alt="AI Generated Art" 
                        fill
                        className="object-cover rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                      <div className="absolute bottom-2 left-2 text-white text-sm font-semibold">Art</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Natural Language Editing */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-8 text-white">
                    <h4 className="text-3xl font-bold mb-4">Natural Language Editing</h4>
                    <p className="text-lg mb-6 opacity-90">
                      Describe in plain English to add/remove elements or change styles. What you say is what you get with our advanced AI understanding.
                    </p>
                    <div className="bg-white/20 rounded-2xl p-4">
                      <p className="text-sm font-mono">&quot;Add a sunset background with warm colors&quot;</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative group h-32">
                    <Image 
                      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=200&fit=crop&crop=center" 
                      alt="Before: Plain Image" 
                      fill
                      className="object-cover rounded-2xl shadow-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/80 to-blue-500/80 rounded-2xl"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">Before: Plain Image</span>
                    </div>
                  </div>
                  <div className="relative group h-32">
                    <Image 
                      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=200&fit=crop&crop=center&sat=150&hue=30" 
                      alt="After: AI Enhanced" 
                      fill
                      className="object-cover rounded-2xl shadow-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400/80 to-purple-500/80 rounded-2xl"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">After: AI Enhanced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Character Consistency */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white">
                  <h4 className="text-3xl font-bold mb-4">Character Consistency</h4>
                  <p className="text-lg mb-6 opacity-90">
                    Maintain consistent characters across images for branding and storytelling. Perfect for creating cohesive visual narratives.
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 rounded-full p-3">
                      <Shapes className="w-6 h-6" />
                    </div>
                    <span className="text-lg font-semibold">Consistent Branding</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="relative group h-24">
                      <Image 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" 
                        alt="Character 1" 
                        fill
                        className="object-cover rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-xl"></div>
                    </div>
                    <div className="relative group h-24">
                      <Image 
                        src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=faces" 
                        alt="Character 2" 
                        fill
                        className="object-cover rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-xl"></div>
                    </div>
                    <div className="relative group h-24">
                      <Image 
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face" 
                        alt="Character 3" 
                        fill
                        className="object-cover rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-xl"></div>
                    </div>
                    <div className="relative group h-24">
                      <Image 
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face" 
                        alt="Character 4" 
                        fill
                        className="object-cover rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-xl"></div>
                    </div>
                    <div className="relative group h-24">
                      <Image 
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face" 
                        alt="Character 5" 
                        fill
                        className="object-cover rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-xl"></div>
                    </div>
                    <div className="relative group h-24">
                      <Image 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face" 
                        alt="Character 6" 
                        fill
                        className="object-cover rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-xl"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Grid (SSR/ISR via Supabase) */}
      <section id="templates" className="relative py-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1920&h=1080&fit=crop&crop=center" 
            alt="Templates Background" 
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-pink-900/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">Featured Templates</h3>
              <p className="text-gray-200">Single-image · Multi-image · Text-to-image</p>
            </div>
            <Link href="/templates" className="text-cyan-400 hover:text-cyan-300 font-medium">View All Templates</Link>
          </div>

          <TemplatesGrid />
        </div>
      </section>

      {/* Professional Tools - Pixlr Style */}
      <section id="guides" className="relative py-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center" 
            alt="Professional Tools Background" 
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-indigo-900/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/40"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">Best in Class</h3>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">Photo Editing and Design tools that have maintained excellence for over 15 years. Our commitment to pioneering innovation ensures excellent retouching, drawing, filter, and effect tools!</p>
          </div>

          {/* Tools Grid with Enhanced Visuals */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Selection Tool */}
            <div className="group">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Palette className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">Selection Tool</h4>
                    <p className="text-gray-600 mb-4">Select, move and transform objects with precision. Advanced selection algorithms for complex shapes and edges.</p>
                    <div className="flex items-center space-x-2 text-purple-600 font-semibold">
                      <span>Try Selection Tool</span>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="relative h-32">
                    <Image 
                      src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=200&fit=crop&crop=center" 
                      alt="Selection Tool Demo" 
                      fill
                      className="object-cover rounded-xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-600/20 rounded-xl"></div>
                    <div className="absolute top-2 right-2 bg-white/90 rounded-lg px-3 py-1 text-sm font-semibold text-purple-600">
                      Selection Demo
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Brush Tool */}
            <div className="group">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Brush className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">Brush Tool</h4>
                    <p className="text-gray-600 mb-4">Free drawing and sketching with natural brush dynamics. Pressure sensitivity and customizable brush settings.</p>
                    <div className="flex items-center space-x-2 text-blue-600 font-semibold">
                      <span>Try Brush Tool</span>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="relative h-32">
                    <Image 
                      src="https://images.unsplash.com/photo-1503264116251-35a269479413?w=600&h=200&fit=crop&crop=center" 
                      alt="Brush Tool Demo" 
                      fill
                      className="object-cover rounded-xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-xl"></div>
                    <div className="absolute top-2 right-2 bg-white/90 rounded-lg px-3 py-1 text-sm font-semibold text-blue-600">
                      Brush Demo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* More Tools Section */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Text Tool */}
            <div className="group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Type className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-bold">Text Tool</h4>
                </div>
                <p className="text-lg mb-6 opacity-90">Add and edit text with professional typography controls. Multiple fonts, sizes, and styling options.</p>
                <div className="relative h-32">
                  <Image 
                    src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=200&fit=crop&crop=center" 
                    alt="Text Tool Demo" 
                    fill
                    className="object-cover rounded-2xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-2xl"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 rounded-lg px-4 py-2">
                      <p className="text-2xl font-bold text-green-600">Your Text Here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shape Tool */}
            <div className="group">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shapes className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-bold">Shape Tool</h4>
                </div>
                <p className="text-lg mb-6 opacity-90">Rectangles, circles, polygons and more. Perfect geometric shapes for any design.</p>
                <div className="relative h-32">
                  <Image 
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=200&fit=crop&crop=center" 
                    alt="Shape Tool Demo" 
                    fill
                    className="object-cover rounded-2xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-2xl"></div>
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <div className="w-6 h-6 bg-white/90 rounded"></div>
                    <div className="w-6 h-6 bg-white/90 rounded-full"></div>
                    <div className="w-6 h-6 bg-white/90 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
              <h4 className="text-3xl font-bold mb-4">Ready to Create?</h4>
              <p className="text-xl mb-6 opacity-90">Start your creative journey with our professional-grade tools powered by <a href="#faq" className="underline decoration-white/40 hover:decoration-white">Nano Banana Image Editor</a>.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/standard-editor"
                  className="flex items-center justify-center space-x-2 px-8 py-4 bg-white text-indigo-600 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-semibold"
                >
                  <Wand2 className="w-5 h-5" />
                  <span>Start Editing</span>
                </Link>
                <Link
                  href="/standard-editor"
                  className="flex items-center justify-center space-x-2 px-8 py-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-200 text-lg font-semibold border border-white/30"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>Image Editor</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ for SEO - moved to bottom above footer */}
      <section id="faq" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/70 to-slate-900/80"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-3">FAQ</h3>
            <p className="text-gray-200 max-w-2xl mx-auto">Common questions about Nano Banana, how to use the site, and our editor.</p>
          </div>
          <div className="mx-auto max-w-3xl space-y-4">
            <details className="group bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4">
              <summary className="cursor-pointer list-none flex items-center justify-between text-white font-semibold">
                <span>What is Nano Banana?</span>
                <span className="ml-4 text-white/70 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-3 text-gray-200">
                Nano Banana is the image model that powers our AI image generation and editing. It enables faster iteration, high-quality results, and natural-language controlled edits.
              </div>
            </details>

            <details className="group bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4">
              <summary className="cursor-pointer list-none flex items-center justify-between text-white font-semibold">
                <span>How do I start using the website?</span>
                <span className="ml-4 text-white/70 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-3 text-gray-200">
                Click <span className="font-semibold">Get Started</span> to open the Standard Editor. Sign in with GitHub or Google. Use the AI Assistant to generate images from text or select objects on the canvas and choose AI Edit.
              </div>
            </details>

            <details className="group bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4">
              <summary className="cursor-pointer list-none flex items-center justify-between text-white font-semibold">
                <span>Do I need to sign in?</span>
                <span className="ml-4 text-white/70 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-3 text-gray-200">
                You must be signed in to generate or edit images. Browsing templates is available without sign-in.
              </div>
            </details>

            <details className="group bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4">
              <summary className="cursor-pointer list-none flex items-center justify-between text-white font-semibold">
                <span>What can I do in the Standard Editor?</span>
                <span className="ml-4 text-white/70 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-3 text-gray-200">
                The editor supports a Fabric.js canvas, AI generation, AI editing of selected objects, brush, shapes, text, arrow tools, drag-and-drop uploads, and exporting selected elements as PNG.
              </div>
            </details>

            <details className="group bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4">
              <summary className="cursor-pointer list-none flex items-center justify-between text-white font-semibold">
                <span>How do templates help?</span>
                <span className="ml-4 text-white/70 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-3 text-gray-200">
                Templates provide curated prompts and layouts to accelerate your workflow. Choose one to prefill the AI Assistant and then iterate inside the editor.
              </div>
            </details>

            {/* Nano Banana focused entries for SEO weight */}
            <details className="group bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4">
              <summary className="cursor-pointer list-none flex items-center justify-between text-white font-semibold">
                <span>What are the strengths of Nano Banana (Gemini 2.5 Flash Image)?</span>
                <span className="ml-4 text-white/70 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-3 text-gray-200">
                Nano Banana excels at <span className="font-semibold">subject consistency</span> across multiple images, <span className="font-semibold">multi-image blending</span> with coherent lighting and texture, and <span className="font-semibold">precise local edits</span> controlled by natural language. It is optimized for stable multi-round refinement.
              </div>
            </details>

            <details className="group bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4">
              <summary className="cursor-pointer list-none flex items-center justify-between text-white font-semibold">
                <span>Are there any limitations of Nano Banana?</span>
                <span className="ml-4 text-white/70 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-3 text-gray-200">
                Compared to pro editors, ultra fine-grained pixel tools and manual masking can be less comprehensive. For the best Nano Banana results, iterate step-by-step instead of issuing one very long prompt.
              </div>
            </details>

            <details className="group bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4">
              <summary className="cursor-pointer list-none flex items-center justify-between text-white font-semibold">
                <span>Any practical tips for better results with Nano Banana?</span>
                <span className="ml-4 text-white/70 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-3 text-gray-200">
                Try a <span className="font-semibold">three-step flow</span>: set background → adjust lighting → refine details. Keep your subject descriptors consistent across rounds to maintain identity and style.
              </div>
            </details>

            <details className="group bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4">
              <summary className="cursor-pointer list-none flex items-center justify-between text-white font-semibold">
                <span>Is Nano Banana free?</span>
                <span className="ml-4 text-white/70 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-3 text-gray-200">
                Availability and pricing depend on your account and region. Free tiers usually have usage or quality limits; paid usage is typically low-cost per generated image.
              </div>
            </details>
          </div>
        </div>
      </section>
    </div>
  )
}
