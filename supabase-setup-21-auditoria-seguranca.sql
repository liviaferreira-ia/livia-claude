-- ============================================================
-- Central School — parte 21: correções da auditoria de segurança (25/08/2026)
-- Execute depois da parte 20. Seguro para rodar novamente.
-- ============================================================

-- 1) mark_course_phase() aceitava qualquer nível/unidade/etapa vindo do
-- cliente sem nunca conferir se o aluno realmente fez algum exercício --
-- um aluno podia chamar a função direto (fora da tela) e se creditar 100%
-- de progresso em qualquer nível sem nunca ter praticado. Agora exige uma
-- evidência real e recente (resposta de exercício ou evento de
-- pronúncia/roleplay) nos últimos 30 minutos antes de aceitar a etapa --
-- exatamente o que toda sessão legítima (Praticar, Pronúncia, Roleplay,
-- teste final da lição) já gera pouco antes de chamar esta função.
create or replace function public.mark_course_phase(
  p_level text, p_unit integer, p_phase text,
  p_source text default 'platform', p_evidence_id text default null,
  p_path text default '/aluno/curso', p_title text default 'Meu curso'
) returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  max_units integer := case p_level when 'A1' then 12 when 'A2' then 12 when 'B1' then 14 when 'B2' then 14 when 'C1' then 14 when 'C2' then 14 end;
  has_evidence boolean;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_level not in ('A1','A2','B1','B2','C1','C2') then raise exception 'invalid level'; end if;
  if p_unit < 1 or p_unit > max_units then raise exception 'invalid unit'; end if;
  if p_phase not in ('learn','understand','practice','speak','mission','mastery') then raise exception 'invalid phase'; end if;

  if p_phase in ('practice', 'mastery') then
    select exists(
      select 1 from public.student_exercise_attempts
      where student_id = uid and level = p_level and answered_at > now() - interval '30 minutes'
    ) into has_evidence;
  elsif p_phase = 'speak' then
    select exists(
      select 1 from public.student_events
      where student_id = uid and event_type = 'pronunciation' and correct = true and created_at > now() - interval '30 minutes'
    ) into has_evidence;
  elsif p_phase = 'mission' then
    select exists(
      select 1 from public.student_events
      where student_id = uid and event_type = 'roleplay' and created_at > now() - interval '30 minutes'
    ) into has_evidence;
  else
    select exists(
      select 1 from public.student_exercise_attempts where student_id = uid and answered_at > now() - interval '30 minutes'
      union all
      select 1 from public.student_events where student_id = uid and created_at > now() - interval '30 minutes'
    ) into has_evidence;
  end if;

  if not has_evidence then
    raise exception 'no recent activity evidence for this phase';
  end if;

  perform public.upsert_course_phase(uid, p_level, p_unit::smallint, p_phase, p_source, p_evidence_id);
  perform public.record_learning_position(p_path, p_title, 'course_phase');
  insert into public.student_events (student_id, event_type, kind, correct)
  values (uid, 'course_phase', p_level || ':' || p_unit || ':' || p_phase, true);
end;
$$;

grant execute on function public.mark_course_phase(text,integer,text,text,text,text,text) to authenticated;

-- 2) A tabela de arquivos de uma atividade especial só conferia se o aluno
-- era destinatário, sem checar se a atividade já foi publicada -- um aluno
-- já designado (mas com a atividade ainda em rascunho) conseguia ler nome
-- e caminho do arquivo direto do banco, sem passar pela tela. Alinha com a
-- mesma checagem que a tabela da atividade em si já tem.
drop policy if exists "special_assets_recipient_read" on public.special_activity_assets;
create policy "special_assets_recipient_read" on public.special_activity_assets for select to authenticated using (
  exists (
    select 1 from public.special_activity_recipients r
    join public.special_activities a on a.id = r.activity_id
    where r.activity_id = special_activity_assets.activity_id
      and r.student_id = auth.uid()
      and a.publication_status = 'published'
  )
);

-- 3) add_time_seconds() não tinha teto -- o heartbeat legítimo sempre manda
-- 60 (uma vez por minuto, só com a aba visível), então um valor muito maior
-- só pode vir de alguém chamando a função direto pra inflar "tempo de
-- estudo". Limite generoso (2min) cobre variação normal sem travar uso real.
create or replace function public.add_time_seconds(p_secs integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  capped_secs integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if p_secs is null or p_secs <= 0 then
    return;
  end if;
  capped_secs := least(p_secs, 120);

  insert into public.student_activity (user_id, total_seconds)
  values (uid, capped_secs)
  on conflict (user_id) do update
    set total_seconds = student_activity.total_seconds + capped_secs,
        updated_at    = now();
end;
$$;

grant execute on function public.add_time_seconds(integer) to authenticated;

notify pgrst, 'reload schema';
