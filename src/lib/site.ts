// URL pública fixa do site. Não usar `new URL(request.url).origin` pra montar
// links de redirect: o servidor roda atrás do LiteSpeed, que termina o HTTPS e
// repassa pro Node por dentro em HTTP puro — o app nunca vê o "https://" real,
// então qualquer origin calculado a partir do request vem errado (http:// em vez
// de https://) e o Supabase rejeita o redirect por não bater com a allow list.
export const SITE_URL = "https://centralschool.com.br";
