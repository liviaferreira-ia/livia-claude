import { NextResponse } from "next/server";
import { A1_DRAFTS } from "@/data/a1Drafts";
import { checkSpokenAnswer } from "@/lib/ai/speaking-check";
import { recordIncident } from "@/lib/operational-server";
import { createClient } from "@/lib/supabase/server";

/**
 * Confere a resposta falada do aluno numa pergunta da etapa "Sua vez" (aulas em vídeo).
 * A pergunta é buscada aqui no servidor pelo id da aula e posição — o navegador só manda o que o aluno falou.
 * Nada é gravado: nem a voz (que nunca chega aqui) nem o texto reconhecido.
 */

const MAX_HEARD_LENGTH = 300;
const RATE_LIMIT = 60;
const TRIAL_RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const usage = new Map<string, { count: number; windowStart: number }>();

function rateLimited(userId: string, limit: number): boolean {
  const now = Date.now();
  const entry = usage.get(userId);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    usage.set(userId, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });

  const { data: trial } = await supabase
    .from("student_trials")
    .select("status,ends_at")
    .eq("student_id", user.id)
    .maybeSingle();
  const trialEnded = trial?.ends_at ? new Date(trial.ends_at).getTime() <= Date.now() : false;
  if (trial && trial.status !== "converted" && (trialEnded || trial.status === "expired" || trial.status === "cancelled")) {
    return NextResponse.json({ error: "Seu período gratuito terminou. Escolha um plano para continuar." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
  const index = Number.isInteger(body?.index) ? (body.index as number) : -1;
  const heard = typeof body?.heard === "string" ? body.heard.replace(/\s+/g, " ").trim().slice(0, MAX_HEARD_LENGTH) : "";

  const lesson = A1_DRAFTS.find((item) => item.id === lessonId);
  const line = lesson && index >= 0 ? lesson.practice[index] : undefined;
  if (!lesson || !line) return NextResponse.json({ error: "Pergunta não encontrada." }, { status: 404 });
  if (!heard) return NextResponse.json({ error: "Não ouvi nada. Toque no microfone e responda em inglês." }, { status: 400 });

  const rateLimit = trial && trial.status !== "converted" ? TRIAL_RATE_LIMIT : RATE_LIMIT;
  if (rateLimited(user.id, rateLimit)) {
    return NextResponse.json({ error: "Muitas respostas em pouco tempo. Tente de novo daqui a pouco." }, { status: 429 });
  }

  const startedAt = Date.now();
  try {
    const check = await checkSpokenAnswer({ question: line.en, questionPt: line.pt, hint: line.hint, level: "A1" }, heard);
    console.log(JSON.stringify({ event: "speaking_check", user_id: user.id, lesson_id: lesson.id, model: check.model, latency_ms: Date.now() - startedAt, usage: check.usage }));
    return NextResponse.json({ result: check.result, feedback: check.feedback, suggestion: check.suggestion });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao conferir a resposta falada.";
    const trace = await recordIncident({ userId: user.id, source: "server", area: "aluno/fala", action: "ai_check", severity: "error", message });
    return NextResponse.json({ error: `Não consegui conferir agora. Tente de novo em instantes. Código: ${trace}` }, { status: 502 });
  }
}
