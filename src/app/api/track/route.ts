import { NextResponse, type NextRequest } from 'next/server'
import { publicClient } from '@/lib/supabase/public'
import { hasSupabase } from '@/lib/supabase/env'

const TYPES = new Set(['pageview', 'cta', 'whatsapp', 'item_open', 'lead', 'social'])
const BOT = /bot|crawl|spider|slurp|preview|lighthouse|headless/i
const UUID = /^[0-9a-f-]{36}$/i

function device(ua: string) {
  if (/ipad|tablet/i.test(ua)) return 'tablet'
  if (/mobi|iphone|android/i.test(ua)) return 'mobile'
  return 'desktop'
}
const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : null)

export async function POST(req: NextRequest) {
  const ua = req.headers.get('user-agent') || ''
  if (!hasSupabase || BOT.test(ua)) return new NextResponse(null, { status: 204 })
  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { return new NextResponse(null, { status: 400 }) }
  if (!TYPES.has(String(body.type))) return new NextResponse(null, { status: 400 })

  await publicClient().from('events').insert({
    type: body.type,
    path: clip(body.path, 300),
    locale: clip(body.locale, 5),
    item_id: typeof body.item_id === 'string' && UUID.test(body.item_id) ? body.item_id : null,
    label: clip(body.label, 120),
    session_id: clip(body.session_id, 64),
    referrer: clip(body.referrer, 300),
    device: device(ua),
    country: req.headers.get('x-vercel-ip-country'),
  })
  return new NextResponse(null, { status: 204 })
}
