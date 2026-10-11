import Link from "next/link";
import { LessonVideo } from "@/components/LessonVideo";
import type { A1_DRAFTS } from "@/data/a1Drafts";

type Draft = (typeof A1_DRAFTS)[number];
export function DraftLessonReview({ lesson }: { lesson: Draft }) {
  return <div className="view" style={{ maxWidth: 800 }}>
    <div className="eyebrow">A1 · Unidade {lesson.unitNumber} · Aula {lesson.number} · Revisão da Livia</div>
    <h2>{lesson.title}</h2>
    <p className="muted">Material produzido, aguardando validação pedagógica. Esta página não altera o progresso dos alunos.</p>
    <section className="card" style={{ padding: 20 }}>
      <h3>Objetivo</h3><p>{lesson.objective}</p><p>{lesson.situation}</p>
      <p>Tempo sugerido: {lesson.minutes} minutos. {lesson.prerequisite}</p>
    </section>
    <LessonVideo mode="dialogue" media={lesson.media} />
    <section className="card" style={{ padding: 20, marginTop: 20 }}>
      <h3>Explicação das frases</h3>
      {lesson.explanation.map((part, i) => <div key={i}>
        <h4>{part.title}</h4>{part.phrases.map((phrase, j) => <p lang="en" key={j}>{phrase}</p>)}<p>{part.text}</p>
      </div>)}
      <p><b>Atenção:</b> {lesson.commonMistake}</p>
      <h3>Exercícios e gabarito</h3>
      {lesson.questions.map((question, i) => <div key={i} style={{ marginBottom: 24 }}>
        <p><b>{i + 1}. {question.prompt}</b></p>
        {question.options && <ol type="a">{question.options.map((option, j) => <li key={j}>{option}</li>)}</ol>}
        <details><summary>Ver resposta e orientação</summary>
          <p><b>Resposta:</b> {question.options ? question.options[Number(question.answer)] : question.answer}</p>
          <p>{question.feedback}</p><p>{question.hint}</p>
        </details>
      </div>)}
    </section>
    <LessonVideo mode="practice" media={lesson.media} />
    <section className="card" style={{ padding: 20, marginTop: 20 }}>
      <h3>Apoio para a prática oral</h3>
      {lesson.practice.map((line, i) => <p key={i}><b lang="en">{line.en}</b><br />{line.pt}<br />{line.hint}</p>)}
      <h3>Aplicação pessoal</h3><p>{lesson.application}</p>
      <details><summary>Ver modelo</summary><p style={{ whiteSpace: "pre-wrap" }}>{lesson.model}</p></details>
      <h3>Autoavaliação</h3><ul>{lesson.checklist.map((item, i) => <li key={i}>{item}</li>)}</ul>
      <h3>Revisão no dia seguinte</h3><p>{lesson.review}</p><p>{lesson.next}</p>
    </section>
    <Link className="btn ghost" style={{ marginTop: 20 }} href="/professor/aulas">← Todas as aulas</Link>
  </div>;
}
