import type { ItemKind, SectionType } from './types'

/** Field definitions drive the dashboard forms, so adding a field here adds it to the editor. */
export type Field = {
  key: string
  label: string
  type: 'l' | 'lt' | 'text' | 'url' | 'media' | 'bool' | 'number' | 'select' | 'list' | 'group'
  help?: string
  options?: { value: string; label: string }[]
  fields?: Field[]
  itemLabel?: string
}

const L = (key: string, label: string, help?: string): Field => ({ key, label, type: 'l', help })
const LT = (key: string, label: string, help?: string): Field => ({ key, label, type: 'lt', help })
const head: Field[] = [L('tag', 'الشارة الصغيرة فوق العنوان'), L('title', 'العنوان'), LT('lead', 'الوصف')]
const link = (key: string, label: string): Field => ({
  key, label, type: 'group', fields: [L('label', 'نص الزرار'), { key: 'href', label: 'الرابط', type: 'text', help: 'مثال: ‎#contact أو رابط كامل' }],
})

export type SectionDef = {
  label: string
  desc: string
  fields: Field[]
  items?: { kinds: ItemKind[]; label: string }
  defaults: Record<string, unknown>
}

const l = (ar: string, en: string) => ({ ar, en })

export const SECTION_DEFS: Record<SectionType, SectionDef> = {
  hero: {
    label: 'الهيرو (أول الصفحة)',
    desc: 'العنوان الكبير، الأزرار، وعداد جدول العيادة.',
    fields: [
      L('badge', 'الشارة'),
      LT('title', 'العنوان', 'كل سطر في سطر لوحده'),
      LT('lead', 'الوصف'),
      link('primary', 'الزرار الأساسي'),
      link('secondary', 'الزرار التاني'),
      { key: 'trust', label: 'نقاط الثقة', type: 'list', itemLabel: 'نقطة', fields: [L('text', 'النص')] },
      { key: 'meter', label: 'العداد', type: 'group', fields: [L('title', 'عنوان العداد'), L('footer', 'النص تحت العداد')] },
      { key: 'toasts', label: 'الإشعارات حوالين العداد (لحد 3)', type: 'list', itemLabel: 'إشعار', fields: [L('title', 'العنوان'), L('sub', 'السطر الصغير')] },
    ],
    defaults: {
      badge: l('وكالة تسويق للأطباء والعيادات', 'Marketing for doctors and clinics'),
      title: l('عنوان جديد\nفي سطرين', 'New headline\non two lines'),
      lead: l('', ''), primary: { label: l('احجز مكالمة', 'Book a call'), href: '#contact' }, secondary: { label: l('', ''), href: '' },
      trust: [], meter: { title: l('جدول العيادة.', 'Clinic schedule.'), footer: l('من 50 ميعاد', 'of 50 slots') }, toasts: [],
    },
  },
  doctors: {
    label: 'كروت الدكاترة',
    desc: 'الكروت المتفرّدة. الدكاترة نفسهم بيتعدلوا من صفحة «الدكاترة».',
    fields: [L('title', 'العنوان الكبير'), LT('subtitle', 'السطر تحت الكروت')],
    defaults: { title: l('دكاترة بنشتغل معاهم.', 'Doctors we work with.'), subtitle: l('', '') },
  },
  services: {
    label: 'الخدمات (بينتو)',
    desc: 'كروت الخدمات بأشكال مختلفة.',
    fields: [
      ...head,
      {
        key: 'cards', label: 'الكروت', type: 'list', itemLabel: 'كارت', fields: [
          { key: 'variant', label: 'شكل الكارت', type: 'select', options: [
            { value: 'brand', label: 'كبير غامق + صورة وبحث' }, { value: 'ads', label: 'بنفسجي + سويتش لايكات/حجوزات' },
            { value: 'landing', label: 'فاتح + موبايل صغير' }, { value: 'video', label: 'صورة/فيديو خلفية' }, { value: 'cta', label: 'أبيض + زرار' },
          ] },
          L('title', 'العنوان'), LT('text', 'الوصف'), L('chips', 'التاجات', 'افصل بينهم بفاصلة'),
          { key: 'media_url', label: 'صورة أو فيديو (للكروت اللي فيها صورة)', type: 'media' },
          L('cta_label', 'نص الزرار (كارت الزرار)'), { key: 'cta_href', label: 'رابط الزرار', type: 'text' },
        ],
      },
    ],
    defaults: { tag: l('', ''), title: l('خدماتنا', 'Services'), lead: l('', ''), cards: [] },
  },
  work: {
    label: 'عرض الشغل (موبايلات)',
    desc: 'صفحات لايف، سكرين شوتس، فيديوهات أو لينكات جوه موبايلات، مع فلتر بالتخصص.',
    fields: head,
    items: { kinds: ['live', 'image', 'video', 'link'], label: 'شغل' },
    defaults: { tag: l('شغلنا', 'Our work'), title: l('عنوان القسم', 'Section title'), lead: l('', '') },
  },
  videos: {
    label: 'فيديوهات (ريلز)',
    desc: 'فيديوهات مرفوعة أو لينكات يوتيوب / تيك توك / إنستجرام / فيميو.',
    fields: [...head, L('cta_label', 'نص الزرار'), { key: 'cta_href', label: 'رابط الزرار', type: 'text' }],
    items: { kinds: ['video', 'image'], label: 'فيديو' },
    defaults: { tag: l('', ''), title: l('فيديوهاتنا', 'Our videos'), lead: l('', ''), cta_label: l('', ''), cta_href: '' },
  },
  gallery: {
    label: 'جاليري صور',
    desc: 'صور وفيديوهات في شبكة، وبتفتح كبيرة لما تدوس عليها.',
    fields: head,
    items: { kinds: ['image', 'video'], label: 'صورة' },
    defaults: { tag: l('', ''), title: l('جاليري', 'Gallery'), lead: l('', '') },
  },
  stats: {
    label: 'الأرقام والنتايج',
    desc: 'شريط الأرقام، دراسة حالة بالرسم، وقبل/بعد.',
    fields: [
      L('tag', 'الشارة'), L('title', 'العنوان'),
      { key: 'stats', label: 'الأرقام (أول رقم هو البارز)', type: 'list', itemLabel: 'رقم', fields: [{ key: 'value', label: 'الرقم', type: 'text', help: 'مثال: ‎+212% أو 3.8x' }, L('label', 'الوصف')] },
      { key: 'case', label: 'دراسة الحالة', type: 'group', fields: [L('label', 'الشارة'), L('title', 'العنوان'), LT('text', 'الوصف'),
        { key: 'bars', label: 'الأعمدة', type: 'list', itemLabel: 'عمود', fields: [L('label', 'اسم العمود'), { key: 'value', label: 'القيمة', type: 'number' }] }] },
      { key: 'compare', label: 'قبل وبعد', type: 'group', fields: [L('label', 'الشارة'), L('title', 'العنوان'), LT('text', 'الوصف'),
        L('before_label', 'كلمة «قبل»'), { key: 'before_value', label: 'قيمة قبل', type: 'text' }, { key: 'before_image', label: 'صورة قبل', type: 'media' },
        L('after_label', 'كلمة «بعد»'), { key: 'after_value', label: 'قيمة بعد', type: 'text' }, { key: 'after_image', label: 'صورة بعد', type: 'media' }] },
    ],
    defaults: { tag: l('', ''), title: l('أرقامنا', 'Our numbers'), stats: [] },
  },
  process: {
    label: 'خطوات الشغل',
    desc: 'خطوات مترقمة بخط بيتملى مع السكرول.',
    fields: [...head, { key: 'steps', label: 'الخطوات', type: 'list', itemLabel: 'خطوة', fields: [L('title', 'العنوان'), LT('text', 'الوصف')] }],
    defaults: { tag: l('', ''), title: l('طريقة الشغل', 'How we work'), lead: l('', ''), steps: [] },
  },
  contact: {
    label: 'التواصل والفورم',
    desc: 'الفورم بيتحفظ في «الطلبات» وبيجهز رسالة واتساب.',
    fields: [
      L('title', 'العنوان'), LT('lead', 'الوصف'), L('form_title', 'عنوان الفورم'), L('meter_title', 'عنوان العداد'),
      L('meter_empty', 'نص العداد قبل الإرسال'), L('meter_full', 'نص العداد بعد الإرسال'), L('whatsapp_label', 'نص لينك الواتساب'), LT('success', 'رسالة النجاح'),
    ],
    defaults: { title: l('تواصل معانا', 'Contact us'), lead: l('', ''), form_title: l('ابعتلنا بياناتك', 'Send us your details') },
  },
  richtext: {
    label: 'نص حر',
    desc: 'عنوان وفقرات: عن الشركة، سياسة، أي كلام.',
    fields: [L('tag', 'الشارة'), L('title', 'العنوان'), LT('body', 'النص', 'كل فقرة في سطر')],
    defaults: { tag: l('', ''), title: l('عنوان', 'Title'), body: l('', '') },
  },
  cta: {
    label: 'بانر دعوة للتواصل',
    desc: 'شريط بنفسجي بعنوان وزرار.',
    fields: [L('title', 'العنوان'), LT('text', 'الوصف'), L('label', 'نص الزرار'), { key: 'href', label: 'رابط الزرار', type: 'text' }],
    defaults: { title: l('جاهز نبدأ؟', 'Ready to start?'), text: l('', ''), label: l('احجز مكالمة', 'Book a call'), href: '#contact' },
  },
}

export const KIND_LABEL: Record<ItemKind, string> = {
  live: 'صفحة لايف', image: 'سكرين شوت / صورة', video: 'فيديو', link: 'لينك خارجي',
}
