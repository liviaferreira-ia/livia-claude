import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

/**
 * Recebe o link de convite/confirmação do Supabase (e o retorno do login com Google, via=google),
 * troca o código pela sessão e redireciona.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/aluno";
  const viaGoogle = searchParams.get("via") === "google";

  if (code) {
    const supabase = await createClient();
    let error: unknown = null;
    try {
      ({ error } = await supabase.auth.exchangeCodeForSession(code));
    } catch (err) {
      error = err; // nunca virar erro 500: volta para o login com aviso
    }
    if (error) console.error(JSON.stringify({ event: "auth_confirm_failed", via: viaGoogle ? "google" : "email", message: error instanceof Error ? error.message : String((error as { message?: string })?.message ?? error) }));
    if (!error) {
      // Google: a página /auth/entrar marca a sessão e escolhe o destino (equipe, conta nova ou aluno).
      return NextResponse.redirect(viaGoogle ? `${SITE_URL}/auth/entrar` : `${SITE_URL}${next}`);
    }
  }

  if (viaGoogle) return NextResponse.redirect(`${SITE_URL}/login?error=google`);

  return NextResponse.redirect(`${SITE_URL}/login?error=convite_invalido`);
}
