'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { track, type TrackType } from './track'

/** Page views + clicks on anything marked with data-track="cta|whatsapp|social". */
export function Tracker() {
  const path = usePathname()
  useEffect(() => { track('pageview') }, [path])
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-track]')
      if (!el) return
      track(el.dataset.track as TrackType, { label: (el.dataset.label || el.textContent || '').trim().slice(0, 100) })
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
  return null
}
