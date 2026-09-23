'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { move, publish, saveOrder, sb } from '@/components/admin/api'
import { Drawer, Fld, FieldList, LInput, MediaField, Switch, Thumb, useToast } from '@/components/admin/ui'
import { KIND_LABEL, SECTION_DEFS } from '@/lib/sections'
import { toEmbed, youtubeThumb } from '@/lib/embed'
import type { Category, Doctor, Item, ItemKind, Section } from '@/lib/types'

export default function SectionEditor() {
  const { id } = useParams<{ id: string }>()
  const toast = useToast()
  const [sec, setSec] = useState<Section | null>(null)
  const [pageTitle, setPageTitle] = useState('')
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    sb().from('sections').select('*, pages(title)').eq('id', id).single().then(({ data, error }) => {
      if (error) return toast(error.message, true)
      const { pages, ...s } = data as Section & { pages: { title: { ar?: string } } }
      setSec(s as Section); setPageTitle(pages?.title?.ar || '')
    })
  }, [id, toast])
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault() } }
    addEventListener('beforeunload', warn)
    return () => removeEventListener('beforeunload', warn)
  }, [dirty])

  if (!sec) return <p className="muted">بيحمّل…</p>
  const def = SECTION_DEFS[sec.type]
  const set = (v: Partial<Section>) => { setSec({ ...sec, ...v }); setDirty(true) }

  async function save() {
    if (!sec) return
    const anchor = sec.anchor ? sec.anchor.toLowerCase().replace(/[^a-z0-9-]+/g, '-') : null
    setBusy(true)
    const { error } = await sb().from('sections').update({ content: sec.content, anchor, nav_label: sec.nav_label?.ar || sec.nav_label?.en ? sec.nav_label : null, visible: sec.visible }).eq('id', sec.id)
    setBusy(false)
    if (error) return toast(error.message, true)
    setDirty(false); toast('اتحفظ واتنشر'); publish()
  }

  return (
    <>
      <div className="crumbs"><Link href="/admin/pages">الصفحات</Link> / <Link href={`/admin/pages/${sec.page_id}`}>{pageTitle}</Link> / {def.label}</div>
      <div className="ph-head"><div><h1>{def.label}</h1><p>{def.desc}</p></div></div>

      <div className="grid" style={{ gridTemplateColumns: def.items ? 'minmax(0,1fr) minmax(0,1fr)' : '1fr' }}>
        <div>
          <div className="card">
            <h2>المحتوى</h2>
            <FieldList fields={def.fields} value={sec.content} onChange={(v) => set({ content: v })} />
          </div>
          <div className="card">
            <h2>المكان في الصفحة</h2>
            <div className="fld"><Switch checked={sec.visible} onChange={(v) => set({ visible: v })} label="السكشن ظاهر في الموقع" /></div>
            <Fld label="اسم الرابط (anchor)" help="حروف إنجليزي. لو كتبت work هتقدر تعمل زرار يودي لـ ‎#work">
              <input className="in" dir="ltr" value={sec.anchor || ''} onChange={(e) => set({ anchor: e.target.value })} />
            </Fld>
            <Fld label="اسمه في المنيو اللي فوق" help="سيبه فاضي لو مش عايزه يظهر في المنيو. شغال بس في الصفحة الرئيسية.">
              <LInput value={sec.nav_label} onChange={(v) => set({ nav_label: v })} />
            </Fld>
          </div>
          <div className="savebar">
            {dirty && <span className="dirty">فيه تعديلات مش محفوظة</span>}
            <button className="btn pri" onClick={save} disabled={busy || !dirty}>{busy ? 'بيحفظ…' : 'احفظ وانشر'}</button>
          </div>
        </div>
        {def.items && <ItemsManager section={sec} kinds={def.items.kinds} label={def.items.label} />}
      </div>
    </>
  )
}

/* ---------------------------------------------------------------- items */
const BLANK = (section_id: string, kind: ItemKind): Partial<Item> => ({
  section_id, kind, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' }, url: '', media_url: '', poster_url: '',
  category_id: null, doctor_id: null, visible: true, featured: false, embeddable: null,
})

function ItemsManager({ section, kinds, label }: { section: Section; kinds: ItemKind[]; label: string }) {
  const toast = useToast()
  const [items, setItems] = useState<Item[] | null>(null)
  const [cats, setCats] = useState<Category[]>([])
  const [docs, setDocs] = useState<Doctor[]>([])
  const [edit, setEdit] = useState<Partial<Item> | null>(null)
  const load = useCallback(async () => {
    const [i, c, d] = await Promise.all([
      sb().from('items').select('*').eq('section_id', section.id).order('sort'),
      sb().from('categories').select('*').order('sort'),
      sb().from('doctors').select('*').order('sort'),
    ])
    setItems((i.data as Item[]) || []); setCats((c.data as Category[]) || []); setDocs((d.data as Doctor[]) || [])
  }, [section.id])
  useEffect(() => { load() }, [load])

  async function reorder(i: number, d: number) {
    if (!items) return
    const next = move(items, i, i + d); setItems(next); await saveOrder('items', next); publish()
  }
  async function toggle(it: Item, v: boolean) {
    await sb().from('items').update({ visible: v }).eq('id', it.id)
    setItems((x) => x?.map((y) => (y.id === it.id ? { ...y, visible: v } : y)) || null); publish()
  }
  async function remove(it: Item) {
    if (!confirm('تمسح ده؟')) return
    await sb().from('items').delete().eq('id', it.id); toast('اتمسح'); load(); publish()
  }

  return (
    <div className="card" style={{ alignSelf: 'start' }}>
      <div className="row" style={{ marginBottom: 12 }}><h2 style={{ margin: 0 }}>ال{label} ({items?.length || 0})</h2></div>
      <div className="row" style={{ marginBottom: 14 }}>
        {kinds.map((k) => <button key={k} className="btn sm" onClick={() => setEdit(BLANK(section.id, k))}>+ {KIND_LABEL[k]}</button>)}
      </div>
      {!items ? <p className="muted">بيحمّل…</p> : items.length === 0 ? <div className="empty-s">مفيش حاجة لسه. ضيف أول {label}.</div> : (
        <div className="list">
          {items.map((it, i) => (
            <div className={`lrow stack ${it.visible ? '' : 'off'}`} key={it.id}>
              <Thumb src={it.poster_url || it.media_url || youtubeThumb(it.url)} label={KIND_LABEL[it.kind]} />
              <div className="meta">
                <b>{it.title.ar || it.title.en || it.subtitle.ar || '—'}</b>
                <small>{KIND_LABEL[it.kind]}{it.category_id ? ` · ${cats.find((c) => c.id === it.category_id)?.name.ar || ''}` : ''}</small>
                {it.kind === 'live' && it.embeddable === false && <div><span className="pill warn">مش بتتعرض لايف، هيظهر السكرين شوت</span></div>}
              </div>
              <div className="acts">
                <Switch checked={it.visible} onChange={(v) => toggle(it, v)} label="ظاهر" />
                <span className="spacer" />
                <button className="btn sm icon" aria-label="لفوق" onClick={() => reorder(i, -1)}>↑</button>
                <button className="btn sm icon" aria-label="لتحت" onClick={() => reorder(i, 1)}>↓</button>
                <button className="btn sm pri" onClick={() => setEdit(it)}>عدّل</button>
                <button className="btn sm danger" onClick={() => remove(it)}>امسح</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {edit && <ItemForm item={edit} cats={cats} docs={docs} kinds={kinds} count={items?.length || 0}
        onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); publish() }} />}
    </div>
  )
}

function ItemForm({ item, cats, docs, kinds, count, onClose, onSaved }: {
  item: Partial<Item>; cats: Category[]; docs: Doctor[]; kinds: ItemKind[]; count: number; onClose: () => void; onSaved: () => void
}) {
  const toast = useToast()
  const [it, setIt] = useState<Partial<Item>>(item)
  const [checking, setChecking] = useState(false)
  const [check, setCheck] = useState<string>('')
  const set = (v: Partial<Item>) => setIt((x) => ({ ...x, ...v }))
  const kind = it.kind as ItemKind

  async function runCheck() {
    if (!it.url) return toast('حط الرابط الأول.', true)
    setChecking(true); setCheck('')
    try {
      const r = await fetch('/api/check-embed', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: it.url }) })
      const j = await r.json()
      if (!r.ok) { setCheck(j.error || 'حصلت مشكلة.'); return }
      set({ embeddable: j.embeddable, poster_url: it.poster_url || j.image || '', title: it.title?.ar || it.title?.en ? it.title : { ar: j.title || '', en: j.title || '' } })
      setCheck(j.embeddable ? 'تمام: الصفحة هتشتغل لايف جوه الموبايل.' : `الموقع ده مانع العرض جوه فريم (${j.reason}). هنعرض السكرين شوت ولما حد يدوس هتفتح الصفحة.`)
    } finally { setChecking(false) }
  }

  async function save() {
    const row = {
      section_id: it.section_id, kind: it.kind, title: it.title, subtitle: it.subtitle,
      url: it.url || null, media_url: it.media_url || null, poster_url: it.poster_url || null, embeddable: it.embeddable ?? null,
      category_id: it.category_id || null, doctor_id: it.doctor_id || null, visible: it.visible ?? true, featured: it.featured ?? false,
    }
    if ((kind === 'live' || kind === 'link') && !row.url) return toast('الرابط مطلوب.', true)
    if (kind === 'image' && !row.media_url) return toast('ارفع صورة.', true)
    if (kind === 'video' && !row.media_url && !row.url) return toast('ارفع فيديو أو حط لينك.', true)
    const q = it.id ? sb().from('items').update(row).eq('id', it.id) : sb().from('items').insert({ ...row, sort: count + 1 })
    const { error } = await q
    if (error) return toast(error.message, true)
    toast('اتحفظ واتنشر'); onSaved()
  }

  const embed = toEmbed(it.url)
  return (
    <Drawer title={it.id ? 'تعديل' : `إضافة ${KIND_LABEL[kind]}`} onClose={onClose} actions={<button className="btn pri" onClick={save}>احفظ</button>}>
      {kinds.length > 1 && (
        <Fld label="النوع">
          <select className="sel" value={kind} onChange={(e) => set({ kind: e.target.value as ItemKind })}>
            {kinds.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
          </select>
        </Fld>
      )}

      {kind === 'live' && (
        <div className="group">
          <div className="gtitle">رابط الصفحة اللايف</div>
          <Fld label="الرابط" help="الصفحة هتتعرض شغالة جوه الموبايل. اضغط «افحص» عشان نتأكد إنها تنفع تتعرض ونجيب صورتها.">
            <div className="row"><input className="in" dir="ltr" style={{ flex: 1 }} value={it.url || ''} onChange={(e) => set({ url: e.target.value, embeddable: null })} placeholder="https://" />
              <button className="btn" onClick={runCheck} disabled={checking}>{checking ? 'بيفحص…' : 'افحص'}</button></div>
          </Fld>
          {check && <p className={`small ${it.embeddable === false ? 'dirty' : ''}`} style={{ marginTop: -6 }}>{check}</p>}
        </div>
      )}
      {kind === 'link' && (
        <Fld label="الرابط" help="هيفتح في تاب جديد."><input className="in" dir="ltr" value={it.url || ''} onChange={(e) => set({ url: e.target.value })} placeholder="https://" /></Fld>
      )}
      {kind === 'video' && (
        <div className="group">
          <div className="gtitle">الفيديو</div>
          <Fld label="لينك (يوتيوب، تيك توك، إنستجرام، فيميو)" help={it.url ? (embed.type === 'none' ? 'اللينك ده مش متعرف عليه. جرب لينك الفيديو نفسه.' : `اتعرف عليه: ${embed.type}`) : 'أو ارفع الفيديو تحت. الفيديوهات الطويلة الأفضل على يوتيوب.'}>
            <input className="in" dir="ltr" value={it.url || ''} onChange={(e) => set({ url: e.target.value })} placeholder="https://youtube.com/…" />
          </Fld>
          <Fld label="أو ارفع ملف فيديو"><MediaField value={it.media_url} onChange={(v) => set({ media_url: v })} accept="video/*" /></Fld>
        </div>
      )}
      {kind === 'image' && <Fld label="الصورة / السكرين شوت"><MediaField value={it.media_url} onChange={(v) => set({ media_url: v })} accept="image/*,video/*" /></Fld>}
      {kind !== 'image' && (
        <Fld label={kind === 'live' ? 'سكرين شوت احتياطي' : 'صورة الغلاف'} help="بتظهر لحد ما الفيديو أو الصفحة يحمّلوا.">
          <MediaField value={it.poster_url} onChange={(v) => set({ poster_url: v })} accept="image/*" />
        </Fld>
      )}

      <Fld label="العنوان"><LInput value={it.title} onChange={(v) => set({ title: v })} /></Fld>
      <Fld label="السطر التاني (اسم الدكتور مثلاً)"><LInput value={it.subtitle} onChange={(v) => set({ subtitle: v })} /></Fld>
      <div className="grid g2">
        <Fld label="التخصص (للفلتر)">
          <select className="sel" value={it.category_id || ''} onChange={(e) => set({ category_id: e.target.value || null })}>
            <option value="">بدون</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name.ar}</option>)}
          </select>
        </Fld>
        <Fld label="الدكتور">
          <select className="sel" value={it.doctor_id || ''} onChange={(e) => set({ doctor_id: e.target.value || null })}>
            <option value="">بدون</option>{docs.map((d) => <option key={d.id} value={d.id}>{d.name.ar}</option>)}
          </select>
        </Fld>
      </div>
      <div className="row"><Switch checked={it.visible ?? true} onChange={(v) => set({ visible: v })} label="ظاهر في الموقع" /></div>
    </Drawer>
  )
}
