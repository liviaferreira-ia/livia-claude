import "server-only";
import { A1_DRAFTS } from "@/data/a1Drafts";
import { FIRST_LESSON_MEDIA } from "@/data/lessonMedia";
import { createClient } from "@/lib/supabase/server";
import { publishedLessons } from "@/lib/lesson-reviews-server";
import type { CourseItem } from "@/lib/video-course-types";

/** Conclusão das aulas em vídeo (supabase-setup-25): section_id gravado por mark_video_lesson. */
export const VIDEO_DONE_SECTION = "aula-concluida";
const PILOT_ID = FIRST_LESSON_MEDIA.slug;

/**
 * Sequência das aulas publicadas para o aluno (piloto + A1 aprovadas, na ordem do curso),
 * com o que ele já concluiu. Regra pedida pelo Fabio em 17/11/2026: só avança depois de
 * concluir a anterior. A equipe vê tudo aberto (para revisar), mas enxerga o cadeado dos alunos.
 * Se a consulta de conclusões falhar, nada é marcado como concluído (falha fechada).
 */
export async function loadVideoCourse(): Promise<{ items: CourseItem[]; isStaff: boolean }> {
  const lessons = await publishedLessons();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isStaff = false;
  const done = new Set<string>();
  if (user) {
    const [{ data: profile }, { data: rows }] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
      supabase.from("student_lesson_progress").select("lesson_slug,section_id").eq("student_id", user.id),
    ]);
    isStaff = profile?.role === "teacher" || profile?.role === "admin";
    for (const row of rows ?? []) {
      if (row.section_id === VIDEO_DONE_SECTION) done.add(row.lesson_slug);
      // A aula piloto usa o fluxo antigo: conta como concluída quando a tarefa final foi feita.
      if (row.lesson_slug === PILOT_ID && row.section_id === "exercicios") done.add(PILOT_ID);
    }
  }
  const unit1 = A1_DRAFTS.find((item) => item.unitNumber === 1)?.unit ?? "";
  const sequence = [
    { id: PILOT_ID, unitNumber: 1, unit: unit1, number: 1, title: "Primeiro encontro", objective: "Aprenda a cumprimentar alguém e dizer seu nome.",
      minutes: "", href: "/aluno/licao/apresentando-se/intro", poster: `${FIRST_LESSON_MEDIA.base}/poster.png` },
    ...[...lessons].sort((a, b) => a.unitNumber - b.unitNumber || a.number - b.number).map((lesson) => ({
      id: lesson.id, unitNumber: lesson.unitNumber, unit: lesson.unit, number: lesson.number, title: lesson.title, objective: lesson.objective,
      minutes: lesson.minutes, href: `/aluno/aulas/${lesson.id}`, poster: `/aluno/aulas/midia/${lesson.id}/poster.png`,
    })),
  ];
  const items: CourseItem[] = sequence.map((lesson, index) => {
    const lockedForStudents = index > 0 && !done.has(sequence[index - 1].id);
    return { ...lesson, done: done.has(lesson.id), lockedForStudents, open: !lockedForStudents || isStaff };
  });
  return { items, isStaff };
}
