-- ============================================================
-- Central School — parte 4: WhatsApp e data de nascimento do aluno
-- Cole TUDO no Supabase → SQL Editor → New query → Run.
-- Seguro para rodar mais de uma vez.
-- ============================================================

alter table public.student_activity add column if not exists whatsapp text;
alter table public.student_activity add column if not exists birthdate date;

-- Chamada quando o aluno salva WhatsApp/data de nascimento em "Minha conta".
create or replace function public.update_contact_info(p_whatsapp text, p_birthdate date)
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

  insert into public.student_activity (user_id, whatsapp, birthdate)
  values (uid, nullif(trim(p_whatsapp), ''), p_birthdate)
  on conflict (user_id) do update
    set whatsapp   = nullif(trim(p_whatsapp), ''),
        birthdate  = p_birthdate,
        updated_at = now();
end;
$$;

grant execute on function public.update_contact_info(text, date) to authenticated;

-- Pronto! ✅
