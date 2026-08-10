-- ============================================================
-- Central School — configuração do Supabase
-- Cole TUDO isto no Supabase → SQL Editor → New query → Run.
-- Pode rodar mais de uma vez sem problema (é seguro reexecutar).
-- ============================================================

-- 1) BUCKET DE FOTOS DE PERFIL ------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Qualquer pessoa pode VER as fotos (bucket público)
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- O aluno logado só pode ENVIAR foto para a pasta com o próprio id
drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ...e TROCAR a própria foto
drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2) RECADOS PARA O TUTOR -----------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  sender     text not null default 'student',
  body       text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- O aluno só vê os próprios recados
drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own"
  on public.messages for select to authenticated
  using ( user_id = auth.uid() );

-- O aluno só cria recado em nome dele mesmo
drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own"
  on public.messages for insert to authenticated
  with check ( user_id = auth.uid() and sender = 'student' );

-- Pronto! ✅
