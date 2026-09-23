'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { move, publish, saveOrder, sb } from '@/components/admin/api'
import { Drawer, Fld, LInput, Switch, useToast } from '@/components/admin/ui'
import { SECTION_DEFS } from '@/lib/sections'
import type { L, Page, Section, SectionType } from '@/lib/types'

export default function PageEditor() {
  const { id } = useParams<{ id: string }>()
  const toast = useToast()
  const [page, setPage] = useState<Page | null>(null)
  const [secs, setSecs] = useState<Section[] | null>(null)
  const [adding, setAdding] = useState(false)
  const [meta, setMeta] = useState(false)

  const load = useCallback(async () => {
    const [p, s] = await Promise.all([
      sb().from('pages').select('*').eq('id', id).single(),
      sb().from('sections').select('*').eq('page_id', id).order('sort'),
    ])
    if (p.error) toast(p.error.message, true)
    setPage(p.data as Page); setSecs((s.data as Section[]) || [])
  }, [id, toast])
  useEffect(() => { load() }, [load])

  async function patch(s: Section, v: Partial<Section>) {
    const { error } = await sb().from('sections').update(v).eq('id', s.id)
    if (error) return toast(error.message, true)
    setSecs((x) => x?.map((y) => (y.id === s.id ? { ...y, ...v } : y)) || null); toast('اتحفظ'); publish()
  }
  async function reorder(i: number, d: number) {
    if (!secs) return
    const next = move(secs, i, i + d)
    setSecs(next); await saveOrder('sections', next); publish()
  }
  async function duplicate(s: Section) {
    const { id: _id, ...rest } = s
    void _id
    const { error } = await sb().from('sections').insert({ ...rest, anchor: null, nav_label: null, sort: s.sort + 1 })
    if (error) return toast(error.message, true)
    toast('اتكررت (من غير الشغل اللي جواها)'); load(); publish()
  }
  async function remove(s: Section) {
    if (!confirm('تمسح السكشن ده وكل الشغل اللي جواه؟')) return
    const { error } = await sb().from('sections').delete().eq('id', s.id)
    if (error) return toast(error.message, true)
    toast('اتمسح'); load(); publish()
  }
  async function add(type: SectionType) {
    const def = SECTION_DEFS[type]
    const sort = (secs?.length || 0) + 1
    const { data, error } = await sb().from('sections').insert({ page_id: id, type, content: def.defaults, sort }).select('id').single()
    if (error) return toast(error.message, true)
    publish(); location.href = `/admin/sections/${data.id}`
  }

  if (!page || !secs) return <p className="muted">بيحمّل…</p>
  const viewUrl = page.is_home ? '/ar' : `/ar/${page.slug}`
  return (
    <>
      <div className="crumbs"><Link href="/admin/pages">الصفحات</Link> / {page.title.ar}</div>
      <div className="ph-head">
        <div><h1>{page.title.ar || page.slug}</h1><p>رتب السكاشن، خبيها، أو ضيف جديد. التعديل بيظهر في الموقع على طول.</p></div>
        <div className="row">
          <button className="btn" onClick={() => setMeta(true)}>إعدادات الصفحة</button>
          <a className="btn" href={viewUrl} target="_blank" rel="noopener">اعرض ↗</a>
          <button className="btn pri" onClick={() => setAdding(true)}>+ سكشن جديد</button>
        </div>
      </div>
      {secs.length === 0 ? <div className="empty-s">الصفحة فاضية. ضيف أول سكشن.</div> : (
        <div className="list">
          {secs.map((s, i) => {
            const def = SECTION_DEFS[s.type]
            const title = s.content?.title?.ar || s.content?.title?.en || ''
            return (
              <div className={`lrow ${s.visible ? '' : 'off'}`} key={s.id}>
                <div className="thumb">{i + 1}</div>
                <div className="meta"><b>{def?.label || s.type}</b><small>{title.replace(/\n/g, ' ') || def?.desc}</small></div>
                {s.nav_label?.ar && <span className="pill gray">في المنيو: {s.nav_label.ar}</span>}
                <Switch checked={s.visible} onChange={(v) => patch(s, { visible: v })} label="ظاهر" />
                <button className="btn sm icon" aria-label="لفوق" onClick={() => reorder(i, -1)}>↑</button>
                <button className="btn sm icon" aria-label="لتحت" onClick={() => reorder(i, 1)}>↓</button>
                <Link className="btn sm pri" href={`/admin/sections/${s.id}`}>عدّل{def?.items ? ' + الشغل' : ''}</Link>
                <button className="btn sm ghost" onClick={() => duplicate(s)}>كرّر</button>
                <button className="btn sm danger" onClick={() => remove(s)}>امسح</button>
              </div>
            )
          })}
        </div>
      )}

      {adding && (
        <Drawer title="اختار نوع السكشن" onClose={() => setAdding(false)}>
          <div className="types">
            {(Object.keys(SECTION_DEFS) as SectionType[]).map((t) => (
              <button key={t} onClick={() => add(t)}><b>{SECTION_DEFS[t].label}</b><small>{SECTION_DEFS[t].desc}</small></button>
            ))}
          </div>
        </Drawer>
      )}
      {meta && <PageMeta page={page} onClose={() => setMeta(false)} onSaved={(p) => { setPage(p); setMeta(false) }} />}
    </>
  )
}

function PageMeta({ page, onClose, onSaved }: { page: Page; onClose: () => void; onSaved: (p: Page) => void }) {
  const toast = useToast()
  const [p, setP] = useState(page)
  async function save() {
    const { error } = await sb().from('pages').update({ title: p.title, slug: p.slug, seo: p.seo, in_nav: p.in_nav, published: p.published }).eq('id', p.id)
    if (error) return toast(error.code === '23505' ? 'الرابط ده مستخدم.' : error.message, true)
    toast('اتحفظ'); publish(); onSaved(p)
  }
  const seo = p.seo || {}
  return (
    <Drawer title="إعدادات الصفحة" onClose={onClose} actions={<button className="btn pri" onClick={save}>احفظ</button>}>
      <Fld label="العنوان"><LInput value={p.title} onChange={(v) => setP({ ...p, title: v })} /></Fld>
      {!p.is_home && (
        <Fld label="الرابط"><input className="in" dir="ltr" value={p.slug} onChange={(e) => setP({ ...p, slug: e.target.value.toLowerCase() })} /></Fld>
      )}
      {!p.is_home && <div className="row" style={{ marginBottom: 14 }}>
        <Switch checked={p.published} onChange={(v) => setP({ ...p, published: v })} label="منشورة" />
        <Switch checked={p.in_nav} onChange={(v) => setP({ ...p, in_nav: v })} label="في المنيو" />
      </div>}
      <div className="group"><div className="gtitle">جوجل والسوشيال (SEO)</div>
        <Fld label="العنوان في جوجل"><LInput value={seo.title} onChange={(v: L) => setP({ ...p, seo: { ...seo, title: v } })} /></Fld>
        <Fld label="الوصف في جوجل"><LInput multiline value={seo.description} onChange={(v: L) => setP({ ...p, seo: { ...seo, description: v } })} /></Fld>
      </div>
    </Drawer>
  )
}
