/** Shared SVG gradients/filters for the liquid-chrome shapes and the gooey effect. */
export function ChromeDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="chA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" /><stop offset=".2" stopColor="#E6DDFF" /><stop offset=".38" stopColor="#9C7FEE" />
          <stop offset=".5" stopColor="#2A1766" /><stop offset=".6" stopColor="#6445D0" /><stop offset=".74" stopColor="#ECE5FF" />
          <stop offset=".88" stopColor="#FFFFFF" /><stop offset="1" stopColor="#B9A5F2" />
        </linearGradient>
        <radialGradient id="chHi" cx=".3" cy=".26" r=".5"><stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <radialGradient id="chShade" cx=".72" cy=".82" r=".6"><stop offset="0" stopColor="#140A3A" stopOpacity=".6" /><stop offset="1" stopColor="#140A3A" stopOpacity="0" /></radialGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" /></filter>
        <filter id="goo" x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11" />
        </filter>
        <symbol id="drop" viewBox="0 0 200 200">
          <path d={DROP} fill="url(#chA)" /><path d={DROP} fill="url(#chShade)" /><path d={DROP} fill="url(#chHi)" />
          <path d="M56 150C38 128 38 100 58 82" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" filter="url(#soft)" opacity=".9" />
          <path d="M150 48C168 64 172 92 162 114" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" filter="url(#soft)" opacity=".7" />
        </symbol>
        <symbol id="ring" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="62" fill="none" stroke="url(#chA)" strokeWidth="38" />
          <circle cx="100" cy="100" r="62" fill="none" stroke="url(#chShade)" strokeWidth="38" />
          <path d="M50 72A60 60 0 0 1 118 40" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" filter="url(#soft)" />
          <path d="M150 128A60 60 0 0 1 112 160" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" filter="url(#soft)" opacity=".7" />
        </symbol>
      </defs>
    </svg>
  )
}
const DROP = 'M140 22C182 38 196 92 176 136C156 180 104 196 64 178C24 160 8 116 26 80C40 52 70 50 88 38C104 28 118 14 140 22Z'

export function Chrome({ kind, className }: { kind: 'drop' | 'ring'; className?: string }) {
  return (
    <div className={`chrome ${kind} ${className || ''}`} aria-hidden="true">
      <svg viewBox="0 0 200 200"><use href={`#${kind}`} /></svg>
    </div>
  )
}
