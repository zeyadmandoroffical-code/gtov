'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { L } from '@/lib/types'
import type { Field } from '@/lib/sections'
import { isVideoFile } from '@/lib/embed'
import { sb, uploadFile } from './api'

/* ---------------- toast ---------------- */
type ToastFn = (msg: string, err?: boolean) => void
const ToastCtx = createContext<ToastFn>(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [t, setT] = useState<{ msg: string; err?: boolean } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const show = useCallback<ToastFn>((msg, err) => {
    setT({ msg, err }); clearTimeout(timer.current); timer.current = setTimeout(() => setT(null), err ? 5000 : 2200)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {t && <div className={`toast ${t.err ? 'err' : ''}`} role="status">{t.msg}</div>}
    </ToastCtx.Provider>
  )
}

/* ---------------- basics ---------------- */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="sw">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i />{label}
    </label>
  )
}

export function Fld({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return <div className="fld"><label className="f">{label}</label>{children}{help && <div className="help">{help}</div>}</div>
}

export function LInput({ value, onChange, multiline }: { value?: L | null; onChange: (v: L) => void; multiline?: boolean }) {
  const v = value || {}
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <div className="lpair">
      <div><span className="tagl">عربي</span>
        <Tag className={multiline ? 'ta' : 'in'} dir="rtl" value={v.ar || ''} onChange={(e) => onChange({ ...v, ar: e.target.value })} /></div>
      <div><span className="tagl">English</span>
        <Tag className={multiline ? 'ta' : 'in'} dir="ltr" value={v.en || ''} onChange={(e) => onChange({ ...v, en: e.target.value })} /></div>
    </div>
  )
}

export function Drawer({ title, onClose, children, actions }: { title: string; onClose: () => void; children: ReactNode; actions?: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="drawer-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-h"><h2>{title}</h2>{actions}<button className="btn ghost" onClick={onClose}>إغلاق</button></div>
        {children}
      </div>
    </div>
  )
}

export function Thumb({ src, label }: { src?: string | null; label?: string }) {
  return (
    <div className="thumb">
      {src ? (isVideoFile(src) ? <video src={src} muted /> : /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt="" />) : label}
    </div>
  )
}

/* ---------------- media ---------------- */
export function MediaField({ value, onChange, accept = 'image/*,video/*' }: { value?: string | null; onChange: (v: string) => void; accept?: string }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [pick, setPick] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  async function onFile(f?: File) {
    if (!f) return
    setBusy(true)
    try { onChange(await uploadFile(f)); toast('اترفع') }
    catch (e) { toast((e as Error).message, true) }
    finally { setBusy(false); if (input.current) input.current.value = '' }
  }
  return (
    <div className="media-f">
      <div className="prev">
        {value ? (isVideoFile(value) ? <video src={value} muted autoPlay loop playsInline /> : /* eslint-disable-next-line @next/next/no-img-element */ <img src={value} alt="" />) : <span className="small">مفيش</span>}
      </div>
      <div className="ctrls">
        <input className="in" dir="ltr" placeholder="https://…" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        <div className="row">
          <button type="button" className="btn sm pri" disabled={busy} onClick={() => input.current?.click()}>{busy ? 'بيترفع…' : 'ارفع ملف'}</button>
          <button type="button" className="btn sm" onClick={() => setPick(true)}>من المكتبة</button>
          {value && <button type="button" className="btn sm danger" onClick={() => onChange('')}>شيل</button>}
          <input ref={input} type="file" hidden accept={accept} onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
      </div>
      {pick && <Drawer title="اختار من المكتبة" onClose={() => setPick(false)}><Library onPick={(u) => { onChange(u); setPick(false) }} /></Drawer>}
    </div>
  )
}

export function Library({ onPick }: { onPick?: (url: string) => void }) {
  const toast = useToast()
  const [files, setFiles] = useState<{ name: string; url: string; size: number }[] | null>(null)
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const load = useCallback(async () => {
    const { data, error } = await sb().storage.from('media').list('uploads', { limit: 500, sortBy: { column: 'created_at', order: 'desc' } })
    if (error) { toast(error.message, true); setFiles([]); return }
    setFiles((data || []).filter((f) => f.id).map((f) => ({
      name: f.name, size: (f.metadata as { size?: number } | null)?.size || 0,
      url: sb().storage.from('media').getPublicUrl(`uploads/${f.name}`).data.publicUrl,
    })))
  }, [toast])
  useEffect(() => { load() }, [load])
  async function up(list: FileList | null) {
    if (!list?.length) return
    setBusy(true)
    try { for (const f of Array.from(list)) await uploadFile(f); toast('اترفع'); load() }
    catch (e) { toast((e as Error).message, true) } finally { setBusy(false) }
  }
  async function del(name: string) {
    if (!confirm('تمسح الملف ده نهائي؟ لو مستخدم في الموقع هيختفي من هناك.')) return
    const { error } = await sb().storage.from('media').remove([`uploads/${name}`])
    if (error) toast(error.message, true); else { toast('اتمسح'); load() }
  }
  return (
    <div>
      <div className="row" style={{ marginBottom: 14 }}>
        <button className="btn pri" disabled={busy} onClick={() => input.current?.click()}>{busy ? 'بيترفع…' : 'ارفع صور أو فيديوهات'}</button>
        <input ref={input} type="file" multiple hidden accept="image/*,video/*" onChange={(e) => up(e.target.files)} />
        <span className="muted small">الصور بتتضغط لوحدها قبل الرفع.</span>
      </div>
      {!files ? <p className="muted">بيحمّل…</p> : files.length === 0 ? <div className="empty-s">المكتبة فاضية. ارفع أول ملف.</div> : (
        <div className={`lib ${onPick ? 'pick' : ''}`}>
          {files.map((f) => (
            <div className="tile" key={f.name} onClick={() => onPick?.(f.url)}>
              <div className="pv">{isVideoFile(f.url) ? <video src={f.url} muted preload="metadata" /> : /* eslint-disable-next-line @next/next/no-img-element */ <img src={f.url} alt="" loading="lazy" />}</div>
              <div className="cap">{(f.size / 1024 / 1024).toFixed(1)} MB</div>
              {!onPick && (
                <div className="acts">
                  <button onClick={() => { navigator.clipboard.writeText(f.url); toast('الرابط اتنسخ') }}>انسخ</button>
                  <button onClick={() => del(f.name)}>امسح</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------------- schema-driven form ---------------- */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function FieldList({ fields, value, onChange }: { fields: Field[]; value: Record<string, any>; onChange: (v: Record<string, any>) => void }) {
  return <>{fields.map((f) => <FieldView key={f.key} field={f} value={value?.[f.key]} onChange={(v) => onChange({ ...(value || {}), [f.key]: v })} />)}</>
}

function FieldView({ field: f, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  switch (f.type) {
    case 'l': return <Fld label={f.label} help={f.help}><LInput value={value} onChange={onChange} /></Fld>
    case 'lt': return <Fld label={f.label} help={f.help}><LInput value={value} onChange={onChange} multiline /></Fld>
    case 'text': case 'url':
      return <Fld label={f.label} help={f.help}><input className="in" dir="ltr" value={value || ''} onChange={(e) => onChange(e.target.value)} /></Fld>
    case 'number':
      return <Fld label={f.label} help={f.help}><input className="in" type="number" dir="ltr" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} /></Fld>
    case 'bool': return <div className="fld"><Switch checked={!!value} onChange={onChange} label={f.label} /></div>
    case 'select':
      return (
        <Fld label={f.label} help={f.help}>
          <select className="sel" value={value || ''} onChange={(e) => onChange(e.target.value)}>
            <option value="">اختار…</option>
            {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Fld>
      )
    case 'media': return <Fld label={f.label} help={f.help}><MediaField value={value} onChange={onChange} /></Fld>
    case 'group':
      return <div className="group"><div className="gtitle">{f.label}</div><FieldList fields={f.fields || []} value={value || {}} onChange={onChange} /></div>
    case 'list': {
      const list: any[] = Array.isArray(value) ? value : []
      const set = (i: number, v: any) => onChange(list.map((x, j) => (j === i ? v : x)))
      const mv = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= list.length) return; const c = list.slice(); [c[i], c[j]] = [c[j], c[i]]; onChange(c) }
      return (
        <div className="group">
          <div className="gtitle">{f.label}</div>
          {list.map((it, i) => (
            <div className="litem" key={i}>
              <div className="litem-h">
                <span>{f.itemLabel || 'عنصر'} {i + 1}</span><span className="spacer" />
                <button type="button" className="btn sm icon" aria-label="لفوق" onClick={() => mv(i, -1)}>↑</button>
                <button type="button" className="btn sm icon" aria-label="لتحت" onClick={() => mv(i, 1)}>↓</button>
                <button type="button" className="btn sm danger" onClick={() => onChange(list.filter((_, j) => j !== i))}>امسح</button>
              </div>
              <FieldList fields={f.fields || []} value={it || {}} onChange={(v) => set(i, v)} />
            </div>
          ))}
          <button type="button" className="btn sm" style={{ marginBottom: 12 }} onClick={() => onChange([...list, {}])}>+ ضيف {f.itemLabel || 'عنصر'}</button>
        </div>
      )
    }
  }
}
