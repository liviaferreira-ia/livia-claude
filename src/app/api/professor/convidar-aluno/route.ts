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
  const redirectTo = `${SITE_URL}/definir-senha`;

  // Continua mandando o e-mail de convite como sempre (via inviteUserByEmail
  // — cria o usuário e usa o SMTP configurado no Supabase, seja o padrão do
  // Supabase ou um customizado no futuro). Isso não muda.
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { name },
    // Vai direto pra /definir-senha (página client-side): o link de convite do
    // Supabase entrega a sessão via #access_token na URL, que só o navegador lê
    // — uma rota de servidor nunca chega a ver esse pedaço da URL.
    redirectTo,
  });

  if (error) {
    // Ferramenta só de professor — é seguro mostrar o motivo real do Supabase,
    // ajuda a diagnosticar sem precisar olhar log de servidor.
    const duplicate = /already registered|already exists|email.*exists|email_exists|user.*registered/.test(error.message.toLowerCase());
    const msg = duplicate
      ? "Este e-mail já está em uso. Procure o aluno na lista ou envie uma redefinição de senha pela página dele."
      : `Não consegui enviar o convite: ${error.message}`;
    return NextResponse.json({ error: msg }, { status: duplicate ? 409 : 400 });
  }

  // Sem isso o aluno convidado fica invisível no painel até o primeiro login.
  if (data.user) {
    await admin
      .from("student_activity")
      .upsert({ user_id: data.user.id, role: "student", student_name: name }, { onConflict: "user_id" });
    await recordAudit(user.id, data.user.id, "student_invited", { email });
  }

  // Além do e-mail (que vem caindo em spam com frequência e travando o
  // cadastro), pega o link do convite pra mostrar na tela — professor pode
  // copiar e mandar manualmente por WhatsApp etc. mesmo que o e-mail não
  // chegue. generateLink() nunca manda e-mail sozinho, só devolve o link;
  // como o usuário já foi criado pelo inviteUserByEmail acima (ainda sem
  // confirmar), essa segunda chamada gera um link válido pro mesmo convite
  // sem duplicar o cadastro. Best-effort: se falhar, o convite em si já foi
  // criado e o e-mail já foi tentado — só não mostra o link de reserva.
  let inviteLink: string | null = null;
  try {
    const { data: linkData } = await admin.auth.admin.generateLink({
      type: "invite",
      email,
      options: { data: { name }, redirectTo },
    });
    inviteLink = linkData.properties?.action_link ?? null;
  } catch {
    inviteLink = null;
  }

  return NextResponse.json({ ok: true, inviteLink });
}
