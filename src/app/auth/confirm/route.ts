import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Recebe o link de convite/confirmação do Supabase, troca o código pela sessão e redireciona. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/aluno";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=convite_invalido`);
}
