'use client'
import { useState, type FormEvent } from 'react'
import { browserClient } from '@/lib/supabase/browser'

export default function Login() {
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true); setErr('')
    const sb = browserClient()
    const { error } = await sb.auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('password')) })
    if (error) { setErr('الإيميل أو الباسورد غلط.'); setBusy(false); return }
    const { data } = await sb.rpc('is_admin')
    if (data !== true) {
      await sb.auth.signOut()
      setErr('الحساب ده مش أدمن. ضيفه في جدول admins من Supabase (الخطوات في README).')
      setBusy(false); return
    }
    location.href = '/admin'
  }
  return (
    <div className="login">
      <form className="card" onSubmit={submit}>
        <h1 style={{ fontSize: 24, marginBottom: 6 }}>لوحة تحكم Go2Viral</h1>
        <p className="muted" style={{ marginTop: 0, marginBottom: 20 }}>ادخل بحساب الأدمن.</p>
        {err && <div className="err-box" role="alert">{err}</div>}
        <div className="fld"><label className="f" htmlFor="email">الإيميل</label><input className="in" id="email" name="email" type="email" dir="ltr" autoComplete="username" required /></div>
        <div className="fld"><label className="f" htmlFor="pw">الباسورد</label><input className="in" id="pw" name="password" type="password" dir="ltr" autoComplete="current-password" required /></div>
        <button className="btn pri" style={{ width: '100%' }} disabled={busy}>{busy ? 'بيدخل…' : 'دخول'}</button>
      </form>
    </div>
  )
}
