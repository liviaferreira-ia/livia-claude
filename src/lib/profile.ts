"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import type { Kind } from "@/data/exercises";
import { createClient } from "@/lib/supabase/client";

export type PracticeStat = { done: number; correct: number };

export type Stats = {
  practice: Record<Kind, PracticeStat>;
  lessonsCompleted: number;
  streak: number;
};

export type Profile = {
  onboarded: boolean;
  name: string;
  goal: string;
  level: string;
  stats: Stats;
};

// A identidade (nome/objetivo/nível) mora na conta do Supabase (user_metadata).
// As estatísticas de prática ficam no navegador por enquanto (próxima etapa: banco).
const STATS_KEY = "central_stats_v1";

export function emptyStats(): Stats {
  return {
    practice: {
      mc: { done: 0, correct: 0 },
      fill: { done: 0, correct: 0 },
      translate: { done: 0, correct: 0 },
      order: { done: 0, correct: 0 },
    },
    lessonsCompleted: 0,
    streak: 0,
  };
}

export function emptyProfile(): Profile {
  return { onboarded: false, name: "", goal: "", level: "", stats: emptyStats() };
}

export function loadStats(): Stats {
  if (typeof window === "undefined") return emptyStats();
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return emptyStats();
    const parsed = JSON.parse(raw) as Partial<Stats>;
    const base = emptyStats();
    return {
      ...base,
      ...parsed,
      practice: { ...base.practice, ...(parsed.practice ?? {}) },
    };
  } catch {
    return emptyStats();
  }
}

export function saveStats(s: Stats) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(s));
  } catch {
    // Safari em modo privado (ou storage desativado) pode lançar erro — ignoramos.
  }
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "🙂";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function totalExercises(p: Profile) {
  const pr = p.stats.practice;
  const done = pr.mc.done + pr.fill.done + pr.translate.done + pr.order.done;
  const correct = pr.mc.correct + pr.fill.correct + pr.translate.correct + pr.order.correct;
  return { done, correct, pct: done ? Math.round((correct / done) * 100) : 0 };
}

function metaString(user: User | null, key: string): string {
  const v = user?.user_metadata?.[key];
  return typeof v === "string" ? v : "";
}

/**
 * Lê a identidade da conta Supabase e as estatísticas do navegador.
 * `ready` fica true depois que a sessão foi verificada, evitando "piscar".
 */
export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>(emptyStats());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    setStats(loadStats());

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const profile: Profile = {
    onboarded: user?.user_metadata?.onboarded === true,
    name: metaString(user, "name"),
    goal: metaString(user, "goal"),
    level: metaString(user, "level"),
    stats,
  };

  /** Salva parte da identidade na conta (nome, objetivo, nível, onboarded). */
  const updateIdentity = useCallback(
    async (patch: { name?: string; goal?: string; level?: string; onboarded?: boolean }) => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.updateUser({ data: patch });
      if (!error && data.user) setUser(data.user);
      return { error };
    },
    [],
  );

  const bumpPractice = useCallback((kind: Kind, correct: boolean) => {
    setStats((prev) => {
      const stat = prev.practice[kind];
      const next: Stats = {
        ...prev,
        practice: {
          ...prev.practice,
          [kind]: { done: stat.done + 1, correct: stat.correct + (correct ? 1 : 0) },
        },
      };
      saveStats(next);
      return next;
    });
  }, []);

  /** Zera apenas as estatísticas de prática deste navegador. */
  const reset = useCallback(() => {
    const fresh = emptyStats();
    saveStats(fresh);
    setStats(fresh);
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return { profile, user, ready, updateIdentity, bumpPractice, reset, signOut };
}
