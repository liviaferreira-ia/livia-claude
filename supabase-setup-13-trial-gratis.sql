-- ============================================================
-- Central School — parte 13: período gratuito de 7 dias
-- Execute depois da parte 12. Seguro para rodar mais de uma vez.
-- ============================================================

create table if not exists public.student_trials (
  student_id               uuid primary key references auth.users(id) on delete cascade,
  status                   text not null default 'pending'
    check (status in ('pending', 'active', 'checkout_pending', 'converted', 'expired', 'cancelled')),
  starts_at                timestamptz,
  ends_at                  timestamptz,
  consent_at               timestamptz not null,
  terms_version            text not null,
  checkout_id              text unique,
  checkout_url             text,
  checkout_created_at      timestamptz,
  conversion_requested_at  timestamptz,
  converted_at             timestamptz,
  asaas_customer_id        text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  check ((starts_at is null and ends_at is null) or (starts_at is not null and ends_at is not null and ends_at > starts_at))
);

create index if not exists student_trials_status_ends_idx
  on public.student_trials (status, ends_at);
create index if not exists student_trials_checkout_idx
  on public.student_trials (checkout_id);

alter table public.student_trials enable row level security;
grant select on public.student_trials to authenticated;
revoke insert, update, delete on public.student_trials from authenticated;

drop policy if exists "trials_select_own" on public.student_trials;
create policy "trials_select_own" on public.student_trials for select to authenticated
  using (student_id = auth.uid());

drop policy if exists "trials_select_teacher" on public.student_trials;
create policy "trials_select_teacher" on public.student_trials for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'));

-- Mantém a criação do perfil já existente e abre um trial pendente apenas para
-- cadastros que vieram da página pública "Experimente grátis". O relógio ainda
-- não começa aqui: começa no primeiro acesso autenticado à plataforma.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;

  if coalesce(new.raw_user_meta_data ->> 'trial_requested', 'false') = 'true' then
    insert into public.student_trials (student_id, consent_at, terms_version)
    values (new.id, new.created_at, '2026-08-15')
    on conflict (student_id) do nothing;
  end if;
  return new;
end;
$$;

-- Ativa o período uma única vez, no primeiro acesso. SECURITY DEFINER impede
-- que o navegador escolha outra data ou reinicie os sete dias.
create or replace function public.activate_my_trial()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  update public.student_trials
  set status = 'active', starts_at = now(), ends_at = now() + interval '7 days', updated_at = now()
  where student_id = uid and status = 'pending' and starts_at is null;
end;
$$;

revoke all on function public.activate_my_trial() from public, anon;
grant execute on function public.activate_my_trial() to authenticated;

-- Reserva idempotente para criação do checkout. Impede dois cliques/requisições
-- simultâneos de abrirem duas assinaturas no Asaas. Uma reserva sem resposta
-- pode ser retomada depois de dois minutos.
create or replace function public.claim_trial_checkout(p_student_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed integer;
begin
  update public.student_trials
  set status = 'checkout_pending', checkout_created_at = now(), updated_at = now()
  where student_id = p_student_id
    and status not in ('converted', 'cancelled')
    and checkout_url is null
    and (checkout_created_at is null or checkout_created_at < now() - interval '2 minutes');
  get diagnostics claimed = row_count;
  return claimed = 1;
end;
$$;

revoke all on function public.claim_trial_checkout(uuid) from public, anon, authenticated;
grant execute on function public.claim_trial_checkout(uuid) to service_role;

notify pgrst, 'reload schema';
