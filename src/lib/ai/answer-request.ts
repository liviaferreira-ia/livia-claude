import "server-only";

import type { createClient } from "@/lib/supabase/server";

/**
 * Peças comuns das rotas que recebem a fala do aluno (/api/aluno/fala e /api/aluno/transcrever).
 * O áudio só é validado e repassado para transcrição: nunca é salvo.
 */

const MAX_AUDIO_BYTES = 3_000_000;
const AUDIO_TYPES: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "mp4",
  "audio/x-m4a": "m4a",
  "audio/m4a": "m4a",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
};

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Período gratuito encerrado (sem conversão) bloqueia os recursos de IA. Devolve também se ainda está em teste. */
export async function trialState(supabase: Supabase, userId: string): Promise<{ blocked: boolean; inTrial: boolean }> {
  const { data: trial } = await supabase
    .from("student_trials")
    .select("status,ends_at")
    .eq("student_id", userId)
    .maybeSingle();
  if (!trial || trial.status === "converted") return { blocked: false, inTrial: false };
  const ended = trial.ends_at ? new Date(trial.ends_at).getTime() <= Date.now() : false;
  return { blocked: ended || trial.status === "expired" || trial.status === "cancelled", inTrial: true };
}

/** Limite simples por processo (um único processo Node no servidor atual). */
export function rateLimiter(windowMs: number) {
  const usage = new Map<string, { count: number; windowStart: number }>();
  return (userId: string, limit: number): boolean => {
    const now = Date.now();
    const entry = usage.get(userId);
    if (!entry || now - entry.windowStart > windowMs) {
      usage.set(userId, { count: 1, windowStart: now });
      return false;
    }
    entry.count += 1;
    return entry.count > limit;
  };
}

/** Valida o campo "audio" do formulário e devolve um arquivo com nome e tipo definidos pelo servidor. */
export async function readAudio(value: FormDataEntryValue | null | undefined): Promise<{ audio: File } | { error: string; status: number }> {
  if (!(value instanceof File) || value.size === 0) return { error: "Não recebi o áudio. Toque no microfone e fale de novo.", status: 400 };
  if (value.size > MAX_AUDIO_BYTES) return { error: "A gravação ficou longa demais. Fale uma frase curta.", status: 413 };
  const baseType = value.type.split(";")[0].trim().toLowerCase();
  const ext = AUDIO_TYPES[baseType];
  if (!ext) return { error: "Formato de áudio não suportado neste navegador.", status: 415 };
  // A transcrição usa a extensão para ler o áudio; nome e tipo não vêm do navegador.
  return { audio: new File([await value.arrayBuffer()], `resposta.${ext}`, { type: baseType }) };
}
