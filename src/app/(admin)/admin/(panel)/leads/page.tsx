'use client'
import { useCallback, useEffect, useState } from 'react'
import { sb } from '@/components/admin/api'
import { useToast } from '@/components/admin/ui'
import type { Lead } from '@/lib/types'

const STATUS: Record<Lead['status'], { label: string; cls: string }> = {
  new: { label: 'جديد', cls: '' }, contacted: { label: 'اتكلمنا', cls: 'warn' }, won: { label: 'اتقفل ✓', cls: 'ok' }, lost: { label: 'مش مهتم', cls: 'gray' },
}

export default function Leads() {
  const toast = useToast()
  const [list, setList] = useState<Lead[] | null>(null)
  const [filter, setFilter] = useState<'all' | Lead['status']>('all')
  const load = useCallback(async () => {
    let q = sb().from('leads').select('*').order('created_at', { ascending: false }).limit(500)
    if (filter !== 'all') q = q.eq('status', filter)
    const { data, error } = await q
    if (error) toast(error.message, true)
    setList((data as Lead[]) || [])
  }, [filter, toast])
  useEffect(() => { load() }, [load])

  async function patch(l: Lead, v: Partial<Lead>) {
    const { error } = await sb().from('leads').update(v).eq('id', l.id)
    if (error) return toast(error.message, true)
    setList((x) => x?.map((y) => (y.id === l.id ? { ...y, ...v } : y)) || null)
  }
  async function remove(l: Lead) {
    if (!confirm(`تمسح طلب ${l.name}؟`)) return
    await sb().from('leads').delete().eq('id', l.id); load()
  }
  function exportCsv() {
    if (!list?.length) return
    const rows = [['التاريخ', 'الاسم', 'التخصص', 'الرقم', 'الحالة', 'ملاحظات', 'اللغة', 'الصفحة'],
      ...list.map((l) => [new Date(l.created_at).toLocaleString('en-GB'), l.name, l.specialty || '', l.phone, STATUS[l.status].label, l.notes || '', l.locale || '', l.source || ''])]
    const csv = '\ufeff' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  }
  const wa = (p: string) => `https://wa.me/${p.replace(/\D/g, '').replace(/^0/, '20')}`

  return (
    <>
      <div className="ph-head">
        <div><h1>الطلبات</h1><p>كل اللي بعتوا الفورم. غيّر الحالة وانت بتتابع.</p></div>
        <div className="row">
          <select className="sel" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">الكل</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button className="btn" onClick={exportCsv}>نزّل Excel (CSV)</button>
        </div>
      </div>
      {!list ? <p className="muted">بيحمّل…</p> : list.length === 0 ? <div className="empty-s">مفيش طلبات هنا.</div> : (
        <div className="card tablewrap" style={{ padding: 0 }}>
          <table className="t">
            <thead><tr><th>الاسم</th><th>التخصص</th><th>الرقم</th><th>الحالة</th><th>ملاحظات</th><th>التاريخ</th><th /></tr></thead>
            <tbody>
              {list.map((l) => (
                <tr key={l.id}>
                  <td><b>{l.name}</b>{l.status === 'new' && <> <span className="pill">جديد</span></>}</td>
                  <td>{l.specialty}</td>
                  <td dir="ltr" style={{ textAlign: 'right' }}><a href={wa(l.phone)} target="_blank" rel="noopener">{l.phone}</a></td>
                  <td>
                    <select className="sel" style={{ minHeight: 34, width: 130 }} value={l.status} onChange={(e) => patch(l, { status: e.target.value as Lead['status'] })}>
                      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                  <td><textarea className="ta" style={{ minHeight: 40, minWidth: 180 }} defaultValue={l.notes || ''} onBlur={(e) => e.target.value !== (l.notes || '') && patch(l, { notes: e.target.value })} /></td>
                  <td className="small muted" dir="ltr">{new Date(l.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td><div className="row">
                    <a className="btn sm" href={wa(l.phone)} target="_blank" rel="noopener">واتساب</a>
                    <button className="btn sm danger" onClick={() => remove(l)}>امسح</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
