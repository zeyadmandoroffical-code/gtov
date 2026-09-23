'use client'
import { useState } from 'react'
import { tr } from '@/lib/i18n'
import { youtubeThumb } from '@/lib/embed'
import type { Item } from '@/lib/types'
import { ArrowIcon, PlayIcon } from '../Icons'
import { Lightbox } from '../Lightbox'
import { Media } from '../Media'
import { track } from '../track'
import { SecHead } from './SecHead'
import type { SectionProps } from './types'

export function Videos({ section, items, locale }: SectionProps) {
  const c = section.content
  const [open, setOpen] = useState<Item | null>(null)
  const count = items.length
  const cls = count === 1 ? 'count-1' : count === 2 ? 'count-2' : count > 3 ? 'many' : ''
  return (
    <section className="sec" id={section.anchor || undefined}>
      <div className="wrap">
        <SecHead tag={c.tag} title={c.title} locale={locale} />
        {count > 0 && (
          <div className={`reels ${cls}`}>
            {items.map((it, i) => {
              const poster = it.poster_url || youtubeThumb(it.url)
              return (
                <button type="button" key={it.id} className={`reel r${Math.min(i + 1, 3)} ${i >= 3 ? 'more' : ''}`}
                  onClick={() => { track('item_open', { item_id: it.id, label: tr(it.title, locale).slice(0, 100) }); setOpen(it) }}>
                  <Media src={it.media_url} poster={poster} alt={tr(it.title, locale)} />
                  {tr(it.subtitle, locale) && <span className="top">{tr(it.subtitle, locale)}</span>}
                  <span className="play" aria-hidden="true"><PlayIcon size={22} /></span>
                  <span className="over"><b>{tr(it.title, locale)}</b></span>
                </button>
              )
            })}
          </div>
        )}
        <div className="reels-foot">
          {tr(c.lead, locale) && <p>{tr(c.lead, locale)}</p>}
          {c.cta_href && (
            <a href={c.cta_href} className="btn ghost small" data-track="cta" data-label="videos-cta">
              {tr(c.cta_label, locale)}<span className="ic"><ArrowIcon size={16} /></span>
            </a>
          )}
        </div>
      </div>
      {open && <Lightbox item={open} locale={locale} onClose={() => setOpen(null)} />}
    </section>
  )
}
