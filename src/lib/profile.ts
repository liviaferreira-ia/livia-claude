"use client";

import { useCallback, useEffect, useState } from "react";
import type { Kind } from "@/data/exercises";

export type PracticeStat = { done: number; correct: number };

export type Profile = {
  onboarded: boolean;
  name: string;
  goal: string;
  level: string;
  stats: {
    practice: Record<Kind, PracticeStat>;
    lessonsCompleted: number;
    streak: number;
  };
};

const KEY = "central_profile_v1";

export function emptyProfile(): Profile {
  return {
    onboarded: false,
    name: "",
    goal: "",
    level: "",
    stats: {
      practice: {
        mc: { done: 0, correct: 0 },
        fill: { done: 0, correct: 0 },
        translate: { done: 0, correct: 0 },
        order: { done: 0, correct: 0 },
      },
      lessonsCompleted: 0,
      streak: 0,
    },
  };
}

export function loadProfile(): Profile {
  if (typeof window === "undefined") return emptyProfile();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyProfile();
    const parsed = JSON.parse(raw) as Partial<Profile>;
    const base = emptyProfile();
    return {
      ...base,
      ...parsed,
      stats: {
        ...base.stats,
        ...(parsed.stats ?? {}),
        practice: { ...base.stats.practice, ...(parsed.stats?.practice ?? {}) },
      },
    };
  } catch {
    return emptyProfile();
  }
}

export function saveProfile(p: Profile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
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

/** Hook que lê e escreve o perfil no localStorage. `ready` evita erro de hidratação. */
export function useProfile() {
  const [profile, setProfile] = useState<Profile>(emptyProfile());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setReady(true);
  }, []);

  const update = useCallback((patch: (p: Profile) => Profile) => {
    setProfile((prev) => {
      const next = patch(prev);
      saveProfile(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const fresh = emptyProfile();
    saveProfile(fresh);
    setProfile(fresh);
  }, []);

  const bumpPractice = useCallback(
    (kind: Kind, correct: boolean) => {
      update((p) => {
        const stat = p.stats.practice[kind];
        return {
          ...p,
          stats: {
            ...p.stats,
            practice: {
              ...p.stats.practice,
              [kind]: { done: stat.done + 1, correct: stat.correct + (correct ? 1 : 0) },
            },
          },
        };
      });
    },
    [update],
  );

  return { profile, ready, update, reset, bumpPractice };
}
