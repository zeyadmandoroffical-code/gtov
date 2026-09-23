'use client'
import { useState, type CSSProperties } from 'react'
import { tr } from '@/lib/i18n'
import { Media } from '../Media'
import { useInView } from '../hooks'
import type { SectionProps } from './types'

const LAYOUT = [
  { x: -2, y: 44, r: -13, z: 1 }, { x: -1, y: 14, r: -5, z: 2 }, { x: 0, y: 0, r: 3, z: 5 },
  { x: 1, y: 18, r: -4, z: 4 }, { x: 2, y: 46, r: 11, z: 3 },
]

/** Pick positions for 1–7 cards, centred. */
function positions(n: number) {
  if (n <= 5) {
    const start = Math.floor((5 - n) / 2)
    return LAYOUT.slice(start, start + n)
  }
  return Array.from({ length: n }, (_, i) => {
    const x = i - (n - 1) / 2
    return { x: x * (4 / (n - 1)), y: Math.abs(x) * 14, r: x * 5 + (i % 2 ? -2 : 2), z: n - Math.round(Math.abs(x)) }
  })
}

function tint(hex: string) {
  return { h1: `color-mix(in srgb, ${hex} 55%, white)`, h2: `color-mix(in srgb, ${hex} 16%, white)` }
}

export function Doctors({ section, doctors, categories, locale }: SectionProps) {
  const c = section.content
  const list = doctors.slice(0, 7)
  const pos = positions(list.length)
  const [ref, open] = useInView<HTMLDivElement>(0.25)
  const [lift, setLift] = useState<string | null>(null)
  const specialty = (id: string | null) => tr(categories.find((x) => x.id === id)?.name, locale)
  const label = locale === 'ar' ? { code: 'كود العيادة', doc: 'الدكتور', spec: 'التخصص' } : { code: 'Clinic code', doc: 'Doctor', spec: 'Specialty' }

  return (
    <section className="clinics" id={section.anchor || undefined}>
      <div className="wrap"><h2 className="mega">{tr(c.title, locale)}</h2></div>
      {list.length > 0 && (
        <div className={`fan ${open ? 'open' : ''}`} ref={ref}>
          {list.map((doc, i) => {
            const t = tint(doc.color || '#5428B3')
            const p = pos[i]
            const style = {
              '--h1': t.h1, '--h2': t.h2, '--band': doc.color, '--x': p.x, '--y': `${p.y}px`, '--r': `${p.r}deg`, '--z': p.z, '--d': `${i * 0.7}s`,
            } as CSSProperties
            return (
              <button type="button" key={doc.id} className={`gcard ${lift === doc.id ? 'lift' : ''}`} style={style}
                aria-label={tr(doc.name, locale)} onClick={() => setLift(lift === doc.id ? null : doc.id)}
                onPointerMove={(e) => {
                  const ph = e.currentTarget.querySelector<HTMLElement>('.gc-photo'); if (!ph) return
                  const r = ph.getBoundingClientRect()
                  ph.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
                  ph.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
                }}>
                <span className="gc-in">
                  <span className="gc-top"><span className="gc-brand">G2V</span><Media as="span" src={doc.avatar_url} person alt="" /></span>
                  <span className="gc-photo">
                    <Media as="span" src={doc.card_image_url} alt={tr(doc.name, locale)} />
                    <span className="gc-shine" />
                    {doc.code && <span className="gc-code"><small>{label.code}</small><b>{doc.code}</b></span>}
                  </span>
                  <span className="gc-band">
                    <span><small>{label.doc}</small><strong>{tr(doc.name, locale)}</strong></span>
                    <span><small>{label.spec}</small><strong>{specialty(doc.specialty_id)}</strong></span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
      {tr(c.subtitle, locale) && <div className="wrap"><p className="mega-sub">{tr(c.subtitle, locale)}</p></div>}
    </section>
  )
}
