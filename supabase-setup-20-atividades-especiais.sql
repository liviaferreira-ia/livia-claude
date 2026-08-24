-- ============================================================
-- Central School — parte 20: Atividades Especiais
-- Seguro para rodar novamente.
-- ============================================================

create table if not exists public.special_activities (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null check (char_length(title) between 1 and 180),
  description         text,
  level               text not null check (level in ('A1','A2','B1','B2','C1','C2')),
  instructions        text,
  content_type        text not null default 'external_link'
                        check (content_type in ('external_link','material','mixed','internal','ai_generated')),
  external_url        text,
  internal_content    text,
  publication_status  text not null default 'draft'
                        check (publication_status in ('draft','published','archived')),
  starts_at           timestamptz,
  ends_at             timestamptz,
  requires_submission boolean not null default false,
  allowed_formats     text[] not null default array['pdf','docx','image'],
  max_file_mb         smallint not null default 20 check (max_file_mb between 1 and 100),
  allow_replacement   boolean not null default true,
  allow_download      boolean not null default true,
  ai_generated        boolean not null default false,
  ai_generation_data  jsonb,
  duplicated_from     uuid references public.special_activities(id) on delete set null,
  created_by          uuid not null references auth.users(id) on delete restrict,
  updated_by          uuid references auth.users(id) on delete set null,
  published_at        timestamptz,
  archived_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

alter table public.special_activities add column if not exists internal_content text;

create table if not exists public.special_activity_targets (
  id            uuid primary key default gen_random_uuid(),
  activity_id   uuid not null references public.special_activities(id) on delete cascade,
  target_type   text not null check (target_type in ('all','level','student')),
  target_value  text,
  created_at    timestamptz not null default now(),
  unique (activity_id, target_type, target_value)
);

create table if not exists public.special_activity_recipients (
  activity_id    uuid not null references public.special_activities(id) on delete cascade,
  student_id     uuid not null references auth.users(id) on delete cascade,
  assigned_at    timestamptz not null default now(),
  viewed_at      timestamptz,
  last_opened_at timestamptz,
  primary key (activity_id, student_id)
);

create table if not exists public.special_activity_assets (
  id            uuid primary key default gen_random_uuid(),
  activity_id   uuid not null references public.special_activities(id) on delete cascade,
  file_name     text not null,
  storage_path  text not null unique,
  mime_type     text,
  file_size     bigint not null default 0 check (file_size >= 0),
  asset_kind    text not null default 'material' check (asset_kind in ('material','cover')),
  uploaded_by   uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- Entregas dos alunos e histórico de versões.
create table if not exists public.special_activity_submissions (
  id                uuid primary key default gen_random_uuid(),
  activity_id       uuid not null references public.special_activities(id) on delete cascade,
  student_id        uuid not null references auth.users(id) on delete cascade,
  status            text not null default 'submitted'
                      check (status in ('submitted','reviewing','reviewed')),
  correction_status text not null default 'not_reviewed'
                      check (correction_status in ('not_reviewed','reviewing','reviewed')),
  feedback          text,
  submitted_at      timestamptz not null default now(),
  reviewed_at       timestamptz,
  reviewed_by       uuid references auth.users(id) on delete set null,
  unique (activity_id, student_id)
);

create table if not exists public.special_activity_submission_versions (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null references public.special_activity_submissions(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  file_name      text not null,
  storage_path   text not null unique,
  mime_type      text,
  file_size      bigint not null default 0,
  created_at     timestamptz not null default now(),
  unique (submission_id, version_number)
);

create index if not exists special_activities_status_idx on public.special_activities (publication_status, starts_at, ends_at);
create index if not exists special_targets_activity_idx on public.special_activity_targets (activity_id);
create index if not exists special_recipients_student_idx on public.special_activity_recipients (student_id, assigned_at desc);
create index if not exists special_assets_activity_idx on public.special_activity_assets (activity_id, created_at);
create index if not exists special_submissions_activity_idx on public.special_activity_submissions (activity_id, submitted_at desc);

alter table public.special_activities enable row level security;
alter table public.special_activity_targets enable row level security;
alter table public.special_activity_recipients enable row level security;
alter table public.special_activity_assets enable row level security;
alter table public.special_activity_submissions enable row level security;
alter table public.special_activity_submission_versions enable row level security;

grant select on public.special_activities, public.special_activity_targets,
  public.special_activity_recipients, public.special_activity_assets,
  public.special_activity_submissions, public.special_activity_submission_versions to authenticated;

drop policy if exists "special_activities_staff_read" on public.special_activities;
create policy "special_activities_staff_read" on public.special_activities for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin'))
);
drop policy if exists "special_activities_student_read" on public.special_activities;
create policy "special_activities_student_read" on public.special_activities for select to authenticated using (
  publication_status = 'published' and exists (
    select 1 from public.special_activity_recipients r where r.activity_id = id and r.student_id = auth.uid()
  )
);

drop policy if exists "special_targets_staff_read" on public.special_activity_targets;
create policy "special_targets_staff_read" on public.special_activity_targets for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin'))
);
drop policy if exists "special_recipients_staff_read" on public.special_activity_recipients;
create policy "special_recipients_staff_read" on public.special_activity_recipients for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin'))
);
drop policy if exists "special_recipients_own_read" on public.special_activity_recipients;
create policy "special_recipients_own_read" on public.special_activity_recipients for select to authenticated using (student_id = auth.uid());
drop policy if exists "special_assets_staff_read" on public.special_activity_assets;
create policy "special_assets_staff_read" on public.special_activity_assets for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin'))
);
drop policy if exists "special_assets_recipient_read" on public.special_activity_assets;
create policy "special_assets_recipient_read" on public.special_activity_assets for select to authenticated using (
  exists (select 1 from public.special_activity_recipients r where r.activity_id = special_activity_assets.activity_id and r.student_id = auth.uid())
);
drop policy if exists "special_submissions_staff_read" on public.special_activity_submissions;
create policy "special_submissions_staff_read" on public.special_activity_submissions for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin'))
);
drop policy if exists "special_submissions_own_read" on public.special_activity_submissions;
create policy "special_submissions_own_read" on public.special_activity_submissions for select to authenticated using (student_id = auth.uid());
drop policy if exists "special_versions_staff_read" on public.special_activity_submission_versions;
create policy "special_versions_staff_read" on public.special_activity_submission_versions for select to authenticated using (
  exists (select 1 from public.special_activity_submissions s join public.profiles p on p.id = auth.uid()
    where s.id = special_activity_submission_versions.submission_id and p.role in ('teacher','admin'))
);
drop policy if exists "special_versions_own_read" on public.special_activity_submission_versions;
create policy "special_versions_own_read" on public.special_activity_submission_versions for select to authenticated using (
  exists (select 1 from public.special_activity_submissions s where s.id = special_activity_submission_versions.submission_id and s.student_id = auth.uid())
);

insert into storage.buckets (id, name, public, file_size_limit)
values ('special-activities', 'special-activities', false, 20971520)
on conflict (id) do update set public = false, file_size_limit = 20971520;

notify pgrst, 'reload schema';
