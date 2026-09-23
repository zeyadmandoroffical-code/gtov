'use client'
import { useCallback, useEffect, useState } from 'react'
import { move, publish, saveOrder, sb } from '@/components/admin/api'
import { Drawer, Fld, LInput, MediaField, Switch, Thumb, useToast } from '@/components/admin/ui'
import type { Category, Doctor } from '@/lib/types'

const BLANK: Partial<Doctor> = { name: { ar: '', en: '' }, bio: {}, color: '#5428B3', code: '', visible: true, avatar_url: '', card_image_url: '', specialty_id: null }

export default function Doctors() {
  const toast = useToast()
  const [list, setList] = useState<Doctor[] | null>(null)
  const [cats, setCats] = useState<Category[]>([])
  const [edit, setEdit] = useState<Partial<Doctor> | null>(null)
  const load = useCallback(async () => {
    const [d, c] = await Promise.all([sb().from('doctors').select('*').order('sort'), sb().from('categories').select('*').order('sort')])
    setList((d.data as Doctor[]) || []); setCats((c.data as Category[]) || [])
  }, [])
  useEffect(() => { load() }, [load])

  async function save() {
    if (!edit) return
    if (!edit.name?.ar) return toast('اكتب اسم الدكتور.', true)
    const row = { name: edit.name, specialty_id: edit.specialty_id || null, avatar_url: edit.avatar_url || null, card_image_url: edit.card_image_url || null,
      code: edit.code || null, color: edit.color || '#5428B3', bio: edit.bio || {}, visible: edit.visible ?? true }
    const { error } = edit.id ? await sb().from('doctors').update(row).eq('id', edit.id) : await sb().from('doctors').insert({ ...row, sort: (list?.length || 0) + 1 })
    if (error) return toast(error.message, true)
    toast('اتحفظ'); setEdit(null); load(); publish()
  }
  async function remove(d: Doctor) {
    if (!confirm(`تمسح ${d.name.ar}؟`)) return
    await sb().from('doctors').delete().eq('id', d.id); load(); publish()
  }
  async function reorder(i: number, dir: number) {
    if (!list) return
    const next = move(list, i, i + dir); setList(next); await saveOrder('doctors', next); publish()
  }
  async function toggle(d: Doctor, v: boolean) { await sb().from('doctors').update({ visible: v }).eq('id', d.id); load(); publish() }

  return (
    <>
      <div className="ph-head">
        <div><h1>الدكاترة</h1><p>دول اللي بيظهروا في كروت الدكاترة. الترتيب هنا هو ترتيب الكروت (أول 7 بس بيظهروا).</p></div>
        <button className="btn pri" onClick={() => setEdit(BLANK)}>+ دكتور</button>
      </div>
      {!list ? <p className="muted">بيحمّل…</p> : list.length === 0 ? <div className="empty-s">مفيش دكاترة لسه.</div> : (
        <div className="list">
          {list.map((d, i) => (
            <div className={`lrow ${d.visible ? '' : 'off'}`} key={d.id}>
              <Thumb src={d.card_image_url || d.avatar_url} label={d.name.ar?.slice(0, 6)} />
              <div className="meta"><b>{d.name.ar}</b><small>{cats.find((c) => c.id === d.specialty_id)?.name.ar || 'بدون تخصص'}</small></div>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: d.color }} />
              <Switch checked={d.visible} onChange={(v) => toggle(d, v)} label="ظاهر" />
              <button className="btn sm icon" aria-label="لفوق" onClick={() => reorder(i, -1)}>↑</button>
              <button className="btn sm icon" aria-label="لتحت" onClick={() => reorder(i, 1)}>↓</button>
              <button className="btn sm pri" onClick={() => setEdit(d)}>عدّل</button>
              <button className="btn sm danger" onClick={() => remove(d)}>امسح</button>
            </div>
          ))}
        </div>
      )}
      {edit && (
        <Drawer title={edit.id ? 'تعديل دكتور' : 'دكتور جديد'} onClose={() => setEdit(null)} actions={<button className="btn pri" onClick={save}>احفظ</button>}>
          <Fld label="الاسم"><LInput value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} /></Fld>
          <div className="grid g2">
            <Fld label="التخصص">
              <select className="sel" value={edit.specialty_id || ''} onChange={(e) => setEdit({ ...edit, specialty_id: e.target.value || null })}>
                <option value="">بدون</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name.ar}</option>)}
              </select>
            </Fld>
            <Fld label="لون الكارت"><input className="in" type="color" value={edit.color || '#5428B3'} onChange={(e) => setEdit({ ...edit, color: e.target.value })} style={{ padding: 4 }} /></Fld>
          </div>
          <Fld label="الصورة الصغيرة (فوق)"><MediaField value={edit.avatar_url} onChange={(v) => setEdit({ ...edit, avatar_url: v })} accept="image/*" /></Fld>
          <Fld label="الصورة الكبيرة (جوه الكارت)" help="ينفع صورة أو فيديو قصير."><MediaField value={edit.card_image_url} onChange={(v) => setEdit({ ...edit, card_image_url: v })} /></Fld>
          <Fld label="الرقم اللي على الكارت" help="اختياري: كود، سنين خبرة، أي رقم."><input className="in" dir="ltr" value={edit.code || ''} onChange={(e) => setEdit({ ...edit, code: e.target.value })} /></Fld>
          <Fld label="نبذة (للاستخدام في صفحة الدكاترة لاحقاً)"><LInput multiline value={edit.bio} onChange={(v) => setEdit({ ...edit, bio: v })} /></Fld>
          <Switch checked={edit.visible ?? true} onChange={(v) => setEdit({ ...edit, visible: v })} label="ظاهر في الموقع" />
        </Drawer>
      )}
    </>
  )
}
