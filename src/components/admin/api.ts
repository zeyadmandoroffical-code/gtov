'use client'
import { browserClient } from '@/lib/supabase/browser'

export const sb = () => browserClient()

/** Tell Next.js to rebuild the public pages after a change. */
export async function publish() {
  try { await fetch('/api/revalidate', { method: 'POST' }) } catch { /* the site still updates within 5 minutes */ }
}

async function compress(file: File, max = 2000): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file)
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    const out = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/webp', 0.86))
    return out && out.size < file.size ? out : file
  } catch { return file }
}

export async function uploadFile(file: File): Promise<string> {
  let blob: Blob = file
  let ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  if (/^image\/(jpeg|png|webp)$/.test(file.type)) {
    blob = await compress(file)
    if (blob !== file) ext = 'webp'
  }
  const path = `uploads/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const { error } = await sb().storage.from('media').upload(path, blob, {
    contentType: blob.type || file.type || undefined, cacheControl: '31536000', upsert: false,
  })
  if (error) throw new Error(error.message.includes('exceeded') ? 'الملف أكبر من الحد المسموح في Supabase. ارفعه على يوتيوب وحط اللينك.' : error.message)
  return sb().storage.from('media').getPublicUrl(path).data.publicUrl
}

/** Save new sort order for a list of rows (only rows whose position changed). */
export async function saveOrder(table: string, rows: { id: string; sort: number }[]) {
  const changed = rows.map((r, i) => ({ ...r, next: i + 1 })).filter((r) => r.sort !== r.next)
  await Promise.all(changed.map((r) => sb().from(table).update({ sort: r.next }).eq('id', r.id)))
}

export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list
  const copy = list.slice()
  const [x] = copy.splice(from, 1)
  copy.splice(to, 0, x)
  return copy
}
