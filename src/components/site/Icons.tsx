import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }
const base = (size = 18, rest: SVGProps<SVGSVGElement>) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...rest,
})

export const ArrowIcon = ({ size, className, ...r }: P) => (
  <svg {...base(size, r)} className={['flip', className].filter(Boolean).join(' ')}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
)
export const CheckIcon = ({ size, ...r }: P) => <svg {...base(size, r)} strokeWidth={2.2}><path d="M20 6 9 17l-5-5" /></svg>
export const PersonIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)} strokeWidth={1.6}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
)
export const ImageIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)} strokeWidth={1.6}><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></svg>
)
export const PlayIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)} stroke="none" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
)
export const CalIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)} strokeWidth={1.7}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></svg>
)
export const ChatIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)} strokeWidth={1.8}>
    <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20l1.2-4.2A8.5 8.5 0 1 1 20.5 11.5Z" />
    <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-1.9-1-1 .8a4 4 0 0 1-2.2-2.2l.8-1-1-1.9Z" fill="currentColor" stroke="none" />
  </svg>
)
export const PhoneIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)} strokeWidth={1.8}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
)
export const ReplayIcon = ({ size, ...r }: P) => <svg {...base(size, r)} strokeWidth={1.8}><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" /></svg>
export const CloseIcon = ({ size, ...r }: P) => <svg {...base(size, r)} strokeWidth={2.2}><path d="M6 6l12 12M18 6 6 18" /></svg>
export const ExternalIcon = ({ size, ...r }: P) => <svg {...base(size, r)}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
export const SearchIcon = ({ size, ...r }: P) => <svg {...base(size, r)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
export const TrendIcon = ({ size, ...r }: P) => <svg {...base(size, r)} strokeWidth={2.4}><path d="M5 17 11 11l3 3 5-7" /><path d="M14 7h5v5" /></svg>

export function SocialIcon({ platform, size = 20 }: { platform: string; size?: number }) {
  const p = platform.toLowerCase()
  const s = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true } as const
  if (p.includes('facebook'))
    return <svg {...s} fill="currentColor"><path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" /></svg>
  if (p.includes('instagram'))
    return <svg {...s} fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" /></svg>
  if (p.includes('tiktok'))
    return <svg {...s} fill="currentColor"><path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v2.6c-1.4.1-2.6-.3-3.9-1.1v5.9c0 3.8-3.2 6.2-6.6 5.4-3.6-.8-5-5.3-2.6-8.1 1.2-1.4 3-2 4.8-1.8v2.8c-1.3-.4-2.8.2-3.2 1.5-.5 1.5.6 3 2.2 3 1.5 0 2.3-1.1 2.3-2.6V3h3.1Z" /></svg>
  if (p.includes('youtube'))
    return <svg {...s} fill="currentColor"><path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z" /></svg>
  if (p.includes('linkedin'))
    return <svg {...s} fill="currentColor"><path d="M6.9 8.9H3.8V20h3.1V8.9ZM5.3 4a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM20 13.6c0-3-1.6-4.9-4.2-4.9-1.4 0-2.4.7-2.9 1.5V8.9H10V20h3.1v-5.8c0-1.5.6-2.6 2-2.6 1.3 0 1.8 1 1.8 2.5V20H20v-6.4Z" /></svg>
  if (p === 'x' || p.includes('twitter'))
    return <svg {...s} fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" /></svg>
  if (p.includes('whatsapp')) return <ChatIcon size={size} />
  if (p.includes('snap'))
    return <svg {...s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 3c3 0 5 2.2 5 5v2.5l1.8-.6c.6.3.6 1-.1 1.3l-1.9.8c.6 1.6 1.8 2.9 3.4 3.4-.3.8-1.4 1-2.4 1.2-.2.6-.3 1.1-1 1.1-.9 0-1.8-.4-2.8.2-.9.6-1.8 1.1-2.9 1.1s-2-.5-2.9-1.1c-1-.6-1.9-.2-2.8-.2-.7 0-.8-.5-1-1.1-1-.2-2.1-.4-2.4-1.2 1.6-.5 2.8-1.8 3.4-3.4l-1.9-.8c-.7-.3-.7-1-.1-1.3l1.8.6V8c0-2.8 2-5 5-5Z" /></svg>
  return <ExternalIcon size={size} />
}
