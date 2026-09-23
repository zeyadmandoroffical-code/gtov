import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/supabase/server'

/**
 * Checks whether a page can be shown live inside an iframe on our site
 * (X-Frame-Options / CSP frame-ancestors) and grabs its og:image + title.
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const { url } = await req.json().catch(() => ({ url: '' }))
  let target: URL
  try { target = new URL(url); if (!/^https?:$/.test(target.protocol)) throw new Error() }
  catch { return NextResponse.json({ error: 'الرابط مش صحيح.' }, { status: 422 }) }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 9000)
  try {
    const res = await fetch(target, { redirect: 'follow', signal: ctrl.signal, headers: { 'user-agent': 'Mozilla/5.0 Go2ViralBot/1.0' } })
    const xfo = (res.headers.get('x-frame-options') || '').toLowerCase()
    const csp = (res.headers.get('content-security-policy') || '').toLowerCase()
    const fa = csp.match(/frame-ancestors([^;]*)/)?.[1]?.trim() || ''
    const site = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host : ''

    let embeddable = true
    let reason = ''
    if (xfo.includes('deny') || xfo.includes('sameorigin')) { embeddable = false; reason = `X-Frame-Options: ${xfo}` }
    if (fa && !fa.includes('*') && !(site && fa.includes(site))) { embeddable = false; reason = `frame-ancestors ${fa}` }

    const html = (await res.text()).slice(0, 300_000)
    const meta = (p: string) =>
      html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${p}["'][^>]*content=["']([^"']+)`, 'i'))?.[1] ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${p}["']`, 'i'))?.[1] || null
    let image = meta('og:image') || meta('twitter:image')
    if (image) { try { image = new URL(image, res.url).toString() } catch { image = null } }
    const title = meta('og:title') || html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || null

    return NextResponse.json({ ok: res.ok, status: res.status, embeddable, reason, image, title, finalUrl: res.url })
  } catch {
    return NextResponse.json({ error: 'الصفحة ماردتش. اتأكد إن الرابط شغال.' }, { status: 502 })
  } finally {
    clearTimeout(timer)
  }
}
