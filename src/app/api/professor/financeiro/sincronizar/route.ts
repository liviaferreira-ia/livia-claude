import { NextResponse } from "next/server";
import { listAsaasPayments } from "@/lib/asaas";
import { isPaidPayment, refreshStudentPaymentStatus, upsertAsaasPayment, upsertPaymentCandidate } from "@/lib/payments-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/staff-server";

/** Importa o histórico do Asaas. Só professores/admins autenticados podem executar. */
export async function POST() {
  const session = await requireStaff();
  if (session.error) return session.error;

  const admin = createAdminClient();
  const { data: students, error } = await admin
    .from("student_activity")
    .select("user_id, asaas_customer_id")
    .eq("role", "student")
    .not("asaas_customer_id", "is", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const linkedByCustomer = new Map((students ?? []).flatMap((student) =>
    student.asaas_customer_id ? [[student.asaas_customer_id, student.user_id] as const] : [],
  ));
  const payments = await listAsaasPayments();
  const unmatchedPaidCustomers = new Set<string>();
  const touchedUsers = new Set<string>();

  for (const payment of payments) {
    const userId = linkedByCustomer.get(payment.customer);
    await upsertAsaasPayment(admin, payment, "MANUAL_SYNC", userId);
    if (userId) touchedUsers.add(userId);
    else if (isPaidPayment(payment)) unmatchedPaidCustomers.add(payment.customer);
  }
  for (const customerId of unmatchedPaidCustomers) {
    await upsertPaymentCandidate(admin, customerId);
  }
  for (const userId of touchedUsers) {
    await refreshStudentPaymentStatus(admin, userId);
  }

  return NextResponse.json({
    ok: true,
    students: touchedUsers.size,
    payments: payments.length,
    candidates: unmatchedPaidCustomers.size,
  });
}
