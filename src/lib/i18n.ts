import type { L, Locale } from './types'

export function tr(value: L | null | undefined, locale: Locale): string {
  if (!value) return ''
  return value[locale] || value.ar || value.en || ''
}

export const isLocale = (v: string): v is Locale => v === 'ar' || v === 'en'
export const dirOf = (l: Locale) => (l === 'ar' ? 'rtl' : 'ltr')

const dict = {
  ar: {
    bookCall: 'احجز مكالمة مجانية',
    openMenu: 'افتح القائمة',
    closeMenu: 'اقفل القائمة',
    all: 'الكل',
    live: 'لايف',
    openPage: 'افتح الصفحة',
    watch: 'شغّل الفيديو',
    close: 'اقفل',
    name: 'اسمك',
    specialty: 'تخصصك',
    chooseSpecialty: 'اختار تخصصك',
    otherSpecialty: 'تخصص تاني',
    whatsappNumber: 'رقم الواتساب',
    send: 'ابعت الطلب',
    sending: 'بنبعت…',
    openWhatsapp: 'افتح واتساب',
    errName: 'اكتب اسمك عشان نعرف نكلمك.',
    errSpec: 'اختار التخصص عشان نجهزلك أمثلة من نفس المجال.',
    errPhone: 'اكتب رقم واتساب صحيح.',
    errServer: 'الطلب ماوصلش. جرّب تاني أو كلمنا على واتساب.',
    replay: 'تاني',
    lang: 'English',
    langHref: 'en',
    waMessage: (n: string, s: string, p: string) => `أهلاً Go2Viral، أنا ${n} (${s}). عايز أحجز مكالمة التحليل المجاني. رقمي: ${p}`,
    notFound: 'الصفحة دي مش موجودة.',
    backHome: 'ارجع للرئيسية',
    setup: 'الموقع لسه مش متوصل بقاعدة البيانات. راجع ملف README.',
  },
  en: {
    bookCall: 'Book a free call',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    all: 'All',
    live: 'Live',
    openPage: 'Open page',
    watch: 'Play video',
    close: 'Close',
    name: 'Your name',
    specialty: 'Your specialty',
    chooseSpecialty: 'Choose your specialty',
    otherSpecialty: 'Other',
    whatsappNumber: 'WhatsApp number',
    send: 'Send request',
    sending: 'Sending…',
    openWhatsapp: 'Open WhatsApp',
    errName: 'Add your name so we know who to call.',
    errSpec: 'Pick a specialty so we can prepare relevant examples.',
    errPhone: 'Enter a valid WhatsApp number.',
    errServer: "The request didn't go through. Try again or message us on WhatsApp.",
    replay: 'Replay',
    lang: 'العربية',
    langHref: 'ar',
    waMessage: (n: string, s: string, p: string) => `Hi Go2Viral, I'm ${n} (${s}). I'd like to book the free audit call. My number: ${p}`,
    notFound: "This page doesn't exist.",
    backHome: 'Back to home',
    setup: 'The site is not connected to the database yet. See README.',
  },
}

export type Dict = (typeof dict)['ar']
export const t = (l: Locale): Dict => dict[l] as Dict
