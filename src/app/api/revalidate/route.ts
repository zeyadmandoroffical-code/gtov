import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/server'

/** Called by the dashboard after every save so the public site updates right away. */
export async function POST() {
  const sb = await requireAdmin()
  if (!sb) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true })
}
