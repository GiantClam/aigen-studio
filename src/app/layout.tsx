import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProviderClient from '@/components/SessionProviderClient'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

const isProd = process.env.NODE_ENV === 'production'
const siteUrl = isProd ? 'https://www.gemini-image-edit.com' : 'http://localhost:3000'
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Nano Banana Image Editor | AI Image Generation & Editing',
    template: '%s | Nano Banana Image Editor'
  },
  description:
    'Nano Banana Image Editor powered by Nano Banana (Gemini 2.5 Flash Image). Create, edit, and refine images with subject consistency, multi-image blending and precise natural‑language edits. Templates for single‑image, multi‑image and text‑to‑image with professional tools and SEO‑ready UI.',
  keywords: [
    'Nano Banana',
    'Gemini 2.5 Flash Image',
    // synonyms kept for SEO but de-emphasized
    'gemini-2.5-image-preview',
    'Gemini 2.5',
    'AI image generation',
    'AI image editing',
    'text to image',
    'multi image generation',
    'single image generation'
  ],
  themeColor: '#0B1020',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    url: siteUrl + '/',
    siteName: 'Nano Banana Image Editor',
    title: 'Nano Banana Image Editor — AI Image Generation & Editing (Gemini 2.5 Flash Image)',
    description:
      'Create and edit high‑quality images with Nano Banana (Gemini 2.5 Flash Image). Rich templates and SEO support.',
    images: [
      {
        url: '/og-cover.svg',
        width: 1200,
        height: 630,
        alt: 'Nano Banana Image Editor'
      }
    ],
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nano Banana Image Editor',
    description:
      'Image generation & editing powered by Nano Banana (Gemini 2.5 Flash Image).',
    images: ['/og-cover.svg']
  },
  icons: {
    icon: ['/logo.svg', '/favicon-32x32.png'],
    apple: ['/apple-touch-icon.png'],
    shortcut: ['/logo.svg'],
    other: [
      { rel: 'mask-icon', url: '/logo.svg', media: '(prefers-color-scheme: dark)' }
    ]
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
        <Script id="org-ldjson" type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Nano Banana Image Editor',
            url: siteUrl,
            logo: siteUrl + '/logo.svg',
            sameAs: []
          })}
        </Script>
        <SessionProviderClient>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">{children}</main>
          <footer className="bg-gray-950 text-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center gap-2 text-lg font-bold">
                    <Image src="/logo.svg" alt="Nano Banana Image Editor logo" width={20} height={20} />
                    <span>Nano Banana Image Editor</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-400">
                    Powered by Nano Banana (Gemini 2.5 Flash Image). Stylish, fast and professional image generation & editing.
                  </p>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-300">Product</div>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li><Link className="hover:text-white" href="/standard-editor">Standard Editor</Link></li>
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
                <div>© {new Date().getFullYear()} Nano Banana Image Editor</div>
                <div className="mt-3 md:mt-0 space-x-4">
                  <Link className="hover:text-gray-300" href="/">Nano Banana Image Editor</Link>
                  <Link className="hover:text-gray-300" href="/privacy">Privacy Policy</Link>
                  <Link className="hover:text-gray-300" href="/terms">Terms of Service</Link>
                  <a className="hover:text-gray-300" href="/sitemap.xml">Sitemap</a>
                  <a className="hover:text-gray-300" href="/robots.txt">Robots</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
        </SessionProviderClient>
      </body>
    </html>
  )
}
