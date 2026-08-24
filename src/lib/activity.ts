"use client";

import type { Kind } from "@/data/exercises";
import type { CefrLevel } from "@/data/placement";
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

export type LearningSnapshot = {
  practice: Record<Kind, { done: number; correct: number }>;
  dailyDone: number;
  streak: number;
  bestStreak: number;
  lessonsCompleted: number;
  lastPath: string;
  lastTitle: string;
  lastActivityType: string;
};

/** Lê do servidor o estado que deve acompanhar o aluno em qualquer aparelho. */
export async function getMyLearningSnapshot(): Promise<LearningSnapshot | null> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const [{ data: activity }, { data: sections }] = await Promise.all([
    supabase.from("student_activity").select("practice_mc_done,practice_mc_correct,practice_fill_done,practice_fill_correct,practice_translate_done,practice_translate_correct,practice_order_done,practice_order_correct,daily_activity_date,daily_exercise_done,streak_count,best_streak,last_path,last_title,last_activity_type").eq("user_id", auth.user.id).maybeSingle(),
    supabase.from("student_lesson_progress").select("lesson_slug,section_id").eq("student_id", auth.user.id),
  ]);
  if (!activity) return null;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const byLesson = new Map<string, Set<string>>();
  for (const row of sections ?? []) {
    const set = byLesson.get(row.lesson_slug) ?? new Set<string>();
    set.add(row.section_id);
    byLesson.set(row.lesson_slug, set);
  }
  return {
    practice: {
      mc: { done: activity.practice_mc_done, correct: activity.practice_mc_correct },
      fill: { done: activity.practice_fill_done, correct: activity.practice_fill_correct },
      translate: { done: activity.practice_translate_done, correct: activity.practice_translate_correct },
      order: { done: activity.practice_order_done, correct: activity.practice_order_correct },
    },
    dailyDone: activity.daily_activity_date === today ? activity.daily_exercise_done : 0,
    streak: activity.streak_count,
    bestStreak: activity.best_streak,
    lessonsCompleted: byLesson.size,
    lastPath: activity.last_path ?? "",
    lastTitle: activity.last_title ?? "",
    lastActivityType: activity.last_activity_type ?? "",
  };
}

export async function recordExerciseAttempt(input: {
  exerciseId: string; level: CefrLevel; kind: Kind; correct: boolean; path?: string; title?: string;
}): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("record_exercise_attempt", {
    p_exercise_id: input.exerciseId,
    p_level: input.level,
    p_kind: input.kind,
    p_correct: input.correct,
    p_path: input.path ?? "/aluno/praticar",
    p_title: input.title ?? "Prática",
  });
  if (error) throw new Error(`Não foi possível salvar a atividade: ${error.message}`);
}

export async function recordLearningPosition(path: string, title: string, activityType: string): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("record_learning_position", { p_path: path, p_title: title, p_activity_type: activityType });
}

export type ReviewTarget = { exerciseId: string; level: CefrLevel; kind: Kind };

/** Última resposta de cada questão: só retorna as que continuam erradas. */
export async function listMyReviewTargets(): Promise<ReviewTarget[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("student_exercise_attempts")
    .select("exercise_id,level,kind,correct,answered_at")
    .order("answered_at", { ascending: false })
    .limit(400);
  const seen = new Set<string>();
  const due: ReviewTarget[] = [];
  for (const row of data ?? []) {
    if (seen.has(row.exercise_id)) continue;
    seen.add(row.exercise_id);
    if (!row.correct) due.push({ exerciseId: row.exercise_id, level: row.level as CefrLevel, kind: row.kind as Kind });
  }
  return due;
}

/** Salva WhatsApp e data de nascimento do aluno logado. */
export async function updateContactInfo(whatsapp: string, birthdate: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.rpc("update_contact_info", {
    p_whatsapp: whatsapp,
    p_birthdate: birthdate || null,
  });
  return { error: error?.message ?? null };
}

/** Lê o WhatsApp e a data de nascimento salvos do aluno logado. */
export async function getMyContactInfo(): Promise<{ whatsapp: string; birthdate: string }> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return { whatsapp: "", birthdate: "" };
  const { data } = await supabase
    .from("student_activity")
    .select("whatsapp, birthdate")
    .eq("user_id", uid)
    .maybeSingle();
  return { whatsapp: data?.whatsapp ?? "", birthdate: data?.birthdate ?? "" };
}

export type StudentActivity = {
  user_id: string;
  student_name: string | null;
  level: string | null;
  whatsapp: string | null;
  birthdate: string | null;
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
  asaas_customer_id: string | null;
  payment_status: "ok" | "overdue" | null;
  overdue_since: string | null;
  blocked: boolean;
  /** true quando quem bloqueou foi o professor, não a régua de atraso. */
  manual_block: boolean;
  updated_at: string;
};

/** Pausa ou reativa o acesso de um aluno (só funciona logado como professor). */
export async function setStudentAccess(
  userId: string,
  action: "pause" | "resume",
): Promise<{ error: string | null }> {
  try {
    const res = await fetch("/api/professor/acesso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { error: body.error || "Não consegui alterar o acesso." };
    return { error: null };
  } catch {
    return { error: "Falha de conexão. Tente de novo." };
  }
}

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

/** Calcula a idade a partir da data de nascimento (formato YYYY-MM-DD). */
export function calcAge(birthdate: string | null): number | null {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthdayThisYear =
    now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthdayThisYear) age -= 1;
  return age;
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
