"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import type { Kind } from "@/data/exercises";
import { LEVEL_ORDER, levelBadge, type CefrLevel } from "@/data/placement";
import { addTimeSeconds, getMyLearningSnapshot, recordExerciseAttempt, touchLogin } from "@/lib/activity";
import { bumpDaily, readDaily, readStreak, touchStreak } from "@/lib/daily";
import { countCompletedLessons } from "@/lib/lessonProgress";
import { createClient } from "@/lib/supabase/client";
import { clearSessionActivity } from "@/lib/sessionActivity";

const CEFR_RE = /^[ABC][12]$/;

/**
 * Extrai o código CEFR de `profile.level`, que pode estar em formatos antigos:
 * "C1" (atual), "C1 · Avançado" (formato anterior) ou palavras livres do
 * primeiro onboarding ("Iniciante"/"Intermediário"/"Avançado").
 */
export function parseCefrLevel(raw: string): CefrLevel | null {
  if (!raw) return null;
  const first = raw.split("·")[0].trim().toUpperCase();
  if ((LEVEL_ORDER as string[]).includes(first) && CEFR_RE.test(first)) {
    return first as CefrLevel;
  }
  const word = raw.trim().toLowerCase();
  if (word.startsWith("inici")) return "A1";
  if (word.startsWith("interm")) return "B1";
  if (word.startsWith("avan")) return "C1";
  return null;
}

/** Formata `profile.level` pra exibição ("C1 · Avançado"), aceitando formatos antigos. */
export function levelDisplay(raw: string): string {
  const cefr = parseCefrLevel(raw);
  return cefr ? levelBadge(cefr) : raw;
}

export type PracticeStat = { done: number; correct: number };

export type Stats = {
  practice: Record<Kind, PracticeStat>;
  lessonsCompleted: number;
  streak: number;
  /** Exercícios feitos hoje (para a meta diária). */
  dailyDone: number;
  bestStreak: number;
  lastPath: string;
  lastTitle: string;
  lastActivityType: string;
};

export type Profile = {
  onboarded: boolean;
  name: string;
  goal: string;
  level: string;
  avatarUrl: string;
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
    dailyDone: 0,
    bestStreak: 0,
    lastPath: "",
    lastTitle: "",
    lastActivityType: "",
  };
}

export function emptyProfile(): Profile {
  return { onboarded: false, name: "", goal: "", level: "", avatarUrl: "", stats: emptyStats() };
}

/**
 * `lessonsCompleted` e `streak` não são guardados aqui: são derivados na hora
 * do progresso das lições e do registro de dias seguidos, senão ficariam
 * desatualizados (era o motivo de viverem zerados no painel).
 */
export function loadStats(): Stats {
  if (typeof window === "undefined") return emptyStats();
  const base = emptyStats();
  let practice = base.practice;
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Stats>;
      practice = { ...base.practice, ...(parsed.practice ?? {}) };
    }
  } catch {
    // storage indisponível — seguimos com os contadores zerados
  }
  return {
    practice,
    lessonsCompleted: countCompletedLessons(),
    streak: readStreak().streak,
    dailyDone: readDaily().done,
    bestStreak: readStreak().best,
    lastPath: "",
    lastTitle: "",
    lastActivityType: "",
  };
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
export type Role = "student" | "teacher";

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("student");
  const [stats, setStats] = useState<Stats>(emptyStats());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // Registra a presença de hoje antes de ler as estatísticas, senão a
    // ofensiva só apareceria na próxima vez que o app abrisse.
    const localTimer = window.setTimeout(() => {
      touchStreak();
      if (mounted) setStats(loadStats());
    }, 0);

    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      if (data.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();
        if (mounted) setRole((prof?.role as Role) ?? "student");
        touchLogin(metaString(data.user, "name"), metaString(data.user, "level")).catch(() => {});
        const snapshot = await getMyLearningSnapshot();
        if (mounted && snapshot) {
          setStats((current) => ({ ...current, ...snapshot }));
        }
      }
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      window.clearTimeout(localTimer);
      sub.subscription.unsubscribe();
    };
  }, []);

  // Heartbeat: enquanto o aluno estiver com a aba aberta e visível, soma tempo de uso.
  useEffect(() => {
    if (!ready || !user || role !== "student") return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        addTimeSeconds(60).catch(() => {});
      }
    }, 60_000);
    return () => window.clearInterval(id);
  }, [ready, user, role]);

  const profile: Profile = {
    onboarded: user?.user_metadata?.onboarded === true,
    name: metaString(user, "name"),
    goal: metaString(user, "goal"),
    level: metaString(user, "level"),
    avatarUrl: metaString(user, "avatar_url"),
    stats,
  };

  const email = user?.email ?? "";

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

  const bumpPractice = useCallback((kind: Kind, correct: boolean, exerciseId = "unknown", level: CefrLevel = "A2", title = "Prática") => {
    const daily = bumpDaily();
    setStats((prev) => {
      const stat = prev.practice[kind];
      const next: Stats = {
        ...prev,
        practice: {
          ...prev.practice,
          [kind]: { done: stat.done + 1, correct: stat.correct + (correct ? 1 : 0) },
        },
        dailyDone: daily.done,
      };
      saveStats(next);
      return next;
    });
    recordExerciseAttempt({ exerciseId, level, kind, correct, title }).catch(() => {});
  }, []);

  /** Recalcula lições concluídas e ofensiva (ex.: ao voltar de uma lição). */
  const refreshDerivedStats = useCallback(() => {
    setStats(loadStats());
  }, []);

  /** Zera apenas as estatísticas de prática deste navegador. */
  const reset = useCallback(() => {
    const fresh = emptyStats();
    saveStats(fresh);
    setStats(fresh);
  }, []);

  /**
   * Envia a foto para o Supabase Storage e salva a URL na conta.
   * Recebe a imagem já recortada em quadrado (JPEG), vinda do AvatarCropper.
   */
  const uploadAvatar = useCallback(
    async (blob: Blob): Promise<{ error: string | null }> => {
      if (!user) return { error: "Você precisa estar logado." };
      const supabase = createClient();
      const path = `${user.id}/avatar.jpg`;

      const up = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, cacheControl: "3600", contentType: "image/jpeg" });
      if (up.error) return { error: up.error.message };

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      // ?t= força o navegador a recarregar a imagem quando ela é trocada.
      const url = `${pub.publicUrl}?t=${Date.now()}`;

      const { data, error } = await supabase.auth.updateUser({ data: { avatar_url: url } });
      if (error) return { error: error.message };
      if (data.user) setUser(data.user);
      return { error: null };
    },
    [user],
  );

  const signOut = useCallback(async (scope: "global" | "local" = "global") => {
    const supabase = createClient();
    if (user) clearSessionActivity(user.id);
    const result = await supabase.auth.signOut({ scope });
    setUser(null);
    return result;
  }, [user]);

  return {
    profile,
    user,
    email,
    role,
    isTeacher: role === "teacher",
    ready,
    updateIdentity,
    uploadAvatar,
    refreshDerivedStats,
    bumpPractice,
    reset,
    signOut,
  };
}
