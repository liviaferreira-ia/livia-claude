import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Pausa ou reativa o acesso de um aluno na mão. Só professor(a) pode chamar.
 *
 * O bloqueio manual é diferente do automático por atraso: ele fica marcado em
 * `manual_block`, e o webhook de pagamento não o desfaz sozinho — quem pausou
 * é quem reativa. Isso cobre cancelamento de assinatura, estorno e trancamento,
 * casos em que nunca chega um "vencido" do Asaas.
 */
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
    return NextResponse.json({ error: "Só professores podem alterar o acesso." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId : "";
  const action = body?.action === "pause" ? "pause" : body?.action === "resume" ? "resume" : null;
  if (!userId || !action) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const admin = createAdminClient();
  const patch =
    action === "pause"
      ? { blocked: true, manual_block: true }
      : // Reativar limpa também o atraso, senão o cron bloquearia de novo amanhã.
        { blocked: false, manual_block: false, payment_status: "ok", overdue_since: null };

  const { error } = await admin
    .from("student_activity")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, blocked: action === "pause" });
}
