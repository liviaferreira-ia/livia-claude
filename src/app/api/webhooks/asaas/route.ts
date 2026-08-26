import { NextResponse } from "next/server";
import type { AsaasPayment } from "@/lib/asaas";
import { linkCustomerPayments, refreshStudentPaymentStatus, upsertAsaasPayment, upsertPaymentCandidate } from "@/lib/payments-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordIncident } from "@/lib/operational-server";
import { secureCompare } from "@/lib/secure-compare";

type Admin = ReturnType<typeof createAdminClient>;
type AsaasCheckoutEvent = {
  id: string;
  status?: string;
  customer?: string | null;
  externalReference?: string | null;
};

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
  if (!process.env.ASAAS_WEBHOOK_TOKEN || !token || !secureCompare(token, process.env.ASAAS_WEBHOOK_TOKEN)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const event = body?.event as string | undefined;
  const checkout = body?.checkout as AsaasCheckoutEvent | undefined;
  if (event?.startsWith("CHECKOUT_") && checkout?.id) {
    await processCheckoutEvent(event, checkout);
    return NextResponse.json({ ok: true });
  }

  const payment = body?.payment as AsaasPayment | undefined;
  const customerId = payment?.customer;
  if (!event || !payment?.id || !customerId) {
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();
  let userId: string | undefined;

  try {
    userId = trialUserId(payment.externalReference) ?? await upsertAsaasPayment(admin, payment, event);
    if (userId && payment.externalReference) {
      await upsertAsaasPayment(admin, payment, event, userId);
    }
    if (PAID_EVENTS.has(event) && !userId) {
      // Um pagador pode ser pai, mãe ou responsável. Mantém como pré-cadastro
      // até o professor identificar o aluno e aprovar ou vincular a cobrança.
      await upsertPaymentCandidate(admin, customerId);
    }
    if (userId) {
      await linkCustomerPayments(admin, customerId, userId);
      await refreshStudentPaymentStatus(admin, userId);
      if (PAID_EVENTS.has(event)) await convertTrial(admin, userId, customerId);
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
function trialUserId(externalReference: string | null | undefined): string | undefined {
  const match = externalReference?.match(/^central-trial:([0-9a-f-]{36})$/i);
  return match?.[1];
}

async function convertTrial(admin: Admin, userId: string, customerId: string | null | undefined) {
  const now = new Date().toISOString();
  const { error } = await admin.from("student_trials").update({
    status: "converted",
    converted_at: now,
    asaas_customer_id: customerId || null,
    updated_at: now,
  }).eq("student_id", userId).neq("status", "converted");
  if (error) throw new Error(`Não foi possível converter o período gratuito: ${error.message}`);
}

async function processCheckoutEvent(event: string, checkout: AsaasCheckoutEvent) {
  const admin = createAdminClient();
  try {
    const { data: trial } = await admin
      .from("student_trials")
      .select("student_id,status,ends_at")
      .eq("checkout_id", checkout.id)
      .maybeSingle();
    const userId = trial?.student_id ?? trialUserId(checkout.externalReference);
    if (!userId) return;

    const now = new Date().toISOString();
    if (event === "CHECKOUT_PAID") {
      await convertTrial(admin, userId, checkout.customer);
      const { data: activity } = await admin.from("student_activity").select("manual_block").eq("user_id", userId).maybeSingle();
      const { error } = await admin.from("student_activity").update({
        asaas_customer_id: checkout.customer || null,
        payment_status: "ok",
        overdue_since: null,
        blocked: Boolean(activity?.manual_block),
        updated_at: now,
      }).eq("user_id", userId);
      if (error) throw new Error(`Não foi possível liberar o acesso convertido: ${error.message}`);
      return;
    }

    if (event === "CHECKOUT_CANCELED" || event === "CHECKOUT_EXPIRED") {
      const trialEnded = trial?.ends_at ? new Date(trial.ends_at).getTime() <= Date.now() : false;
      await admin.from("student_trials").update({
        status: trialEnded ? "expired" : "active",
        checkout_id: null,
        checkout_url: null,
        checkout_created_at: null,
        updated_at: now,
      }).eq("student_id", userId).neq("status", "converted");
    }
  } catch (error) {
    await recordIncident({
      source: "webhook",
      area: "financeiro/asaas-checkout",
      action: event,
      severity: "critical",
      message: error instanceof Error ? error.message : "Erro processando checkout do Asaas",
      metadata: { checkout_id: checkout.id },
    });
  }
}
