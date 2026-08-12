import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSONS } from "@/data/lesson";
import { SpeakButton } from "@/components/SpeakButton";
import { SaveWordButton } from "@/components/SaveWordButton";
import { ConcluirEtapa } from "@/components/ConcluirEtapa";

export default async function VocabularioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = LESSONS[slug];
  if (!lesson) notFound();

  return (
    <div className="view" style={{ maxWidth: 680 }}>
      <div className="eyebrow" style={{ color: "var(--gold)" }}>
        Vocabulário
      </div>
      <h2 style={{ fontSize: 24, margin: "6px 0 4px" }}>{lesson.vocab.title}</h2>
      <p className="muted" style={{ margin: "0 0 16px" }}>
        {lesson.vocab.hint}
      </p>
      <div className="card" style={{ padding: "6px 20px" }}>
        {lesson.vocab.items.map((v) => (
          <div className="vrow" key={v.en}>
            <span className="vmain">
              <span className="ven" style={{ display: "block" }}>{v.en}</span>
              <span className="vpt" style={{ display: "block" }}>{v.pt}</span>
            </span>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <SpeakButton text={v.en} />
              <SaveWordButton en={v.en} pt={v.pt} source={`Lição · ${lesson.title}`} />
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <ConcluirEtapa slug={slug} id="vocabulario" />
        <Link href={`/aluno/licao/${slug}`} className="btn ghost">
          Voltar
        </Link>
      </div>
    </div>
  );
}
