import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import { getNav, getSettings } from '@/lib/data'
import { dirOf, isLocale, tr } from '@/lib/i18n'
import { LOCALES } from '@/lib/types'
import { ChromeDefs } from '@/components/site/ChromeDefs'
import { MobileBar, SiteHeader, type NavLink } from '@/components/site/Chrome'
import { Footer } from '@/components/site/Footer'
import { Tracker } from '@/components/site/Tracker'
import '../../site.css'

// Light by default for everyone; dark only if the visitor picked it before.
const THEME_SCRIPT = `try{if(localStorage.getItem('g2v-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}`

export const revalidate = 300
export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#5428B3',
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const s = await getSettings()
  const title = tr(s.seo?.title, locale) || 'Go2Viral'
  const description = tr(s.seo?.description, locale)
  const base = process.env.NEXT_PUBLIC_SITE_URL
  return {
    metadataBase: base ? new URL(base) : undefined,
    title: { default: title, template: `%s — Go2Viral` },
    description,
    alternates: { languages: { ar: '/ar', en: '/en' } },
    openGraph: { title, description, images: s.seo?.og_image ? [s.seo.og_image] : undefined, locale },
    icons: s.logo_url ? { icon: s.logo_url } : undefined,
  }
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [settings, navRaw] = await Promise.all([getSettings(), getNav()])
  const nav: NavLink[] = navRaw.map((n) => ({ label: n.label, href: n.slug ? `/${locale}/${n.slug}` : `/${locale}#${n.anchor}` }))
  const brand = /^#[0-9a-f]{3,8}$/i.test(settings.brand_color) ? settings.brand_color : '#5428B3'

  return (
    <html lang={locale} dir={dirOf(locale)} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" />
        <style>{`:root{--violet:${brand};--vtext:${brand}}:root[data-theme="dark"]{--vtext:#B89CFF}`}</style>
      </head>
      <body>
        <ChromeDefs />
        <SiteHeader settings={settings} nav={nav} locale={locale} />
        <main>{children}</main>
        <Footer settings={settings} nav={nav} locale={locale} />
        <MobileBar settings={settings} locale={locale} />
        <Tracker />
        <Analytics />
      </body>
    </html>
  )
}
