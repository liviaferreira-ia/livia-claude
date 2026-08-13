import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import { recordAudit } from "@/lib/operational-server";

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

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { name },
    // Vai direto pra /definir-senha (página client-side): o link de convite do
    // Supabase entrega a sessão via #access_token na URL, que só o navegador lê
    // — uma rota de servidor nunca chega a ver esse pedaço da URL.
    redirectTo: `${SITE_URL}/definir-senha`,
  });

  if (error) {
    // Ferramenta só de professor — é seguro mostrar o motivo real do Supabase,
    // ajuda a diagnosticar sem precisar olhar log de servidor.
    const msg = error.message.toLowerCase().includes("already registered")
      ? "Este e-mail já tem conta."
      : `Não consegui enviar o convite: ${error.message}`;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Sem isso o aluno convidado fica invisível no painel até o primeiro login.
  if (data.user) {
    await admin
      .from("student_activity")
      .upsert({ user_id: data.user.id, role: "student", student_name: name }, { onConflict: "user_id" });
    await recordAudit(user.id, data.user.id, "student_invited", { email });
  }

  return NextResponse.json({ ok: true });
}
