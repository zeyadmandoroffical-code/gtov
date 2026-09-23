export type Locale = 'ar' | 'en'
export const LOCALES: Locale[] = ['ar', 'en']
export type L = { ar?: string; en?: string }

export type SectionType =
  | 'hero' | 'doctors' | 'services' | 'work' | 'videos'
  | 'stats' | 'process' | 'contact' | 'richtext' | 'gallery' | 'cta'

export type ItemKind = 'live' | 'video' | 'image' | 'link'

export type Social = { platform: string; url: string }

export type Settings = {
  brand_color: string
  logo_url: string | null
  whatsapp: string
  email: string | null
  phone: string | null
  socials: Social[]
  ticker: { ar?: string[]; en?: string[] }
  seo: { title?: L; description?: L; og_image?: string }
  footer: { tagline?: L }
}

export type Page = {
  id: string
  slug: string
  title: L
  is_home: boolean
  in_nav: boolean
  published: boolean
  sort: number
  seo: { title?: L; description?: L }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Section = {
  id: string
  page_id: string
  type: SectionType
  anchor: string | null
  nav_label: L | null
  content: Record<string, any>
  visible: boolean
  sort: number
}

export type Item = {
  id: string
  section_id: string
  kind: ItemKind
  title: L
  subtitle: L
  url: string | null
  media_url: string | null
  poster_url: string | null
  embeddable: boolean | null
  category_id: string | null
  doctor_id: string | null
  featured: boolean
  visible: boolean
  sort: number
}

export type Category = { id: string; slug: string; name: L; color: string | null; sort: number }

export type Doctor = {
  id: string
  name: L
  specialty_id: string | null
  avatar_url: string | null
  card_image_url: string | null
  code: string | null
  color: string
  bio: L
  visible: boolean
  sort: number
}

export type Lead = {
  id: string
  name: string
  specialty: string | null
  phone: string
  message: string | null
  locale: string | null
  source: string | null
  status: 'new' | 'contacted' | 'won' | 'lost'
  notes: string | null
  created_at: string
}
