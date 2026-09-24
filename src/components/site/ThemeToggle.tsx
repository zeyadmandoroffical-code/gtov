'use client'
import { useEffect, useState } from 'react'
import type { Locale } from '@/lib/types'

/** Sun/moon switch. The site always opens in light mode unless the visitor chose dark. */
export function ThemeToggle({ locale }: { locale: Locale }) {
  const [dark, setDark] = useState(false)
  useEffect(() => { setDark(document.documentElement.getAttribute('data-theme') === 'dark') }, [])

  function toggle() {
    const next = !dark
    const root = document.documentElement
    root.classList.add('theme-anim')
    root.setAttribute('data-theme', next ? 'dark' : 'light')
    try { localStorage.setItem('g2v-theme', next ? 'dark' : 'light') } catch { /* private mode */ }
    setDark(next)
    setTimeout(() => root.classList.remove('theme-anim'), 450)
  }

  const label = locale === 'ar'
    ? (dark ? 'حوّل للوضع الفاتح' : 'حوّل للوضع الداكن')
    : (dark ? 'Switch to light mode' : 'Switch to dark mode')

  return (
    <button type="button" className="theme-t" onClick={toggle} aria-label={label} aria-pressed={dark} title={label}>
      <svg className="sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
      </svg>
      <svg className="moon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.2 14.6A8.5 8.5 0 0 1 9.4 3.8a8.5 8.5 0 1 0 10.8 10.8Z" />
      </svg>
    </button>
  )
}
