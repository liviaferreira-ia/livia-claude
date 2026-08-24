-- ============================================================
-- Central School — parte 18: ampliar a projeção curricular do C2
-- Execute depois da parte 17. Seguro para rodar novamente.
-- ============================================================

create or replace function public.refresh_course_projection(p_student_id uuid, p_level text)
returns void language plpgsql security definer set search_path = public as $$
declare
  phases text[] := array['learn','understand','practice','speak','mission','mastery'];
  max_units integer := case p_level when 'A1' then 12 when 'A2' then 12 when 'B1' then 14 when 'B2' then 14 when 'C1' then 14 when 'C2' then 14 end;
  completed integer;
  next_unit integer := max_units;
  next_phase text := 'mastery';
  u integer;
  i integer;
begin
  select count(*) into completed from public.student_course_progress
  where student_id = p_student_id and level = p_level;

  <<unit_scan>>
  for u in 1..max_units loop
    for i in 1..6 loop
      if not exists (
        select 1 from public.student_course_progress
        where student_id = p_student_id and level = p_level
          and unit_number = u and phase = phases[i]
      ) then
        next_unit := u;
        next_phase := phases[i];
        exit unit_scan;
      end if;
    end loop;
  end loop unit_scan;

  insert into public.student_activity (user_id) values (p_student_id)
  on conflict (user_id) do nothing;
  update public.student_activity set
    course_level = p_level,
    course_completed_phases = completed,
    current_unit = next_unit,
    current_phase = next_phase,
    course_progress_updated_at = now(),
    updated_at = now()
  where user_id = p_student_id;
end;
$$;

create or replace function public.mark_course_phase(
  p_level text, p_unit integer, p_phase text,
  p_source text default 'platform', p_evidence_id text default null,
  p_path text default '/aluno/curso', p_title text default 'Meu curso'
) returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  max_units integer := case p_level when 'A1' then 12 when 'A2' then 12 when 'B1' then 14 when 'B2' then 14 when 'C1' then 14 when 'C2' then 14 end;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_level not in ('A1','A2','B1','B2','C1','C2') then raise exception 'invalid level'; end if;
  if p_unit < 1 or p_unit > max_units then raise exception 'invalid unit'; end if;
  if p_phase not in ('learn','understand','practice','speak','mission','mastery') then raise exception 'invalid phase'; end if;

  perform public.upsert_course_phase(uid, p_level, p_unit::smallint, p_phase, p_source, p_evidence_id);
  perform public.record_learning_position(p_path, p_title, 'course_phase');
  insert into public.student_events (student_id, event_type, kind, correct)
  values (uid, 'course_phase', p_level || ':' || p_unit || ':' || p_phase, true);
end;
$$;

create or replace function public.mark_lesson_section(p_slug text, p_section text, p_title text)
returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  mapped_level text;
  mapped_unit smallint;
  mapped_phase text;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  insert into public.student_lesson_progress (student_id, lesson_slug, section_id)
  values (uid, left(p_slug, 160), left(p_section, 80))
  on conflict (student_id, lesson_slug, section_id) do update set completed_at = now();

  mapped_level := case p_slug
    when 'apresentando-se' then 'A1'
    when 'conhecendo-voce-melhor' then 'A2'
    when 'reservas-e-check-in' then 'A2'
    when 'who-i-am' then 'B1'
    when 'contando-uma-experiencia' then 'B1'
    when 'identity-personal-development' then 'B2'
    when 'contando-uma-historia' then 'B2'
    when 'identity-values-perspective' then 'C1'
    when 'discordando-com-tato' then 'C1'
    when 'precision-nuance' then 'C2'
    when 'argumento-persuasivo' then 'C2'
  end;
  mapped_unit := case p_slug
    when 'apresentando-se' then 1
    when 'conhecendo-voce-melhor' then 1
    when 'reservas-e-check-in' then 3
    when 'who-i-am' then 1
    when 'contando-uma-experiencia' then 2
    when 'identity-personal-development' then 1
    when 'contando-uma-historia' then 2
    when 'identity-values-perspective' then 1
    when 'discordando-com-tato' then 3
    when 'precision-nuance' then 1
    when 'argumento-persuasivo' then 6
    else 1
  end;
  mapped_phase := case p_section
    when 'vocabulario' then 'learn'
    when 'expressoes' then 'learn'
    when 'listening' then 'understand'
    when 'exercicios' then 'practice'
  end;

  if mapped_level is not null and mapped_phase is not null then
    perform public.upsert_course_phase(uid, mapped_level, mapped_unit, mapped_phase, 'lesson_section', p_slug || ':' || p_section);
  end if;
  perform public.record_learning_position('/aluno/licao/' || p_slug, p_title, 'lesson');
end;
$$;

-- A antiga lição persuasiva era classificada como C2 U1; agora pertence à U6.
insert into public.student_course_progress
  (student_id, level, unit_number, phase, source, evidence_id, completed_at)
select student_id, level, 6, phase, source, evidence_id, completed_at
from public.student_course_progress
where level = 'C2' and unit_number = 1 and evidence_id like 'argumento-persuasivo:%'
on conflict (student_id, level, unit_number, phase) do nothing;

delete from public.student_course_progress
where level = 'C2' and unit_number = 1 and evidence_id like 'argumento-persuasivo:%';

insert into public.student_course_progress
  (student_id, level, unit_number, phase, source, evidence_id, completed_at)
select student_id, 'C2', 1,
  case section_id when 'vocabulario' then 'learn' when 'expressoes' then 'learn' when 'listening' then 'understand' when 'exercicios' then 'practice' end,
  'historical_lesson_section', lesson_slug || ':' || section_id, completed_at
from public.student_lesson_progress
where lesson_slug = 'precision-nuance'
  and section_id in ('vocabulario','expressoes','listening','exercicios')
on conflict (student_id, level, unit_number, phase) do nothing;

do $$
declare r record;
begin
  for r in select user_id from public.student_activity
    where substring(level from '(A1|A2|B1|B2|C1|C2)') = 'C2'
  loop
    perform public.refresh_course_projection(r.user_id, 'C2');
  end loop;
end $$;

grant execute on function public.mark_course_phase(text,integer,text,text,text,text,text) to authenticated;
grant execute on function public.mark_lesson_section(text,text,text) to authenticated;
notify pgrst, 'reload schema';
