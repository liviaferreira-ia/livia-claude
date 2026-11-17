import { NextResponse } from "next/server";
import { A1_DRAFTS } from "@/data/a1Drafts";
import { requireStaff } from "@/lib/staff-server";
import { lessonRevision, loadLessonReviews } from "@/lib/lesson-reviews-server";
import { reviewStatus } from "@/lib/lesson-review-types";

export const dynamic = "force-dynamic";

/** Quantas aulas A1 ainda esperam decisão da professora (contador do menu no design v2). Só leitura, só equipe. */
export async function GET() {
  const session = await requireStaff();
  if (session.error) return session.error;
  try {
    const reviews = await loadLessonReviews();
    const byId = new Map(reviews.map((review) => [review.lesson_id, review]));
    const pending = A1_DRAFTS.filter((lesson) => reviewStatus(byId.get(lesson.id), lessonRevision(lesson)) !== "approved").length;
    return NextResponse.json({ pending }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Não foi possível contar as aulas pendentes." }, { status: 500 });
  }
}
