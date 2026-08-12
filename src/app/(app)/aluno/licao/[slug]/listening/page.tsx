import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSONS } from "@/data/lesson";
import { SpeakButton } from "@/components/SpeakButton";
import { ConcluirEtapa } from "@/components/ConcluirEtapa";

export default async function ListeningPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = LESSONS[slug];
  if (!lesson) notFound();

  const fullText = lesson.listening.lines.map((l) => l.en).join(" ");

  return (
    <div className="view" style={{ maxWidth: 680 }}>
      <div className="eyebrow" style={{ color: "var(--gold)" }}>
        Listening
      </div>
      <h2 style={{ fontSize: 24, margin: "6px 0 4px" }}>{lesson.listening.title}</h2>
      <p className="muted" style={{ margin: "0 0 14px" }}>
        {lesson.listening.hint}
      </p>
      <div style={{ marginBottom: 14 }}>
        <SpeakButton text={fullText} label="▶ Ouvir a conversa toda" />
      </div>
      <div className="card" style={{ padding: "6px 20px" }}>
        {lesson.listening.lines.map((line, i) => (
          <div className="vrow" key={i}>
            <span className="vmain">
              <span className="ven" style={{ display: "block", fontSize: 15.5 }}>
                <span style={{ color: "var(--gold)" }}>{line.who}:</span> {line.en}
              </span>
              <span className="vpt" style={{ display: "block" }}>{line.pt}</span>
            </span>
            <SpeakButton text={line.en} label="Ouvir" />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <ConcluirEtapa slug={slug} id="listening" />
        <Link href={`/aluno/licao/${slug}`} className="btn ghost">
          Voltar
        </Link>
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
        A voz usa o recurso gratuito do navegador. Futuramente entra áudio/vídeo gravado.
      </p>
    </div>
  );
}
