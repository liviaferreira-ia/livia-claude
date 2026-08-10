import Link from "next/link";
import { LESSON } from "@/data/lesson";
import { SpeakButton } from "@/components/SpeakButton";
import { ConcluirEtapa } from "@/components/ConcluirEtapa";

export default function ExpressoesPage() {
  return (
    <div className="view" style={{ maxWidth: 680 }}>
      <div className="eyebrow" style={{ color: "var(--gold)" }}>
        Expressões
      </div>
      <h2 style={{ fontSize: 24, margin: "6px 0 4px" }}>Fazendo o check-in</h2>
      <p className="muted" style={{ margin: "0 0 16px" }}>
        Frases úteis para usar no hotel. Toque em “Ouvir” e repita em voz alta.
      </p>
      <div className="card" style={{ padding: "6px 20px" }}>
        {LESSON.expressions.map((e) => (
          <div className="vrow" key={e.en}>
            <span className="vmain">
              <span className="ven" style={{ display: "block", fontSize: 16 }}>{e.en}</span>
              <span className="vpt" style={{ display: "block" }}>{e.pt}</span>
            </span>
            <SpeakButton text={e.en} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <ConcluirEtapa id="expressoes" />
        <Link href="/aluno/licao" className="btn ghost">
          Voltar
        </Link>
      </div>
    </div>
  );
}
