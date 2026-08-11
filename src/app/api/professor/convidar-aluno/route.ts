import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Convida um aluno por e-mail. Só funciona pra quem está logado como professor(a). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  }

  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (prof?.role !== "teacher") {
    return NextResponse.json({ error: "Só professores podem convidar alunos." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!name || !email) {
    return NextResponse.json({ error: "Preencha nome e e-mail." }, { status: 400 });
  }

  const { origin } = new URL(request.url);
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { name },
    // Vai direto pra /definir-senha (página client-side): o link de convite do
    // Supabase entrega a sessão via #access_token na URL, que só o navegador lê
    // — uma rota de servidor nunca chega a ver esse pedaço da URL.
    redirectTo: `${origin}/definir-senha`,
  });

  if (error) {
    const msg = error.message.toLowerCase().includes("already registered")
      ? "Este e-mail já tem conta."
      : "Não consegui enviar o convite. Tente de novo.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
