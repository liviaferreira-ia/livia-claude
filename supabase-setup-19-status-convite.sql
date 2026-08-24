-- ============================================================
-- Central School — parte 19: status operacional dos convites
-- Execute depois da parte 18. Seguro para rodar novamente.
-- ============================================================

alter table public.student_activity
  add column if not exists invite_status text not null default 'not_sent',
  add column if not exists invite_last_sent_at timestamptz,
  add column if not exists invite_error text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'student_activity_invite_status_check'
      and conrelid = 'public.student_activity'::regclass
  ) then
    alter table public.student_activity
      add constraint student_activity_invite_status_check
      check (invite_status in ('active', 'pending', 'error', 'not_sent'));
  end if;
end;
$$;

-- Reconstrói o estado inicial usando o histórico real do Auth.
update public.student_activity activity
set invite_status = case
      when auth_user.last_sign_in_at is not null or activity.last_login_at is not null then 'active'
      when auth_user.invited_at is not null then 'pending'
      else 'not_sent'
    end,
    invite_last_sent_at = coalesce(activity.invite_last_sent_at, auth_user.invited_at),
    invite_error = null
from auth.users auth_user
where auth_user.id = activity.user_id;

-- O primeiro carregamento autenticado transforma automaticamente o convite em acesso ativo.
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

  insert into public.student_activity
    (user_id, role, student_name, level, last_login_at, session_count, invite_status, invite_error)
  values
    (uid, coalesce(r, 'student'), nullif(p_name, ''), nullif(p_level, ''), now(), 1, 'active', null)
  on conflict (user_id) do update
    set role = coalesce(r, student_activity.role),
        student_name = coalesce(nullif(p_name, ''), student_activity.student_name),
        level = coalesce(nullif(p_level, ''), student_activity.level),
        last_login_at = now(),
        session_count = student_activity.session_count + 1,
        invite_status = 'active',
        invite_error = null,
        updated_at = now();

  if coalesce(r, 'student') = 'student' then
    insert into public.student_events (student_id, event_type) values (uid, 'login');
  end if;
end;
$$;

grant execute on function public.touch_login(text, text) to authenticated;

