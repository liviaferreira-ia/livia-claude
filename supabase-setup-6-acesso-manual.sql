-- ============================================================
-- Central School — parte 6: pausar/reativar acesso pelo professor
-- Cole TUDO no Supabase → SQL Editor → New query → Run.
-- Seguro para rodar mais de uma vez.
-- ============================================================

-- Marca que o bloqueio foi decidido pelo professor, não pela régua de atraso.
-- Serve para o pagamento automático NÃO reativar quem foi pausado na mão
-- (ex.: aluno trancou o curso, pediu estorno ou saiu da escola).
alter table public.student_activity
  add column if not exists manual_block boolean not null default false;

-- Recarrega o cache de schema do Supabase, senão a API continua sem enxergar
-- a coluna nova e as chamadas falham com "column not found in schema cache".
notify pgrst, 'reload schema';

-- Pronto! ✅
