'use client'
import { useEffect, useState } from 'react'
import { publish, sb } from '@/components/admin/api'
import { Fld, LInput, MediaField, useToast } from '@/components/admin/ui'
import type { L, Settings } from '@/lib/types'

const PLATFORMS = ['facebook', 'instagram', 'tiktok', 'youtube', 'linkedin', 'x', 'snapchat', 'whatsapp']

export default function SettingsPage() {
  const toast = useToast()
  const [s, setS] = useState<Settings | null>(null)
  const [dirty, setDirty] = useState(false)
  useEffect(() => { sb().from('site_settings').select('*').eq('id', 1).single().then(({ data }) => setS(data as Settings)) }, [])
  if (!s) return <p className="muted">بيحمّل…</p>
  const set = (v: Partial<Settings>) => { setS({ ...s, ...v }); setDirty(true) }

  async function save() {
    if (!s) return
    const { error } = await sb().from('site_settings').update({
      brand_color: s.brand_color, logo_url: s.logo_url || null, whatsapp: s.whatsapp.replace(/\D/g, ''), email: s.email || null, phone: s.phone || null,
      socials: s.socials.filter((x) => x.url), ticker: s.ticker, seo: s.seo, footer: s.footer,
    }).eq('id', 1)
    if (error) return toast(error.message, true)
    setDirty(false); toast('اتحفظ واتنشر'); publish()
  }
  const tick = (loc: 'ar' | 'en') => (s.ticker?.[loc] || []).join('\n')

  return (
    <>
      <div className="ph-head"><div><h1>الإعدادات والسوشيال</h1><p>حاجات بتظهر في الموقع كله.</p></div></div>
      <div className="grid g2">
        <div>
          <div className="card">
            <h2>البراند</h2>
            <Fld label="اللوجو" help="PNG شفاف أو SVG. لو فاضي هيظهر اللوجو المكتوب."><MediaField value={s.logo_url} onChange={(v) => set({ logo_url: v })} accept="image/*" /></Fld>
            <Fld label="لون البراند"><div className="row"><input type="color" value={s.brand_color} onChange={(e) => set({ brand_color: e.target.value })} />
              <input className="in" dir="ltr" style={{ width: 130 }} value={s.brand_color} onChange={(e) => set({ brand_color: e.target.value })} /></div></Fld>
          </div>
          <div className="card">
            <h2>التواصل</h2>
            <Fld label="رقم الواتساب" help="بالكود الدولي من غير + (مثال: 201012345678)"><input className="in" dir="ltr" value={s.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} /></Fld>
            <div className="grid g2">
              <Fld label="الإيميل"><input className="in" dir="ltr" value={s.email || ''} onChange={(e) => set({ email: e.target.value })} /></Fld>
              <Fld label="رقم التليفون"><input className="in" dir="ltr" value={s.phone || ''} onChange={(e) => set({ phone: e.target.value })} /></Fld>
            </div>
          </div>
          <div className="card">
            <h2>السوشيال</h2>
            {s.socials.map((x, i) => (
              <div className="row" key={i} style={{ marginBottom: 8 }}>
                <select className="sel" style={{ width: 140 }} value={x.platform} onChange={(e) => set({ socials: s.socials.map((y, j) => (j === i ? { ...y, platform: e.target.value } : y)) })}>
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <input className="in" dir="ltr" style={{ flex: 1 }} value={x.url} placeholder="https://" onChange={(e) => set({ socials: s.socials.map((y, j) => (j === i ? { ...y, url: e.target.value } : y)) })} />
                <button className="btn sm danger" onClick={() => set({ socials: s.socials.filter((_, j) => j !== i) })}>امسح</button>
              </div>
            ))}
            <button className="btn sm" onClick={() => set({ socials: [...s.socials, { platform: 'instagram', url: '' }] })}>+ حساب</button>
          </div>
        </div>
        <div>
          <div className="card">
            <h2>الشريط المتحرك فوق</h2>
            <p className="help" style={{ marginTop: -8 }}>كل جملة في سطر. سيبه فاضي عشان يختفي.</p>
            <div className="lpair">
              <div><span className="tagl">عربي</span><textarea className="ta" dir="rtl" value={tick('ar')} onChange={(e) => set({ ticker: { ...s.ticker, ar: e.target.value.split('\n').filter((x) => x.trim()) } })} /></div>
              <div><span className="tagl">English</span><textarea className="ta" dir="ltr" value={tick('en')} onChange={(e) => set({ ticker: { ...s.ticker, en: e.target.value.split('\n').filter((x) => x.trim()) } })} /></div>
            </div>
          </div>
          <div className="card">
            <h2>جوجل والمشاركة (SEO)</h2>
            <Fld label="عنوان الموقع"><LInput value={s.seo?.title} onChange={(v: L) => set({ seo: { ...s.seo, title: v } })} /></Fld>
            <Fld label="الوصف"><LInput multiline value={s.seo?.description} onChange={(v: L) => set({ seo: { ...s.seo, description: v } })} /></Fld>
            <Fld label="صورة المشاركة (1200×630)"><MediaField value={s.seo?.og_image} onChange={(v) => set({ seo: { ...s.seo, og_image: v } })} accept="image/*" /></Fld>
          </div>
          <div className="card">
            <h2>الفوتر</h2>
            <Fld label="الجملة في الفوتر"><LInput value={s.footer?.tagline} onChange={(v: L) => set({ footer: { ...s.footer, tagline: v } })} /></Fld>
          </div>
        </div>
      </div>
      <div className="savebar">{dirty && <span className="dirty">فيه تعديلات مش محفوظة</span>}<button className="btn pri" disabled={!dirty} onClick={save}>احفظ وانشر</button></div>
    </>
  )
}
