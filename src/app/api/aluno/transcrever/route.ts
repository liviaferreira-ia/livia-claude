import { NextResponse } from "next/server";
import { rateLimiter, readAudio, trialState } from "@/lib/ai/answer-request";
import { transcribeAnswer } from "@/lib/ai/speaking-check";
import { recordIncident } from "@/lib/operational-server";
import { createClient } from "@/lib/supabase/server";

/**
 * Transcreve a frase que o aluno leu na Pronúncia (design v2, 17/11/2026): substitui o reconhecimento
 * de voz do navegador, que falhou no teste do Fabio. A comparação palavra por palavra continua na tela.
 * Recebe multipart com "audio". Nada é guardado: o áudio só é repassado para transcrição.
 */

const RATE_LIMIT = 120;
const TRIAL_RATE_LIMIT = 40;
const limited = rateLimiter(60 * 60 * 1000);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });

  const trial = await trialState(supabase, user.id);
  if (trial.blocked) return NextResponse.json({ error: "Seu período gratuito terminou. Escolha um plano para continuar." }, { status: 403 });

  const form = await request.formData().catch(() => null);
  const read = await readAudio(form?.get("audio"));
  if ("error" in read) return NextResponse.json({ error: read.error }, { status: read.status });

  if (limited(user.id, trial.inTrial ? TRIAL_RATE_LIMIT : RATE_LIMIT)) {
    return NextResponse.json({ error: "Muitas tentativas em pouco tempo. Tente de novo daqui a pouco." }, { status: 429 });
  }

  const startedAt = Date.now();
  try {
    const transcript = await transcribeAnswer(read.audio);
    const heard = transcript.text.slice(0, 300);
    console.log(JSON.stringify({ event: "pronunciation_transcribe", user_id: user.id, model: transcript.model, latency_ms: Date.now() - startedAt }));
    if (!heard) return NextResponse.json({ error: "Não consegui ouvir. Fale um pouco mais perto do microfone e tente de novo." }, { status: 422 });
    return NextResponse.json({ heard });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao transcrever a fala.";
    const trace = await recordIncident({ userId: user.id, source: "server", area: "aluno/pronuncia", action: "ai_transcribe", severity: "error", message });
    return NextResponse.json({ error: `Não consegui ouvir agora. Tente de novo em instantes. Código: ${trace}` }, { status: 502 });
  }
}
