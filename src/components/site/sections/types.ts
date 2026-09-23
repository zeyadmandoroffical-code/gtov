import type { Category, Doctor, Item, Locale, Section, Settings } from '@/lib/types'

export type SectionProps = {
  section: Section
  items: Item[]
  doctors: Doctor[]
  categories: Category[]
  settings: Settings
  locale: Locale
}
