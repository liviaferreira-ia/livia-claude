import { NextResponse } from "next/server";
import { A1_DRAFTS } from "@/data/a1Drafts";
import { requireStaff } from "@/lib/staff-server";
import { lessonRevision } from "@/lib/lesson-reviews-server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (session.error) return session.error;
  const { id } = await params;
  const lesson = A1_DRAFTS.find((item) => item.id === id);
  if (!lesson) return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body || !["approved", "rejected"].includes(body.status) || typeof body.revision !== "string"
      || !(body.expectedUpdatedAt === null || typeof body.expectedUpdatedAt === "string")
      || (typeof body.expectedUpdatedAt === "string" && Number.isNaN(Date.parse(body.expectedUpdatedAt)))
      || (body.note !== undefined && typeof body.note !== "string")) {
    return NextResponse.json({ error: "Dados de revisão inválidos." }, { status: 400 });
  }
  const note = (body.note ?? "").trim();
  if (note.length > 2000 || (body.status === "rejected" && !note)) {
    return NextResponse.json({ error: "Explique o que precisa ser corrigido, usando até 2.000 caracteres." }, { status: 400 });
  }
  const revision = lessonRevision(lesson);
  if (body.revision !== revision) return NextResponse.json({ error: "O conteúdo desta aula mudou. Atualize a página e revise a nova versão." }, { status: 409 });
  const { data, error } = await session.supabase.rpc("review_lesson", {
    p_lesson_id: id, p_revision: revision, p_status: body.status,
    p_note: body.status === "rejected" ? note : null, p_expected_updated_at: body.expectedUpdatedAt,
  });
  if (error) return NextResponse.json({ error: error.code === "40001" ? "Outra decisão foi salva. Atualize a página antes de continuar." : "Não consegui salvar a decisão. Tente novamente." }, { status: error.code === "40001" ? 409 : 500 });
  const review = Array.isArray(data) ? data[0] : data;
  if (!review) return NextResponse.json({ error: "Não consegui confirmar a decisão salva. Atualize a página." }, { status: 500 });
  return NextResponse.json({ review }, { headers: { "Cache-Control": "private, no-store" } });
}
