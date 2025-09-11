import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const isProd = process.env.NODE_ENV === 'production'
export const metadata: Metadata = {
  metadataBase: new URL(isProd ? 'https://www.gemini-image-edit.com' : 'http://localhost:3000'),
  title: {
    default: 'Gemini Image Editor | Image Generation & Editing with gemini-2.5-image-preview (nano-banana)',
    template: '%s | Gemini Image Editor'
  },
  description:
    'Modern AI image editor powered by gemini-2.5-image-preview (nano-banana). Templates for single-image, multi-image and text-to-image with professional tools and SEO-ready UI.',
  keywords: [
    'gemini-2.5-image-preview',
    'nano-banana',
    'Gemini 2.5',
    'AI image generation',
    'AI image editing',
    'text to image',
    'multi image generation',
    'single image generation'
  ],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    url: 'https://www.gemini-image-edit.com/',
    siteName: 'Gemini Image Editor',
    title: 'Gemini Image Editor — Image Generation & Editing (gemini-2.5-image-preview, nano-banana)',
    description:
      'Create and edit high‑quality images with gemini-2.5-image-preview (nano-banana). Rich templates and SEO support.',
    images: [
      {
        url: '/og-cover.png',
        width: 1200,
        height: 630,
        alt: 'Gemini Image Editor'
      }
    ],
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gemini Image Editor',
    description:
      'Image generation & editing powered by gemini-2.5-image-preview (nano-banana).',
    images: ['/og-cover.png']
  },
  icons: {
    icon: '/favicon.ico'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">{children}</main>
          <footer className="bg-gray-950 text-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="text-lg font-bold">Gemini Image Editor</div>
                  <p className="mt-3 text-sm text-gray-400">
                    Powered by <span className="font-medium text-white">gemini-2.5-image-preview</span>
                    (nano-banana). Stylish, fast and professional image generation & editing.
                  </p>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-300">Product</div>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li><a className="hover:text-white" href="/standard-editor">Standard Editor</a></li>
                  </ul>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-300">Resources</div>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li><a className="hover:text-white" href="https://developers.googleblog.com/en/introducing-gemini-2-5-flash-image/" target="_blank" rel="noreferrer">Model Intro</a></li>
                    <li><a className="hover:text-white" href="https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/" target="_blank" rel="noreferrer">Prompting Guide</a></li>
                    <li><a className="hover:text-white" href="https://developers.googleblog.com/en/introducing-gemini-2-5-flash-image/" target="_blank" rel="noreferrer">Model Updates</a></li>
                  </ul>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-300">Contact</div>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li>
                      <a className="hover:text-white" href="mailto:contact@gemini-image-edit.com">contact@gemini-image-edit.com</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
                <div>© {new Date().getFullYear()} Gemini Image Editor</div>
                <div className="mt-3 md:mt-0 space-x-4">
                  <a className="hover:text-gray-300" href="/privacy">Privacy Policy</a>
                  <a className="hover:text-gray-300" href="/terms">Terms of Service</a>
                  <a className="hover:text-gray-300" href="/sitemap.xml">Sitemap</a>
                  <a className="hover:text-gray-300" href="/robots.txt">Robots</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
