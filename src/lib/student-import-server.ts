import "server-only";

import { getAsaasCustomer } from "@/lib/asaas";
import { createAdminClient } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof createAdminClient>;

export type PaidStudentImportResult = {
  userId?: string;
  created: boolean;
  reason?: "customer_without_email" | "teacher_email" | "auth_error";
};

async function findUserByEmail(admin: Admin, email: string) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data.users.find((user) => user.email?.toLowerCase() === email);
}

/**
 * Cria o aluno no Auth e no painel, mas não envia e-mail.
 * O acesso é enviado depois, manualmente, pelo painel do professor.
 */
export async function ensurePreRegisteredStudentForPaidCustomer(
  admin: Admin,
  customerId: string,
): Promise<PaidStudentImportResult> {
  const { data: linked } = await admin
    .from("student_activity")
    .select("user_id")
    .eq("asaas_customer_id", customerId)
    .maybeSingle();
  if (linked) return { userId: linked.user_id, created: false };

  const customer = await getAsaasCustomer(customerId);
  if (!customer.email?.trim()) return { created: false, reason: "customer_without_email" };
  const email = customer.email.trim().toLowerCase();

  let authUser = await findUserByEmail(admin, email);
  let created = false;
  if (!authUser) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: { name: customer.name, source: "asaas_paid_import" },
    });
    if (error || !data.user) return { created: false, reason: "auth_error" };
    authUser = data.user;
    created = true;
  }

  const { data: profile } = await admin.from("profiles").select("role").eq("id", authUser.id).maybeSingle();
  if (profile?.role === "teacher") return { created: false, reason: "teacher_email" };

  const { data: current } = await admin
    .from("student_activity")
    .select("student_name, whatsapp")
    .eq("user_id", authUser.id)
    .maybeSingle();
  const { error } = await admin.from("student_activity").upsert(
    {
      user_id: authUser.id,
      role: "student",
      student_name: current?.student_name || customer.name,
      whatsapp: current?.whatsapp || customer.mobilePhone || null,
      asaas_customer_id: customerId,
      payment_status: "ok",
      overdue_since: null,
      blocked: false,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(`Não foi possível pré-cadastrar ${customer.name}: ${error.message}`);

  return { userId: authUser.id, created };
}
