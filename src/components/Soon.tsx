type SoonProps = {
  title: string;
  desc: string;
};

/** Tela reservada para uma etapa futura do roadmap. */
export function Soon({ title, desc }: SoonProps) {
  return (
    <div className="view">
      <div className="eyebrow">Em construção</div>
      <h2 style={{ fontSize: 22, margin: "6px 0 6px" }}>{title}</h2>
      <p className="muted" style={{ maxWidth: 520, marginBottom: 18 }}>
        {desc}
      </p>
      <div
        className="card"
        style={{ padding: 28, textAlign: "center", color: "var(--ink-soft)" }}
      >
        🚧 Esta tela será construída nas próximas etapas. O desenho já está
        validado no protótipo.
      </div>
    </div>
  );
}
