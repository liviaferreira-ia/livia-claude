"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "central_lesson_sections_v1";

type Done = Record<string, boolean>;

/** Guarda quais seções da lição já foram concluídas (no localStorage). */
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

  const mark = useCallback((id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: true };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { done, ready, mark };
}

/** Marca uma seção como concluída fora de um componente React (ex.: ao finalizar a tarefa). */
export function markSectionDone(id: string) {
  try {
    const raw = window.localStorage.getItem(KEY);
    const done = raw ? (JSON.parse(raw) as Done) : {};
    done[id] = true;
    window.localStorage.setItem(KEY, JSON.stringify(done));
  } catch {}
}
