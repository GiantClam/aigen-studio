import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProviderClient from '@/components/SessionProviderClient'
import Link from 'next/link'
import Image from 'next/image'
import LayoutBody from './LayoutBody'
import Script from 'next/script'
import { Suspense } from 'react'
import ChunkErrorHandler from '@/components/ChunkErrorHandler'

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
    'Nano Banana Image Editor powered by Nano Banana (Gemini 2.5 Flash Image) and Nanobanana Pro (Gemini 3 Image Pro). Create, edit, and refine images with subject consistency, multi-image blending and precise natural‑language edits. Professional features, guides and blogs to improve SEO and discoverability.',
  keywords: [
    'Nano Banana',
    'Gemini 2.5 Flash Image',
    'Nanobanana Pro',
    'Gemini 3 Image Pro',
    // synonyms kept for SEO but de-emphasized
    'gemini-2.5-image-preview',
    'gemini-3-image-pro',
    'Gemini 2.5',
    'AI image generation',
    'AI image editing',
    'text to image',
    'multi image generation',
    'single image generation',
    'AI features',
    'AI blogs',
    'image editor features'
  ],
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

export const viewport: Viewport = {
  themeColor: '#0B1020',
}

// 错误边界组件
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Script
          id="org-ldjson"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Nano Banana Image Editor',
              url: siteUrl,
              logo: siteUrl + '/logo.svg',
              sameAs: []
            }, null, 2).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
          }}
        />
        <ChunkErrorHandler />
        <ErrorBoundary>
          <SessionProviderClient>
            <LayoutBody>{children}</LayoutBody>
          </SessionProviderClient>
        </ErrorBoundary>
      </body>
    </html>
  )
}
