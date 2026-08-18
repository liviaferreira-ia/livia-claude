import "server-only";

import { getAsaasCustomer, type AsaasPayment } from "@/lib/asaas";
import { createAdminClient } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof createAdminClient>;

const PAID_EVENTS = new Set(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH", "DUNNING_RECEIVED"]);

function nullable(value: string | null | undefined): string | null {
  return value || null;
}

/** Persiste a versão mais recente de uma cobrança recebida do Asaas. */
export async function upsertAsaasPayment(
  admin: Admin,
  payment: AsaasPayment,
  event: string,
  knownUserId?: string,
): Promise<string | undefined> {
  let userId = knownUserId;
  if (!userId) {
    const { data: student } = await admin
      .from("student_activity")
      .select("user_id")
      .eq("asaas_customer_id", payment.customer)
      .maybeSingle();
    userId = student?.user_id;
  }

  const row: Record<string, unknown> = {
    id: payment.id,
    asaas_customer_id: payment.customer,
    subscription_id: nullable(payment.subscription),
    status: payment.status,
    billing_type: nullable(payment.billingType),
    value: payment.value ?? 0,
    net_value: payment.netValue ?? null,
    due_date: nullable(payment.dueDate),
    payment_date: nullable(payment.paymentDate),
    confirmed_date: nullable(payment.confirmedDate),
    invoice_url: nullable(payment.invoiceUrl),
    bank_slip_url: nullable(payment.bankSlipUrl),
    description: nullable(payment.description),
    last_event: event,
    updated_at: new Date().toISOString(),
  };
  if (userId) row.user_id = userId;

  const { error } = await admin.from("student_payments").upsert(row, { onConflict: "id" });
  if (error) throw new Error(`Não foi possível salvar a cobrança ${payment.id}: ${error.message}`);
  return userId;
}

/** Liga cobranças antigas ao aluno assim que o customer do Asaas é reconhecido. */
export async function linkCustomerPayments(admin: Admin, customerId: string, userId: string): Promise<void> {
  const { error } = await admin
    .from("student_payments")
    .update({ user_id: userId, updated_at: new Date().toISOString() })
    .eq("asaas_customer_id", customerId);
  if (error) throw new Error(`Não foi possível vincular as cobranças: ${error.message}`);
}

/** Cria/atualiza uma pendência de conciliação sem abrir conta nem enviar convite. */
export async function upsertPaymentCandidate(
  admin: Admin,
  customerId: string,
): Promise<void> {
  const { data: existing, error: existingError } = await admin
    .from("payment_candidates")
    .select("status")
    .eq("asaas_customer_id", customerId)
    .maybeSingle();
  if (existingError) throw new Error(`Não foi possível consultar o pré-cadastro: ${existingError.message}`);
  if (existing && existing.status !== "pending") return;

  const customer = await getAsaasCustomer(customerId);
  const { error } = await admin.from("payment_candidates").upsert({
    asaas_customer_id: customerId,
    payer_name: customer.name || "Cliente Asaas",
    payer_email: customer.email?.trim().toLowerCase() || null,
    payer_phone: customer.mobilePhone || null,
    status: "pending",
    updated_at: new Date().toISOString(),
  }, { onConflict: "asaas_customer_id" });
  if (error) throw new Error(`Não foi possível criar o pré-cadastro: ${error.message}`);
}

export function isPaidPayment(payment: AsaasPayment): boolean {
  return PAID_EVENTS.has(payment.status);
}

/**
 * Recalcula o resumo usado pelo middleware a partir das cobranças persistidas.
 *
 * Respeita `manual_block`: se o professor pausou o aluno na mão, achar a conta
 * em dia aqui não reativa sozinho -- só o professor reativa (/professor/alunos).
 * Sem isso, uma cobrança avulsa reabriria o acesso de quem trancou o curso.
 */
export async function refreshStudentPaymentStatus(admin: Admin, userId: string): Promise<void> {
  const { data: overdue, error: overdueError } = await admin
    .from("student_payments")
    .select("due_date")
    .eq("user_id", userId)
    .eq("status", "OVERDUE")
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (overdueError) throw new Error(`Não foi possível recalcular o financeiro: ${overdueError.message}`);

  const { data: activity } = await admin
    .from("student_activity")
    .select("payment_status, overdue_since, manual_block")
    .eq("user_id", userId)
    .maybeSingle();

  const now = new Date().toISOString();
  if (overdue) {
    const overdueSince =
      activity?.payment_status === "overdue" && activity.overdue_since
        ? activity.overdue_since
        : overdue.due_date
          ? `${overdue.due_date}T12:00:00.000Z`
          : now;
    const { error } = await admin
      .from("student_activity")
      .update({ payment_status: "overdue", overdue_since: overdueSince, updated_at: now })
      .eq("user_id", userId);
    if (error) throw new Error(`Não foi possível marcar o atraso: ${error.message}`);
    return;
  }

  const { error } = await admin
    .from("student_activity")
    .update({ payment_status: "ok", overdue_since: null, blocked: Boolean(activity?.manual_block), updated_at: now })
    .eq("user_id", userId);
  if (error) throw new Error(`Não foi possível liberar o acesso: ${error.message}`);
}
