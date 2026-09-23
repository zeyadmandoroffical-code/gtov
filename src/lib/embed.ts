export type Embed =
  | { type: 'youtube' | 'vimeo' | 'tiktok' | 'instagram'; src: string; vertical: boolean }
  | { type: 'file'; src: string; vertical: boolean }
  | { type: 'none' }

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|$)/i

export function toEmbed(url?: string | null): Embed {
  if (!url) return { type: 'none' }
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\.|^m\./, '')
    if (host === 'youtu.be') return yt(u.pathname.slice(1), false)
    if (host.endsWith('youtube.com')) {
      if (u.pathname.startsWith('/shorts/')) return yt(u.pathname.split('/')[2], true)
      if (u.pathname.startsWith('/embed/')) return yt(u.pathname.split('/')[2], false)
      const v = u.searchParams.get('v')
      if (v) return yt(v, false)
    }
    if (host.endsWith('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).find((p) => /^\d+$/.test(p))
      if (id) return { type: 'vimeo', src: `https://player.vimeo.com/video/${id}`, vertical: false }
    }
    if (host.endsWith('tiktok.com')) {
      const m = u.pathname.match(/video\/(\d+)/)
      if (m) return { type: 'tiktok', src: `https://www.tiktok.com/embed/v2/${m[1]}`, vertical: true }
    }
    if (host.endsWith('instagram.com')) {
      const m = u.pathname.match(/\/(reel|p|tv)\/([^/]+)/)
      if (m) return { type: 'instagram', src: `https://www.instagram.com/${m[1]}/${m[2]}/embed`, vertical: true }
    }
    if (VIDEO_EXT.test(u.pathname)) return { type: 'file', src: url, vertical: false }
  } catch {
    /* not a URL */
  }
  return { type: 'none' }
}

function yt(id: string | undefined, vertical: boolean): Embed {
  if (!id) return { type: 'none' }
  return { type: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`, vertical }
}

export const isVideoFile = (url?: string | null) => !!url && VIDEO_EXT.test(url.split('?')[0])

export function youtubeThumb(url?: string | null): string | null {
  const e = toEmbed(url)
  if (e.type !== 'youtube') return null
  const id = e.src.split('/embed/')[1]?.split('?')[0]
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}
