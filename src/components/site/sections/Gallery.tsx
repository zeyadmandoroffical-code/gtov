'use client'
import { useState } from 'react'
import { tr } from '@/lib/i18n'
import { isVideoFile, youtubeThumb } from '@/lib/embed'
import type { Item } from '@/lib/types'
import { Lightbox } from '../Lightbox'
import { track } from '../track'
import { SecHead } from './SecHead'
import type { SectionProps } from './types'

export function Gallery({ section, items, locale }: SectionProps) {
  const c = section.content
  const [open, setOpen] = useState<Item | null>(null)
  return (
    <section className="sec" id={section.anchor || undefined}>
      <div className="wrap">
        <SecHead tag={c.tag} title={c.title} lead={c.lead} locale={locale} />
        <div className="gallery">
          {items.map((it) => {
            const src = it.media_url || it.poster_url || youtubeThumb(it.url)
            if (!src) return null
            return (
              <button type="button" key={it.id} onClick={() => { track('item_open', { item_id: it.id }); setOpen(it) }} aria-label={tr(it.title, locale) || 'media'}>
                {isVideoFile(src)
                  ? <video src={src} muted loop playsInline autoPlay preload="metadata" />
                  // eslint-disable-next-line @next/next/no-img-element
                  : <img src={src} alt={tr(it.title, locale)} loading="lazy" />}
                {tr(it.title, locale) && <span className="cap">{tr(it.title, locale)}</span>}
              </button>
            )
          })}
        </div>
      </div>
      {open && <Lightbox item={open} locale={locale} onClose={() => setOpen(null)} />}
    </section>
  )
}
