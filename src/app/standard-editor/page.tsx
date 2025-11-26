"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import * as fabric from "fabric"
import NanoCanvasApp from "@/external/nanocanvas/App"
import type { NanoCanvasConfig } from "@/external/nanocanvas/types"

if (typeof window !== "undefined") {
  ;(window as any).fabric = fabric
}

export default function StandardEditor() {
  const params = useSearchParams()
  const [initialJson, setInitialJson] = useState<object | undefined>(undefined)

  useEffect(() => {
    ;(window as any).fabric = fabric
  }, [])

  useEffect(() => {
    const jsonParam = params.get("json")
    const jsonUrl = params.get("jsonUrl")

    const tryParse = (raw: string) => {
      try {
        const decoded = decodeURIComponent(raw)
        const parsed = JSON.parse(decoded)
        setInitialJson(parsed)
      } catch {
        try {
          const parsed = JSON.parse(raw)
          setInitialJson(parsed)
        } catch {}
      }
    }

    if (jsonParam) {
      tryParse(jsonParam)
      return
    }

    if (jsonUrl) {
      fetch(jsonUrl)
        .then((r) => r.json())
        .then((data) => setInitialJson(data))
        .catch(() => {})
    }
  }, [params])

  const config = useMemo<NanoCanvasConfig>(() => ({ provider: "google", apiKey: "" }), [])

  return (
    <NanoCanvasApp config={config} initialCanvasState={initialJson} />
  )
}
