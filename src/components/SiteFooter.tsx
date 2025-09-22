'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function SiteFooter() {
  const pathname = usePathname()

  // 在编辑器页面隐藏 Footer，给画布最大空间
  if (pathname?.startsWith('/standard-editor')) return null

  return (
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
  )
}


