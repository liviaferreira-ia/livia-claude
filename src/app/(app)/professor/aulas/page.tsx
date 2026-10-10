import Link from "next/link";
import { LESSONS } from "@/data/lesson";

export default function TeacherLessonsPage() {
  return <div className="view" style={{ maxWidth: 760 }}>
    <div className="eyebrow">Validação pedagógica</div>
    <h2>Aulas para revisar</h2>
    <p className="muted">Abra qualquer aula para conferir o conteúdo completo, os vídeos disponíveis e o gabarito.</p>
    {Object.values(LESSONS).map((lesson) => <section className="card" key={lesson.slug} style={{ padding: 20, margin: "14px 0" }}>
      <div className="eyebrow">{lesson.level} · {lesson.unit}</div>
      <h3>{lesson.title}</h3>
      <Link className="btn ghost" href={`/professor/aulas/${lesson.slug}`}>Revisar a aula →</Link>
    </section>)}
  </div>;
}
