import { NextResponse } from "next/server";
import { A1_DRAFTS } from "@/data/a1Drafts";
import { rateLimiter, readAudio, trialState } from "@/lib/ai/answer-request";
import { checkSpokenAnswer, transcribeAnswer } from "@/lib/ai/speaking-check";
import { recordIncident } from "@/lib/operational-server";
import { createClient } from "@/lib/supabase/server";

/**
 * Confere a resposta do aluno numa pergunta da etapa "Sua vez" (aulas em vídeo).
 * Recebe o áudio gravado (multipart: audio + lessonId + index) ou, sem microfone, o texto digitado (JSON).
 * A pergunta é buscada aqui no servidor pelo id da aula e posição.
 * Nada é guardado: o áudio só é repassado para transcrição e descartado.
 */

const MAX_HEARD_LENGTH = 300;
const RATE_LIMIT = 60;
const TRIAL_RATE_LIMIT = 20;
const limited = rateLimiter(60 * 60 * 1000);

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, MAX_HEARD_LENGTH) : "";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });

  const trial = await trialState(supabase, user.id);
  if (trial.blocked) return NextResponse.json({ error: "Seu período gratuito terminou. Escolha um plano para continuar." }, { status: 403 });

  let lessonId = "";
  let index = -1;
  let typed = "";
  let audio: File | null = null;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData().catch(() => null);
    lessonId = String(form?.get("lessonId") ?? "");
    index = Number(form?.get("index"));
    const read = await readAudio(form?.get("audio"));
    if ("error" in read) return NextResponse.json({ error: read.error }, { status: read.status });
    audio = read.audio;
  } else {
    const body = await request.json().catch(() => null);
    lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
    index = Number(body?.index);
    typed = cleanText(body?.heard);
    if (!typed) return NextResponse.json({ error: "Escreva sua resposta em inglês." }, { status: 400 });
  }

  const lesson = A1_DRAFTS.find((item) => item.id === lessonId);
  const line = lesson && Number.isInteger(index) && index >= 0 ? lesson.practice[index] : undefined;
  if (!lesson || !line) return NextResponse.json({ error: "Pergunta não encontrada." }, { status: 404 });

  if (limited(user.id, trial.inTrial ? TRIAL_RATE_LIMIT : RATE_LIMIT)) {
    return NextResponse.json({ error: "Muitas respostas em pouco tempo. Tente de novo daqui a pouco." }, { status: 429 });
  }

  const startedAt = Date.now();
  try {
    let heard = typed;
    let transcribeModel: string | null = null;
    if (audio) {
      const transcript = await transcribeAnswer(audio);
      heard = cleanText(transcript.text);
      transcribeModel = transcript.model;
      if (!heard) {
        return NextResponse.json({ error: "Não consegui ouvir sua resposta. Fale um pouco mais perto do microfone e tente de novo." }, { status: 422 });
      }
    }
    const check = await checkSpokenAnswer({ question: line.en, questionPt: line.pt, hint: line.hint, level: "A1" }, heard);
    console.log(JSON.stringify({
      event: "speaking_check", user_id: user.id, lesson_id: lesson.id, audio: Boolean(audio),
      transcribe_model: transcribeModel, model: check.model, latency_ms: Date.now() - startedAt, usage: check.usage,
    }));
    return NextResponse.json({ heard, result: check.result, feedback: check.feedback, suggestion: check.suggestion });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao conferir a resposta.";
    const trace = await recordIncident({ userId: user.id, source: "server", area: "aluno/fala", action: audio ? "ai_transcribe_check" : "ai_check", severity: "error", message });
    return NextResponse.json({ error: `Não consegui conferir agora. Tente de novo em instantes. Código: ${trace}` }, { status: 502 });
  }
}
