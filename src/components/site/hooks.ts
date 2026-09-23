'use client'
import { useEffect, useRef, useState } from 'react'

export function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    if (!('IntersectionObserver' in window)) { setInView(true); return }
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { setInView(true); io.disconnect() }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, inView])
  return [ref, inView] as const
}

export function useReducedMotion() {
  const [rm, setRm] = useState(false)
  useEffect(() => { setRm(window.matchMedia('(prefers-reduced-motion: reduce)').matches) }, [])
  return rm
}

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
