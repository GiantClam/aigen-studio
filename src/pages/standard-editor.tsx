import React, { useEffect, useMemo, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'

const NanoCanvasApp = dynamic(() => import('@nanocanvas/App'), { ssr: false })
import type { NanoCanvasConfig } from '@nanocanvas/types'

export default function StandardEditorStandalone() {
  const [ready, setReady] = useState(false)
  const [initialJson, setInitialJson] = useState<object | undefined>(undefined)
  const hostRef = useRef<HTMLDivElement>(null)
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null)
  const [stylesInjected, setStylesInjected] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const mod: any = await import('fabric')
        ;(window as any).fabric = mod.fabric || mod.default || mod
        setReady(true)
      } catch (e) {
        console.error('Failed to import fabric in Standalone StandardEditor', e)
      }
    })()
  }, [])

  const config = useMemo<NanoCanvasConfig>(() => ({ provider: 'google', apiKey: '' }), [])

  useEffect(() => {
    if (!ready || !hostRef.current || mountNode) return
    const host = hostRef.current as HTMLDivElement
    let sr = host.shadowRoot as ShadowRoot | null
    if (!sr) sr = host.attachShadow({ mode: 'open' })
    let rootDiv = sr.querySelector('#nc-root') as HTMLElement | null
    if (!rootDiv) {
      rootDiv = document.createElement('div')
      rootDiv.id = 'nc-root'
      rootDiv.style.position = 'relative'
      rootDiv.style.width = '100%'
      rootDiv.style.height = '100%'
      sr.appendChild(rootDiv)
    }
    setMountNode(rootDiv)
    ;(async () => {
      if (sr && !sr.querySelector('#nc-shadow-style')) {
        try {
          const res = await fetch('/nanocanvas.css')
          if (res.ok) {
            const cssText = await res.text()
            const styleEl = document.createElement('style')
            styleEl.id = 'nc-shadow-style'
            styleEl.textContent = cssText
            sr.appendChild(styleEl)
            setStylesInjected(true)
            return
          }
        } catch {}
        const styleEl = document.createElement('style')
        styleEl.id = 'nc-shadow-style'
        styleEl.textContent = `#nc-root{font-family:Inter,system-ui,-apple-system,sans-serif;line-height:1.5;-webkit-text-size-adjust:100%;tab-size:4}#nc-root*,#nc-root ::before,#nc-root ::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}`
        sr.appendChild(styleEl)
        setStylesInjected(true)
      }
    })()
    try {
      const params = new URLSearchParams(window.location.search)
      const localId = params.get('localProjectId')
      if (localId) {
        const raw = localStorage.getItem('nc_projects')
        if (raw) {
          const projects = JSON.parse(raw)
          const found = (projects || []).find((p: any) => String(p.id) === String(localId))
          if (found && found.data) setInitialJson(found.data)
        }
      }
    } catch {}
  }, [ready, mountNode])

  if (!ready) return null

  return (
    <>
      <style>{`
        html, body, #__next { height: 100%; }
        #nc-standalone-root { position: fixed; inset: 0; z-index: 9999; background: #ffffff; }
      `}</style>
      <div id="nc-standalone-root" ref={hostRef}>
        {mountNode && createPortal(
          <NanoCanvasApp config={config} initialCanvasState={initialJson} />,
          mountNode
        )}
      </div>
    </>
  )
}
