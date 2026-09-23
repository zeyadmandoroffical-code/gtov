import { tr } from '@/lib/i18n'
import { ArrowIcon } from '../Icons'
import { SecHead } from './SecHead'
import type { SectionProps } from './types'

export function RichText({ section, locale }: SectionProps) {
  const c = section.content
  const paras = tr(c.body, locale).split(/\n{2,}|\n/).filter(Boolean)
  return (
    <section className="sec" id={section.anchor || undefined}>
      <div className="wrap">
        <SecHead tag={c.tag} title={c.title} locale={locale} />
        <div className="prose">{paras.map((p, i) => <p key={i}>{p}</p>)}</div>
      </div>
    </section>
  )
}

export function Cta({ section, locale }: SectionProps) {
  const c = section.content
  return (
    <section className="sec" id={section.anchor || undefined} style={{ paddingBlock: 'clamp(40px,6vw,80px)' }}>
      <div className="wrap">
        <div className="ctab">
          <div><h2>{tr(c.title, locale)}</h2>{tr(c.text, locale) && <p>{tr(c.text, locale)}</p>}</div>
          {c.href && (
            <a className="btn" href={c.href} data-track="cta" data-label="cta-banner">
              {tr(c.label, locale)}<span className="ic"><ArrowIcon /></span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
