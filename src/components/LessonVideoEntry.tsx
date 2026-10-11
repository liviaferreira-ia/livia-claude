import Image from "next/image";
import Link from "next/link";
import { FIRST_LESSON_MEDIA } from "@/data/lessonMedia";

export function LessonVideoEntry({ review = false }: { review?: boolean }) {
  return (
    <section className="card" aria-label="Aulas em vídeo" style={{ padding: 20, margin: "18px 0", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
      <Image src={`${FIRST_LESSON_MEDIA.base}/poster.png`} alt="Livia e Fabio na sala de aula" width={224} height={126} unoptimized style={{ borderRadius: 10, maxWidth: "100%", height: "auto" }} />
      <div style={{ flex: "1 1 220px", minWidth: 0 }}>
        <div className="eyebrow" style={{ color: "var(--gold)" }}>Aulas em vídeo</div>
        <h3 style={{ margin: "6px 0 8px" }}>{review ? "Curso A1 · 50 aulas em 12 unidades" : "A1 · Primeiro encontro"}</h3>
        <p className="muted" style={{ margin: "0 0 14px" }}>{review ? "Confira todas as aulas com Livia e Fabio: vídeos em inglês, legendas em português, explicações, exercícios e gabaritos. Aprove para publicar ou solicite as correções necessárias." : "Assista às conversas com Livia e Fabio em inglês, com legendas em português. Depois, participe dos vídeos “Sua vez”."}</p>
        <Link href={review ? "/professor/aulas" : `/aluno/licao/${FIRST_LESSON_MEDIA.slug}/intro`} className="btn light">{review ? "Abrir as 50 aulas para revisar →" : "Assistir à aula →"}</Link>
        {!review && <p style={{ margin: "12px 0 0" }}><Link href="/aluno/aulas">Ver todas as aulas em vídeo →</Link></p>}
      </div>
    </section>
  );
}
