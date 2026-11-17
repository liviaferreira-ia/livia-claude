-- Central School · supabase-setup-25-aulas-video-concluidas.sql
-- Redesign (design v2), 17/11/2026: registrar a conclusão das aulas A1 em vídeo,
-- para destravar a próxima aula em sequência e mostrar o progresso do curso.
--
-- Pode rodar mais de uma vez sem erro. Não altera nem apaga nenhum dado existente.
-- Usa a tabela que já existe (student_lesson_progress), com section_id = 'aula-concluida'.
-- A tabela continua sem gravação direta pelo aluno: só esta função grava, e só para o próprio aluno.
-- (Os números 23 e 24 estão reservados para a sala de estudo, ainda não publicada.)

create or replace function public.mark_video_lesson(p_lesson_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_lesson_id is null or p_lesson_id !~ '^a1-u[0-9]{2}-l[0-9]{2}-[a-z0-9-]{1,120}$' then
    raise exception 'invalid lesson id';
  end if;
  insert into public.student_lesson_progress (student_id, lesson_slug, section_id)
  values (auth.uid(), p_lesson_id, 'aula-concluida')
  on conflict (student_id, lesson_slug, section_id) do update set completed_at = now();
end;
$$;

revoke all on function public.mark_video_lesson(text) from public;
grant execute on function public.mark_video_lesson(text) to authenticated;
