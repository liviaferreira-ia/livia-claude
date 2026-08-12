"use client";

// Ofensiva (dias seguidos de estudo) e meta diária de exercícios.
// Fica no navegador, junto das estatísticas de prática.

const STREAK_KEY = "central_streak_v1";
const DAILY_KEY = "central_daily_v1";

/** Quantos exercícios por dia contam como meta cumprida. */
export const DAILY_GOAL = 10;

export type Streak = { lastDay: string; streak: number; best: number };
export type Daily = { day: string; done: number };

/** Data local no formato YYYY-MM-DD (não usa UTC pra não virar o dia errado). */
export function todayKey(d: Date = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Safari em modo privado pode bloquear o storage — seguimos sem quebrar.
  }
}

export function readStreak(): Streak {
  return read<Streak>(STREAK_KEY, { lastDay: "", streak: 0, best: 0 });
}

/**
 * Registra que o aluno apareceu hoje. Mesmo dia não muda nada; dia seguinte
 * soma 1; qualquer intervalo maior reinicia a contagem em 1.
 */
export function touchStreak(): Streak {
  const cur = readStreak();
  const today = todayKey();
  if (cur.lastDay === today) return cur;

  const streak = cur.lastDay === yesterdayKey() ? cur.streak + 1 : 1;
  const next: Streak = { lastDay: today, streak, best: Math.max(streak, cur.best) };
  write(STREAK_KEY, next);
  return next;
}

/** Exercícios já feitos hoje (zera sozinho quando vira o dia). */
export function readDaily(): Daily {
  const cur = read<Daily>(DAILY_KEY, { day: "", done: 0 });
  return cur.day === todayKey() ? cur : { day: todayKey(), done: 0 };
}

/** Soma 1 exercício à meta de hoje. */
export function bumpDaily(): Daily {
  const cur = readDaily();
  const next: Daily = { day: cur.day, done: cur.done + 1 };
  write(DAILY_KEY, next);
  return next;
}
