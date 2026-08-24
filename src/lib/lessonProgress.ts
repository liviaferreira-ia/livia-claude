"use client";

import { useCallback, useEffect, useState } from "react";
import { LESSONS, lessonSteps } from "@/data/lesson";
import { createClient } from "@/lib/supabase/client";

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
    const timer = window.setTimeout(async () => {
      let local: Done = {};
      try {
        const raw = window.localStorage.getItem(KEY);
        local = raw ? (JSON.parse(raw) as Done) : {};
      } catch {}
      const supabase = createClient();
      const { data } = await supabase.from("student_lesson_progress").select("lesson_slug,section_id");
      const server: Done = {};
      for (const row of data ?? []) server[keyFor(row.lesson_slug, row.section_id)] = true;
      const merged = { ...local, ...server };
      setDone(merged);
      setReady(true);
      // Importação silenciosa das etapas antigas que existiam apenas neste navegador.
      for (const key of Object.keys(local).filter((item) => local[item] && !server[item])) {
        const separator = key.lastIndexOf(":");
        const slug = key.slice(0, separator);
        const section = key.slice(separator + 1);
        if (slug && section) {
          const title = LESSONS[slug]?.title ?? "Lição";
          void supabase.rpc("mark_lesson_section", { p_slug: slug, p_section: section, p_title: title });
        }
      }
    }, 0);
    return () => window.clearTimeout(timer);
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
export async function markSectionDone(slug: string, sectionId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("mark_lesson_section", {
    p_slug: slug,
    p_section: sectionId,
    p_title: LESSONS[slug]?.title ?? "Lição",
  });
  if (error) throw new Error(`Não foi possível salvar a etapa: ${error.message}`);
  try {
    const raw = window.localStorage.getItem(KEY);
    const done = raw ? (JSON.parse(raw) as Done) : {};
    done[keyFor(slug, sectionId)] = true;
    window.localStorage.setItem(KEY, JSON.stringify(done));
  } catch {}
}
