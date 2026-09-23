'use client'
import { useState, type FormEvent } from 'react'
import { tr, t } from '@/lib/i18n'
import { Chrome } from '../ChromeDefs'
import { ArrowIcon, ChatIcon } from '../Icons'
import { Meter } from '../Meter'
import { track } from '../track'
import type { SectionProps } from './types'

export function Contact({ section, settings, categories, locale }: SectionProps) {
  const c = section.content
  const d = t(locale)
  const wa = (settings.whatsapp || '').replace(/\D/g, '')
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [waHref, setWaHref] = useState(`https://wa.me/${wa}`)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') || '').trim()
    const spec = String(f.get('spec') || '')
    const phone = String(f.get('phone') || '').replace(/[^\d+]/g, '')
    const website = String(f.get('website') || '')
    const errs = { name: name.length < 2, spec: !spec, phone: phone.replace(/\D/g, '').length < 8 }
    setErrors(errs)
    if (errs.name || errs.spec || errs.phone) return
    setState('sending')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, specialty: spec, phone, locale, source: location.pathname, website }),
      })
      if (!res.ok) throw new Error()
      setWaHref(`https://wa.me/${wa}?text=${encodeURIComponent(d.waMessage(name, spec, phone))}`)
      setState('sent')
    } catch {
      setState('error')
    }
  }

  return (
    <section className="contact" id={section.anchor || undefined}>
      <div className="wrap">
        <div className="contact-box">
          <Chrome kind="ring" className="float-b" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2>{tr(c.title, locale)}</h2>
            <p className="lead">{tr(c.lead, locale)}</p>
            <Meter
              title={tr(c.meter_title, locale)} start={18} target={state === 'sent' ? 100 : 18}
              duration={1400} delay={0} ariaLabel={tr(c.meter_title, locale)}
              footer={() => <span>{state === 'sent' ? tr(c.meter_full, locale) : tr(c.meter_empty, locale)}</span>}
            />
            {wa && (
              <a className="wa" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" data-track="whatsapp" data-label="contact-link">
                <ChatIcon size={22} />{tr(c.whatsapp_label, locale)}
              </a>
            )}
          </div>

          <form className={`form ${state === 'sent' ? 'sent' : ''}`} onSubmit={onSubmit} noValidate>
            <h3>{tr(c.form_title, locale)}</h3>
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', insetInlineStart: -9999, width: 1, height: 1, opacity: 0 }} />
            <div className={`field ${errors.name ? 'bad' : ''}`}>
              <label htmlFor="fName">{d.name}</label>
              <input id="fName" name="name" autoComplete="name" onInput={() => setErrors((x) => ({ ...x, name: false }))} />
              <div className="err">{d.errName}</div>
            </div>
            <div className={`field ${errors.spec ? 'bad' : ''}`}>
              <label htmlFor="fSpec">{d.specialty}</label>
              <select id="fSpec" name="spec" defaultValue="" onChange={() => setErrors((x) => ({ ...x, spec: false }))}>
                <option value="">{d.chooseSpecialty}</option>
                {categories.map((cat) => <option key={cat.id}>{tr(cat.name, locale)}</option>)}
                <option>{d.otherSpecialty}</option>
              </select>
              <div className="err">{d.errSpec}</div>
            </div>
            <div className={`field ${errors.phone ? 'bad' : ''}`}>
              <label htmlFor="fPhone">{d.whatsappNumber}</label>
              <input id="fPhone" name="phone" type="tel" inputMode="tel" dir="ltr" autoComplete="tel" placeholder="01x xxxx xxxx" onInput={() => setErrors((x) => ({ ...x, phone: false }))} />
              <div className="err">{d.errPhone}</div>
            </div>
            <button className="btn primary" type="submit" disabled={state === 'sending'}>
              {state === 'sending' ? d.sending : d.send}<span className="ic"><ArrowIcon /></span>
            </button>
            {state === 'error' && <p className="contact-status" role="alert">{d.errServer}</p>}
            <div className="done" role="status" aria-live="polite">
              <p>{tr(c.success, locale)}</p>
              <a className="btn small" href={waHref} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp', { label: 'after-lead' })}>
                {d.openWhatsapp}<span className="ic" style={{ background: 'rgba(255,255,255,.2)' }}><ChatIcon size={16} /></span>
              </a>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
