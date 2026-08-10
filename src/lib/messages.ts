"use client";

import { createClient } from "@/lib/supabase/client";

export type Message = {
  id: string;
  user_id: string;
  sender: "student" | "tutor";
  body: string;
  student_name: string | null;
  created_at: string;
};

/** Recados do aluno logado (ele só enxerga os próprios), mais antigos primeiro. */
export async function listMyMessages(): Promise<{ data: Message[]; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as Message[], error: null };
}

/** Envia um recado do aluno para o tutor. */
export async function sendMessage(body: string): Promise<{ error: string | null }> {
  const text = body.trim();
  if (!text) return { error: "Escreva uma mensagem." };

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return { error: "Você precisa estar logado." };
  const studentName =
    typeof userData.user?.user_metadata?.name === "string"
      ? (userData.user.user_metadata.name as string)
      : null;

  const { error } = await supabase
    .from("messages")
    .insert({ user_id: uid, sender: "student", body: text, student_name: studentName });
  if (error) return { error: error.message };
  return { error: null };
}

// ---------- Lado do professor (só quem é 'teacher' consegue ler/responder) ----------

export type Thread = {
  studentId: string;
  studentName: string;
  messages: Message[];
  lastAt: string;
};

/** Todas as mensagens agrupadas por aluno (para a caixa de entrada do tutor). */
export async function listThreads(): Promise<{ data: Thread[]; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return { data: [], error: error.message };

  const byStudent = new Map<string, Thread>();
  for (const m of (data ?? []) as Message[]) {
    let t = byStudent.get(m.user_id);
    if (!t) {
      t = { studentId: m.user_id, studentName: m.student_name || "Aluno(a)", messages: [], lastAt: m.created_at };
      byStudent.set(m.user_id, t);
    }
    if (m.student_name) t.studentName = m.student_name;
    t.messages.push(m);
    t.lastAt = m.created_at;
  }
  const threads = Array.from(byStudent.values()).sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
  return { data: threads, error: null };
}

/** Resposta do tutor para um aluno específico. */
export async function replyToStudent(
  studentId: string,
  studentName: string,
  body: string,
): Promise<{ error: string | null }> {
  const text = body.trim();
  if (!text) return { error: "Escreva uma resposta." };

  const supabase = createClient();
  const { error } = await supabase
    .from("messages")
    .insert({ user_id: studentId, sender: "tutor", body: text, student_name: studentName });
  if (error) return { error: error.message };
  return { error: null };
}
