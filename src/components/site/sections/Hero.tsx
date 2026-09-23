'use client'
import { useCallback, useState } from 'react'
import { tr, t } from '@/lib/i18n'
import type { L } from '@/lib/types'
import { Chrome } from '../ChromeDefs'
import { ArrowIcon, CalIcon, ChatIcon, CheckIcon } from '../Icons'
import { Meter } from '../Meter'
import type { SectionProps } from './types'

type Toast = { title: L; sub: L }
const AT = [30, 58, 86]

export function Hero({ section, locale }: SectionProps) {
  const c = section.content
  const d = t(locale)
  const lines = tr(c.title, locale).split('\n').filter(Boolean)
  const toasts: Toast[] = (c.toasts || []).slice(0, 3)
  const [shown, setShown] = useState<number[]>([])
  const onProgress = useCallback((p: number) => {
    const next = AT.map((a, i) => (p >= a ? i : -1)).filter((i) => i >= 0 && i < toasts.length)
    const visible = p >= 86 ? next.filter((i) => i !== 0) : next
    setShown((prev) => (prev.join() === visible.join() ? prev : visible))
  }, [toasts.length])

  return (
    <section className="hero" id={section.anchor || undefined}>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          {tr(c.badge, locale) && <p className="kicker"><span className="dot" /><span>{tr(c.badge, locale)}</span></p>}
          <h1>{lines.map((l, i) => <span className="ln" key={i}><span>{l}</span></span>)}</h1>
          {tr(c.lead, locale) && <p className="lead">{tr(c.lead, locale)}</p>}
          <div className="ctas">
            {c.primary?.href && (
              <a href={c.primary.href} className="btn primary" data-track="cta" data-label="hero-primary">
                {tr(c.primary.label, locale)}<span className="ic"><ArrowIcon /></span>
              </a>
            )}
            {c.secondary?.href && (
              <a href={c.secondary.href} className="btn ghost" data-track="cta" data-label="hero-secondary">
                {tr(c.secondary.label, locale)}<span className="ic"><ArrowIcon /></span>
              </a>
            )}
          </div>
          {Array.isArray(c.trust) && c.trust.length > 0 && (
            <ul className="trust">{c.trust.map((x: { text: L }, i: number) => <li key={i}><CheckIcon />{tr(x.text, locale)}</li>)}</ul>
          )}
        </div>
        <div className="hero-visual">
          <Chrome kind="ring" className="float-a" />
          <Chrome kind="drop" className="float-b" />
          <Meter
            interactive
            title={tr(c.meter?.title, locale) || '—'}
            start={12} target={94}
            replayLabel={d.replay}
            ariaLabel={tr(c.meter?.title, locale)}
            onProgress={onProgress}
            footer={(p) => <span><b>{Math.round(p / 2)}</b> {tr(c.meter?.footer, locale)}</span>}
          />
          {toasts.map((x, i) => (
            <div key={i} className={`toast t${i + 1} ${shown.includes(i) ? 'show' : ''}`} aria-hidden="true">
              <span className="av">{i === 1 ? <ChatIcon /> : <CalIcon />}</span>
              <span><b>{tr(x.title, locale)}</b><small>{tr(x.sub, locale)}</small></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
