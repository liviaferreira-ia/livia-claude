"use client";

import type { StudentActivity } from "@/lib/activity";
import type { StudentPayment } from "@/lib/finance";
import type { Message } from "@/lib/messages";
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
  event_type: "login" | "exercise";
  kind: "mc" | "fill" | "translate" | "order" | null;
  correct: boolean | null;
  created_at: string;
};

export type StudentDetail = {
  email: string;
  activity: StudentActivity;
  settings: StudentSettings | null;
  notes: TeacherNote[];
  assignments: StudentAssignment[];
  events: StudentEvent[];
  payments: StudentPayment[];
  messages: Message[];
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
