import { NextResponse } from "next/server";
import { listAsaasPayments } from "@/lib/asaas";
import { refreshStudentPaymentStatus, upsertAsaasPayment } from "@/lib/payments-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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
  const { data: students, error } = await admin
    .from("student_activity")
    .select("user_id, asaas_customer_id")
    .eq("role", "student")
    .not("asaas_customer_id", "is", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let imported = 0;
  for (const student of students ?? []) {
    if (!student.asaas_customer_id) continue;
    const payments = await listAsaasPayments(student.asaas_customer_id);
    for (const payment of payments) {
      await upsertAsaasPayment(admin, payment, "MANUAL_SYNC", student.user_id);
      imported += 1;
    }
    await refreshStudentPaymentStatus(admin, student.user_id);
  }

  return NextResponse.json({ ok: true, students: students?.length ?? 0, payments: imported });
}
