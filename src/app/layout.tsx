import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProviderClient from '@/components/SessionProviderClient'
import Link from 'next/link'
import Image from 'next/image'
import SiteFooter from '@/components/SiteFooter'
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
          {/* 统一 Footer 组件，并在编辑器页自动隐藏 */}
          <SiteFooter />
        </div>
        </SessionProviderClient>
      </body>
    </html>
  )
}
