import Link from "next/link";
import { publishedLessons } from "@/lib/lesson-reviews-server";
export const dynamic = "force-dynamic";
export default async function StudentVideoLessons() {
  const lessons = await publishedLessons();
  return <div className="view" style={{ maxWidth: 760 }}>
    <div className="eyebrow">Inglês A1 com Livia e Fabio</div><h2>Aulas em vídeo</h2>
    <p>Aprenda com conversas em inglês, legendas em português e prática guiada.</p>
    <section className="card" style={{ padding: 20, margin: "16px 0" }}><h3>Unidade 1 · Primeiro encontro</h3>
      <p>Aprenda a cumprimentar alguém e dizer seu nome.</p><Link className="btn light" href="/aluno/licao/apresentando-se/intro">Começar aula →</Link>
    </section>
    {lessons.map((lesson) => <section key={lesson.id} className="card" style={{ padding: 20, margin: "16px 0" }}>
      <div className="eyebrow">Unidade {lesson.unitNumber} · Aula {lesson.number}</div>
      <h3>{lesson.title}</h3><p>{lesson.objective}</p><p className="muted">{lesson.minutes} minutos · 2 vídeos</p>
      <Link className="btn light" href={`/aluno/aulas/${lesson.id}`}>Começar aula →</Link>
    </section>)}
  </div>;
}
