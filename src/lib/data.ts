import 'server-only'
import { publicClient } from './supabase/public'
import { hasSupabase } from './supabase/env'
import type { Category, Doctor, Item, L, Page, Section, Settings } from './types'

export const DEFAULT_SETTINGS: Settings = {
  brand_color: '#5428B3',
  logo_url: null,
  whatsapp: '201000000000',
  email: null,
  phone: null,
  socials: [],
  ticker: { ar: [], en: [] },
  seo: {},
  footer: {},
}

export async function getSettings(): Promise<Settings> {
  if (!hasSupabase) return DEFAULT_SETTINGS
  const { data, error } = await publicClient().from('site_settings').select('*').eq('id', 1).maybeSingle()
  if (error) console.error('[settings]', error.message)
  return { ...DEFAULT_SETTINGS, ...(data || {}) }
}

export type PageBundle = {
  page: Page
  sections: Section[]
  items: Item[]
  doctors: Doctor[]
  categories: Category[]
}

export async function getPage(slug: string | null): Promise<PageBundle | null> {
  if (!hasSupabase) return null
  const sb = publicClient()
  const pq = sb.from('pages').select('*')
  const { data: page, error } = await (slug ? pq.eq('slug', slug) : pq.eq('is_home', true)).maybeSingle()
  if (error) console.error('[page]', error.message)
  if (!page) return null

  const { data: sections } = await sb.from('sections').select('*').eq('page_id', page.id).eq('visible', true).order('sort')
  const secs = (sections as Section[]) || []
  const ids = secs.map((s) => s.id)

  const [items, doctors, categories] = await Promise.all([
    ids.length
      ? sb.from('items').select('*').in('section_id', ids).eq('visible', true).order('sort')
      : Promise.resolve({ data: [] }),
    secs.some((s) => s.type === 'doctors')
      ? sb.from('doctors').select('*').eq('visible', true).order('sort')
      : Promise.resolve({ data: [] }),
    sb.from('categories').select('*').order('sort'),
  ])

  return {
    page: page as Page,
    sections: secs,
    items: (items.data as Item[]) || [],
    doctors: (doctors.data as Doctor[]) || [],
    categories: (categories.data as Category[]) || [],
  }
}

/** Header/footer links: home sections that have a menu label + extra pages. */
export async function getNav(): Promise<{ label: L; anchor?: string; slug?: string }[]> {
  if (!hasSupabase) return []
  const sb = publicClient()
  const { data: home } = await sb.from('pages').select('id').eq('is_home', true).maybeSingle()
  const [secs, pages] = await Promise.all([
    home
      ? sb.from('sections').select('anchor,nav_label').eq('page_id', home.id).eq('visible', true).not('nav_label', 'is', null).order('sort')
      : Promise.resolve({ data: [] }),
    sb.from('pages').select('slug,title').eq('in_nav', true).eq('is_home', false).order('sort'),
  ])
  const a = ((secs.data || []) as { anchor: string | null; nav_label: L }[])
    .filter((s) => s.anchor).map((s) => ({ label: s.nav_label, anchor: s.anchor as string }))
  const b = ((pages.data || []) as { slug: string; title: L }[]).map((p) => ({ label: p.title, slug: p.slug }))
  return [...a, ...b]
}

export async function getAllSlugs(): Promise<string[]> {
  if (!hasSupabase) return []
  const { data } = await publicClient().from('pages').select('slug').eq('is_home', false)
  return (data || []).map((p: { slug: string }) => p.slug)
}
