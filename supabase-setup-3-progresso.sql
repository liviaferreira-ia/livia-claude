-- ============================================================
-- Central School — parte 3: log de atividade dos alunos
-- Cole TUDO no Supabase → SQL Editor → New query → Run.
-- Seguro para rodar mais de uma vez.
-- ============================================================

-- 1) TABELA DE ATIVIDADE --------------------------------------------------
-- Uma linha por usuário, com login, tempo de uso e prática de exercícios.
create table if not exists public.student_activity (
  user_id                   uuid primary key references auth.users(id) on delete cascade,
  role                      text not null default 'student',
  student_name              text,
  level                     text,
  last_login_at             timestamptz,
  session_count             integer not null default 0,
  total_seconds             integer not null default 0,
  practice_mc_done          integer not null default 0,
  practice_mc_correct       integer not null default 0,
  practice_fill_done        integer not null default 0,
  practice_fill_correct     integer not null default 0,
  practice_translate_done   integer not null default 0,
  practice_translate_correct integer not null default 0,
  practice_order_done       integer not null default 0,
  practice_order_correct    integer not null default 0,
  updated_at                timestamptz not null default now()
);

alter table public.student_activity enable row level security;

-- Só as funções abaixo (SECURITY DEFINER) podem escrever; ninguém escreve direto na tabela.
revoke insert, update, delete on public.student_activity from authenticated;
grant select on public.student_activity to authenticated;

-- Cada pessoa lê a própria linha
drop policy if exists "activity_select_own" on public.student_activity;
create policy "activity_select_own"
  on public.student_activity for select to authenticated
  using ( user_id = auth.uid() );

-- O professor lê a linha de todo mundo
drop policy if exists "activity_select_teacher" on public.student_activity;
create policy "activity_select_teacher"
  on public.student_activity for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

-- 2) FUNÇÕES QUE ATUALIZAM A ATIVIDADE ------------------------------------

-- Chamada quando o app carrega com uma sessão ativa: registra login e nome/nível atuais.
create or replace function public.touch_login(p_name text, p_level text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  r   text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select role into r from public.profiles where id = uid;

  insert into public.student_activity (user_id, role, student_name, level, last_login_at, session_count)
  values (uid, coalesce(r, 'student'), nullif(p_name, ''), nullif(p_level, ''), now(), 1)
  on conflict (user_id) do update
    set role          = coalesce(r, student_activity.role),
        student_name  = coalesce(nullif(p_name, ''), student_activity.student_name),
        level         = coalesce(nullif(p_level, ''), student_activity.level),
        last_login_at = now(),
        session_count = student_activity.session_count + 1,
        updated_at    = now();
end;
$$;

-- Chamada periodicamente enquanto o aluno usa a plataforma (heartbeat de tempo de uso).
create or replace function public.add_time_seconds(p_secs integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if p_secs is null or p_secs <= 0 then
    return;
  end if;

  insert into public.student_activity (user_id, total_seconds)
  values (uid, p_secs)
  on conflict (user_id) do update
    set total_seconds = student_activity.total_seconds + p_secs,
        updated_at    = now();
end;
$$;

-- Chamada a cada exercício respondido (múltipla escolha, completar, traduzir, ordenar).
create or replace function public.bump_practice(p_kind text, p_correct boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
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
end;
$$;

grant execute on function public.touch_login(text, text) to authenticated;
grant execute on function public.add_time_seconds(integer) to authenticated;
grant execute on function public.bump_practice(text, boolean) to authenticated;

-- Pronto! ✅
