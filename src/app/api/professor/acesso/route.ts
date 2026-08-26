import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit, recordIncident } from "@/lib/operational-server";
import { requireStaff } from "@/lib/staff-server";

/**
 * Pausa ou reativa o acesso de um aluno na mão. Só professor(a) pode chamar.
 *
 * O bloqueio manual é diferente do automático por atraso: ele fica marcado em
 * `manual_block`, e o webhook de pagamento não o desfaz sozinho — quem pausou
 * é quem reativa. Isso cobre cancelamento de assinatura, estorno e trancamento,
 * casos em que nunca chega um "vencido" do Asaas.
 */
export async function POST(request: Request) {
  const session = await requireStaff();
  if (session.error) return session.error;
  const user = session.user!;

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
    const trace = await recordIncident({ userId, source: "server", area: "professor/acesso", action, message: error.message });
    return NextResponse.json({ error: `Não foi possível alterar o acesso. Código: ${trace}` }, { status: 500 });
  }
  await recordAudit(user.id, userId, action === "pause" ? "access_paused" : "access_resumed");
  return NextResponse.json({ ok: true, blocked: action === "pause" });
}
