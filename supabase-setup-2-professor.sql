-- ============================================================
-- Central School — parte 2: papéis (aluno x professor)
-- Cole TUDO no Supabase → SQL Editor → New query → Run.
-- Seguro para rodar mais de uma vez.
-- ============================================================

-- 1) TABELA DE PAPÉIS ---------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'student',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada pessoa lê só o próprio papel
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using ( id = auth.uid() );

-- Cria a linha de papel automaticamente para quem se cadastrar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Garante papel para quem já se cadastrou antes desta configuração
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- 2) NOME DO ALUNO NO RECADO (para o professor ver de quem é) -----------------
alter table public.messages add column if not exists student_name text;

-- 3) PERMISSÕES DO PROFESSOR NOS RECADOS --------------------------------------
-- O professor pode LER os recados de todos os alunos
drop policy if exists "messages_select_teacher" on public.messages;
create policy "messages_select_teacher"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

-- O professor pode RESPONDER (mensagens do tipo 'tutor')
drop policy if exists "messages_insert_teacher" on public.messages;
create policy "messages_insert_teacher"
  on public.messages for insert to authenticated
  with check (
    sender = 'tutor'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

-- ============================================================
-- DEPOIS que a Livia criar a conta dela, rode a linha abaixo
-- trocando o e-mail pelo dela, para marcá-la como professora:
--
-- update public.profiles set role = 'teacher'
-- where id = (select id from auth.users where email = 'EMAIL_DA_LIVIA');
-- ============================================================
