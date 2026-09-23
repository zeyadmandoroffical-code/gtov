'use client'
import { useEffect, useState } from 'react'
import { tr } from '@/lib/i18n'
import type { L, Locale } from '@/lib/types'
import { ArrowIcon, PhoneIcon, PlayIcon, SearchIcon } from '../Icons'
import { Media } from '../Media'
import { useInView } from '../hooks'
import { SecHead } from './SecHead'
import type { SectionProps } from './types'

type Card = { variant: string; title: L; text: L; chips?: L; media_url?: string; cta_label?: L; cta_href?: string }

const chips = (v: L | undefined, l: Locale) =>
  tr(v, l).split(/[،,]/).map((x) => x.trim()).filter(Boolean)

export function Services({ section, locale }: SectionProps) {
  const c = section.content
  const cards: Card[] = c.cards || []
  return (
    <section className="sec" id={section.anchor || undefined}>
      <div className="wrap">
        <SecHead tag={c.tag} title={c.title} lead={c.lead} locale={locale} />
        <div className="bento">
          {cards.map((card, i) => <Tile key={i} card={card} locale={locale} />)}
        </div>
      </div>
    </section>
  )
}

function Chips({ v, l, style }: { v?: L; l: Locale; style?: React.CSSProperties }) {
  const list = chips(v, l)
  if (!list.length) return null
  return <div className="chips" style={style}>{list.map((x) => <span className="chip" key={x}>{x}</span>)}</div>
}

function Tile({ card, locale }: { card: Card; locale: Locale }) {
  const title = tr(card.title, locale), text = tr(card.text, locale)
  switch (card.variant) {
    case 'brand':
      return (
        <article className="tile t-brand">
          <div className="copy"><h3>{title}</h3><p>{text}</p><Chips v={card.chips} l={locale} /></div>
          <div className="media">
            <Media src={card.media_url} person phStyle="linear-gradient(160deg,#3A2A78,#6B4BD8)" />
            <TypingSearch locale={locale} />
          </div>
        </article>
      )
    case 'ads':
      return <AdsTile title={title} text={text} card={card} locale={locale} />
    case 'landing':
      return (
        <article className="tile t-land">
          <h3>{title}</h3><p>{text}</p>
          <div className="mini-phone" aria-hidden="true">
            <i /><i /><i /><i />
            <span className="mini-cta">{locale === 'ar' ? 'احجز ميعادك' : 'Book now'}</span>
            <span className="call"><PhoneIcon size={14} />{locale === 'ar' ? 'مكالمة جديدة' : 'New call'}</span>
          </div>
          <Chips v={card.chips} l={locale} style={{ marginTop: 18 }} />
        </article>
      )
    case 'video':
      return (
        <article className="tile t-video">
          <Media src={card.media_url} phStyle="linear-gradient(200deg,#8C6BF0,#2B1A66)" />
          <span className="play" aria-hidden="true"><PlayIcon size={22} /></span>
          <div className="over"><h3>{title}</h3><p>{text}</p><Chips v={card.chips} l={locale} /></div>
        </article>
      )
    default:
      return (
        <article className="tile t-cta">
          <div><h3>{title}</h3><p>{text}</p></div>
          {card.cta_href && (
            <a href={card.cta_href} className="btn primary small" data-track="cta" data-label="services-cta">
              {tr(card.cta_label, locale)}<span className="ic"><ArrowIcon size={16} /></span>
            </a>
          )}
        </article>
      )
  }
}

function TypingSearch({ locale }: { locale: Locale }) {
  const phrases = locale === 'ar' ? ['أحسن دكتور جلدية قريب مني', 'دكتور تجميل موثوق'] : ['best dermatologist near me', 'trusted aesthetic doctor']
  const [ref, inView] = useInView<HTMLDivElement>()
  const [text, setText] = useState('')
  const [found, setFound] = useState(false)
  useEffect(() => {
    if (!inView) return
    let i = 0, n = 0, alive = true
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      if (!alive) return
      const p = phrases[i % phrases.length]
      n++; setText(p.slice(0, n))
      if (n < p.length) timer = setTimeout(tick, 70)
      else {
        timer = setTimeout(() => setFound(true), 300)
        setTimeout(() => { if (!alive) return; i++; n = 0; setFound(false); setText(''); tick() }, 3600)
      }
    }
    tick()
    return () => { alive = false; clearTimeout(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])
  return (
    <div ref={ref} className={`search ${found ? 'found' : ''}`} aria-hidden="true">
      <div className="q"><SearchIcon size={16} /><span>{text}</span></div>
      <div className="res"><i /><span><b>{locale === 'ar' ? 'د. اسمك هنا' : 'Dr. Your Name'}</b><small>{locale === 'ar' ? 'جلدية وتجميل' : 'Dermatology'}</small></span><span className="badge">{locale === 'ar' ? 'أول نتيجة' : 'Top result'}</span></div>
    </div>
  )
}

function AdsTile({ title, text, card, locale }: { title: string; text: string; card: Card; locale: Locale }) {
  const [ref, inView] = useInView<HTMLElement>()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf = 0, t0 = 0
    const f = (ts: number) => { if (!t0) t0 = ts; const k = Math.min(1, (ts - t0) / 1600); setN(Math.round(37 * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(f) }
    const id = setTimeout(() => { raf = requestAnimationFrame(f) }, 500)
    return () => { clearTimeout(id); cancelAnimationFrame(raf) }
  }, [inView])
  return (
    <article className={`tile t-ads ${inView ? 'on' : ''}`} ref={ref}>
      <h3>{title}</h3><p>{text}</p>
      <div className="switch" aria-hidden="true"><span>{locale === 'ar' ? 'لايكات' : 'Likes'}</span><span>{locale === 'ar' ? 'حجوزات' : 'Bookings'}</span></div>
      <div className="bookings"><b>+{n}</b><small>{locale === 'ar' ? 'حجز من الحملة' : 'bookings from the campaign'}</small></div>
      <Chips v={card.chips} l={locale} />
    </article>
  )
}
