import { NextResponse } from 'next/server'

export async function GET(_req: Request, context: { params: Promise<{ w?: string; h?: string }> }) {
  const { w, h } = await context.params
  const width = Number(w ?? 32)
  const height = Number(h ?? 32)
  const text = `${width}×${height}`
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#e5e7eb"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${Math.max(8, Math.min(width, height) / 4)}" fill="#6b7280">${text}</text>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" fill="none" stroke="#d1d5db"/>
</svg>`
  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}


