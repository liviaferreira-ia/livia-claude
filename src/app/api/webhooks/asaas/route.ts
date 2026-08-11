import { NextResponse } from "next/server";
import { getAsaasCustomer } from "@/lib/asaas";
import { createAdminClient } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof createAdminClient>;

const PAID_EVENTS = new Set(["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"]);
const OVERDUE_EVENTS = new Set(["PAYMENT_OVERDUE"]);

/** Recebe eventos de pagamento do Asaas: libera acesso quando paga, marca atraso quando vence. */
export async function POST(request: Request) {
  const token = request.headers.get("asaas-access-token");
  if (!process.env.ASAAS_WEBHOOK_TOKEN || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const event = body?.event as string | undefined;
  const customerId = body?.payment?.customer as string | undefined;
  if (!event || !customerId) {
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();
  const { origin } = new URL(request.url);

  try {
    if (PAID_EVENTS.has(event)) {
      await handlePaid(admin, customerId, origin);
    } else if (OVERDUE_EVENTS.has(event)) {
      await handleOverdue(admin, customerId);
    }
  } catch (err) {
    console.error("Erro processando webhook do Asaas:", err);
    // Sempre 200 pro Asaas não ficar re-tentando um evento que já sabemos que vai falhar de novo.
  }

  return NextResponse.json({ ok: true });
}

async function handlePaid(admin: Admin, customerId: string, origin: string) {
  const { data: existing } = await admin
    .from("student_activity")
    .select("user_id")
    .eq("asaas_customer_id", customerId)
    .maybeSingle();

  // Cliente já vinculado a um aluno (mensalidade recorrente) — só reativa.
  if (existing) {
    await admin
      .from("student_activity")
      .update({ payment_status: "ok", overdue_since: null, blocked: false, updated_at: new Date().toISOString() })
      .eq("user_id", existing.user_id);
    return;
  }

  // Primeiro pagamento desse cliente Asaas: precisa achar (ou criar) a conta do aluno.
  const customer = await getAsaasCustomer(customerId);
  if (!customer.email) return;
  const email = customer.email.trim().toLowerCase();

  const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { name: customer.name },
    redirectTo: `${origin}/definir-senha`,
  });

  let userId = invited?.user?.id;
  if (error) {
    if (!error.message.toLowerCase().includes("already registered")) return;
    // E-mail já tinha conta (ex.: professor cadastrou manualmente antes) — só falta linkar o cliente Asaas.
    const { data: usersPage } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    userId = usersPage.users.find((u) => u.email?.toLowerCase() === email)?.id;
    if (!userId) return;
  }

  await admin.from("student_activity").upsert(
    {
      user_id: userId,
      role: "student",
      student_name: customer.name,
      asaas_customer_id: customerId,
      payment_status: "ok",
      overdue_since: null,
      blocked: false,
    },
    { onConflict: "user_id" },
  );
}

async function handleOverdue(admin: Admin, customerId: string) {
  const { data: existing } = await admin
    .from("student_activity")
    .select("user_id, payment_status")
    .eq("asaas_customer_id", customerId)
    .maybeSingle();
  // Sem aluno vinculado ainda, ou já contando o atraso — não reseta o prazo dos 5 dias.
  if (!existing || existing.payment_status === "overdue") return;

  await admin
    .from("student_activity")
    .update({
      payment_status: "overdue",
      overdue_since: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", existing.user_id);
}
