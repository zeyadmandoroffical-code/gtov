import { NextResponse, type NextRequest } from 'next/server'
import { publicClient } from '@/lib/supabase/public'
import { hasSupabase } from '@/lib/supabase/env'

export async function POST(req: NextRequest) {
  if (!hasSupabase) return NextResponse.json({ error: 'not configured' }, { status: 503 })
  let b: Record<string, unknown> = {}
  try { b = await req.json() } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }

  // honeypot: bots fill every field
  if (typeof b.website === 'string' && b.website) return NextResponse.json({ ok: true })

  const name = String(b.name || '').trim().slice(0, 120)
  const phone = String(b.phone || '').replace(/[^\d+]/g, '').slice(0, 30)
  const specialty = String(b.specialty || '').trim().slice(0, 80) || null
  if (name.length < 2 || phone.replace(/\D/g, '').length < 8) {
    return NextResponse.json({ error: 'invalid' }, { status: 422 })
  }
  const sb = publicClient()
  const { error } = await sb.from('leads').insert({
    name, phone, specialty,
    message: typeof b.message === 'string' ? b.message.slice(0, 2000) : null,
    locale: String(b.locale || '').slice(0, 5) || null,
    source: String(b.source || '').slice(0, 200) || null,
  })
  if (error) return NextResponse.json({ error: 'save failed' }, { status: 500 })
  await sb.from('events').insert({ type: 'lead', path: String(b.source || '').slice(0, 300), locale: String(b.locale || '').slice(0, 5) })
  return NextResponse.json({ ok: true })
}
