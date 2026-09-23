import type { ComponentType } from 'react'
import type { Category, Doctor, Item, Locale, Section, SectionType, Settings } from '@/lib/types'
import { Contact } from './Contact'
import { Doctors } from './Doctors'
import { Gallery } from './Gallery'
import { Hero } from './Hero'
import { Process } from './Process'
import { Services } from './Services'
import { Cta, RichText } from './Simple'
import { Stats } from './Stats'
import { Videos } from './Videos'
import { Work } from './Work'
import type { SectionProps } from './types'

const MAP: Record<SectionType, ComponentType<SectionProps>> = {
  hero: Hero, doctors: Doctors, services: Services, work: Work, videos: Videos,
  stats: Stats, process: Process, contact: Contact, richtext: RichText, gallery: Gallery, cta: Cta,
}

export function Sections(props: { sections: Section[]; items: Item[]; doctors: Doctor[]; categories: Category[]; settings: Settings; locale: Locale }) {
  return (
    <>
      {props.sections.map((s) => {
        const C = MAP[s.type]
        if (!C) return null
        return (
          <C key={s.id} section={s} items={props.items.filter((i) => i.section_id === s.id)}
            doctors={props.doctors} categories={props.categories} settings={props.settings} locale={props.locale} />
        )
      })}
    </>
  )
}
