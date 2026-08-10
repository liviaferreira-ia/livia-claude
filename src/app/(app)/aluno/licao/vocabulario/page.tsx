import Link from "next/link";
import { LESSON } from "@/data/lesson";
import { SpeakButton } from "@/components/SpeakButton";
import { ConcluirEtapa } from "@/components/ConcluirEtapa";

export default function VocabularioPage() {
  return (
    <div className="view" style={{ maxWidth: 680 }}>
      <div className="eyebrow" style={{ color: "var(--gold)" }}>
        Vocabulário
      </div>
      <h2 style={{ fontSize: 24, margin: "6px 0 4px" }}>Palavras do hotel</h2>
      <p className="muted" style={{ margin: "0 0 16px" }}>
        Toque em “Ouvir” para escutar a pronúncia de cada palavra.
      </p>
      <div className="card" style={{ padding: "6px 20px" }}>
        {LESSON.vocab.map((v) => (
          <div className="vrow" key={v.en}>
            <span className="vmain">
              <span className="ven" style={{ display: "block" }}>{v.en}</span>
              <span className="vpt" style={{ display: "block" }}>{v.pt}</span>
            </span>
            <SpeakButton text={v.en} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <ConcluirEtapa id="vocabulario" />
        <Link href="/aluno/licao" className="btn ghost">
          Voltar
        </Link>
      </div>
    </div>
  );
}
