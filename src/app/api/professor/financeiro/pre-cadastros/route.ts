import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { linkCustomerPayments, refreshStudentPaymentStatus } from "@/lib/payments-server";
import { recordAudit } from "@/lib/operational-server";
import { SITE_URL } from "@/lib/site";
import { requireStaff as teacherSession } from "@/lib/staff-server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const session = await teacherSession();
  if (session.error) return session.error;
  const body = await request.json().catch(() => null);
  const action = body?.action;
  const candidateId = typeof body?.candidate_id === "string" ? body.candidate_id : "";
  if (!candidateId) return NextResponse.json({ error: "Pré-cadastro inválido." }, { status: 400 });

  const admin = createAdminClient();
  const { data: candidate, error: candidateError } = await admin
    .from("payment_candidates")
    .select("*")
    .eq("id", candidateId)
    .eq("status", "pending")
    .maybeSingle();
  if (candidateError) return NextResponse.json({ error: candidateError.message }, { status: 500 });
  if (!candidate) return NextResponse.json({ error: "Este pré-cadastro já foi resolvido ou não existe." }, { status: 404 });

  if (action === "ignore") {
    const { error } = await admin.from("payment_candidates").update({ status: "ignored", updated_at: new Date().toISOString() }).eq("id", candidateId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await recordAudit(session.user!.id, null, "payment_candidate_ignored", { asaas_customer_id: candidate.asaas_customer_id });
    return NextResponse.json({ ok: true });
  }

  if (action === "link") {
    const studentId = typeof body?.student_id === "string" ? body.student_id : "";
    const { data: student, error: studentError } = await admin.from("student_activity").select("user_id,asaas_customer_id").eq("user_id", studentId).eq("role", "student").maybeSingle();
    if (studentError || !student) return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
    if (student.asaas_customer_id && student.asaas_customer_id !== candidate.asaas_customer_id) {
      return NextResponse.json({ error: "Este aluno já está vinculado a outro cliente do Asaas." }, { status: 409 });
    }
    const { data: used } = await admin.from("student_activity").select("user_id").eq("asaas_customer_id", candidate.asaas_customer_id).neq("user_id", studentId).maybeSingle();
    if (used) return NextResponse.json({ error: "Este cliente do Asaas já está vinculado a outro aluno." }, { status: 409 });

    const { error: updateError } = await admin.from("student_activity").update({ asaas_customer_id: candidate.asaas_customer_id, updated_at: new Date().toISOString() }).eq("user_id", studentId);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    await linkCustomerPayments(admin, candidate.asaas_customer_id, studentId);
    await refreshStudentPaymentStatus(admin, studentId);
    const { error: candidateUpdateError } = await admin.from("payment_candidates").update({ status: "linked", linked_user_id: studentId, updated_at: new Date().toISOString() }).eq("id", candidateId);
    if (candidateUpdateError) return NextResponse.json({ error: candidateUpdateError.message }, { status: 500 });
    await recordAudit(session.user!.id, studentId, "payment_candidate_linked", { asaas_customer_id: candidate.asaas_customer_id });
    return NextResponse.json({ ok: true, user_id: studentId });
  }

  if (action === "approve") {
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!name || !EMAIL.test(email)) return NextResponse.json({ error: "Informe nome e e-mail válidos para o aluno." }, { status: 400 });

    const { data: usersPage, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 });
    if (usersPage.users.some((item) => item.email?.toLowerCase() === email)) {
      return NextResponse.json({ error: "Este e-mail já possui conta. Use a opção de vincular a um aluno existente." }, { status: 409 });
    }

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { name },
      redirectTo: `${SITE_URL}/definir-senha`,
    });
    if (inviteError || !invited.user) return NextResponse.json({ error: inviteError?.message || "Não foi possível criar a conta." }, { status: 400 });

    const userId = invited.user.id;
    const { error: activityError } = await admin.from("student_activity").upsert({
      user_id: userId,
      role: "student",
      student_name: name,
      asaas_customer_id: candidate.asaas_customer_id,
      payment_status: "ok",
      overdue_since: null,
      blocked: false,
      invite_status: "pending",
      invite_last_sent_at: new Date().toISOString(),
      invite_error: null,
    }, { onConflict: "user_id" });
    if (activityError) {
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: activityError.message }, { status: 500 });
    }
    await linkCustomerPayments(admin, candidate.asaas_customer_id, userId);
    await refreshStudentPaymentStatus(admin, userId);
    const { error: candidateUpdateError } = await admin.from("payment_candidates").update({ status: "approved", linked_user_id: userId, updated_at: new Date().toISOString() }).eq("id", candidateId);
    if (candidateUpdateError) return NextResponse.json({ error: candidateUpdateError.message }, { status: 500 });
    await recordAudit(session.user!.id, userId, "payment_candidate_approved", { asaas_customer_id: candidate.asaas_customer_id });
    return NextResponse.json({ ok: true, user_id: userId });
  }

  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}
