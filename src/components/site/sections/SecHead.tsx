import type { L, Locale } from '@/lib/types'
import { tr } from '@/lib/i18n'

export function SecHead({ tag, title, lead, locale }: { tag?: L; title?: L; lead?: L; locale: Locale }) {
  const tg = tr(tag, locale), ti = tr(title, locale), le = tr(lead, locale)
  if (!tg && !ti && !le) return null
  return (
    <div className="sec-head">
      {tg && <span className="tag">{tg}</span>}
      {ti && <h2>{ti}</h2>}
      {le && <p>{le}</p>}
    </div>
  )
}
