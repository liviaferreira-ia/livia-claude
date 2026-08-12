import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSONS } from "@/data/lesson";
import { ConcluirEtapa } from "@/components/ConcluirEtapa";

export default async function IntroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = LESSONS[slug];
  if (!lesson) notFound();

  return (
    <div className="view" style={{ maxWidth: 680 }}>
      <div className="eyebrow" style={{ color: "var(--gold)" }}>
        Introdução
      </div>
      <h2 style={{ fontSize: 24, margin: "6px 0 14px" }}>{lesson.title}</h2>
      <div className="card" style={{ padding: 26 }}>
        <p style={{ fontSize: 16, lineHeight: 1.7, margin: 0 }}>{lesson.intro}</p>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <ConcluirEtapa slug={slug} id="intro" label="Entendi, vamos lá →" />
        <Link href={`/aluno/licao/${slug}`} className="btn ghost">
          Voltar
        </Link>
      </div>
    </div>
  );
}
