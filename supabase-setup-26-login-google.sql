-- Central School · 26 · Login com Google (17/11/2026)
--
-- Decisão do Fabio: o login com Google vale para quem já é aluno (o Supabase liga o
-- Google à conta que já existe com o mesmo e-mail) e também para novos cadastros,
-- que entram no teste grátis de 7 dias, como quem se cadastra em /experimente.
--
-- 1) Conta nova criada por um provedor externo (Google) abre o teste grátis pendente.
--    Convites da professora e cadastros por e-mail continuam como antes (provider = email).
--    O relógio dos 7 dias só começa no primeiro acesso, como já acontece hoje.
-- 2) A foto escolhida pelo aluno passa a ficar em photo_url (o Google sobrescreve
--    avatar_url a cada login). Copia as fotos já enviadas para o campo novo.
--
-- Pode rodar mais de uma vez sem erro.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;

  if coalesce(new.raw_user_meta_data ->> 'trial_requested', 'false') = 'true'
     or coalesce(new.raw_app_meta_data ->> 'provider', 'email') <> 'email' then
    insert into public.student_trials (student_id, consent_at, terms_version)
    values (new.id, new.created_at, '2026-08-15')
    on conflict (student_id) do nothing;
  end if;
  return new;
end;
$$;

update auth.users
set raw_user_meta_data = raw_user_meta_data || jsonb_build_object('photo_url', raw_user_meta_data ->> 'avatar_url')
where raw_user_meta_data ? 'avatar_url'
  and raw_user_meta_data ->> 'avatar_url' like '%/storage/v1/object/%'
  and not (raw_user_meta_data ? 'photo_url');
