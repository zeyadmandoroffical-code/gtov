'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ToastProvider } from '@/components/admin/ui'
import { sb } from '@/components/admin/api'

const NAV = [
  { href: '/admin', label: 'نظرة عامة', exact: true },
  { href: '/admin/pages', label: 'الصفحات والسكاشن' },
  { href: '/admin/doctors', label: 'الدكاترة' },
  { href: '/admin/categories', label: 'التخصصات' },
  { href: '/admin/leads', label: 'الطلبات', count: true },
  { href: '/admin/media', label: 'مكتبة الميديا' },
  { href: '/admin/settings', label: 'الإعدادات والسوشيال' },
]

export default function Panel({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const [newLeads, setNewLeads] = useState(0)
  useEffect(() => { document.body.classList.remove('nav-open') }, [path])
  useEffect(() => {
    sb().from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new').then(({ count }) => setNewLeads(count || 0))
  }, [path])
  async function logout() { await sb().auth.signOut(); location.href = '/admin/login' }

  return (
    <ToastProvider>
      <div className="topbar">
        <b style={{ fontFamily: 'var(--fd)' }}>Go2Viral</b>
        <button onClick={() => document.body.classList.toggle('nav-open')}>القائمة</button>
      </div>
      <div className="shell">
        <aside className="side">
          <div className="brand">Go2Viral <i>↗</i></div>
          {NAV.map((n) => {
            const on = n.exact ? path === n.href : path?.startsWith(n.href)
            return (
              <Link key={n.href} href={n.href} className={on ? 'on' : ''}>
                {n.label}{n.count && newLeads > 0 && <span className="count">{newLeads}</span>}
              </Link>
            )
          })}
          <div className="foot">
            <a href="/ar" target="_blank" rel="noopener">افتح الموقع ↗</a>
            <a href="#" onClick={(e) => { e.preventDefault(); logout() }}>تسجيل خروج</a>
          </div>
        </aside>
        <main className="main">{children}</main>
      </div>
    </ToastProvider>
  )
}
