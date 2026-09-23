import type { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/data'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const slugs = await getAllSlugs()
  const paths = ['', ...slugs.map((s) => `/${s}`)]
  return paths.flatMap((p) => (['ar', 'en'] as const).map((l) => ({
    url: `${base}/${l}${p}`,
    changeFrequency: 'weekly' as const,
    alternates: { languages: { ar: `${base}/ar${p}`, en: `${base}/en${p}` } },
  })))
}
