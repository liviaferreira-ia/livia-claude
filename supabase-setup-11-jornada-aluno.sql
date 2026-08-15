-- ============================================================
-- Central School — parte 11: jornada e progresso do aluno
-- Execute depois da parte 8. Seguro para rodar novamente.
-- ============================================================

alter table public.student_activity
  add column if not exists daily_activity_date date,
  add column if not exists daily_exercise_done integer not null default 0,
  add column if not exists streak_count integer not null default 0,
  add column if not exists best_streak integer not null default 0,
  add column if not exists last_study_date date,
  add column if not exists last_path text,
  add column if not exists last_title text,
  add column if not exists last_activity_type text,
  add column if not exists last_activity_at timestamptz;

create table if not exists public.student_exercise_attempts (
  id          bigint generated always as identity primary key,
  student_id  uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  level       text not null check (level in ('A1','A2','B1','B2','C1','C2')),
  kind        text not null check (kind in ('mc','fill','translate','order')),
  correct     boolean not null,
  answered_at timestamptz not null default now()
);

create table if not exists public.student_lesson_progress (
  student_id  uuid not null references auth.users(id) on delete cascade,
  lesson_slug text not null,
  section_id  text not null,
  completed_at timestamptz not null default now(),
  primary key (student_id, lesson_slug, section_id)
);

create table if not exists public.student_saved_words (
  student_id uuid not null references auth.users(id) on delete cascade,
  word_key   text not null,
  en         text not null,
  pt         text not null,
  example    text,
  source     text,
  added_at   timestamptz not null default now(),
  primary key (student_id, word_key)
);

create index if not exists exercise_attempts_student_idx
  on public.student_exercise_attempts (student_id, answered_at desc);
create index if not exists exercise_attempts_review_idx
  on public.student_exercise_attempts (student_id, exercise_id, answered_at desc);
create index if not exists lesson_progress_student_idx
  on public.student_lesson_progress (student_id, completed_at desc);

alter table public.student_exercise_attempts enable row level security;
alter table public.student_lesson_progress enable row level security;
alter table public.student_saved_words enable row level security;

grant select on public.student_exercise_attempts, public.student_lesson_progress,
  public.student_saved_words to authenticated;
revoke insert, update, delete on public.student_exercise_attempts,
  public.student_lesson_progress, public.student_saved_words from authenticated;

drop policy if exists "attempts_select_own" on public.student_exercise_attempts;
create policy "attempts_select_own" on public.student_exercise_attempts for select to authenticated
  using (student_id = auth.uid());
drop policy if exists "attempts_select_teacher" on public.student_exercise_attempts;
create policy "attempts_select_teacher" on public.student_exercise_attempts for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'));

drop policy if exists "lesson_progress_select_own" on public.student_lesson_progress;
create policy "lesson_progress_select_own" on public.student_lesson_progress for select to authenticated
  using (student_id = auth.uid());
drop policy if exists "lesson_progress_select_teacher" on public.student_lesson_progress;
create policy "lesson_progress_select_teacher" on public.student_lesson_progress for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'));

drop policy if exists "saved_words_select_own" on public.student_saved_words;
create policy "saved_words_select_own" on public.student_saved_words for select to authenticated
  using (student_id = auth.uid());

create or replace function public.record_learning_position(
  p_path text, p_title text, p_activity_type text
) returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into public.student_activity
    (user_id, last_path, last_title, last_activity_type, last_activity_at)
  values
    (auth.uid(), left(p_path, 500), left(p_title, 200), left(p_activity_type, 60), now())
  on conflict (user_id) do update set
    last_path = excluded.last_path,
    last_title = excluded.last_title,
    last_activity_type = excluded.last_activity_type,
    last_activity_at = now(),
    updated_at = now();
end;
$$;

create or replace function public.record_exercise_attempt(
  p_exercise_id text, p_level text, p_kind text, p_correct boolean,
  p_path text default '/aluno/praticar', p_title text default 'Prática'
) returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  today date := timezone('America/Sao_Paulo', now())::date;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_level not in ('A1','A2','B1','B2','C1','C2') then raise exception 'invalid level'; end if;
  if p_kind not in ('mc','fill','translate','order') then raise exception 'invalid kind'; end if;

  insert into public.student_activity (user_id) values (uid)
  on conflict (user_id) do nothing;

  execute format(
    'update public.student_activity set %1$I = %1$I + 1, %2$I = %2$I + %3$L,
      daily_exercise_done = case when daily_activity_date = %4$L then daily_exercise_done + 1 else 1 end,
      daily_activity_date = %4$L,
      streak_count = case when last_study_date = %4$L then streak_count when last_study_date = %4$L::date - 1 then streak_count + 1 else 1 end,
      best_streak = greatest(best_streak, case when last_study_date = %4$L then streak_count when last_study_date = %4$L::date - 1 then streak_count + 1 else 1 end),
      last_study_date = %4$L, last_path = %5$L, last_title = %6$L,
      last_activity_type = ''exercise'', last_activity_at = now(), updated_at = now()
      where user_id = %7$L',
    'practice_' || p_kind || '_done', 'practice_' || p_kind || '_correct',
    case when p_correct then 1 else 0 end, today, left(p_path, 500), left(p_title, 200), uid
  );

  insert into public.student_exercise_attempts (student_id, exercise_id, level, kind, correct)
  values (uid, left(p_exercise_id, 160), p_level, p_kind, p_correct);
  insert into public.student_events (student_id, event_type, kind, correct)
  values (uid, 'exercise', p_kind, p_correct);
end;
$$;

create or replace function public.mark_lesson_section(p_slug text, p_section text, p_title text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into public.student_lesson_progress (student_id, lesson_slug, section_id)
  values (auth.uid(), left(p_slug, 160), left(p_section, 80))
  on conflict (student_id, lesson_slug, section_id) do update set completed_at = now();
  perform public.record_learning_position('/aluno/licao/' || p_slug, p_title, 'lesson');
end;
$$;

create or replace function public.save_student_word(
  p_en text, p_pt text, p_example text default null, p_source text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if nullif(trim(p_en), '') is null then return; end if;
  insert into public.student_saved_words (student_id, word_key, en, pt, example, source)
  values (auth.uid(), lower(trim(p_en)), trim(p_en), trim(p_pt), nullif(trim(p_example), ''), nullif(trim(p_source), ''))
  on conflict (student_id, word_key) do update set
    en = excluded.en, pt = excluded.pt, example = excluded.example,
    source = excluded.source, added_at = now();
end;
$$;

create or replace function public.remove_student_word(p_en text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from public.student_saved_words
  where student_id = auth.uid() and word_key = lower(trim(p_en));
end;
$$;

grant execute on function public.record_learning_position(text,text,text) to authenticated;
grant execute on function public.record_exercise_attempt(text,text,text,boolean,text,text) to authenticated;
grant execute on function public.mark_lesson_section(text,text,text) to authenticated;
grant execute on function public.save_student_word(text,text,text,text) to authenticated;
grant execute on function public.remove_student_word(text) to authenticated;
notify pgrst, 'reload schema';
