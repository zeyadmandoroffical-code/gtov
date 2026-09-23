import { getPage, getSettings } from '@/lib/data'
import { isLocale, t } from '@/lib/i18n'
import { Sections } from '@/components/site/sections'
import { notFound } from 'next/navigation'

export const revalidate = 300

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [bundle, settings] = await Promise.all([getPage(null), getSettings()])
  if (!bundle) return <div className="notice wrap"><h1>Go2Viral</h1><p>{t(locale).setup}</p></div>
  return <Sections {...bundle} settings={settings} locale={locale} />
}
