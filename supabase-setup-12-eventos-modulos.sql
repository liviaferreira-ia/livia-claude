-- ============================================================
-- Central School — parte 12: rastrear uso de Tutor, Roleplay e Pronúncia
-- Execute no Supabase SQL Editor depois da parte 9.
-- Seguro para rodar mais de uma vez.
-- ============================================================

alter table public.student_events drop constraint if exists student_events_event_type_check;
alter table public.student_events add constraint student_events_event_type_check
  check (event_type in ('login', 'exercise', 'tutor', 'roleplay', 'pronunciation'));

-- RPC de uso pelo próprio aluno (roleplay/pronúncia, client-side). O tutor
-- grava direto via service_role na rota de servidor, não usa esta função.
-- Nunca guarda texto de conversa nem áudio -- só o evento em si.
create or replace function public.log_student_event(p_event_type text, p_kind text default null, p_correct boolean default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_event_type not in ('roleplay', 'pronunciation') then
    raise exception 'invalid event_type for log_student_event: %', p_event_type;
  end if;
  insert into public.student_events (student_id, event_type, kind, correct)
  values (uid, p_event_type, p_kind, p_correct);
end;
$$;

grant execute on function public.log_student_event(text, text, boolean) to authenticated;
notify pgrst, 'reload schema';
