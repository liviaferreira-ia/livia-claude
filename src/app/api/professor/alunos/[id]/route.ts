import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import { recordAudit, recordIncident } from "@/lib/operational-server";

const LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function teacherSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "teacher") {
    return { error: NextResponse.json({ error: "Só professores podem administrar alunos." }, { status: 403 }) };
  }
  return { user, supabase };
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await teacherSession();
  if (session.error) return session.error;
  const { id } = await context.params;
  const admin = createAdminClient();

  const [authResult, activity, settings, notes, assignments, events, courseProgress, payments, messages, incidents, audits] = await Promise.all([
    admin.auth.admin.getUserById(id),
    admin.from("student_activity").select("*").eq("user_id", id).maybeSingle(),
    admin.from("student_settings").select("*").eq("student_id", id).maybeSingle(),
    admin.from("teacher_notes").select("*").eq("student_id", id).order("created_at", { ascending: false }),
    admin.from("student_assignments").select("*").eq("student_id", id).order("created_at", { ascending: false }),
    admin.from("student_events").select("*").eq("student_id", id).order("created_at", { ascending: false }).limit(100),
    admin.from("student_course_progress").select("*").eq("student_id", id).order("completed_at", { ascending: false }),
    admin.from("student_payments").select("*").eq("user_id", id).order("due_date", { ascending: false, nullsFirst: false }),
    admin.from("messages").select("*").eq("user_id", id).order("created_at", { ascending: true }),
    admin.from("app_incidents").select("*").eq("user_id", id).order("last_seen_at", { ascending: false }).limit(100),
    admin.from("admin_audit_logs").select("*").eq("student_id", id).order("created_at", { ascending: false }).limit(100),
  ]);

  if (authResult.error || !authResult.data.user) {
    return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
  }
  const firstError = [activity.error, settings.error, notes.error, assignments.error, events.error, courseProgress.error, payments.error, messages.error, incidents.error, audits.error].find(Boolean);
  if (firstError) {
    const trace = await recordIncident({ userId: id, source: "server", area: "professor/aluno", action: "load_detail", message: firstError.message });
    return NextResponse.json({ error: `Não foi possível carregar o aluno. Código: ${trace}` }, { status: 500 });
  }

  return NextResponse.json({
    email: authResult.data.user.email ?? "",
    auth: {
      emailConfirmedAt: authResult.data.user.email_confirmed_at ?? null,
      invitedAt: authResult.data.user.invited_at ?? null,
      lastSignInAt: authResult.data.user.last_sign_in_at ?? null,
    },
    activity: activity.data,
    settings: settings.data,
    notes: notes.data ?? [],
    assignments: assignments.data ?? [],
    events: events.data ?? [],
    courseProgress: courseProgress.data ?? [],
    payments: payments.data ?? [],
    messages: messages.data ?? [],
    incidents: incidents.data ?? [],
    audits: audits.data ?? [],
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await teacherSession();
  if (session.error) return session.error;
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const level = typeof body.level === "string" && LEVELS.has(body.level) ? body.level : "";
  const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim().slice(0, 30) : "";
  const birthdate = /^\d{4}-\d{2}-\d{2}$/.test(body.birthdate ?? "") ? body.birthdate : null;
  const focus = typeof body.focus === "string" ? body.focus.trim().slice(0, 500) : "";
  const weeklyGoal = Math.max(1, Math.min(7, Number(body.weekly_goal) || 3));
  const accessExpires = /^\d{4}-\d{2}-\d{2}$/.test(body.access_expires_on ?? "") ? body.access_expires_on : null;
  if (!name || !level || !EMAIL.test(email)) return NextResponse.json({ error: "Informe nome, e-mail e nível válidos." }, { status: 400 });

  const admin = createAdminClient();
  const { data: existing, error: userError } = await admin.auth.admin.getUserById(id);
  if (userError || !existing.user) return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
  const currentEmail = existing.user.email?.toLowerCase() ?? "";
  const emailChanged = email !== currentEmail;
  if (emailChanged && existing.user.email_confirmed_at) {
    return NextResponse.json({ error: "Por segurança, o e-mail de uma conta já ativada não pode ser alterado por esta tela." }, { status: 409 });
  }
  if (emailChanged) {
    const { data: usersPage, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 });
    if (usersPage.users.some((item) => item.id !== id && item.email?.toLowerCase() === email)) {
      return NextResponse.json({ error: "Este e-mail já está vinculado a outra conta." }, { status: 409 });
    }
  }
  const metadata = { ...existing.user.user_metadata, name, level };
  const authValues = emailChanged ? { user_metadata: metadata, email } : { user_metadata: metadata };

  const [authUpdate, activityUpdate, settingsUpdate] = await Promise.all([
    admin.auth.admin.updateUserById(id, authValues),
    admin.from("student_activity").update({ student_name: name, level, whatsapp: whatsapp || null, birthdate, updated_at: new Date().toISOString() }).eq("user_id", id),
    admin.from("student_settings").upsert({ student_id: id, focus: focus || null, weekly_goal: weeklyGoal, access_expires_on: accessExpires, updated_at: new Date().toISOString() }, { onConflict: "student_id" }),
  ]);
  const error = authUpdate.error || activityUpdate.error || settingsUpdate.error;
  if (error) {
    const trace = await recordIncident({ userId: id, source: "server", area: "professor/aluno", action: "update_student", message: error.message });
    return NextResponse.json({ error: `Não foi possível salvar. Código: ${trace}` }, { status: 500 });
  }
  await recordAudit(session.user!.id, id, "student_updated", { fields: ["name", "email", "level", "whatsapp", "birthdate", "focus", "weekly_goal", "access_expires_on"], email_changed: emailChanged });
  return NextResponse.json({ ok: true, email_changed: emailChanged });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await teacherSession();
  if (session.error) return session.error;
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const action = body?.action;
  const admin = createAdminClient();

  if (action === "reset_password") {
    const { data, error } = await admin.auth.admin.getUserById(id);
    if (error || !data.user?.email) return NextResponse.json({ error: "E-mail do aluno não encontrado." }, { status: 404 });
    const email = data.user.email;
    const redirectTo = `${SITE_URL}/definir-senha`;

    // Convite ainda não aceito (aluno nunca logou): reenviar precisa gerar um
    // link tipo "invite" de novo, não "recovery" — resetPasswordForEmail é
    // pra quem já tem senha, e o link antigo do primeiro convite continua
    // "vivo" até alguém gerar um novo, então reenviar sem invalidar o de
    // antes deixa dois links circulando (fácil o aluno clicar no errado).
    // generateLink({ type: "invite" }) sempre funciona mesmo pro mesmo
    // e-mail de novo e substitui o token anterior por um novo, já expirado
    // ou não — por isso devolvemos o link fresco pro professor copiar e
    // mandar direto (mesmo padrão do convite inicial em convidar-aluno).
    if (!data.user.last_sign_in_at) {
      const name = typeof data.user.user_metadata?.name === "string" ? data.user.user_metadata.name : undefined;
      // Best-effort: tenta mandar e-mail de novo. Se o Supabase recusar por o
      // usuário já existir (esperado num reenvio), seguimos pro generateLink
      // abaixo, que sempre devolve um link válido independente disso.
      await admin.auth.admin.inviteUserByEmail(email, { data: { name }, redirectTo });
      const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
        type: "invite",
        email,
        options: { data: { name }, redirectTo },
      });
      if (linkError) return NextResponse.json({ error: linkError.message }, { status: 500 });
      // Mesmo cuidado do convite inicial (convidar-aluno/route.ts): nunca
      // expor o action_link cru do Supabase, que confirma sozinho no
      // primeiro GET e pode ser queimado por prévia automática antes do
      // aluno clicar de verdade. Montamos o link seguro com hashed_token.
      const hashedToken = linkData.properties?.hashed_token;
      const inviteLink = hashedToken ? `${redirectTo}?token_hash=${hashedToken}&type=invite` : null;
      await recordAudit(session.user!.id, id, "invite_resent");
      return NextResponse.json({ ok: true, inviteLink });
    }

    const { error: resetError } = await session.supabase!.auth.resetPasswordForEmail(email, { redirectTo });
    if (resetError) return NextResponse.json({ error: resetError.message }, { status: 500 });
    await recordAudit(session.user!.id, id, "password_reset_sent");
    return NextResponse.json({ ok: true });
  }

  if (action === "add_note") {
    const text = typeof body.body === "string" ? body.body.trim().slice(0, 4000) : "";
    if (!text) return NextResponse.json({ error: "Escreva a anotação." }, { status: 400 });
    const { error } = await admin.from("teacher_notes").insert({ student_id: id, teacher_id: session.user!.id, body: text });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await recordAudit(session.user!.id, id, "note_added");
    return NextResponse.json({ ok: true });
  }

  if (action === "delete_note") {
    const noteId = typeof body.note_id === "string" ? body.note_id : "";
    const { error } = await admin.from("teacher_notes").delete().eq("id", noteId).eq("student_id", id).eq("teacher_id", session.user!.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await recordAudit(session.user!.id, id, "note_deleted", { note_id: noteId });
    return NextResponse.json({ ok: true });
  }

  if (action === "add_assignment") {
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
    const details = typeof body.details === "string" ? body.details.trim().slice(0, 2000) : "";
    const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(body.due_date ?? "") ? body.due_date : null;
    if (!title) return NextResponse.json({ error: "Informe o título da atividade." }, { status: 400 });
    const { error } = await admin.from("student_assignments").insert({ student_id: id, teacher_id: session.user!.id, title, details: details || null, due_date: dueDate });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await recordAudit(session.user!.id, id, "assignment_added", { title, due_date: dueDate });
    return NextResponse.json({ ok: true });
  }

  if (action === "assignment_status") {
    const assignmentId = typeof body.assignment_id === "string" ? body.assignment_id : "";
    const status = body.status === "done" || body.status === "cancelled" || body.status === "assigned" ? body.status : null;
    if (!assignmentId || !status) return NextResponse.json({ error: "Atividade inválida." }, { status: 400 });
    const { error } = await admin.from("student_assignments").update({ status, updated_at: new Date().toISOString() }).eq("id", assignmentId).eq("student_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await recordAudit(session.user!.id, id, "assignment_status_changed", { assignment_id: assignmentId, status });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}
