import { notFound } from "next/navigation";
import { A1_DRAFTS } from "@/data/a1Drafts";
import { isLessonPublished } from "@/lib/lesson-reviews-server";
import { DraftLessonReview } from "@/components/DraftLessonReview";
export const dynamic = "force-dynamic";
export default async function PublishedLesson({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = A1_DRAFTS.find((item) => item.id === id);
  if (!lesson || !await isLessonPublished(lesson)) notFound();
  return <DraftLessonReview student lesson={{ ...lesson, media: { ...lesson.media, base: `/aluno/aulas/midia/${id}` } }} />;
}
