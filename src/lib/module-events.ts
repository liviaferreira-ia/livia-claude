"use client";

import { createClient } from "@/lib/supabase/client";
import { courseContextFromLocation, markCoursePhase } from "@/lib/courseProgress";

export type TrackedModule = "roleplay" | "pronunciation";

/**
 * Registra que o aluno usou um módulo, para o professor enxergar quem já
 * testou o quê. Só o evento em si (tipo, um identificador curto, acerto) —
 * nunca o áudio nem o texto trocado na prática.
 */
export async function logModuleEvent(eventType: TrackedModule, kind?: string, correct?: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("log_student_event", {
    p_event_type: eventType,
    p_kind: kind ?? null,
    p_correct: correct ?? null,
  });
  if (error) throw new Error(`Não foi possível registrar o módulo: ${error.message}`);
}

/** Registra o uso do módulo e, quando ele veio da trilha, conclui a etapa correspondente. */
export async function completeTrackedModule(eventType: TrackedModule, kind?: string, correct?: boolean): Promise<void> {
  await logModuleEvent(eventType, kind, correct);
  if (eventType === "pronunciation" && correct !== true) return;
  const context = courseContextFromLocation();
  if (!context) return;
  await markCoursePhase({
    ...context,
    phase: eventType === "pronunciation" ? "speak" : "mission",
    source: eventType,
    evidenceId: kind,
    path: `/aluno/${eventType === "pronunciation" ? "pronuncia" : "roleplay"}`,
    title: eventType === "pronunciation" ? "Prática de pronúncia" : "Missão com roleplay",
  });
}
