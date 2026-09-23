# Guide for AI coding agents (Antigravity, Claude Code, Cursor…)

Read this before changing code. The owner edits content from `/admin`; code changes should keep everything editable.

## Stack
- Next.js 16 App Router, React 19, TypeScript strict. Middleware is `src/proxy.ts` (Next 16 renamed middleware → proxy).
- Supabase: Postgres + RLS, Auth (single admin via `public.admins`), Storage bucket `media`.
- No CSS framework. Public styles: `src/app/site.css` (ported from `design/prototype.html`). Admin styles: `src/app/admin.css`.
- Two root layouts via route groups: `(site)/[locale]` (html lang/dir per locale) and `(admin)/admin` (Arabic RTL).

## Content model
- Localized text is always `{ ar, en }` (type `L`), rendered with `tr(value, locale)`.
- `pages` → ordered `sections` (type + jsonb `content`) → ordered `items` (work/videos/gallery entries).
- `doctors`, `categories`, `site_settings` (single row id=1), `leads`, `events` (analytics).
- Public reads use the anon key (`src/lib/supabase/public.ts`); pages are ISR (`revalidate = 300`) and the admin calls `POST /api/revalidate` after every save.

## Adding a new section type (keep all 4 steps together)
1. Add the type to the `check` constraint on `sections.type` in `supabase/schema.sql` (and write a migration: `alter table … drop constraint … add constraint …`).
2. Add it to `SectionType` in `src/lib/types.ts`.
3. Define its editor fields + defaults in `SECTION_DEFS` in `src/lib/sections.ts` (the admin form is generated from this).
4. Create the component in `src/components/site/sections/` and register it in `sections/index.tsx`.

## Conventions
- Arabic is the default locale and RTL. Use logical CSS properties (`inset-inline-start`, `margin-inline-end`). Add `[dir="ltr"]` overrides only where physical transforms are unavoidable.
- Analytics: add `data-track="cta|whatsapp|social"` + `data-label` to links; item opens call `track('item_open', { item_id })`.
- Motion must respect `prefers-reduced-motion`.
- Never expose a service-role key to the browser. Admin writes go through RLS with the logged-in session.
- User-facing admin copy is Egyptian Arabic, short and plain.

## Suggested next steps
- Drag-and-drop ordering in the admin (currently ↑/↓ buttons).
- Doctor profile pages `/[locale]/doctors/[id]` using `doctors.bio` and items filtered by `doctor_id`.
- Email/WhatsApp notification on new lead (Supabase Database Webhook → Resend or a WhatsApp API).
- Rate limiting on `/api/lead` and `/api/track` (e.g. Upstash).
- Switch the Google Fonts `<link>` to `next/font` once building with network access.
- Draft/preview mode for sections before publishing.
