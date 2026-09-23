import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="notice wrap">
      <h1>404</h1>
      <p>الصفحة دي مش موجودة. / This page doesn’t exist.</p>
      <p style={{ marginTop: 24 }}><Link className="btn primary plain" href="/ar">الرئيسية / Home</Link></p>
    </div>
  )
}
