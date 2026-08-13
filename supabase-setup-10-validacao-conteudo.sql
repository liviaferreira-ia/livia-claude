-- ============================================================
-- Central School — parte 10: validação de conteúdo por nível
-- Execute no Supabase SQL Editor depois da parte 9.
-- Seguro para rodar mais de uma vez.
-- ============================================================

create table if not exists public.content_validations (
  level        text primary key check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  validated    boolean not null default false,
  validated_by uuid references auth.users(id) on delete set null,
  validated_at timestamptz,
  note         text,
  updated_at   timestamptz not null default now()
);

insert into public.content_validations (level)
values ('A1'), ('A2'), ('B1'), ('B2'), ('C1'), ('C2')
on conflict (level) do nothing;

alter table public.content_validations enable row level security;

grant select on public.content_validations to authenticated;
revoke insert, update, delete on public.content_validations from authenticated;

drop policy if exists "content_validations_select_teacher" on public.content_validations;
create policy "content_validations_select_teacher" on public.content_validations for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'));

notify pgrst, 'reload schema';
