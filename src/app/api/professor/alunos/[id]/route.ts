import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

const LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

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

  const [authResult, activity, settings, notes, assignments, events, payments, messages] = await Promise.all([
    admin.auth.admin.getUserById(id),
    admin.from("student_activity").select("*").eq("user_id", id).maybeSingle(),
    admin.from("student_settings").select("*").eq("student_id", id).maybeSingle(),
    admin.from("teacher_notes").select("*").eq("student_id", id).order("created_at", { ascending: false }),
    admin.from("student_assignments").select("*").eq("student_id", id).order("created_at", { ascending: false }),
    admin.from("student_events").select("*").eq("student_id", id).order("created_at", { ascending: false }).limit(100),
    admin.from("student_payments").select("*").eq("user_id", id).order("due_date", { ascending: false, nullsFirst: false }),
    admin.from("messages").select("*").eq("user_id", id).order("created_at", { ascending: true }),
  ]);

  if (authResult.error || !authResult.data.user) {
    return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
  }
  const firstError = [activity.error, settings.error, notes.error, assignments.error, events.error, payments.error, messages.error].find(Boolean);
  if (firstError) return NextResponse.json({ error: firstError.message }, { status: 500 });

  return NextResponse.json({
    email: authResult.data.user.email ?? "",
    activity: activity.data,
    settings: settings.data,
    notes: notes.data ?? [],
    assignments: assignments.data ?? [],
    events: events.data ?? [],
    payments: payments.data ?? [],
    messages: messages.data ?? [],
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await teacherSession();
  if (session.error) return session.error;
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const level = typeof body.level === "string" && LEVELS.has(body.level) ? body.level : "";
  const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim().slice(0, 30) : "";
  const birthdate = /^\d{4}-\d{2}-\d{2}$/.test(body.birthdate ?? "") ? body.birthdate : null;
  const focus = typeof body.focus === "string" ? body.focus.trim().slice(0, 500) : "";
  const weeklyGoal = Math.max(1, Math.min(7, Number(body.weekly_goal) || 3));
  const accessExpires = /^\d{4}-\d{2}-\d{2}$/.test(body.access_expires_on ?? "") ? body.access_expires_on : null;
  if (!name || !level) return NextResponse.json({ error: "Informe nome e nível válidos." }, { status: 400 });

  const admin = createAdminClient();
  const { data: existing, error: userError } = await admin.auth.admin.getUserById(id);
  if (userError || !existing.user) return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
  const metadata = { ...existing.user.user_metadata, name, level };

  const [authUpdate, activityUpdate, settingsUpdate] = await Promise.all([
    admin.auth.admin.updateUserById(id, { user_metadata: metadata }),
    admin.from("student_activity").update({ student_name: name, level, whatsapp: whatsapp || null, birthdate, updated_at: new Date().toISOString() }).eq("user_id", id),
    admin.from("student_settings").upsert({ student_id: id, focus: focus || null, weekly_goal: weeklyGoal, access_expires_on: accessExpires, updated_at: new Date().toISOString() }, { onConflict: "student_id" }),
  ]);
  const error = authUpdate.error || activityUpdate.error || settingsUpdate.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
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
    const { error: resetError } = await session.supabase!.auth.resetPasswordForEmail(data.user.email, { redirectTo: `${SITE_URL}/definir-senha` });
    if (resetError) return NextResponse.json({ error: resetError.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "add_note") {
    const text = typeof body.body === "string" ? body.body.trim().slice(0, 4000) : "";
    if (!text) return NextResponse.json({ error: "Escreva a anotação." }, { status: 400 });
    const { error } = await admin.from("teacher_notes").insert({ student_id: id, teacher_id: session.user!.id, body: text });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "delete_note") {
    const noteId = typeof body.note_id === "string" ? body.note_id : "";
    const { error } = await admin.from("teacher_notes").delete().eq("id", noteId).eq("student_id", id).eq("teacher_id", session.user!.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "add_assignment") {
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
    const details = typeof body.details === "string" ? body.details.trim().slice(0, 2000) : "";
    const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(body.due_date ?? "") ? body.due_date : null;
    if (!title) return NextResponse.json({ error: "Informe o título da atividade." }, { status: 400 });
    const { error } = await admin.from("student_assignments").insert({ student_id: id, teacher_id: session.user!.id, title, details: details || null, due_date: dueDate });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "assignment_status") {
    const assignmentId = typeof body.assignment_id === "string" ? body.assignment_id : "";
    const status = body.status === "done" || body.status === "cancelled" || body.status === "assigned" ? body.status : null;
    if (!assignmentId || !status) return NextResponse.json({ error: "Atividade inválida." }, { status: 400 });
    const { error } = await admin.from("student_assignments").update({ status, updated_at: new Date().toISOString() }).eq("id", assignmentId).eq("student_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}
