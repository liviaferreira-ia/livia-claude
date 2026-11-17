/**
 * Login com Google (pedido do Fabio em 17/11/2026): vale para alunos que já têm conta
 * (o Supabase liga o Google à conta com o mesmo e-mail) e para novos cadastros, que
 * entram no teste grátis de 7 dias (supabase-setup-26-login-google.sql).
 *
 * Só ligar (true) depois de configurar o provedor Google no Supabase; com false o botão some.
 */
export const GOOGLE_LOGIN_ATIVO = true; // Ligado em 17/11/2026, depois de configurar o Google no Supabase.
