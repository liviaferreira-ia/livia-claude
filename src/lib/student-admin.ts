"use client";

import type { StudentActivity } from "@/lib/activity";
import type { StudentPayment } from "@/lib/finance";
import type { Message } from "@/lib/messages";
import type { AuditLog, Incident } from "@/lib/operational";
import { createClient } from "@/lib/supabase/client";

export type StudentSettings = {
  student_id: string;
  focus: string | null;
  weekly_goal: number;
  access_expires_on: string | null;
};

export type TeacherNote = {
  id: string;
  student_id: string;
  teacher_id: string;
  body: string;
  created_at: string;
};

export type StudentAssignment = {
  id: string;
  student_id: string;
  teacher_id: string;
  title: string;
  details: string | null;
  due_date: string | null;
  status: "assigned" | "done" | "cancelled";
  created_at: string;
  updated_at: string;
};

export type StudentEvent = {
  id: number;
  student_id: string;
  event_type: "login" | "exercise" | "tutor" | "roleplay" | "pronunciation" | "course_phase";
  kind: "mc" | "fill" | "translate" | "order" | string | null;
  correct: boolean | null;
  created_at: string;
};

export type StudentCourseProgress = {
  student_id: string;
  level: string;
  unit_number: number;
  phase: "learn" | "understand" | "practice" | "speak" | "mission" | "mastery";
  source: string;
  evidence_id: string | null;
  completed_at: string;
};

export type StudentDetail = {
  email: string;
  auth: {
    emailConfirmedAt: string | null;
    invitedAt: string | null;
    lastSignInAt: string | null;
  };
  activity: StudentActivity;
  settings: StudentSettings | null;
  notes: TeacherNote[];
  assignments: StudentAssignment[];
  events: StudentEvent[];
  courseProgress: StudentCourseProgress[];
  payments: StudentPayment[];
  messages: Message[];
  incidents: Incident[];
  audits: AuditLog[];
};

export async function getStudentDetail(id: string): Promise<{ data: StudentDetail | null; error: string | null }> {
  const res = await fetch(`/api/professor/alunos/${encodeURIComponent(id)}`, { cache: "no-store" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { data: null, error: body.error || "Não consegui carregar o aluno." };
  return { data: body as StudentDetail, error: null };
}

export async function updateStudentDetail(id: string, values: Record<string, unknown>): Promise<string | null> {
  const res = await fetch(`/api/professor/alunos/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const body = await res.json().catch(() => ({}));
  return res.ok ? null : body.error || "Não consegui salvar.";
}

export async function studentAdminAction(id: string, values: Record<string, unknown>): Promise<string | null> {
  const res = await fetch(`/api/professor/alunos/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const body = await res.json().catch(() => ({}));
  return res.ok ? null : body.error || "Não consegui concluir a ação.";
}

export async function requestStudentAccess(id: string): Promise<{ error: string | null; inviteLink: string | null }> {
  const res = await fetch(`/api/professor/alunos/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reset_password" }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: body.error || "Não consegui enviar o acesso.", inviteLink: null };
  }
  return {
    error: null,
    inviteLink: typeof body.inviteLink === "string" ? body.inviteLink : null,
  };
}

export async function deleteStudentAccount(id: string): Promise<string | null> {
  const res = await fetch(`/api/professor/alunos/${encodeURIComponent(id)}`, { method: "DELETE" });
  const body = await res.json().catch(() => ({}));
  return res.ok ? null : body.error || "Não consegui excluir o aluno.";
}

export async function createTemporaryStudentPassword(id: string): Promise<{ error: string | null; email: string | null; temporaryPassword: string | null }> {
  const res = await fetch(`/api/professor/alunos/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "temporary_password" }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { error: body.error || "Não consegui criar a senha provisória.", email: null, temporaryPassword: null };
  return {
    error: null,
    email: typeof body.email === "string" ? body.email : null,
    temporaryPassword: typeof body.temporaryPassword === "string" ? body.temporaryPassword : null,
  };
}

/** Meta semanal e foco definidos pelo professor (RLS: aluno só lê o próprio). */
export async function getMySettings(): Promise<StudentSettings | null> {
  const supabase = createClient();
  const { data } = await supabase.from("student_settings").select("*").maybeSingle();
  return (data as StudentSettings) ?? null;
}

/** Quantos dias distintos o aluno teve atividade (login ou exercício) desde a segunda-feira. */
export async function countMyActiveDaysThisWeek(): Promise<number> {
  const supabase = createClient();
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const { data } = await supabase.from("student_events").select("created_at").gte("created_at", monday.toISOString());
  const days = new Set((data ?? []).map((e) => new Date(e.created_at as string).toDateString()));
  return days.size;
}

export async function listMyAssignments(): Promise<StudentAssignment[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("student_assignments")
    .select("*")
    .eq("status", "assigned")
    .order("due_date", { ascending: true, nullsFirst: false });
  return (data ?? []) as StudentAssignment[];
}

export async function completeMyAssignment(id: string): Promise<string | null> {
  const supabase = createClient();
  const { error } = await supabase.rpc("complete_assignment", { p_id: id });
  return error?.message ?? null;
}
