'use client'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { tr } from '@/lib/i18n'
import type { L } from '@/lib/types'
import { SecHead } from './SecHead'
import type { SectionProps } from './types'

export function Process({ section, locale }: SectionProps) {
  const c = section.content
  const steps: { title: L; text: L }[] = c.steps || []
  const ref = useRef<HTMLDivElement>(null)
  const [prog, setProg] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mq = window.matchMedia('(max-width:720px)')
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const on = () => {
      if (rm) { setProg(1); return }
      const r = el.getBoundingClientRect(), vh = innerHeight
      setProg(Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + (mq.matches ? 0 : vh * 0.2)))))
    }
    on()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
  const n = steps.length
  return (
    <section className="sec" id={section.anchor || undefined}>
      <div className="wrap">
        <SecHead tag={c.tag} title={c.title} lead={c.lead} locale={locale} />
        <div className="steps" ref={ref} style={{ '--prog': prog.toFixed(3), gridTemplateColumns: undefined } as CSSProperties}>
          {steps.map((s, i) => (
            <div key={i} className={`step ${prog >= (n > 1 ? (i / (n - 1)) * 0.95 : 0) ? 'on' : ''}`}>
              <span className="n" />
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{tr(s.title, locale)}</h3>
              <p>{tr(s.text, locale)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
