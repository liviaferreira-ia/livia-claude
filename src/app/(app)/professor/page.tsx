import Link from "next/link";

type Student = {
  href: string;
  initials: string;
  color: string;
  name: string;
  meta: string;
  flag: string;
  flagClass: "att" | "ok";
  progress: string;
};

const students: Student[] = [
  {
    href: "/professor/marina",
    initials: "MS",
    color: "linear-gradient(135deg,#c1962f,#8f6a1e)",
    name: "Marina Souza",
    meta: "Estudou hoje · A2",
    flag: "Pronúncia fraca",
    flagClass: "att",
    progress: "Unidade 3 · 62%",
  },
  {
    href: "/professor/marina",
    initials: "LR",
    color: "linear-gradient(135deg,#274a7d,#16263f)",
    name: "Lucas Ribeiro",
    meta: "Há 5 dias sem estudar · A2",
    flag: "Inativo 5 dias",
    flagClass: "att",
    progress: "Unidade 2 · 40%",
  },
  {
    href: "/professor/marina",
    initials: "AC",
    color: "linear-gradient(135deg,#41506a,#2a3547)",
    name: "Ana Costa",
    meta: "Estudou ontem · A2+",
    flag: "Em dia",
    flagClass: "ok",
    progress: "Unidade 4 · 88%",
  },
  {
    href: "/professor/marina",
    initials: "PM",
    color: "linear-gradient(135deg,#8a6a1f,#5f4712)",
    name: "Pedro Martins",
    meta: "Estudou hoje · A2",
    flag: "Gramática fraca",
    flagClass: "att",
    progress: "Unidade 3 · 55%",
  },
];

export default function ProfessorTurma() {
  return (
    <div className="view">
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Painel do professor
      </div>
      <h2 style={{ fontSize: 22, marginBottom: 4 }}>Turma A2 — Manhã</h2>
      <p className="muted" style={{ margin: "0 0 20px" }}>
        18 alunos · 3 precisam de atenção. A IA prepara o resumo; você decide o
        foco da aula.
      </p>
      <div className="card">
        {students.map((s, idx) => (
          <Link className="rosterrow" href={s.href} key={idx}>
            <div className="std">
              <span className="mini-av" style={{ background: s.color }}>
                {s.initials}
              </span>
              <div>
                <b style={{ fontSize: 14.5 }}>{s.name}</b>
                <div className="muted" style={{ fontSize: 12 }}>
                  {s.meta}
                </div>
              </div>
            </div>
            <div>
              <span className={`flag ${s.flagClass}`}>{s.flag}</span>
            </div>
            <div className="muted" style={{ fontSize: 13 }}>
              {s.progress}
            </div>
            <span className="btn ghost" style={{ padding: "8px 14px", fontSize: 13 }}>
              Ver aluno
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
