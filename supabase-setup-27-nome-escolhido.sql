-- Central School · 27 · Nome escolhido protegido do Google (17/11/2026)
--
-- O login com Google sobrescreve user_metadata.name a cada entrada. A plataforma passa a ler o
-- nome escolhido em user_metadata.display_name (com name como reserva). Aqui copiamos o nome
-- atual para display_name de quem ainda não tem.
-- Pode rodar mais de uma vez sem erro.

update auth.users
set raw_user_meta_data = raw_user_meta_data || jsonb_build_object('display_name', raw_user_meta_data ->> 'name')
where coalesce(raw_user_meta_data ->> 'display_name', '') = ''
  and coalesce(raw_user_meta_data ->> 'name', '') <> '';
