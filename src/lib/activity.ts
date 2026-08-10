"use client";

import type { Kind } from "@/data/exercises";
import { createClient } from "@/lib/supabase/client";

/** Registra um login/carregamento de sessão do usuário logado. */
export async function touchLogin(name: string, level: string): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("touch_login", { p_name: name, p_level: level });
}

/** Soma segundos de uso à conta do usuário logado (heartbeat de tempo na plataforma). */
export async function addTimeSeconds(seconds: number): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("add_time_seconds", { p_secs: Math.round(seconds) });
}

/** Registra a resposta de um exercício no servidor, para o painel do professor. */
export async function bumpPracticeServer(kind: Kind, correct: boolean): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("bump_practice", { p_kind: kind, p_correct: correct });
}

export type StudentActivity = {
  user_id: string;
  student_name: string | null;
  level: string | null;
  last_login_at: string | null;
  session_count: number;
  total_seconds: number;
  practice_mc_done: number;
  practice_mc_correct: number;
  practice_fill_done: number;
  practice_fill_correct: number;
  practice_translate_done: number;
  practice_translate_correct: number;
  practice_order_done: number;
  practice_order_correct: number;
  updated_at: string;
};

/** Log de todos os alunos (só retorna dados para contas de professor — RLS cuida disso). */
export async function listStudentActivity(): Promise<{ data: StudentActivity[]; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_activity")
    .select("*")
    .eq("role", "student")
    .order("last_login_at", { ascending: false, nullsFirst: false });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as StudentActivity[], error: null };
}

/** Soma de exercícios feitos e acertos, somando os 4 tipos de prática. */
export function practiceTotals(a: StudentActivity) {
  const done = a.practice_mc_done + a.practice_fill_done + a.practice_translate_done + a.practice_order_done;
  const correct =
    a.practice_mc_correct + a.practice_fill_correct + a.practice_translate_correct + a.practice_order_correct;
  return { done, correct, pct: done ? Math.round((correct / done) * 100) : 0 };
}

/** Formata segundos como "42 min" ou "1h 30min". */
export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "—";
  const mins = Math.round(totalSeconds / 60);
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

/** true se o aluno não loga há mais de 7 dias (ou nunca logou). */
export function isInactive(lastLoginIso: string | null): boolean {
  if (!lastLoginIso) return true;
  return Date.now() - new Date(lastLoginIso).getTime() > 7 * 86_400_000;
}

/** Formata a data do último login de forma relativa ("Hoje, 14:32", "Ontem", "Há 3 dias"...). */
export function formatLastLogin(iso: string | null): string {
  if (!iso) return "Nunca logou";
  const date = new Date(iso);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays <= 0) {
    return `Hoje, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
