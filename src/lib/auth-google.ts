/**
 * Login com Google (pedido do Fabio em 17/11/2026): vale para alunos que já têm conta
 * (o Supabase liga o Google à conta com o mesmo e-mail) e para novos cadastros, que
 * entram no teste grátis de 7 dias (supabase-setup-26-login-google.sql).
 *
 * Só ligar (true) depois de configurar o provedor Google no Supabase; com false o botão some.
 */
export const GOOGLE_LOGIN_ATIVO = true; // Ligado em 17/11/2026, depois de configurar o Google no Supabase.

/**
 * ID público do cliente OAuth (projeto Google Cloud "Central School"). Não é segredo: aparece no
 * código de qualquer página com login do Google. Usado pelo botão oficial (Google Identity Services),
 * que mostra "centralschool.com.br" na tela do Google em vez do endereço do Supabase.
 */
export const GOOGLE_CLIENT_ID = "370907415358-umfvuubv84ehu9r8irpt8rnhcr36lgle.apps.googleusercontent.com";
