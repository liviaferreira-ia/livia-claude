-- ============================================================
-- Central School — parte 5: pagamento (Asaas) e bloqueio por atraso
-- Cole TUDO no Supabase → SQL Editor → New query → Run.
-- Seguro para rodar mais de uma vez.
-- ============================================================

alter table public.student_activity add column if not exists asaas_customer_id text;
alter table public.student_activity add column if not exists payment_status text not null default 'ok';
alter table public.student_activity add column if not exists overdue_since timestamptz;
alter table public.student_activity add column if not exists blocked boolean not null default false;

create index if not exists student_activity_asaas_customer_id_idx
  on public.student_activity (asaas_customer_id);

-- Nota: as colunas acima só são escritas pelo webhook do Asaas e pela rotina diária
-- de bloqueio, ambos rodando com a service role key (que ignora RLS) — não
-- precisam de política nem função própria, igual às outras colunas da tabela,
-- o aluno só tem permissão de leitura da própria linha (já concedida antes).

-- Pronto! ✅
