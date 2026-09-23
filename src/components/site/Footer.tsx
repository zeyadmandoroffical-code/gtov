import Link from 'next/link'
import { tr } from '@/lib/i18n'
import type { Locale, Settings } from '@/lib/types'
import type { NavLink } from './Chrome'
import { SocialIcon, TrendIcon } from './Icons'

export function Footer({ settings, nav, locale }: { settings: Settings; nav: NavLink[]; locale: Locale }) {
  return (
    <footer className="ftr">
      <div className="wrap ftr-in">
        <div className="col">
          <Link href={`/${locale}`} className="logo">
            {settings.logo_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={settings.logo_url} alt="Go2Viral" />
              : <><span className="logo-mark" style={{ background: 'var(--violet)', display: 'grid', placeItems: 'center', color: '#fff' }}><TrendIcon size={20} /></span>Go2Viral</>}
          </Link>
          <p>{tr(settings.footer?.tagline, locale)} <span className="ltr">© {new Date().getFullYear()} Go2Viral</span></p>
          {(settings.email || settings.phone) && (
            <p>
              {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
              {settings.email && settings.phone ? <br /> : null}
              {settings.phone && <a href={`tel:${settings.phone}`} className="ltr">{settings.phone}</a>}
            </p>
          )}
        </div>
        <div className="col">
          {nav.length > 0 && <nav aria-label="footer">{nav.map((n) => <Link key={n.href} href={n.href}>{tr(n.label, locale)}</Link>)}</nav>}
          {settings.socials?.length > 0 && (
            <div className="socials">
              {settings.socials.filter((s) => s.url).map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform} data-track="social" data-label={s.platform}>
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
