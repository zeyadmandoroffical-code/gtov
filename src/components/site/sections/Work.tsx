'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { tr, t } from '@/lib/i18n'
import { youtubeThumb } from '@/lib/embed'
import type { Category, Item, Locale } from '@/lib/types'
import { Lightbox } from '../Lightbox'
import { Media } from '../Media'
import { PlayIcon } from '../Icons'
import { track } from '../track'
import { useInView } from '../hooks'
import { SecHead } from './SecHead'
import type { SectionProps } from './types'

export function Work({ section, items, categories, locale }: SectionProps) {
  const c = section.content
  const d = t(locale)
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState<Item | null>(null)
  const [anim, setAnim] = useState(0)
  const used = useMemo(() => categories.filter((cat) => items.some((i) => i.category_id === cat.id)), [categories, items])
  const shown = filter === 'all' ? items : items.filter((i) => i.category_id === filter)
  const phonesRef = useRef<HTMLDivElement>(null)

  const choose = (id: string) => {
    setFilter(id); setAnim((a) => a + 1)
    phonesRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
  }
  const openItem = (it: Item) => {
    track('item_open', { item_id: it.id, label: tr(it.title, locale).slice(0, 100) })
    if (it.kind === 'link' && it.url) { window.open(it.url, '_blank', 'noopener'); return }
    setOpen(it)
  }

  return (
    <section className="sec" id={section.anchor || undefined}>
      <div className="wrap">
        <SecHead tag={c.tag} title={c.title} lead={c.lead} locale={locale} />
        {used.length > 1 && (
          <div className="filters" role="group">
            <button type="button" aria-pressed={filter === 'all'} onClick={() => choose('all')}>{d.all}</button>
            {used.map((cat) => (
              <button type="button" key={cat.id} aria-pressed={filter === cat.id} onClick={() => choose(cat.id)}>{tr(cat.name, locale)}</button>
            ))}
          </div>
        )}
        {items.length === 0 ? null : (
          <div className="phones" ref={phonesRef}>
            {shown.map((it, i) => (
              <PhoneCard key={`${it.id}-${anim}`} item={it} index={i} locale={locale} animate={anim > 0}
                category={categories.find((x) => x.id === it.category_id)} onOpen={() => openItem(it)} />
            ))}
          </div>
        )}
      </div>
      {open && <Lightbox item={open} locale={locale} onClose={() => setOpen(null)} />}
    </section>
  )
}

function PhoneCard({ item, index, locale, category, onOpen, animate }: {
  item: Item; index: number; locale: Locale; category?: Category; onOpen: () => void; animate: boolean
}) {
  const d = t(locale)
  const title = tr(item.title, locale), sub = tr(item.subtitle, locale)
  const color = category?.color || '#5428B3'
  return (
    <button type="button" className={`pcard ${animate ? 'enter' : ''}`} style={{ animationDelay: `${index * 40}ms` }} onClick={onOpen} aria-label={title || sub}>
      <div className="phone">
        <div className="screen" style={{ ['--c1' as string]: `color-mix(in srgb, ${color} 30%, white)`, ['--c2' as string]: color }}>
          <ScreenContent item={item} title={title} />
          {item.kind === 'live' && <span className="badge"><i />{d.live}</span>}
          {item.kind === 'video' && <span className="badge"><PlayIcon size={12} />{locale === 'ar' ? 'فيديو' : 'Video'}</span>}
        </div>
      </div>
      <div className="pmeta">
        <div><b>{sub || title}</b>{sub && title ? <small>{title}</small> : null}</div>
        {category && <span>{tr(category.name, locale)}</span>}
      </div>
    </button>
  )
}

function ScreenContent({ item, title }: { item: Item; title: string }) {
  const poster = item.poster_url || youtubeThumb(item.url)
  if (item.kind === 'live' && item.url && item.embeddable !== false) return <LiveFrame url={item.url} poster={poster} title={title} />
  const src = item.media_url || poster
  if (src) return <Media src={item.media_url} poster={poster} alt={title} />
  return <div className="fallback"><b>{title}</b></div>
}

/** Renders the real page at phone width (390px) and scales it down to the card. */
function LiveFrame({ url, poster, title }: { url: string; poster: string | null; title: string }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.1)
  const box = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(0.54)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const el = box.current?.parentElement
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 390))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={(n) => { ref.current = n; box.current = n }} style={{ position: 'absolute', inset: 0 }}>
      {poster ? <Media src={poster} alt={title} style={{ position: 'absolute', inset: 0 }} /> : <div className="fallback"><b>{title}</b></div>}
      {inView && (
        <iframe className="live-frame" src={url} title={title} loading="lazy" tabIndex={-1} aria-hidden="true"
          style={{ ['--s' as string]: scale, opacity: loaded ? 1 : 0, transition: 'opacity .5s' }} onLoad={() => setLoaded(true)}
          sandbox="allow-scripts allow-same-origin" />
      )}
    </div>
  )
}
