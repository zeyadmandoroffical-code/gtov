'use client'

export type TrackType = 'pageview' | 'cta' | 'whatsapp' | 'item_open' | 'lead' | 'social'

function sessionId() {
  try {
    let id = sessionStorage.getItem('g2v_sid')
    if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem('g2v_sid', id) }
    return id
  } catch { return 'nosession' }
}

export function track(type: TrackType, data: { label?: string; item_id?: string } = {}) {
  try {
    const body = JSON.stringify({
      type,
      path: location.pathname,
      locale: document.documentElement.lang,
      referrer: document.referrer ? new URL(document.referrer).hostname : '',
      session_id: sessionId(),
      ...data,
    })
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))
    else fetch('/api/track', { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true })
  } catch { /* never break the page for analytics */ }
}
