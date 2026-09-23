'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { sb } from '@/components/admin/api'
import type { L } from '@/lib/types'

type Row = { label: string; count: number }
type Stats = {
  daily: { day: string; views: number; visitors: number; actions: number }[]
  totals: { views: number; visitors: number; whatsapp: number; cta: number; leads: number; item_opens: number; social: number }
  top_items: { item_id: string; title: L; kind: string; count: number }[]
  top_pages: { path: string; count: number }[]
  devices: Row[]; countries: Row[]; referrers: Row[]
  new_leads: number
}

const DEVICE: Record<string, string> = { mobile: 'موبايل', desktop: 'كمبيوتر', tablet: 'تابلت', unknown: 'غير معروف' }

export default function Overview() {
  const [days, setDays] = useState(30)
  const [s, setS] = useState<Stats | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    setS(null)
    sb().rpc('stats_overview', { days }).then(({ data, error }) => { if (error) setErr(error.message); else setS(data as Stats) })
  }, [days])

  const conv = s && s.totals.visitors ? ((s.totals.leads + s.totals.whatsapp) / s.totals.visitors) * 100 : 0

  return (
    <>
      <div className="ph-head">
        <div><h1>نظرة عامة</h1><p>الزيارات وتفاعل الزوار مع الموقع.</p></div>
        <div className="row">
          {[7, 30, 90].map((d) => <button key={d} className={`btn sm ${d === days ? 'pri' : ''}`} onClick={() => setDays(d)}>آخر {d} يوم</button>)}
        </div>
      </div>
      {err && <div className="err-box">{err}</div>}
      {!s ? <p className="muted">بيحمّل…</p> : (
        <>
          <div className="grid g4">
            <div className="kpi hl"><small>الزيارات</small><b>{s.totals.views.toLocaleString('en')}</b></div>
            <div className="kpi"><small>الزوار</small><b>{s.totals.visitors.toLocaleString('en')}</b></div>
            <div className="kpi"><small>طلبات الفورم</small><b>{s.totals.leads}</b></div>
            <div className="kpi"><small>ضغطات واتساب</small><b>{s.totals.whatsapp}</b></div>
            <div className="kpi"><small>ضغطات «احجز»</small><b>{s.totals.cta}</b></div>
            <div className="kpi"><small>فتح شغل / فيديو</small><b>{s.totals.item_opens}</b></div>
            <div className="kpi"><small>ضغطات السوشيال</small><b>{s.totals.social}</b></div>
            <div className="kpi"><small>نسبة التحويل</small><b>{conv.toFixed(1)}%</b></div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="row"><h2 style={{ margin: 0 }}>الزيارات يوم بيوم</h2><span className="spacer" />
              <span className="pill">زيارات</span><span className="pill gray">زوار</span><span className="pill ok">تواصل</span></div>
            <DailyChart data={s.daily} />
          </div>

          <div className="grid g2" style={{ marginTop: 16 }}>
            <div className="card"><h2>أكتر شغل اتفتح</h2>
              <Bars rows={s.top_items.map((x) => ({ label: x.title?.ar || x.title?.en || '—', count: x.count }))} /></div>
            <div className="card"><h2>أكتر صفحات اتزارت</h2><Bars rows={s.top_pages.map((x) => ({ label: x.path, count: x.count }))} ltr /></div>
            <div className="card"><h2>جايين منين</h2><Bars rows={s.referrers.map((x) => ({ label: x.label === 'direct' ? 'مباشر' : x.label, count: x.count }))} ltr /></div>
            <div className="card"><h2>الأجهزة والدول</h2>
              <Bars rows={s.devices.map((x) => ({ label: DEVICE[x.label] || x.label, count: x.count }))} />
              <div style={{ height: 16 }} />
              <Bars rows={s.countries} ltr />
            </div>
          </div>
          {s.new_leads > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="row"><b>عندك {s.new_leads} طلب جديد مستني رد.</b><span className="spacer" /><Link className="btn pri" href="/admin/leads">افتح الطلبات</Link></div>
            </div>
          )}
          <p className="muted small" style={{ marginTop: 16 }}>الأرقام دي من الموقع نفسه. للتحليلات المفصلة زيادة افتح Vercel ← Analytics.</p>
        </>
      )}
    </>
  )
}

function Bars({ rows, ltr }: { rows: Row[]; ltr?: boolean }) {
  if (!rows.length) return <p className="muted small">مفيش بيانات لسه.</p>
  const max = Math.max(...rows.map((r) => r.count), 1)
  return (
    <div className="bars-list">
      {rows.map((r) => (
        <div className="bl-row" key={r.label}>
          <span dir={ltr ? 'ltr' : undefined} style={{ textAlign: 'start', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
          <b>{r.count}</b>
          <span className="track"><i style={{ width: `${(r.count / max) * 100}%` }} /></span>
        </div>
      ))}
    </div>
  )
}

function DailyChart({ data }: { data: Stats['daily'] }) {
  const W = 800, H = 220, P = 24
  const max = Math.max(1, ...data.map((d) => d.views))
  const bw = (W - P * 2) / Math.max(1, data.length)
  const y = (v: number) => H - P - (v / max) * (H - P * 2)
  const line = (k: 'visitors' | 'actions') => data.map((d, i) => `${i ? 'L' : 'M'}${P + i * bw + bw / 2},${y(d[k])}`).join(' ')
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="رسم الزيارات" style={{ direction: 'ltr', marginTop: 12 }}>
      {[0.25, 0.5, 0.75, 1].map((k) => <line key={k} x1={P} x2={W - P} y1={y(max * k)} y2={y(max * k)} stroke="rgba(22,17,43,.07)" />)}
      {data.map((d, i) => (
        <rect key={d.day} x={P + i * bw + bw * 0.18} y={y(d.views)} width={bw * 0.64} height={Math.max(0, H - P - y(d.views))} rx={Math.min(6, bw * 0.3)} fill="#CDBDF6">
          <title>{`${d.day}: ${d.views} زيارة، ${d.visitors} زائر، ${d.actions} تواصل`}</title>
        </rect>
      ))}
      <path d={line('visitors')} fill="none" stroke="#5428B3" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      <path d={line('actions')} fill="none" stroke="#1FAF6B" strokeWidth="2.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
