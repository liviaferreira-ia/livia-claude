import { NextResponse } from "next/server";
import type { AsaasPayment } from "@/lib/asaas";
import { linkCustomerPayments, refreshStudentPaymentStatus, upsertAsaasPayment } from "@/lib/payments-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordIncident } from "@/lib/operational-server";
import { ensurePreRegisteredStudentForPaidCustomer } from "@/lib/student-import-server";

const PAID_EVENTS = new Set(["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"]);

/**
 * Recebe eventos de pagamento do Asaas: grava a cobrança no histórico
 * financeiro e recalcula liberar/bloquear acesso a partir dela.
 *
 * `refreshStudentPaymentStatus` (em payments-server.ts) respeita
 * `manual_block` -- um aluno pausado pelo professor não é reaberto sozinho
 * por um evento de pagamento, só o professor reativa (/professor/alunos).
 */
export async function POST(request: Request) {
  const token = request.headers.get("asaas-access-token");
  if (!process.env.ASAAS_WEBHOOK_TOKEN || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const event = body?.event as string | undefined;
  const payment = body?.payment as AsaasPayment | undefined;
  const customerId = payment?.customer;
  if (!event || !payment?.id || !customerId) {
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();
  let userId: string | undefined;

  try {
    userId = await upsertAsaasPayment(admin, payment, event);
    if (PAID_EVENTS.has(event) && !userId) {
      userId = (await ensurePreRegisteredStudentForPaidCustomer(admin, customerId)).userId;
    }
    if (userId) {
      await linkCustomerPayments(admin, customerId, userId);
      await refreshStudentPaymentStatus(admin, userId);
    }
  } catch (err) {
    await recordIncident({
      userId,
      source: "webhook",
      area: "financeiro/asaas",
      action: event,
      severity: "critical",
      message: err instanceof Error ? err.message : "Erro processando webhook do Asaas",
      metadata: { payment_id: payment.id, customer_id: customerId },
    });
    // Sempre 200 pro Asaas não ficar re-tentando um evento que já sabemos que vai falhar de novo.
  }

  return NextResponse.json({ ok: true });
}
