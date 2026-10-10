import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSONS } from "@/data/lesson";
import { FIRST_LESSON_MEDIA } from "@/data/lessonMedia";
import { LessonVideo } from "@/components/LessonVideo";

export default async function TeacherLessonReview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
