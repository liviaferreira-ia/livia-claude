-- ============================================================
-- Central School — parte 8: administração individual do aluno
-- Execute no Supabase SQL Editor depois da parte 7 (financeiro).
-- Seguro para rodar mais de uma vez.
-- ============================================================

create table if not exists public.student_settings (
  student_id        uuid primary key references auth.users(id) on delete cascade,
  focus             text,
  weekly_goal       integer not null default 3 check (weekly_goal between 1 and 7),
  access_expires_on date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.teacher_notes (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create table if not exists public.student_assignments (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references auth.users(id) on delete cascade,
  teacher_id  uuid not null references auth.users(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 160),
  details     text,
  due_date    date,
  status      text not null default 'assigned' check (status in ('assigned', 'done', 'cancelled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.student_events (
  id         bigint generated always as identity primary key,
  student_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('login', 'exercise')),
  kind       text,
  correct    boolean,
  created_at timestamptz not null default now()
);

create index if not exists teacher_notes_student_idx on public.teacher_notes (student_id, created_at desc);
create index if not exists assignments_student_idx on public.student_assignments (student_id, created_at desc);
create index if not exists student_events_student_idx on public.student_events (student_id, created_at desc);

alter table public.student_settings enable row level security;
alter table public.teacher_notes enable row level security;
alter table public.student_assignments enable row level security;
alter table public.student_events enable row level security;

grant select on public.student_settings, public.teacher_notes, public.student_assignments, public.student_events to authenticated;
revoke insert, update, delete on public.student_settings, public.teacher_notes, public.student_assignments, public.student_events from authenticated;

drop policy if exists "settings_select_own" on public.student_settings;
create policy "settings_select_own" on public.student_settings for select to authenticated
  using (student_id = auth.uid());
drop policy if exists "settings_select_teacher" on public.student_settings;
create policy "settings_select_teacher" on public.student_settings for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'));

drop policy if exists "notes_select_teacher" on public.teacher_notes;
create policy "notes_select_teacher" on public.teacher_notes for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'));

drop policy if exists "assignments_select_own" on public.student_assignments;
create policy "assignments_select_own" on public.student_assignments for select to authenticated
  using (student_id = auth.uid());
drop policy if exists "assignments_select_teacher" on public.student_assignments;
create policy "assignments_select_teacher" on public.student_assignments for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'));

drop policy if exists "events_select_own" on public.student_events;
create policy "events_select_own" on public.student_events for select to authenticated
  using (student_id = auth.uid());
drop policy if exists "events_select_teacher" on public.student_events;
create policy "events_select_teacher" on public.student_events for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'));

-- Atualiza as funções existentes para também alimentar a linha do tempo.
create or replace function public.touch_login(p_name text, p_level text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  r text;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select role into r from public.profiles where id = uid;

  insert into public.student_activity (user_id, role, student_name, level, last_login_at, session_count)
  values (uid, coalesce(r, 'student'), nullif(p_name, ''), nullif(p_level, ''), now(), 1)
  on conflict (user_id) do update
    set role = coalesce(r, student_activity.role),
        student_name = coalesce(nullif(p_name, ''), student_activity.student_name),
        level = coalesce(nullif(p_level, ''), student_activity.level),
        last_login_at = now(),
        session_count = student_activity.session_count + 1,
        updated_at = now();

  if coalesce(r, 'student') = 'student' then
    insert into public.student_events (student_id, event_type) values (uid, 'login');
  end if;
end;
$$;

create or replace function public.bump_practice(p_kind text, p_correct boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_kind not in ('mc', 'fill', 'translate', 'order') then
    raise exception 'invalid kind: %', p_kind;
  end if;

  insert into public.student_activity (user_id) values (uid)
  on conflict (user_id) do nothing;
  execute format(
    'update public.student_activity set %1$I = %1$I + 1, %2$I = %2$I + %3$L, updated_at = now() where user_id = %4$L',
    'practice_' || p_kind || '_done',
    'practice_' || p_kind || '_correct',
    case when p_correct then 1 else 0 end,
    uid
  );
  insert into public.student_events (student_id, event_type, kind, correct)
  values (uid, 'exercise', p_kind, p_correct);
end;
$$;

grant execute on function public.touch_login(text, text) to authenticated;
grant execute on function public.bump_practice(text, boolean) to authenticated;

create or replace function public.complete_assignment(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  update public.student_assignments
  set status = 'done', updated_at = now()
  where id = p_id and student_id = auth.uid() and status = 'assigned';
end;
$$;
grant execute on function public.complete_assignment(uuid) to authenticated;
notify pgrst, 'reload schema';
