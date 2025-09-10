import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.gemini-image-edit.com'
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/standard-editor`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/image-editor`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/test-canvas`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]
}


