'use client'
import { Library } from '@/components/admin/ui'

export default function Media() {
  return (
    <>
      <div className="ph-head"><div><h1>مكتبة الميديا</h1><p>كل الصور والفيديوهات المرفوعة. تقدر تختار منها في أي مكان في الموقع.</p></div></div>
      <div className="card"><Library /></div>
    </>
  )
}
