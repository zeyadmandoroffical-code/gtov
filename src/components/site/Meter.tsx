'use client'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { easeInOut, useReducedMotion } from './hooks'

function colorFor(p: number, lo: number, hi: number) {
  const t = Math.max(0, Math.min(1, (p - lo) / (hi - lo)))
  const h = (4 - 106 * t + 360) % 360, s = 90 - 18 * t, l = 61 - 5 * t
  return { c: `hsl(${h} ${s}% ${l}%)`, c2: `hsl(${h} ${s - 10}% ${l - 30}%)` }
}

type Props = {
  title: string
  start: number
  target: number
  duration?: number
  delay?: number
  interactive?: boolean
  replayLabel?: string
  ariaLabel: string
  footer: (p: number) => ReactNode
  onProgress?: (p: number) => void
  id?: string
}

/** Liquid "clinic schedule" meter: fills coral → pink → violet. */
export function Meter({ title, start, target, duration = 3000, delay = 700, interactive, replayLabel, ariaLabel, footer, onProgress, id }: Props) {
  const rm = useReducedMotion()
  const [p, setP] = useState(start)
  const pRef = useRef(start)
  const busy = useRef(false)
  const raf = useRef(0)

  const animate = useCallback((from: number, to: number, dur: number) => new Promise<void>((done) => {
    cancelAnimationFrame(raf.current)
    if (rm || dur === 0) { pRef.current = to; setP(to); onProgress?.(to); done(); return }
    let t0 = 0
    const step = (ts: number) => {
      if (!t0) t0 = ts
      const k = Math.min(1, (ts - t0) / dur)
      const v = from + (to - from) * easeInOut(k)
      pRef.current = v; setP(v); onProgress?.(v)
      if (k < 1) raf.current = requestAnimationFrame(step); else done()
    }
    raf.current = requestAnimationFrame(step)
  }), [rm, onProgress])

  const run = useCallback(async () => {
    if (busy.current) return
    busy.current = true
    if (pRef.current !== start) await animate(pRef.current, start, 450)
    await animate(start, target, duration)
    busy.current = false
  }, [animate, start, target, duration])

  useEffect(() => {
    const id = setTimeout(run, rm ? 0 : delay)
    return () => { clearTimeout(id); cancelAnimationFrame(raf.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  const col = colorFor(p, start, Math.max(target, start + 1))
  const style = { '--p': p.toFixed(2), '--c': col.c, '--c2': col.c2 } as CSSProperties
  const inner = (
    <>
      <span className="m-top"><span className="m-title">{title}</span><span className="m-val">{Math.round(p)}%</span></span>
      <span className="m-ticks" aria-hidden="true"><span>0</span><span>50</span><span>100</span></span>
      <span className="m-wrap"><span className="m-glow" /><span className="track"><span className="fill" /></span></span>
      <span className="m-foot">{footer(p)}{interactive && replayLabel ? <span className="m-replay">↻ {replayLabel}</span> : null}</span>
    </>
  )
  return interactive ? (
    <button type="button" id={id} className="meter" style={style} aria-label={ariaLabel} onClick={run}>{inner}</button>
  ) : (
    <div id={id} className="meter" style={style} role="img" aria-label={ariaLabel}>{inner}</div>
  )
}
