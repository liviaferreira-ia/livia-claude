-- ============================================================
-- Central School — parte 15: progresso pedagógico por etapa
-- Execute depois da parte 12. Seguro para rodar novamente.
-- ============================================================

create table if not exists public.student_course_progress (
  student_id   uuid not null references auth.users(id) on delete cascade,
  level        text not null check (level in ('A1','A2','B1','B2','C1','C2')),
  unit_number  smallint not null check (unit_number between 1 and 20),
  phase        text not null check (phase in ('learn','understand','practice','speak','mission','mastery')),
  source       text not null default 'platform',
  evidence_id  text,
  completed_at timestamptz not null default now(),
  primary key (student_id, level, unit_number, phase)
);

create index if not exists course_progress_student_idx
  on public.student_course_progress (student_id, level, unit_number, completed_at);

alter table public.student_course_progress enable row level security;
grant select on public.student_course_progress to authenticated;
revoke insert, update, delete on public.student_course_progress from authenticated;

drop policy if exists "course_progress_select_own" on public.student_course_progress;
create policy "course_progress_select_own" on public.student_course_progress
  for select to authenticated using (student_id = auth.uid());
drop policy if exists "course_progress_select_teacher" on public.student_course_progress;
create policy "course_progress_select_teacher" on public.student_course_progress
  for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
  );

alter table public.student_activity
  add column if not exists course_level text,
  add column if not exists course_completed_phases integer not null default 0,
  add column if not exists current_unit smallint not null default 1,
  add column if not exists current_phase text not null default 'learn',
  add column if not exists course_progress_updated_at timestamptz;

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
  select count(*) into completed
  from public.student_course_progress
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

create or replace function public.upsert_course_phase(
  p_student_id uuid, p_level text, p_unit smallint, p_phase text,
  p_source text, p_evidence_id text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.student_course_progress
    (student_id, level, unit_number, phase, source, evidence_id)
  values
    (p_student_id, p_level, p_unit, p_phase, left(coalesce(p_source, 'platform'), 60), left(p_evidence_id, 200))
  on conflict (student_id, level, unit_number, phase) do update set
    source = excluded.source,
    evidence_id = coalesce(student_course_progress.evidence_id, excluded.evidence_id);
  perform public.refresh_course_projection(p_student_id, p_level);
end;
$$;

revoke all on function public.refresh_course_projection(uuid,text) from public;
revoke all on function public.upsert_course_phase(uuid,text,smallint,text,text,text) from public;

alter table public.student_events drop constraint if exists student_events_event_type_check;
alter table public.student_events add constraint student_events_event_type_check
  check (event_type in ('login','exercise','tutor','roleplay','pronunciation','course_phase'));

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

grant execute on function public.mark_course_phase(text,integer,text,text,text,text,text) to authenticated;

-- A conclusão de seções das lições passa a alimentar também o currículo.
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

-- Reconciliação conservadora: recupera somente etapas antigas que possuem
-- evidência na tabela de seções. Tempo de tela e login não provam conclusão.
insert into public.student_course_progress
  (student_id, level, unit_number, phase, source, evidence_id, completed_at)
select
  student_id,
  case lesson_slug
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
  end,
  case lesson_slug
    when 'reservas-e-check-in' then 3
    when 'contando-uma-experiencia' then 2
    when 'identity-personal-development' then 1
    when 'contando-uma-historia' then 2
    when 'identity-values-perspective' then 1
    when 'discordando-com-tato' then 3
    when 'precision-nuance' then 1
    when 'argumento-persuasivo' then 6
    else 1
  end,
  case section_id when 'vocabulario' then 'learn' when 'expressoes' then 'learn' when 'listening' then 'understand' when 'exercicios' then 'practice' end,
  'historical_lesson_section',
  lesson_slug || ':' || section_id,
  completed_at
from public.student_lesson_progress
where lesson_slug in ('apresentando-se','conhecendo-voce-melhor','reservas-e-check-in','who-i-am','contando-uma-experiencia','identity-personal-development','contando-uma-historia','identity-values-perspective','discordando-com-tato','precision-nuance','argumento-persuasivo')
  and section_id in ('vocabulario','expressoes','listening','exercicios')
on conflict (student_id, level, unit_number, phase) do nothing;

-- Se já existirem tentativas detalhadas, garante que os contadores resumidos
-- nunca fiquem abaixo da evidência. Não apaga contagens antigas legítimas.
with totals as (
  select student_id,
    count(*) filter (where kind = 'mc')::integer as mc_done,
    count(*) filter (where kind = 'mc' and correct)::integer as mc_correct,
    count(*) filter (where kind = 'fill')::integer as fill_done,
    count(*) filter (where kind = 'fill' and correct)::integer as fill_correct,
    count(*) filter (where kind = 'translate')::integer as translate_done,
    count(*) filter (where kind = 'translate' and correct)::integer as translate_correct,
    count(*) filter (where kind = 'order')::integer as order_done,
    count(*) filter (where kind = 'order' and correct)::integer as order_correct
  from public.student_exercise_attempts group by student_id
)
update public.student_activity a set
  practice_mc_done = greatest(a.practice_mc_done, t.mc_done),
  practice_mc_correct = greatest(a.practice_mc_correct, t.mc_correct),
  practice_fill_done = greatest(a.practice_fill_done, t.fill_done),
  practice_fill_correct = greatest(a.practice_fill_correct, t.fill_correct),
  practice_translate_done = greatest(a.practice_translate_done, t.translate_done),
  practice_translate_correct = greatest(a.practice_translate_correct, t.translate_correct),
  practice_order_done = greatest(a.practice_order_done, t.order_done),
  practice_order_correct = greatest(a.practice_order_correct, t.order_correct),
  updated_at = now()
from totals t where a.user_id = t.student_id;

do $$
declare r record; normalized_level text;
begin
  for r in select distinct student_id from public.student_course_progress loop
    select substring(level from '(A1|A2|B1|B2|C1|C2)') into normalized_level
    from public.student_activity where user_id = r.student_id;
    if normalized_level is not null then
      perform public.refresh_course_projection(r.student_id, normalized_level);
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';
