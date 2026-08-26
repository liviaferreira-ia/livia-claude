import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/operational-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff as teacher } from "@/lib/staff-server";

export async function GET() {
  const session = await teacher();
  if (session.error) return session.error;
  const admin = createAdminClient();
  const [incidentResult, auditResult, studentsResult] = await Promise.all([
    admin.from("app_incidents").select("*").order("last_seen_at", { ascending: false }).limit(300),
    admin.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(150),
    admin.from("student_activity").select("user_id,student_name"),
  ]);
  const error = incidentResult.error || auditResult.error || studentsResult.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const names = new Map((studentsResult.data ?? []).map((item) => [item.user_id, item.student_name]));
  return NextResponse.json({
    incidents: (incidentResult.data ?? []).map((item) => ({ ...item, student_name: item.user_id ? names.get(item.user_id) ?? null : null })),
    audits: (auditResult.data ?? []).map((item) => ({ ...item, student_name: item.student_id ? names.get(item.student_id) ?? null : null })),
  });
}

export async function PATCH(request: Request) {
  const session = await teacher();
  if (session.error) return session.error;
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const status = ["new", "investigating", "resolved"].includes(body?.status) ? body.status : null;
  const resolutionNote = typeof body?.resolutionNote === "string" ? body.resolutionNote.trim().slice(0, 2000) : "";
  if (!id || !status) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  if (status === "resolved" && !resolutionNote) return NextResponse.json({ error: "Descreva brevemente como o problema foi resolvido." }, { status: 400 });
  const admin = createAdminClient();
  const { error } = await admin.from("app_incidents").update({ status, resolution_note: resolutionNote || null, resolved_by: status === "resolved" ? session.user!.id : null, resolved_at: status === "resolved" ? new Date().toISOString() : null }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await recordAudit(session.user!.id, null, "incident_status_changed", { incident_id: id, status });
  return NextResponse.json({ ok: true });
}
