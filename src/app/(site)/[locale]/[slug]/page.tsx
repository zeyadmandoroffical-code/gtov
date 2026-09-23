import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllSlugs, getPage, getSettings } from '@/lib/data'
import { isLocale, tr } from '@/lib/i18n'
import { LOCALES } from '@/lib/types'
import { Sections } from '@/components/site/sections'

export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

type P = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const b = await getPage(slug)
  if (!b) return {}
  return {
    title: tr(b.page.seo?.title, locale) || tr(b.page.title, locale),
    description: tr(b.page.seo?.description, locale) || undefined,
    alternates: { languages: { ar: `/ar/${slug}`, en: `/en/${slug}` } },
  }
}

export default async function Page({ params }: P) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const [bundle, settings] = await Promise.all([getPage(slug), getSettings()])
  if (!bundle || bundle.page.is_home) notFound()
  return <Sections {...bundle} settings={settings} locale={locale} />
}
