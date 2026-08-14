import { NextResponse } from "next/server";
import { getTutorReply, type TutorTurn } from "@/lib/ai/tutor-provider";
import { recordIncident } from "@/lib/operational-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const OBJECTIVE = "Falar sobre uma viagem recente usando o passado simples.";
const MAX_TURNS = 16;
const MAX_MESSAGE_LENGTH = 600;

/** Limite simples por processo: no máximo 30 mensagens por aluno por hora. Suficiente pro piloto atual. */
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const usage = new Map<string, { count: number; windowStart: number }>();

function rateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = usage.get(userId);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    usage.set(userId, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });

  if (rateLimited(user.id)) {
    return NextResponse.json({ error: "Muitas mensagens em pouco tempo. Tente de novo daqui a pouco." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const rawHistory = Array.isArray(body?.history) ? body.history : null;
  if (!rawHistory || rawHistory.length === 0) {
    return NextResponse.json({ error: "Nenhuma mensagem enviada." }, { status: 400 });
  }

  const history: TutorTurn[] = rawHistory
    .filter((turn: unknown): turn is TutorTurn =>
      typeof turn === "object" && turn !== null &&
      (turn as TutorTurn).role !== undefined && ["user", "assistant"].includes((turn as TutorTurn).role) &&
      typeof (turn as TutorTurn).content === "string")
    .slice(-MAX_TURNS)
    .map((turn: TutorTurn) => ({ role: turn.role, content: turn.content.trim().slice(0, MAX_MESSAGE_LENGTH) }));

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return NextResponse.json({ error: "Formato de conversa inválido." }, { status: 400 });
  }

  const { data: activity } = await supabase
    .from("student_activity")
    .select("student_name, level")
    .eq("user_id", user.id)
    .maybeSingle();
  const level = activity?.level && /^[ABC][12]$/.test(activity.level) ? activity.level : "A2";
  const firstName = (activity?.student_name || user.user_metadata?.name || "aluno(a)").split(" ")[0];

  const startedAt = Date.now();
  try {
    const { text, model, usage: tokenUsage } = await getTutorReply({ level, firstName, objective: OBJECTIVE }, history);
    console.log(JSON.stringify({
      event: "tutor_reply",
      user_id: user.id,
      model,
      latency_ms: Date.now() - startedAt,
      usage: tokenUsage,
    }));
    // Só o evento (pra "Atividades" do professor saber que o aluno usou o tutor) -- nunca o texto trocado.
    await createAdminClient().from("student_events").insert({ student_id: user.id, event_type: "tutor" });
    return NextResponse.json({ reply: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao gerar resposta do tutor.";
    const trace = await recordIncident({
      userId: user.id,
      source: "server",
      area: "aluno/tutor",
      action: "ai_reply",
      severity: "error",
      message,
    });
    return NextResponse.json(
      { error: `Não consegui responder agora. Tente de novo em instantes. Código: ${trace}` },
      { status: 502 },
    );
  }
}
