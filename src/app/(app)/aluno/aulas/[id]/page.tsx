import { notFound, redirect } from "next/navigation";
import { A1_DRAFTS } from "@/data/a1Drafts";
import { isLessonPublished } from "@/lib/lesson-reviews-server";
import { DraftLessonReview } from "@/components/DraftLessonReview";
import { loadVideoCourse } from "@/lib/video-course-server";
import { DESIGN_V2_PARA_TODOS } from "@/lib/design";
import type { LessonOutline } from "@/lib/video-course-types";
export const dynamic = "force-dynamic";
export default async function PublishedLesson({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = A1_DRAFTS.find((item) => item.id === id);
  if (!lesson || !await isLessonPublished(lesson)) notFound();
  // Design v2: painel de aulas e desbloqueio em sequência (pedido do Fabio em 17/11/2026).
  const course = await loadVideoCourse();
  const current = course.items.find((item) => item.id === id);
  // Quando o visual novo valer para todos, aula trancada não abre nem pelo endereço direto.
  if (DESIGN_V2_PARA_TODOS && current && !current.open) redirect("/aluno/aulas");
  const done = course.items.filter((item) => item.done).length;
  const outline: LessonOutline = {
    mode: "student", currentId: id, progressLabel: "Meu progresso",
    doneLabel: `${done} de ${course.items.length} aulas concluídas`, items: course.items,
    breadcrumb: [{ label: "Aulas em vídeo", href: "/aluno/aulas" }, { label: `Unidade ${lesson.unitNumber}` }, { label: `Aula ${lesson.number}` }],
  };
  return <DraftLessonReview student outline={outline} lesson={{ ...lesson, media: { ...lesson.media, base: `/aluno/aulas/midia/${id}` } }} />;
}
