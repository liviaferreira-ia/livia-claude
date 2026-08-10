import Link from "next/link";
import { LESSON } from "@/data/lesson";
import { ConcluirEtapa } from "@/components/ConcluirEtapa";

export default function IntroPage() {
  return (
    <div className="view" style={{ maxWidth: 680 }}>
      <div className="eyebrow" style={{ color: "var(--gold)" }}>
        Introdução
      </div>
      <h2 style={{ fontSize: 24, margin: "6px 0 14px" }}>{LESSON.title}</h2>
      <div className="card" style={{ padding: 26 }}>
        <p style={{ fontSize: 16, lineHeight: 1.7, margin: 0 }}>{LESSON.intro}</p>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <ConcluirEtapa id="intro" label="Entendi, vamos lá →" />
        <Link href="/aluno/licao" className="btn ghost">
          Voltar
        </Link>
      </div>
    </div>
  );
}
