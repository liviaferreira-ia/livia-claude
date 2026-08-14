import { NextResponse } from "next/server";
import { listAsaasPayments, listPaidAsaasPayments } from "@/lib/asaas";
import { linkCustomerPayments, refreshStudentPaymentStatus, upsertAsaasPayment } from "@/lib/payments-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ensurePreRegisteredStudentForPaidCustomer } from "@/lib/student-import-server";

/** Importa o histórico do Asaas. Só professores autenticados podem executar. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "teacher") {
    return NextResponse.json({ error: "Só professores podem sincronizar pagamentos." }, { status: 403 });
  }

  const admin = createAdminClient();
  const today = new Date();
  const from = new Date(today);
  from.setUTCDate(from.getUTCDate() - 30);
  const dateOnly = (value: Date) => value.toISOString().slice(0, 10);
  const recent = await listPaidAsaasPayments(dateOnly(from), dateOnly(today));
  const recentCustomers = [...new Set(recent.map((payment) => payment.customer))];
  let created = 0;
  let linked = 0;
  let skipped = 0;

  for (const payment of recent) {
    await upsertAsaasPayment(admin, payment, "INITIAL_PAID_IMPORT");
  }
  for (const customerId of recentCustomers) {
    const result = await ensurePreRegisteredStudentForPaidCustomer(admin, customerId);
    if (!result.userId) {
      skipped += 1;
      continue;
    }
    if (result.created) created += 1;
    else linked += 1;
    await linkCustomerPayments(admin, customerId, result.userId);
    await refreshStudentPaymentStatus(admin, result.userId);
  }

  const { data: students, error } = await admin
    .from("student_activity")
    .select("user_id, asaas_customer_id")
    .eq("role", "student")
    .not("asaas_customer_id", "is", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const paymentIds = new Set(recent.map((payment) => payment.id));
  for (const student of students ?? []) {
    if (!student.asaas_customer_id) continue;
    const payments = await listAsaasPayments(student.asaas_customer_id);
    for (const payment of payments) {
      await upsertAsaasPayment(admin, payment, "MANUAL_SYNC", student.user_id);
      paymentIds.add(payment.id);
    }
    await refreshStudentPaymentStatus(admin, student.user_id);
  }

  return NextResponse.json({
    ok: true,
    students: students?.length ?? 0,
    payments: paymentIds.size,
    created,
    linked,
    skipped,
  });
}
