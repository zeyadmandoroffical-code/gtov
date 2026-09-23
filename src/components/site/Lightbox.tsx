'use client'
import { useEffect } from 'react'
import { isVideoFile, toEmbed } from '@/lib/embed'
import type { Item, Locale } from '@/lib/types'
import { tr, t } from '@/lib/i18n'
import { CloseIcon, ExternalIcon } from './Icons'

export function Lightbox({ item, locale, onClose }: { item: Item; locale: Locale; onClose: () => void }) {
  const d = t(locale)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  const embed = toEmbed(item.url)
  let body: React.ReactNode = null
  if (item.kind === 'live' && item.url && item.embeddable !== false) {
    body = <div className="lb-device"><iframe src={item.url} title={tr(item.title, locale)} loading="lazy" /></div>
  } else if (embed.type !== 'none' && embed.type !== 'file') {
    body = <div className={`lb-embed ${embed.vertical ? 'vertical' : ''}`}><iframe src={embed.src} title={tr(item.title, locale)} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /></div>
  } else if (isVideoFile(item.media_url) || embed.type === 'file') {
    body = <div className="lb-media"><video src={(isVideoFile(item.media_url) ? item.media_url : item.url) as string} poster={item.poster_url || undefined} controls autoPlay playsInline /></div>
  } else if (item.media_url || item.poster_url) {
    // eslint-disable-next-line @next/next/no-img-element
    body = <div className="lb-media"><img src={(item.media_url || item.poster_url) as string} alt={tr(item.title, locale)} /></div>
  }

  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label={tr(item.title, locale)} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lb-box">
        <div className="lb-top">
          <div><b>{tr(item.title, locale)}</b><small>{tr(item.subtitle, locale)}</small></div>
          <div className="lb-actions">
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer">{d.openPage}<ExternalIcon size={16} /></a>
            )}
            <button type="button" onClick={onClose} aria-label={d.close}><CloseIcon /></button>
          </div>
        </div>
        {body}
      </div>
    </div>
  )
}
