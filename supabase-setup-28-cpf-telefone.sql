-- Central School · 28 · CPF e telefone no cadastro do teste grátis (20/11/2026)
--
-- Pedido do Fabio: quem se cadastra no teste grátis de 7 dias informa WhatsApp e CPF,
-- para a escola poder fazer a cobrança depois, se o aluno decidir continuar.
--
-- 1) student_activity ganha o campo cpf (só os 11 dígitos). Um CPF por conta: isso também
--    impede a mesma pessoa de repetir o teste grátis com outro e-mail.
-- 2) cpf_valido(): confere os dígitos verificadores.
-- 3) handle_new_user(): igual à versão 26, e agora copia WhatsApp e CPF informados em
--    /experimente para student_activity. Depois de copiar, tira os dois dos metadados da
--    conta (não ficam duplicados no login). Se o CPF já estiver em uso, a conta é criada
--    sem CPF e as boas-vindas pedem de novo (lá o aluno vê a mensagem de CPF em uso).
-- 4) save_billing_contact(): o próprio aluno salva WhatsApp e CPF (usado nas boas-vindas
--    por quem entrou pelo Google). Depois de salvo, o CPF não muda por aqui: só a escola.
--
-- Pode rodar mais de uma vez sem erro.

alter table public.student_activity add column if not exists cpf text;

create unique index if not exists student_activity_cpf_key
  on public.student_activity (cpf) where cpf is not null;

create or replace function public.cpf_valido(p text)
returns boolean
language plpgsql
immutable
as $$
declare
  d text := regexp_replace(coalesce(p, ''), '\D', '', 'g');
  s int;
  r int;
  i int;
begin
  if length(d) <> 11 or d ~ '^(\d)\1{10}$' then
    return false;
  end if;
  s := 0;
  for i in 1..9 loop s := s + substr(d, i, 1)::int * (11 - i); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if;
  if r <> substr(d, 10, 1)::int then return false; end if;
  s := 0;
  for i in 1..10 loop s := s + substr(d, i, 1)::int * (12 - i); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if;
  return r = substr(d, 11, 1)::int;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cpf   text := regexp_replace(coalesce(new.raw_user_meta_data ->> 'cpf', ''), '\D', '', 'g');
  v_phone text := left(trim(coalesce(new.raw_user_meta_data ->> 'whatsapp', '')), 30);
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;

  if coalesce(new.raw_user_meta_data ->> 'trial_requested', 'false') = 'true'
     or coalesce(new.raw_app_meta_data ->> 'provider', 'email') <> 'email' then
    insert into public.student_trials (student_id, consent_at, terms_version)
    values (new.id, new.created_at, '2026-08-15')
    on conflict (student_id) do nothing;
  end if;

  if v_phone <> '' or v_cpf <> '' then
    begin
      insert into public.student_activity (user_id, whatsapp, cpf)
      values (new.id, nullif(v_phone, ''), case when public.cpf_valido(v_cpf) then v_cpf end)
      on conflict (user_id) do update
        set whatsapp = coalesce(excluded.whatsapp, public.student_activity.whatsapp),
            cpf      = coalesce(public.student_activity.cpf, excluded.cpf);
    exception when unique_violation then
      -- CPF já usado por outra conta: cria sem CPF; as boas-vindas pedem de novo.
      insert into public.student_activity (user_id, whatsapp)
      values (new.id, nullif(v_phone, ''))
      on conflict (user_id) do update
        set whatsapp = coalesce(excluded.whatsapp, public.student_activity.whatsapp);
    end;
    update auth.users
       set raw_user_meta_data = raw_user_meta_data - 'cpf' - 'whatsapp'
     where id = new.id;
  end if;
  return new;
end;
$$;

create or replace function public.save_billing_contact(p_whatsapp text, p_cpf text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid     uuid := auth.uid();
  v_cpf   text := regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g');
  v_phone text := left(trim(coalesce(p_whatsapp, '')), 30);
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;
  if length(regexp_replace(v_phone, '\D', '', 'g')) < 10 then
    raise exception 'telefone_invalido';
  end if;
  if not public.cpf_valido(v_cpf) then
    raise exception 'cpf_invalido';
  end if;
  if exists (select 1 from public.student_activity where cpf = v_cpf and user_id <> uid) then
    raise exception 'cpf_em_uso';
  end if;
  insert into public.student_activity (user_id, whatsapp, cpf)
  values (uid, v_phone, v_cpf)
  on conflict (user_id) do update
    set whatsapp = excluded.whatsapp,
        cpf      = coalesce(public.student_activity.cpf, excluded.cpf);
end;
$$;

revoke all on function public.save_billing_contact(text, text) from public, anon;
grant execute on function public.save_billing_contact(text, text) to authenticated;
