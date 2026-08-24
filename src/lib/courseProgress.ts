"use client";

import { useEffect, useMemo, useState } from "react";
import { COURSES, LEARNING_CYCLE, type LearningPhase, type LessonStatus, type UnitStatus } from "@/data/curso";
import type { CefrLevel } from "@/data/placement";
import { createClient } from "@/lib/supabase/client";

export type CourseProgressRow = {
  student_id: string;
  level: CefrLevel;
  unit_number: number;
  phase: LearningPhase;
  source: string;
  evidence_id: string | null;
  completed_at: string;
};

export type CourseProjectionFields = {
  course_level?: string | null;
  course_completed_phases?: number | null;
  current_unit?: number | null;
  current_phase?: string | null;
  course_progress_updated_at?: string | null;
};

const phaseOrder = LEARNING_CYCLE.map((item) => item.id);

function progressKey(unit: number, phase: LearningPhase) {
  return `${unit}:${phase}`;
}

export function courseTotalPhases(level: CefrLevel): number {
  return COURSES[level].units.length * phaseOrder.length;
}

export function summarizeCourseProgress(level: CefrLevel, rows: CourseProgressRow[]) {
  const completed = new Set(
    rows.filter((row) => row.level === level).map((row) => progressKey(row.unit_number, row.phase)),
  );
  const total = courseTotalPhases(level);
  const completedCount = completed.size;

  function unitState(unit: number): { status: UnitStatus; pct: number; completed: number } {
    const count = phaseOrder.filter((phase) => completed.has(progressKey(unit, phase))).length;
    const available = unit === 1 || completed.has(progressKey(unit - 1, "mastery"));
    return {
      status: count === phaseOrder.length ? "done" : available ? "current" : "locked",
      pct: Math.round((count / phaseOrder.length) * 100),
      completed: count,
    };
  }

  function phaseStatus(unit: number, phase: LearningPhase): LessonStatus {
    if (completed.has(progressKey(unit, phase))) return "done";
    if (unitState(unit).status === "locked") return "locked";
    const firstMissing = phaseOrder.find((candidate) => !completed.has(progressKey(unit, candidate)));
    return phase === firstMissing ? "now" : "locked";
  }

  let currentUnit = 1;
  let currentPhase: LearningPhase = "learn";
  for (const unit of COURSES[level].units) {
    const missing = phaseOrder.find((phase) => !completed.has(progressKey(unit.n, phase)));
    if (missing) {
      currentUnit = unit.n;
      currentPhase = missing;
      break;
    }
    currentUnit = unit.n;
    currentPhase = "mastery";
  }

  return {
    completed,
    completedCount,
    total,
    pct: total ? Math.round((completedCount / total) * 100) : 0,
    currentUnit,
    currentPhase,
    unitState,
    phaseStatus,
  };
}

export function useCourseProgress(level: CefrLevel) {
  const [rows, setRows] = useState<CourseProgressRow[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    void supabase
      .from("student_course_progress")
      .select("student_id,level,unit_number,phase,source,evidence_id,completed_at")
      .eq("level", level)
      .then(({ data, error: loadError }) => {
        if (!active) return;
        setRows((data ?? []) as CourseProgressRow[]);
        setError(loadError?.message ?? "");
        setReady(true);
      });
    return () => { active = false; };
  }, [level]);

  return { ...useMemo(() => summarizeCourseProgress(level, rows), [level, rows]), rows, ready, error };
}

export async function markCoursePhase(input: {
  level: CefrLevel;
  unit: number;
  phase: LearningPhase;
  source: string;
  evidenceId?: string;
  path?: string;
  title?: string;
}): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("mark_course_phase", {
    p_level: input.level,
    p_unit: input.unit,
    p_phase: input.phase,
    p_source: input.source,
    p_evidence_id: input.evidenceId ?? null,
    p_path: input.path ?? "/aluno/curso",
    p_title: input.title ?? `Unidade ${input.unit} · ${input.level}`,
  });
  if (error) throw new Error(`Não foi possível salvar o progresso: ${error.message}`);
}

export function courseContextFromLocation(): { level: CefrLevel; unit: number } | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const level = params.get("level");
  const unit = Number(params.get("unit"));
  if (!level || !["A1", "A2", "B1", "B2", "C1", "C2"].includes(level) || !Number.isInteger(unit) || unit < 1) return null;
  return { level: level as CefrLevel, unit };
}

/**
 * Aguarda a hidratação antes de ler o contexto curricular da URL.
 * `undefined` significa que a leitura ainda não ocorreu; `null`, que a página
 * foi aberta fora de uma etapa do curso.
 */
export function useCourseContextFromLocation() {
  const [context, setContext] = useState<ReturnType<typeof courseContextFromLocation> | undefined>(undefined);

  useEffect(() => {
    const timer = window.setTimeout(() => setContext(courseContextFromLocation()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return { context: context ?? null, ready: context !== undefined };
}

const lessonLocations: Record<string, { level: CefrLevel; unit: number }> = {
  "apresentando-se": { level: "A1", unit: 1 },
  "conhecendo-voce-melhor": { level: "A2", unit: 1 },
  "reservas-e-check-in": { level: "A2", unit: 3 },
  "who-i-am": { level: "B1", unit: 1 },
  "contando-uma-experiencia": { level: "B1", unit: 2 },
  "identity-personal-development": { level: "B2", unit: 1 },
  "contando-uma-historia": { level: "B2", unit: 2 },
  "identity-values-perspective": { level: "C1", unit: 1 },
  "discordando-com-tato": { level: "C1", unit: 3 },
  "precision-nuance": { level: "C2", unit: 1 },
  "argumento-persuasivo": { level: "C2", unit: 6 },
};

export function lessonCourseLocation(slug: string) {
  return lessonLocations[slug] ?? null;
}
