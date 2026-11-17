import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSONS } from "@/data/lesson";
import { FIRST_LESSON_MEDIA } from "@/data/lessonMedia";
import { LessonVideo } from "@/components/LessonVideo";
import { A1_DRAFTS } from "@/data/a1Drafts";
import { DraftLessonReview } from "@/components/DraftLessonReview";
import { lessonRevision, loadLessonReviews } from "@/lib/lesson-reviews-server";
import { reviewStatus } from "@/lib/lesson-review-types";
import type { CourseItem, LessonOutline } from "@/lib/video-course-types";

export default async function TeacherLessonReview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const draft = A1_DRAFTS.find((item) => item.id === slug);
  if (draft) {
    const reviews = await loadLessonReviews();
    // Design v2: painel com as aulas do curso e a situação de revisão, para seguir revisando em ordem.
    const byId = new Map(reviews.map((review) => [review.lesson_id, review]));
    const items: CourseItem[] = [
      { id: FIRST_LESSON_MEDIA.slug, unitNumber: 1, unit: A1_DRAFTS.find((item) => item.unitNumber === 1)?.unit ?? "", number: 1, title: "Primeiro encontro",
        objective: "", minutes: "", href: `/professor/aulas/${FIRST_LESSON_MEDIA.slug}`, poster: "", done: true, lockedForStudents: false, open: true },
      ...[...A1_DRAFTS].sort((a, b) => a.unitNumber - b.unitNumber || a.number - b.number).map((item) => ({
        id: item.id, unitNumber: item.unitNumber, unit: item.unit, number: item.number, title: item.title, objective: item.objective,
        minutes: item.minutes, href: `/professor/aulas/${item.id}`, poster: "",
        done: reviewStatus(byId.get(item.id), lessonRevision(item)) === "approved", lockedForStudents: false, open: true,
      })),
    ];
    const outline: LessonOutline = {
      mode: "teacher", currentId: slug, progressLabel: "Revisão do curso",
      doneLabel: `${items.filter((item) => item.done).length} de ${items.length} aprovadas`, items,
      breadcrumb: [{ label: "Aulas para revisar", href: "/professor/aulas" }, { label: `Unidade ${draft.unitNumber}` }, { label: `Aula ${draft.number}` }],
    };
    return <DraftLessonReview lesson={draft} revision={lessonRevision(draft)} review={byId.get(slug) ?? null} outline={outline} />;
  }
  const lesson = LESSONS[slug];
  if (!lesson) notFound();
  return <div className="view" style={{ maxWidth: 760 }}>
    <div className="eyebrow">Revisão da professora · {lesson.level}</div>
    <h2>{lesson.title}</h2>
    <p className="muted">Confira a aula completa. Esta revisão não registra conclusão nem altera o progresso dos alunos.</p>
    <section className="card" style={{ padding: 20 }}><h3>Introdução</h3><p>{lesson.intro}</p></section>
    {slug === FIRST_LESSON_MEDIA.slug && <LessonVideo mode="dialogue" />}
    <section className="card" style={{ padding: 20, marginTop: 20 }}>
      <h3>{lesson.vocab.title}</h3>
      {lesson.vocab.items.map((item) => <p key={item.en}><span lang="en">{item.en}</span> — {item.pt}</p>)}
      <h3>{lesson.listening.title}</h3>
      {lesson.listening.lines.map((line, index) => <p key={index}><b>{line.who}:</b> <span lang="en">{line.en}</span><br />{line.pt}</p>)}
      <h3>{lesson.expressions.title}</h3>
      {lesson.expressions.items.map((item) => <p key={item.en}><span lang="en">{item.en}</span> — {item.pt}</p>)}
    </section>
    {slug === FIRST_LESSON_MEDIA.slug && <LessonVideo mode="practice" />}
    <section className="card" style={{ padding: 20, marginTop: 20 }}>
      <h3>Exercícios e gabarito</h3>
      {lesson.exercises.questions.map((question, index) => <div key={index} style={{ marginBottom: 22 }}>
        <p><b>{index + 1}. {question.prompt}</b></p>
        <p className="muted">{question.hint}</p>
        {question.kind === "mc" && <ol type="a">{question.options.map((option, i) => <li key={i}>{option}</li>)}</ol>}
        <details><summary>Ver resposta e orientação</summary>
          <p><b>Resposta:</b> {question.kind === "mc" ? question.options[question.answer] : question.answers.join(" / ")}</p>
          <p>{question.feedbackOk}</p><p>{question.feedbackNo}</p>
        </details>
      </div>)}
    </section>
    <Link className="btn ghost" style={{ marginTop: 20 }} href="/professor/aulas">← Todas as aulas</Link>
  </div>;
}
