-- ============================================================
-- Central School — parte 9: logs operacionais e auditoria
-- Execute no Supabase SQL Editor depois da parte 8.
-- Seguro para rodar mais de uma vez.
-- ============================================================

create table if not exists public.app_incidents (
  id              uuid primary key default gen_random_uuid(),
  trace_code      text not null unique,
  user_id         uuid references auth.users(id) on delete set null,
  severity        text not null default 'error' check (severity in ('info', 'warning', 'error', 'critical')),
  source          text not null check (source in ('client', 'server', 'webhook', 'cron')),
  area            text not null,
  action          text,
  fingerprint     text not null,
  message         text not null,
  metadata        jsonb not null default '{}'::jsonb,
  occurrences     integer not null default 1 check (occurrences > 0),
  first_seen_at   timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  status          text not null default 'new' check (status in ('new', 'investigating', 'resolved')),
  resolution_note text,
  resolved_by     uuid references auth.users(id) on delete set null,
  resolved_at     timestamptz
);

create table if not exists public.admin_audit_logs (
  id         bigint generated always as identity primary key,
  actor_id   uuid references auth.users(id) on delete set null,
  student_id uuid references auth.users(id) on delete set null,
  action     text not null,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists incidents_status_seen_idx on public.app_incidents (status, last_seen_at desc);
create index if not exists incidents_user_seen_idx on public.app_incidents (user_id, last_seen_at desc);
create index if not exists incidents_fingerprint_idx on public.app_incidents (fingerprint, last_seen_at desc);
create index if not exists audit_student_created_idx on public.admin_audit_logs (student_id, created_at desc);
create index if not exists audit_actor_created_idx on public.admin_audit_logs (actor_id, created_at desc);

alter table public.app_incidents enable row level security;
alter table public.admin_audit_logs enable row level security;

grant select on public.app_incidents, public.admin_audit_logs to authenticated;
revoke insert, update, delete on public.app_incidents, public.admin_audit_logs from authenticated;

drop policy if exists "incidents_select_teacher" on public.app_incidents;
create policy "incidents_select_teacher" on public.app_incidents for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'));

drop policy if exists "audit_select_teacher" on public.admin_audit_logs;
create policy "audit_select_teacher" on public.admin_audit_logs for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'));

-- Remove detalhes que podem conter diagnóstico técnico após 90 dias e
-- conserva apenas o resumo do incidente. Auditoria administrativa fica 1 ano.
create or replace function public.cleanup_operational_logs()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  scrubbed integer;
  audits_deleted integer;
begin
  update public.app_incidents
  set metadata = '{}'::jsonb
  where last_seen_at < now() - interval '90 days' and metadata <> '{}'::jsonb;
  get diagnostics scrubbed = row_count;

  delete from public.admin_audit_logs where created_at < now() - interval '365 days';
  get diagnostics audits_deleted = row_count;
  return jsonb_build_object('incidents_scrubbed', scrubbed, 'audits_deleted', audits_deleted);
end;
$$;

revoke all on function public.cleanup_operational_logs() from public, anon, authenticated;
grant execute on function public.cleanup_operational_logs() to service_role;
notify pgrst, 'reload schema';
