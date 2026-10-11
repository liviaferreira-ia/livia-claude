-- Central School: decisões individuais, publicação e histórico das aulas.
-- Executar no SQL Editor do projeto jqxiztixsegcufolbzwm antes do deploy.
begin;
create table if not exists public.lesson_reviews (
  lesson_id text primary key,
  revision text not null,
  status text not null check (status in ('approved', 'rejected')),
  note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  check (status <> 'rejected' or coalesce(length(btrim(note)), 0) > 0),
  check (status <> 'approved' or note is null)
);
create table if not exists public.lesson_review_events (
  id bigint generated always as identity primary key,
  lesson_id text not null,
  revision text not null,
  status text not null check (status in ('approved', 'rejected')),
  note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.lesson_reviews enable row level security;
alter table public.lesson_review_events enable row level security;
revoke all on public.lesson_reviews, public.lesson_review_events from anon, authenticated;
grant select on public.lesson_reviews, public.lesson_review_events to authenticated;
drop policy if exists lesson_reviews_read on public.lesson_reviews;
create policy lesson_reviews_read on public.lesson_reviews for select to authenticated
  using (status = 'approved' or exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin')));
drop policy if exists lesson_review_events_read on public.lesson_review_events;
create policy lesson_review_events_read on public.lesson_review_events for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin')));
create or replace function public.review_lesson(
  p_lesson_id text, p_revision text, p_status text, p_note text,
  p_expected_updated_at timestamptz
) returns public.lesson_reviews
language plpgsql security definer set search_path = public
as $$
declare current_review public.lesson_reviews; saved public.lesson_reviews;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin')) then
    raise exception 'Somente a equipe pode revisar aulas.' using errcode = '42501';
  end if;
  if p_lesson_id is null or p_revision is null
     or p_lesson_id !~ '^a1-u[0-9]{2}-l[0-9]{2}-[a-z0-9-]+$' or p_revision !~ '^[a-f0-9]{64}$'
     or p_status not in ('approved', 'rejected') or p_status is null
     or (p_status = 'rejected' and coalesce(length(btrim(p_note)), 0) = 0)
     or coalesce(length(p_note), 0) > 2000 then
    raise exception 'Dados de revisão inválidos.' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_lesson_id, 0));
  select * into current_review from public.lesson_reviews where lesson_id = p_lesson_id;
  if current_review.updated_at is distinct from p_expected_updated_at then
    raise exception 'A revisão mudou. Atualize a página antes de decidir.' using errcode = '40001';
  end if;
  insert into public.lesson_reviews (lesson_id, revision, status, note, reviewed_by, updated_at)
    values (p_lesson_id, p_revision, p_status, case when p_status = 'rejected' then btrim(p_note) else null end, auth.uid(), clock_timestamp())
    on conflict (lesson_id) do update set revision = excluded.revision, status = excluded.status,
      note = excluded.note, reviewed_by = excluded.reviewed_by, updated_at = excluded.updated_at
    returning * into saved;
  insert into public.lesson_review_events (lesson_id, revision, status, note, reviewed_by, created_at)
    values (saved.lesson_id, saved.revision, saved.status, saved.note, saved.reviewed_by, saved.updated_at);
  return saved;
end;
$$;
revoke all on function public.review_lesson(text, text, text, text, timestamptz) from public, anon;
grant execute on function public.review_lesson(text, text, text, text, timestamptz) to authenticated;
notify pgrst, 'reload schema';
commit;
