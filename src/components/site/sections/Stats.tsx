'use client'
import { useEffect, useState } from 'react'
import { tr } from '@/lib/i18n'
import type { L, Locale } from '@/lib/types'
import { Chrome } from '../ChromeDefs'
import { Media } from '../Media'
import { useInView, useReducedMotion } from '../hooks'
import { SecHead } from './SecHead'
import type { SectionProps } from './types'

type Stat = { value: string; label: L }
type Bar = { label: L; value: number }

function CountUp({ value, run }: { value: string; run: boolean }) {
  const rm = useReducedMotion()
  const m = value.match(/^([^\d]*)([\d.,]+)(.*)$/)
  const [shown, setShown] = useState(m && !rm ? `${m[1]}0${m[3]}` : value)
  useEffect(() => {
    if (!run || !m || rm) { setShown(value); return }
    const target = parseFloat(m[2].replace(/,/g, ''))
    const dec = (m[2].split('.')[1] || '').length
    let raf = 0, t0 = 0
    const f = (ts: number) => {
      if (!t0) t0 = ts
      const k = Math.min(1, (ts - t0) / 1600)
      setShown(`${m[1]}${(target * (1 - Math.pow(1 - k, 3))).toFixed(dec)}${m[3]}`)
      if (k < 1) raf = requestAnimationFrame(f)
    }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, value, rm])
  return <b>{shown}</b>
}

export function Stats({ section, locale }: SectionProps) {
  const c = section.content
  const stats: Stat[] = c.stats || []
  const [barRef, barIn] = useInView<HTMLDivElement>()
  const [statRef, statIn] = useInView<HTMLDivElement>()
  const bars: Bar[] = c.case?.bars || []
  const max = Math.max(1, ...bars.map((b) => Number(b.value) || 0))
  const cmp = c.compare

  return (
    <section className="sec results" id={section.anchor || undefined}>
      <Chrome kind="drop" className="float-a" />
      <div className="wrap">
        <SecHead tag={c.tag} title={c.title} locale={locale} />
        {stats.length > 0 && (
          <div className="statbar" ref={statRef} style={{ ['--n' as string]: stats.length }}>
            {stats.map((s, i) => (
              <div key={i} className={`stat ${i === 0 ? 'hi' : ''}`}><CountUp value={s.value} run={statIn} /><span>{tr(s.label, locale)}</span></div>
            ))}
          </div>
        )}
        <div className="res-grid">
          {c.case && (
            <div className={`rcard ${barIn ? 'in' : ''}`} ref={barRef}>
              <span className="lbl">{tr(c.case.label, locale)}</span>
              <h3>{tr(c.case.title, locale)}</h3>
              <p>{tr(c.case.text, locale)}</p>
              <div className="bars" aria-hidden="true">
                {bars.map((b, i) => <div className="bar" key={i}><i style={{ ['--h' as string]: `${((Number(b.value) || 0) / max) * 100}%` }} /></div>)}
              </div>
              <div className="bar-l">{bars.map((b, i) => <span key={i}>{tr(b.label, locale)}</span>)}</div>
            </div>
          )}
          {cmp && <Compare cmp={cmp} locale={locale} />}
        </div>
      </div>
    </section>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Compare({ cmp, locale }: { cmp: any; locale: Locale }) {
  return (
    <div className="rcard">
      <span className="lbl">{tr(cmp.label, locale)}</span>
      <h3>{tr(cmp.title, locale)}</h3>
      <p>{tr(cmp.text, locale)}</p>
      <div className="goo-wrap">
        <svg viewBox="0 0 560 220" aria-hidden="true">
          <g filter="url(#goo)" className="goo-blob">
            <circle cx="450" cy="110" r="100" /><circle cx="110" cy="110" r="100" />
            <g className="mover"><ellipse cx="318" cy="110" rx="78" ry="54" /></g>
          </g>
          <g className="arrowg" fill="#fff">
            <circle cx="342" cy="110" r="6" />
            <path d="M318 110h-26m10-10-10 10 10 10" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
        <Media className="s-before" src={cmp.before_image} person />
        <Media className="s-after" src={cmp.after_image} person />
      </div>
      <div className="goo-pills">
        <span className="gpill">{tr(cmp.before_label, locale)} <span>{cmp.before_value}</span></span>
        <span className="gpill after">{tr(cmp.after_label, locale)} <span>{cmp.after_value}</span></span>
      </div>
    </div>
  )
}
