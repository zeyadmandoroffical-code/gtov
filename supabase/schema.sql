-- =====================================================================
-- Go2Viral — database schema (run once in Supabase → SQL Editor)
-- Every localized field is jsonb shaped like {"ar": "...", "en": "..."}
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- admins -------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- site settings (single row) ------------------------------------
create table if not exists public.site_settings (
  id          int primary key default 1 check (id = 1),
  brand_color text  not null default '#5428B3',
  logo_url    text,
  whatsapp    text  not null default '201000000000',
  email       text,
  phone       text,
  socials     jsonb not null default '[]',                 -- [{platform, url}]
  ticker      jsonb not null default '{"ar":[],"en":[]}',  -- {ar:[..], en:[..]}
  seo         jsonb not null default '{}',                 -- {title:L, description:L, og_image}
  footer      jsonb not null default '{}',                 -- {tagline:L}
  updated_at  timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict do nothing;

-- ---------- pages ----------------------------------------------------------
create table if not exists public.pages (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title      jsonb not null default '{"ar":"","en":""}',
  is_home    boolean not null default false,
  in_nav     boolean not null default true,
  published  boolean not null default true,
  sort       int not null default 0,
  seo        jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists pages_one_home on public.pages (is_home) where is_home;

-- ---------- categories (specialties / filters) ---------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       jsonb not null default '{"ar":"","en":""}',
  color      text,
  sort       int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- doctors ------------------------------------------------------
create table if not exists public.doctors (
  id             uuid primary key default gen_random_uuid(),
  name           jsonb not null default '{"ar":"","en":""}',
  specialty_id   uuid references public.categories(id) on delete set null,
  avatar_url     text,
  card_image_url text,
  code           text,
  color          text not null default '#5428B3',
  bio            jsonb not null default '{}',
  visible        boolean not null default true,
  sort           int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------- sections (ordered blocks inside a page) -----------------------
create table if not exists public.sections (
  id         uuid primary key default gen_random_uuid(),
  page_id    uuid not null references public.pages(id) on delete cascade,
  type       text not null check (type in
             ('hero','doctors','services','work','videos','stats','process','contact','richtext','gallery','cta')),
  anchor     text check (anchor is null or anchor ~ '^[a-z0-9-]+$'),
  nav_label  jsonb,                     -- when set, the section shows in the header menu
  content    jsonb not null default '{}',
  visible    boolean not null default true,
  sort       int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sections_page_sort on public.sections (page_id, sort);

-- ---------- items (work, videos, gallery entries inside a section) --------
create table if not exists public.items (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references public.sections(id) on delete cascade,
  kind        text not null check (kind in ('live','video','image','link')),
  title       jsonb not null default '{"ar":"","en":""}',
  subtitle    jsonb not null default '{"ar":"","en":""}',
  url         text,          -- live page / external link / video link (YouTube, TikTok…)
  media_url   text,          -- uploaded image or video
  poster_url  text,          -- screenshot / cover (fallback when a live page can't be framed)
  embeddable  boolean,       -- set by the admin "check" button for live pages
  category_id uuid references public.categories(id) on delete set null,
  doctor_id   uuid references public.doctors(id) on delete set null,
  featured    boolean not null default false,
  visible     boolean not null default true,
  sort        int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists items_section_sort on public.items (section_id, sort);

-- ---------- leads (contact form) -----------------------------------------
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 120),
  specialty  text check (specialty is null or char_length(specialty) <= 80),
  phone      text not null check (char_length(phone) between 6 and 30),
  message    text check (message is null or char_length(message) <= 2000),
  locale     text,
  source     text,
  status     text not null default 'new' check (status in ('new','contacted','won','lost')),
  notes      text,
  created_at timestamptz not null default now()
);

-- ---------- analytics events ----------------------------------------------
create table if not exists public.events (
  id         bigint generated always as identity primary key,
  type       text not null check (type in ('pageview','cta','whatsapp','item_open','lead','social')),
  path       text check (path is null or char_length(path) <= 300),
  locale     text,
  item_id    uuid,
  label      text check (label is null or char_length(label) <= 120),
  session_id text check (session_id is null or char_length(session_id) <= 64),
  referrer   text check (referrer is null or char_length(referrer) <= 300),
  device     text,
  country    text,
  created_at timestamptz not null default now()
);
create index if not exists events_created on public.events (created_at);
create index if not exists events_type_created on public.events (type, created_at);

-- ---------- updated_at triggers -------------------------------------------
do $$ declare t text; begin
  foreach t in array array['site_settings','pages','doctors','sections','items'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format('create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- =====================================================================
-- Row level security
-- =====================================================================
alter table public.admins        enable row level security;
alter table public.site_settings enable row level security;
alter table public.pages         enable row level security;
alter table public.categories    enable row level security;
alter table public.doctors       enable row level security;
alter table public.sections      enable row level security;
alter table public.items         enable row level security;
alter table public.leads         enable row level security;
alter table public.events        enable row level security;

-- admins: an admin can see the list; nobody writes through the API
drop policy if exists admins_read on public.admins;
create policy admins_read on public.admins for select using (public.is_admin());

-- public read
drop policy if exists settings_read on public.site_settings;
create policy settings_read on public.site_settings for select using (true);
drop policy if exists pages_read on public.pages;
create policy pages_read on public.pages for select using (published or public.is_admin());
drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories for select using (true);
drop policy if exists doctors_read on public.doctors;
create policy doctors_read on public.doctors for select using (visible or public.is_admin());
drop policy if exists sections_read on public.sections;
create policy sections_read on public.sections for select using (
  public.is_admin() or (visible and exists (select 1 from public.pages p where p.id = page_id and p.published)));
drop policy if exists items_read on public.items;
create policy items_read on public.items for select using (visible or public.is_admin());

-- admin write (content tables)
do $$ declare t text; begin
  foreach t in array array['site_settings','pages','categories','doctors','sections','items'] loop
    execute format('drop policy if exists %1$s_admin_write on public.%1$s', t);
    execute format('create policy %1$s_admin_write on public.%1$s for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- leads: anyone can submit, only admin reads/updates/deletes
drop policy if exists leads_insert on public.leads;
create policy leads_insert on public.leads for insert with check (status = 'new' and notes is null);
drop policy if exists leads_admin on public.leads;
create policy leads_admin on public.leads for all using (public.is_admin()) with check (public.is_admin());

-- events: anyone can insert, only admin reads/deletes
drop policy if exists events_insert on public.events;
create policy events_insert on public.events for insert with check (true);
drop policy if exists events_admin_read on public.events;
create policy events_admin_read on public.events for select using (public.is_admin());
drop policy if exists events_admin_delete on public.events;
create policy events_admin_delete on public.events for delete using (public.is_admin());

-- =====================================================================
-- API grants (newer projects don't expose public tables by default; RLS still applies)
-- =====================================================================
grant usage on schema public to anon, authenticated;
grant select on public.site_settings, public.pages, public.categories,
                public.doctors, public.sections, public.items to anon, authenticated;
grant insert on public.leads, public.events to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- =====================================================================
-- Storage bucket for uploads (images + videos)
-- Wrapped so a missing privilege on storage.* doesn't abort the whole script.
-- =====================================================================
do $$ begin
  insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do update set public = true;

  drop policy if exists media_admin_insert on storage.objects;
  create policy media_admin_insert on storage.objects for insert to authenticated
    with check (bucket_id = 'media' and public.is_admin());
  drop policy if exists media_admin_update on storage.objects;
  create policy media_admin_update on storage.objects for update to authenticated
    using (bucket_id = 'media' and public.is_admin());
  drop policy if exists media_admin_delete on storage.objects;
  create policy media_admin_delete on storage.objects for delete to authenticated
    using (bucket_id = 'media' and public.is_admin());
  drop policy if exists media_admin_list on storage.objects;
  create policy media_admin_list on storage.objects for select to authenticated
    using (bucket_id = 'media' and public.is_admin());
exception when insufficient_privilege then
  raise warning 'Skipped storage setup (insufficient privilege): create the "media" bucket + policies from the dashboard.';
end $$;

-- =====================================================================
-- Dashboard stats (admin only). Days are counted in Cairo time.
-- =====================================================================
create or replace function public.stats_overview(days int default 30)
returns json language plpgsql stable security definer set search_path = public as $$
declare
  since timestamptz := now() - make_interval(days => days);
  result json;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;

  select json_build_object(
    'daily', (
      select coalesce(json_agg(d order by d.day), '[]'::json) from (
        select gs::date as day,
               count(e.id) filter (where e.type = 'pageview')                     as views,
               count(distinct e.session_id) filter (where e.type = 'pageview')    as visitors,
               count(e.id) filter (where e.type in ('whatsapp','cta','lead'))     as actions
        from generate_series((now() at time zone 'Africa/Cairo')::date - (days - 1),
                             (now() at time zone 'Africa/Cairo')::date, interval '1 day') gs
        left join public.events e
          on (e.created_at at time zone 'Africa/Cairo')::date = gs::date
        group by gs
      ) d),
    'totals', (
      select json_build_object(
        'views',      count(*) filter (where type = 'pageview'),
        'visitors',   count(distinct session_id) filter (where type = 'pageview'),
        'whatsapp',   count(*) filter (where type = 'whatsapp'),
        'cta',        count(*) filter (where type = 'cta'),
        'leads',      count(*) filter (where type = 'lead'),
        'item_opens', count(*) filter (where type = 'item_open'),
        'social',     count(*) filter (where type = 'social'))
      from public.events where created_at >= since),
    'top_items', (
      select coalesce(json_agg(t), '[]'::json) from (
        select e.item_id, i.title, i.kind, count(*) as count
        from public.events e join public.items i on i.id = e.item_id
        where e.type = 'item_open' and e.created_at >= since
        group by e.item_id, i.title, i.kind order by count desc limit 6) t),
    'top_pages', (
      select coalesce(json_agg(t), '[]'::json) from (
        select path, count(*) as count from public.events
        where type = 'pageview' and created_at >= since
        group by path order by count desc limit 6) t),
    'devices', (
      select coalesce(json_agg(t), '[]'::json) from (
        select coalesce(device, 'unknown') as label, count(distinct session_id) as count
        from public.events where type = 'pageview' and created_at >= since
        group by 1 order by 2 desc) t),
    'countries', (
      select coalesce(json_agg(t), '[]'::json) from (
        select coalesce(country, '??') as label, count(distinct session_id) as count
        from public.events where type = 'pageview' and created_at >= since
        group by 1 order by 2 desc limit 6) t),
    'referrers', (
      select coalesce(json_agg(t), '[]'::json) from (
        select coalesce(nullif(referrer, ''), 'direct') as label, count(distinct session_id) as count
        from public.events where type = 'pageview' and created_at >= since
        group by 1 order by 2 desc limit 6) t),
    'new_leads', (select count(*) from public.leads where status = 'new')
  ) into result;

  return result;
end $$;

grant execute on function public.stats_overview(int) to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
