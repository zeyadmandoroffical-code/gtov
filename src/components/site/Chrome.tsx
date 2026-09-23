'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { tr, t } from '@/lib/i18n'
import type { L, Locale, Settings } from '@/lib/types'
import { ArrowIcon, ChatIcon, TrendIcon } from './Icons'

export type NavLink = { href: string; label: L }

function Logo({ settings, locale }: { settings: Settings; locale: Locale }) {
  return (
    <Link href={`/${locale}`} className="logo" aria-label="Go2Viral">
      {settings.logo_url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={settings.logo_url} alt="Go2Viral" />
        : <><span className="logo-mark" style={{ background: 'var(--violet)', display: 'grid', placeItems: 'center', color: '#fff' }}><TrendIcon size={20} /></span><span>Go2Viral</span></>}
    </Link>
  )
}

function switchHref(path: string, to: Locale) {
  const parts = path.split('/')
  parts[1] = to
  return parts.join('/') || `/${to}`
}

export function SiteHeader({ settings, nav, locale }: { settings: Settings; nav: NavLink[]; locale: Locale }) {
  const d = t(locale)
  const path = usePathname() || `/${locale}`
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(scrollY > 10)
    on(); addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  useEffect(() => { document.body.classList.toggle('menu-open', open) }, [open])
  const other: Locale = locale === 'ar' ? 'en' : 'ar'
  const ticker = settings.ticker?.[locale] || []

  return (
    <>
      {ticker.length > 0 && (
        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">{[0, 1, 2, 3].flatMap((k) => ticker.map((x, i) => <span key={`${k}-${i}`}>{x}</span>))}</div>
        </div>
      )}
      <header className={`hdr ${scrolled ? 'scrolled' : ''}`}>
        <div className="wrap hdr-in">
          <Logo settings={settings} locale={locale} />
          <nav className="nav" aria-label="menu">
            {nav.map((n) => <Link key={n.href} href={n.href}>{tr(n.label, locale)}</Link>)}
          </nav>
          <div className="hdr-cta">
            <Link className="lang" href={switchHref(path, other)} hrefLang={other}>{d.lang}</Link>
            <a href={`/${locale}#contact`} className="btn primary small" data-track="cta" data-label="header">
              {d.bookCall}<span className="ic"><ArrowIcon size={16} /></span>
            </a>
            <button className="menu-btn" type="button" aria-expanded={open} aria-label={open ? d.closeMenu : d.openMenu} onClick={() => setOpen(!open)}><span /></button>
          </div>
        </div>
      </header>
      <nav className="sheet" aria-label="menu">
        {nav.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>{tr(n.label, locale)}</Link>)}
        <a href={`/${locale}#contact`} className="btn primary" onClick={() => setOpen(false)} data-track="cta" data-label="mobile-menu">
          {d.bookCall}<span className="ic"><ArrowIcon /></span>
        </a>
        <Link className="lang" href={switchHref(path, other)} onClick={() => setOpen(false)}>{d.lang}</Link>
      </nav>
    </>
  )
}

export function MobileBar({ settings, locale }: { settings: Settings; locale: Locale }) {
  const d = t(locale)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => {
      const hero = document.querySelector('.hero')
      const contact = document.getElementById('contact')
      const past = hero ? hero.getBoundingClientRect().bottom < 80 : scrollY > 500
      const atC = contact ? contact.getBoundingClientRect().top < innerHeight * 0.8 : false
      setShow(past && !atC)
    }
    on(); addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  const wa = (settings.whatsapp || '').replace(/\D/g, '')
  return (
    <div className={`mbar ${show ? 'show' : ''}`}>
      <a href={`/${locale}#contact`} className="btn primary" data-track="cta" data-label="mobile-bar">{d.bookCall}<span className="ic"><ArrowIcon /></span></a>
      {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="wab" aria-label="WhatsApp" data-track="whatsapp" data-label="mobile-bar"><ChatIcon size={24} /></a>}
    </div>
  )
}
