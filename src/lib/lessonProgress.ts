"use client";

import { useCallback, useEffect, useState } from "react";
import { LESSONS, lessonSteps } from "@/data/lesson";

const KEY = "central_lesson_sections_v1";

type Done = Record<string, boolean>;

/** A chave é por lição, senão concluir "intro" numa lição marcaria todas as outras. */
function keyFor(slug: string, sectionId: string) {
  return `${slug}:${sectionId}`;
}

/** Guarda quais etapas de cada lição já foram concluídas (no localStorage). */
export function useLessonProgress() {
  const [done, setDone] = useState<Done>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      setDone(raw ? (JSON.parse(raw) as Done) : {});
    } catch {
      setDone({});
    }
    setReady(true);
  }, []);

  const isDone = useCallback(
    (slug: string, sectionId: string) => done[keyFor(slug, sectionId)] === true,
    [done],
  );

  return { ready, isDone };
}

/** Quantas lições tiveram TODAS as etapas concluídas (usado nas conquistas do painel). */
export function countCompletedLessons(): number {
  if (typeof window === "undefined") return 0;
  let done: Done = {};
  try {
    const raw = window.localStorage.getItem(KEY);
    done = raw ? (JSON.parse(raw) as Done) : {};
  } catch {
    return 0;
  }
  return Object.values(LESSONS).filter((lesson) =>
    lessonSteps(lesson).every((step) => done[keyFor(lesson.slug, step.id)]),
  ).length;
}

/** Marca uma etapa como concluída fora de um componente React (ex.: ao finalizar a tarefa). */
export function markSectionDone(slug: string, sectionId: string) {
  try {
    const raw = window.localStorage.getItem(KEY);
    const done = raw ? (JSON.parse(raw) as Done) : {};
    done[keyFor(slug, sectionId)] = true;
    window.localStorage.setItem(KEY, JSON.stringify(done));
  } catch {}
}
