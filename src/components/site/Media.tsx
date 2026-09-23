import type { CSSProperties } from 'react'
import { isVideoFile } from '@/lib/embed'
import { ImageIcon, PersonIcon } from './Icons'

type Props = {
  src?: string | null
  poster?: string | null
  alt?: string
  className?: string
  person?: boolean
  phStyle?: string
  style?: CSSProperties
  eager?: boolean
  as?: 'div' | 'span'
}

/** Image / looping muted video with a branded placeholder when empty. */
export function Media({ src, poster, alt = '', className, person, phStyle, style, eager, as: Tag = 'div' }: Props) {
  const video = isVideoFile(src)
  const filled = Boolean(src || poster)
  const cls = ['slot', filled ? 'filled' : '', className].filter(Boolean).join(' ')
  const phVars = phStyle ? ({ ['--ph' as string]: phStyle } as CSSProperties) : undefined
  return (
    <Tag className={cls} style={{ ...phVars, ...style }}>
      <span className={person ? 'ph person' : 'ph'}>{person ? <PersonIcon /> : <ImageIcon />}</span>
      {video && src ? (
        <video src={src} poster={poster || undefined} muted loop playsInline autoPlay preload="metadata" />
      ) : src || poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={(src || poster) as string} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      ) : null}
    </Tag>
  )
}
