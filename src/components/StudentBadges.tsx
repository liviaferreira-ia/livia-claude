/**
 * Conquistas do aluno. No design v2 elas saem da tela inicial (máximo de 6 blocos,
 * aprovado em 16/11/2026) e passam a ficar em "Meu progresso". Mesmas regras do visual atual.
 */
type Totals = { done: number; pct: number };
type Stats = { streak: number; lessonsCompleted: number };

export function studentBadges(totals: Totals, stats: Stats) {
  return [
    { emoji: "🌱", label: "Primeiro passo", got: totals.done >= 1, hint: "Faça 1 exercício" },
    { emoji: "📚", label: "Praticante", got: totals.done >= 10, hint: "Faça 10 exercícios" },
    { emoji: "🎯", label: "Pontaria", got: totals.done >= 5 && totals.pct >= 80, hint: "80% de acerto em 5+ exercícios" },
    { emoji: "🔥", label: "Chama acesa", got: stats.streak >= 3, hint: "3 dias seguidos" },
    { emoji: "🏅", label: "Dedicado", got: totals.done >= 30, hint: "Faça 30 exercícios" },
    { emoji: "🎓", label: "Primeira lição", got: stats.lessonsCompleted >= 1, hint: "Conclua 1 lição" },
  ];
}

export function StudentBadges({ totals, stats }: { totals: Totals; stats: Stats }) {
  const badges = studentBadges(totals, stats);
  return <section className="card" style={{ padding: 20, marginTop: 22 }} aria-label="Conquistas">
    <div className="sec-h" style={{ margin: "0 0 4px" }}>
      <h3>Conquistas</h3>
      <span className="muted">{badges.filter((b) => b.got).length} de {badges.length}</span>
    </div>
    <div className="badges">
      {badges.map((b) => <div key={b.label} className={`badge-item${b.got ? " got" : ""}`} title={b.hint}>
        <span className="badge-emoji">{b.got ? b.emoji : "🔒"}</span>
        <span className="badge-label">{b.label}</span>
      </div>)}
    </div>
  </section>;
}
