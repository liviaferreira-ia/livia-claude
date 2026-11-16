import Link from "next/link";
import { LESSONS } from "@/data/lesson";
import { A1_DRAFTS } from "@/data/a1Drafts";
import { lessonRevision, loadLessonReviews } from "@/lib/lesson-reviews-server";
import { REVIEW_LABELS, reviewStatus } from "@/lib/lesson-review-types";

export const dynamic = "force-dynamic";

export default async function TeacherLessonsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const showApproved = (await searchParams).status === "aprovadas";
  const reviews = await loadLessonReviews();
  const reviewsById = new Map(reviews.map((review) => [review.lesson_id, review]));
  const statuses = new Map(A1_DRAFTS.map((lesson) => [lesson.id, reviewStatus(reviewsById.get(lesson.id), lessonRevision(lesson))]));
  const approved = [...statuses.values()].filter((status) => status === "approved").length;
  const pending = A1_DRAFTS.length - approved;
  const visibleLessons = A1_DRAFTS.filter((lesson) => (statuses.get(lesson.id) === "approved") === showApproved);
  const units = [...new Set([...(showApproved ? [1] : []), ...visibleLessons.map((lesson) => lesson.unitNumber)])].sort((a, b) => a - b);
  return <div className="view" style={{ maxWidth: 760 }}>
    <div className="eyebrow">Validação pedagógica</div>
    <h2>{showApproved ? "Aulas aprovadas" : "Aulas para revisar"}</h2>
    <p className="muted">{showApproved
      ? "Consulte as aulas já publicadas. Se precisar solicitar uma correção, abra a aula e registre a nova decisão."
      : "Esta lista mostra apenas o que ainda precisa de revisão. Ao aprovar uma aula, ela sai das pendentes e fica em Aprovadas."}</p>
    <nav aria-label="Situação das aulas" style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "20px 0" }}>
      <Link className={`btn ${showApproved ? "ghost" : "primary"}`} href="/professor/aulas" prefetch={false} aria-current={!showApproved ? "page" : undefined}>Pendentes ({pending})</Link>
      <Link className={`btn ${showApproved ? "primary" : "ghost"}`} href="/professor/aulas?status=aprovadas" prefetch={false} aria-current={showApproved ? "page" : undefined}>Aprovadas ({approved + 1})</Link>
    </nav>
    <h3>Curso A1 com avatares · {A1_DRAFTS.length + 1} aulas</h3>
    <p>{showApproved ? `${approved + 1} aulas publicadas, incluindo Primeiro encontro.` : `${pending} aulas aguardando revisão ou correção.`}</p>
    {!showApproved && <p className="muted">Aulas reprovadas e versões alteradas continuam aqui até uma nova aprovação.</p>}
    {!showApproved && pending === 0 && <section className="card" role="status" style={{ padding: 20, margin: "20px 0" }}>
      <h3>Nenhuma aula pendente</h3><p>Todas as aulas A1 desta lista foram aprovadas. Você pode consultá-las em Aprovadas.</p>
    </section>}
    {units.length > 0 && <nav aria-label="Unidades A1" style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "20px 0" }}>
      {units.map((unit) => <a key={unit} href={`#unidade-${unit}`}>Unidade {unit}</a>)}
    </nav>}
    {units.map((unit) => <section id={`unidade-${unit}`} key={unit} style={{ margin: "28px 0" }}>
      <h3>Unidade {unit} · {A1_DRAFTS.find((item) => item.unitNumber === unit)?.unit}</h3>
      {showApproved && unit === 1 && <p><Link href="/professor/aulas/apresentando-se" prefetch={false}>01 · Primeiro encontro — publicada</Link></p>}
      {visibleLessons.filter((item) => item.unitNumber === unit).map((lesson) => <div className="card" key={lesson.id} style={{ padding: 20, margin: "12px 0" }}>
        <h4>{String(lesson.number).padStart(2, "0")} · {lesson.title}</h4>
        <p>{lesson.objective}</p><p className="muted">2 vídeos · 5 exercícios · {REVIEW_LABELS[statuses.get(lesson.id) ?? "pending"]}</p>
        {reviewsById.get(lesson.id)?.note && <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}><b>Correção:</b> {reviewsById.get(lesson.id)?.note}</p>}
        <Link className="btn ghost" href={`/professor/aulas/${lesson.id}`} prefetch={false}>{showApproved ? "Consultar aula →" : "Revisar aula completa →"}</Link>
      </div>)}
    </section>)}
    <details style={{ marginTop: 32 }}>
      <summary>Consultar demais lições da plataforma</summary>
      <p className="muted">Conteúdo anterior da plataforma, separado da fila de aprovação das novas aulas A1.</p>
      {Object.values(LESSONS).filter((lesson) => lesson.slug !== "apresentando-se").map((lesson) => <section className="card" key={lesson.slug} style={{ padding: 20, margin: "14px 0" }}>
        <div className="eyebrow">{lesson.level} · {lesson.unit}</div>
        <h3>{lesson.title}</h3>
        <Link className="btn ghost" href={`/professor/aulas/${lesson.slug}`} prefetch={false}>Consultar a aula →</Link>
      </section>)}
    </details>
  </div>;
}
