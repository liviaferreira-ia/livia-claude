import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSONS } from "@/data/lesson";
import { SpeakButton } from "@/components/SpeakButton";
import { SaveWordButton } from "@/components/SaveWordButton";
import { ConcluirEtapa } from "@/components/ConcluirEtapa";

export default async function ExpressoesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = LESSONS[slug];
  if (!lesson) notFound();

  return (
    <div className="view" style={{ maxWidth: 680 }}>
      <div className="eyebrow" style={{ color: "var(--gold)" }}>
        Expressões
      </div>
      <h2 style={{ fontSize: 24, margin: "6px 0 4px" }}>{lesson.expressions.title}</h2>
      <p className="muted" style={{ margin: "0 0 16px" }}>
        {lesson.expressions.hint}
      </p>
      <div className="card" style={{ padding: "6px 20px" }}>
        {lesson.expressions.items.map((e) => (
          <div className="vrow" key={e.en}>
            <span className="vmain">
              <span className="ven" style={{ display: "block", fontSize: 16 }}>{e.en}</span>
              <span className="vpt" style={{ display: "block" }}>{e.pt}</span>
            </span>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <SpeakButton text={e.en} />
              <SaveWordButton en={e.en} pt={e.pt} source={`Lição · ${lesson.title}`} />
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <ConcluirEtapa slug={slug} id="expressoes" />
        <Link href={`/aluno/licao/${slug}`} className="btn ghost">
          Voltar
        </Link>
      </div>
    </div>
  );
}
