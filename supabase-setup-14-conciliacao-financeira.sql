-- ============================================================
-- Central School — parte 14: pré-cadastros vindos do Asaas
-- Execute no Supabase SQL Editor antes de publicar esta entrega.
-- Seguro para rodar mais de uma vez.
-- ============================================================

create table if not exists public.payment_candidates (
  id                uuid primary key default gen_random_uuid(),
  asaas_customer_id text not null unique,
  payer_name        text not null,
  payer_email       text,
  payer_phone       text,
  status            text not null default 'pending'
                    check (status in ('pending', 'approved', 'linked', 'ignored')),
  linked_user_id    uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists payment_candidates_status_idx
  on public.payment_candidates (status, updated_at desc);

alter table public.payment_candidates enable row level security;

drop policy if exists "payment_candidates_select_teacher" on public.payment_candidates;
create policy "payment_candidates_select_teacher"
  on public.payment_candidates for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

revoke all on public.payment_candidates from anon;
grant select on public.payment_candidates to authenticated;

-- Escritas são feitas somente pelas rotas server-side com service_role.
