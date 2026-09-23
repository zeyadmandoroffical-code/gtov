'use client'
import { useCallback, useEffect, useState } from 'react'
import { move, publish, saveOrder, sb } from '@/components/admin/api'
import { LInput, useToast } from '@/components/admin/ui'
import type { Category } from '@/lib/types'

export default function Categories() {
  const toast = useToast()
  const [list, setList] = useState<Category[] | null>(null)
  const load = useCallback(async () => {
    const { data } = await sb().from('categories').select('*').order('sort'); setList((data as Category[]) || [])
  }, [])
  useEffect(() => { load() }, [load])

  const edit = (i: number, v: Partial<Category>) => setList((x) => x?.map((c, j) => (j === i ? { ...c, ...v } : c)) || null)
  async function saveRow(c: Category) {
    const { error } = await sb().from('categories').update({ name: c.name, color: c.color, slug: c.slug }).eq('id', c.id)
    if (error) return toast(error.message, true)
    toast('اتحفظ'); publish()
  }
  async function add() {
    const slug = `cat-${Date.now().toString(36)}`
    const { error } = await sb().from('categories').insert({ slug, name: { ar: 'تخصص جديد', en: 'New specialty' }, color: '#5428B3', sort: (list?.length || 0) + 1 })
    if (error) return toast(error.message, true)
    load()
  }
  async function remove(c: Category) {
    if (!confirm(`تمسح «${c.name.ar}»؟ الشغل والدكاترة المربوطين بيه هيفضلوا بس من غير تخصص.`)) return
    await sb().from('categories').delete().eq('id', c.id); load(); publish()
  }
  async function reorder(i: number, d: number) {
    if (!list) return
    const next = move(list, i, i + d); setList(next); await saveOrder('categories', next); publish()
  }

  return (
    <>
      <div className="ph-head">
        <div><h1>التخصصات</h1><p>بتستخدم في فلاتر الشغل، كروت الدكاترة، واختيارات الفورم.</p></div>
        <button className="btn pri" onClick={add}>+ تخصص</button>
      </div>
      {!list ? <p className="muted">بيحمّل…</p> : (
        <div className="list">
          {list.map((c, i) => (
            <div className="card" key={c.id} style={{ margin: 0 }}>
              <LInput value={c.name} onChange={(v) => edit(i, { name: v })} />
              <div className="row" style={{ marginTop: 10 }}>
                <label className="row small">اللون <input type="color" value={c.color || '#5428B3'} onChange={(e) => edit(i, { color: e.target.value })} /></label>
                <span className="spacer" />
                <button className="btn sm icon" aria-label="لفوق" onClick={() => reorder(i, -1)}>↑</button>
                <button className="btn sm icon" aria-label="لتحت" onClick={() => reorder(i, 1)}>↓</button>
                <button className="btn sm pri" onClick={() => saveRow(c)}>احفظ</button>
                <button className="btn sm danger" onClick={() => remove(c)}>امسح</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
