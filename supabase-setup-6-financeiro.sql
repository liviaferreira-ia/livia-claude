-- ============================================================
-- Central School — parte 6: histórico financeiro por aluno
-- Execute no Supabase SQL Editor antes de publicar a nova tela.
-- Seguro para rodar mais de uma vez.
-- ============================================================

create table if not exists public.student_payments (
  id                text primary key,
  user_id           uuid references auth.users(id) on delete set null,
  asaas_customer_id text not null,
  subscription_id   text,
  status            text not null,
  billing_type      text,
  value             numeric(12,2) not null default 0,
  net_value         numeric(12,2),
  due_date          date,
  payment_date      date,
  confirmed_date    date,
  invoice_url       text,
  bank_slip_url     text,
  description       text,
  last_event        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists student_payments_user_id_idx
  on public.student_payments (user_id);
create index if not exists student_payments_customer_idx
  on public.student_payments (asaas_customer_id);
create index if not exists student_payments_due_date_idx
  on public.student_payments (due_date desc);
create index if not exists student_payments_status_idx
  on public.student_payments (status);

alter table public.student_payments enable row level security;

drop policy if exists "student_payments_select_teacher" on public.student_payments;
create policy "student_payments_select_teacher"
  on public.student_payments for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

revoke all on public.student_payments from anon;
grant select on public.student_payments to authenticated;

-- Escritas são feitas apenas por rotas server-side com service_role.
-- Não há política de insert/update/delete para usuários do navegador.
