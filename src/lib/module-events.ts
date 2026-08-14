"use client";

import { createClient } from "@/lib/supabase/client";

export type TrackedModule = "roleplay" | "pronunciation";

/**
 * Registra que o aluno usou um módulo, para o professor enxergar quem já
 * testou o quê. Só o evento em si (tipo, um identificador curto, acerto) —
 * nunca o áudio nem o texto trocado na prática.
 */
export async function logModuleEvent(eventType: TrackedModule, kind?: string, correct?: boolean): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("log_student_event", {
    p_event_type: eventType,
    p_kind: kind ?? null,
    p_correct: correct ?? null,
  });
}
