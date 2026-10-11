import Link from "next/link";
import { LESSONS } from "@/data/lesson";
import { A1_DRAFTS } from "@/data/a1Drafts";

export const dynamic = "force-dynamic";

export default function TeacherLessonsPage() {
  return <div className="view" style={{ maxWidth: 760 }}>
    <div className="eyebrow">Validação pedagógica</div>
    <h2>Aulas para revisar</h2>
    <p className="muted">Abra qualquer aula para conferir o conteúdo completo, os vídeos disponíveis e o gabarito.</p>
    <h3>Curso A1 com avatares · 50 aulas</h3>
    <p>Primeiro encontro já disponível aos alunos. As outras 49 aulas aguardam sua validação.</p>
    <nav aria-label="Unidades A1" style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "20px 0" }}>
      {Array.from({ length: 12 }, (_, index) => index + 1).map((unit) => <a key={unit} href={`#unidade-${unit}`}>Unidade {unit}</a>)}
    </nav>
    {Array.from({ length: 12 }, (_, index) => index + 1).map((unit) => <section id={`unidade-${unit}`} key={unit} style={{ margin: "28px 0" }}>
      <h3>Unidade {unit} · {A1_DRAFTS.find((item) => item.unitNumber === unit)?.unit}</h3>
      {unit === 1 && <p><Link href="/professor/aulas/apresentando-se">01 · Primeiro encontro — publicada</Link></p>}
      {A1_DRAFTS.filter((item) => item.unitNumber === unit).map((lesson) => <div className="card" key={lesson.id} style={{ padding: 20, margin: "12px 0" }}>
        <h4>{String(lesson.number).padStart(2, "0")} · {lesson.title}</h4>
        <p>{lesson.objective}</p><p className="muted">2 vídeos · 5 exercícios · Pendente de validação</p>
        <Link className="btn ghost" href={`/professor/aulas/${lesson.id}`}>Revisar aula completa →</Link>
      </div>)}
    </section>)}
    <h3>Demais lições da plataforma</h3>
    {Object.values(LESSONS).map((lesson) => <section className="card" key={lesson.slug} style={{ padding: 20, margin: "14px 0" }}>
      <div className="eyebrow">{lesson.level} · {lesson.unit}</div>
      <h3>{lesson.title}</h3>
      <Link className="btn ghost" href={`/professor/aulas/${lesson.slug}`}>Revisar a aula →</Link>
    </section>)}
  </div>;
}
