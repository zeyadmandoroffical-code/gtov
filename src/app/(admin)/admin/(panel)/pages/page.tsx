'use client'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { move, publish, saveOrder, sb } from '@/components/admin/api'
import { Drawer, Fld, LInput, Switch, useToast } from '@/components/admin/ui'
import type { L, Page } from '@/lib/types'

export default function Pages() {
  const toast = useToast()
  const [pages, setPages] = useState<Page[] | null>(null)
  const [adding, setAdding] = useState(false)
  const load = useCallback(async () => {
    const { data, error } = await sb().from('pages').select('*').order('is_home', { ascending: false }).order('sort')
    if (error) toast(error.message, true)
    setPages((data as Page[]) || [])
  }, [toast])
  useEffect(() => { load() }, [load])

  async function patch(p: Page, v: Partial<Page>) {
    const { error } = await sb().from('pages').update(v).eq('id', p.id)
    if (error) return toast(error.message, true)
    toast('اتحفظ'); publish(); load()
  }
  async function remove(p: Page) {
    if (!confirm(`تمسح صفحة «${p.title.ar || p.slug}» وكل السكاشن اللي فيها؟`)) return
    const { error } = await sb().from('pages').delete().eq('id', p.id)
    if (error) return toast(error.message, true)
    toast('اتمسحت'); publish(); load()
  }
  async function makeHome(p: Page) {
    if (!confirm('تخلي الصفحة دي هي الرئيسية؟')) return
    await sb().from('pages').update({ is_home: false }).eq('is_home', true)
    await patch(p, { is_home: true })
  }
  async function reorder(i: number, d: number) {
    if (!pages) return
    const others = pages.filter((p) => !p.is_home)
    const next = move(others, i, i + d)
    setPages([...pages.filter((p) => p.is_home), ...next])
    await saveOrder('pages', next); publish()
  }

  const others = pages?.filter((p) => !p.is_home) || []
  return (
    <>
      <div className="ph-head">
        <div><h1>الصفحات والسكاشن</h1><p>كل صفحة جواها سكاشن. الرئيسية فيها كل حاجة، وتقدر تعمل صفحات زيادة زي «الدكاترة» أو «شغلنا».</p></div>
        <button className="btn pri" onClick={() => setAdding(true)}>+ صفحة جديدة</button>
      </div>
      {!pages ? <p className="muted">بيحمّل…</p> : (
        <div className="list">
          {pages.filter((p) => p.is_home).map((p) => (
            <div className="lrow" key={p.id}>
              <div className="thumb">🏠</div>
              <div className="meta"><b>{p.title.ar || 'الرئيسية'}</b><small dir="ltr">/ar · /en</small></div>
              <span className="pill">الرئيسية</span>
              <Link className="btn sm pri" href={`/admin/pages/${p.id}`}>عدّل السكاشن</Link>
            </div>
          ))}
          {others.map((p, i) => (
            <div className={`lrow ${p.published ? '' : 'off'}`} key={p.id}>
              <div className="thumb">{i + 1}</div>
              <div className="meta"><b>{p.title.ar || p.slug}</b><small dir="ltr">/ar/{p.slug}</small></div>
              <Switch checked={p.published} onChange={(v) => patch(p, { published: v })} label="منشورة" />
              <Switch checked={p.in_nav} onChange={(v) => patch(p, { in_nav: v })} label="في المنيو" />
              <button className="btn sm icon" aria-label="لفوق" onClick={() => reorder(i, -1)}>↑</button>
              <button className="btn sm icon" aria-label="لتحت" onClick={() => reorder(i, 1)}>↓</button>
              <a className="btn sm" href={`/ar/${p.slug}`} target="_blank" rel="noopener">اعرض</a>
              <Link className="btn sm pri" href={`/admin/pages/${p.id}`}>عدّل</Link>
              <button className="btn sm ghost" onClick={() => makeHome(p)}>خليها الرئيسية</button>
              <button className="btn sm danger" onClick={() => remove(p)}>امسح</button>
            </div>
          ))}
        </div>
      )}
      {adding && <NewPage onClose={() => setAdding(false)} onDone={() => { setAdding(false); load() }} />}
    </>
  )
}

function NewPage({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const toast = useToast()
  const [title, setTitle] = useState<L>({ ar: '', en: '' })
  const [slug, setSlug] = useState('')
  const [busy, setBusy] = useState(false)
  async function save() {
    const s = slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '')
    if (!s || !title.ar) return toast('اكتب عنوان عربي ورابط إنجليزي.', true)
    setBusy(true)
    const { data, error } = await sb().from('pages').insert({ slug: s, title, sort: 99 }).select('id').single()
    setBusy(false)
    if (error) return toast(error.code === '23505' ? 'الرابط ده مستخدم قبل كده.' : error.message, true)
    toast('الصفحة اتعملت'); onDone(); location.href = `/admin/pages/${data.id}`
  }
  return (
    <Drawer title="صفحة جديدة" onClose={onClose}>
      <Fld label="عنوان الصفحة (بيظهر في المنيو)"><LInput value={title} onChange={setTitle} /></Fld>
      <Fld label="الرابط" help="حروف إنجليزي صغيرة وأرقام وشرطة. مثال: doctors ← الرابط هيبقى ‎/ar/doctors">
        <input className="in" dir="ltr" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="doctors" />
      </Fld>
      <button className="btn pri" disabled={busy} onClick={save}>اعمل الصفحة</button>
    </Drawer>
  )
}
