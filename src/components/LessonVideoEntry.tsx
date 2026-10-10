import Image from "next/image";
import Link from "next/link";
import { FIRST_LESSON_MEDIA } from "@/data/lessonMedia";

export function LessonVideoEntry({ review = false }: { review?: boolean }) {
  return (
    <section className="card" aria-label="Aulas em vídeo" style={{ padding: 20, margin: "18px 0", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
      <Image src={`${FIRST_LESSON_MEDIA.base}/poster.png`} alt="Livia e Fabio na sala de aula" width={224} height={126} unoptimized style={{ borderRadius: 10, maxWidth: "100%", height: "auto" }} />
      <div style={{ flex: "1 1 220px", minWidth: 0 }}>
        <div className="eyebrow" style={{ color: "var(--gold)" }}>Aulas em vídeo</div>
        <h3 style={{ margin: "6px 0 8px" }}>A1 · Primeiro encontro</h3>
        <p className="muted" style={{ margin: "0 0 14px" }}>Assista à conversa com Livia e Fabio em inglês, com legendas em português. Depois, participe do vídeo “Sua vez”.</p>
        <Link href={review ? `/professor/aulas/${FIRST_LESSON_MEDIA.slug}` : `/aluno/licao/${FIRST_LESSON_MEDIA.slug}/intro`} className="btn light">{review ? "Revisar a aula →" : "Assistir à aula →"}</Link>
      </div>
    </section>
  );
}
