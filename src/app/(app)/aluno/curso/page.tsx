import Link from "next/link";

type LessonStatus = "done" | "now" | "locked";
type Lesson = { title: string; meta: string; status: LessonStatus; href?: string };
type UnitStatus = "done" | "current" | "locked";
type Unit = {
  n: number;
  title: string;
  objective: string;
  status: UnitStatus;
  pct: number;
  lessons: Lesson[];
};

const course: { level: string; pct: number; units: Unit[] } = {
  level: "Inglês · Nível A2",
  pct: 58,
  units: [
    {
      n: 1,
      title: "Apresentações",
      objective: "Cumprimentar, falar seu nome e de onde você é.",
      status: "done",
      pct: 100,
      lessons: [
        { title: "Olá e tchau", meta: "Vocabulário · 6 min", status: "done" },
        { title: "Verbo to be", meta: "Gramática · 9 min", status: "done" },
        { title: "Diga de onde você é", meta: "Conversa · 7 min", status: "done" },
      ],
    },
    {
      n: 2,
      title: "Rotina diária",
      objective: "Falar sobre horários e atividades do dia a dia.",
      status: "done",
      pct: 100,
      lessons: [
        { title: "Present simple", meta: "Gramática · 10 min", status: "done" },
        { title: "Que horas são?", meta: "Vocabulário · 7 min", status: "done" },
        { title: "Minha rotina", meta: "Escrita · 8 min", status: "done" },
      ],
    },
    {
      n: 3,
      title: "No hotel",
      objective: "Reservar, fazer check-in e pedir informações.",
      status: "current",
      pct: 40,
      lessons: [
        { title: "Vocabulário do hotel", meta: "Vocabulário · 8 min", status: "done" },
        {
          title: "Reservas e check-in",
          meta: "Gramática + prática · 10 min",
          status: "now",
          href: "/aluno/licao",
        },
        { title: "Pedindo informações", meta: "Conversa · 8 min", status: "locked" },
        { title: "Roleplay: check-in", meta: "Voz · 5 min", status: "locked" },
      ],
    },
    {
      n: 4,
      title: "No restaurante",
      objective: "Pedir comida, tirar dúvidas e pagar a conta.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Vocabulário de comida", meta: "Vocabulário · 8 min", status: "locked" },
        { title: "Fazendo um pedido", meta: "Conversa · 9 min", status: "locked" },
        { title: "Roleplay: no restaurante", meta: "Voz · 5 min", status: "locked" },
      ],
    },
  ],
};

const icons = {
  done: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  now: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="6" />
    </svg>
  ),
  locked: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  ),
};

export default function CursoPage() {
  return (
    <div className="view" style={{ maxWidth: 760 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Meu curso
      </div>
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>{course.level}</h2>
      <p className="muted" style={{ margin: "0 0 6px" }}>
        Sua trilha de aprendizado. Conclua uma lição para desbloquear a próxima.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0 22px" }}>
        <div style={{ flex: 1, maxWidth: 320 }} className="unit-bar">
          <i style={{ width: `${course.pct}%` }} />
        </div>
        <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
          {course.pct}% do nível
        </span>
      </div>

      <div className="trilha">
        {course.units.map((unit) => {
          const tint =
            unit.status === "done"
              ? "tint-navy"
              : unit.status === "current"
                ? "tint-gold"
                : "";
          return (
            <div key={unit.n} className={`card unit${unit.status === "locked" ? " locked" : ""}`}>
              <div className="unit-head">
                <span
                  className={`unit-num ${tint}`}
                  style={unit.status === "locked" ? { background: "var(--panel-2)", color: "var(--ink-faint)" } : undefined}
                >
                  {unit.n}
                </span>
                <div className="unit-title">
                  <h3>{unit.title}</h3>
                  <p>{unit.objective}</p>
                </div>
                <span className="unit-pct">
                  {unit.status === "locked"
                    ? "Bloqueada"
                    : unit.status === "done"
                      ? "Concluída ✓"
                      : `${unit.pct}%`}
                </span>
              </div>

              {unit.status !== "locked" && (
                <div className="unit-bar">
                  <i style={{ width: `${unit.pct}%` }} />
                </div>
              )}

              <div style={{ marginTop: 6 }}>
                {unit.lessons.map((lesson, k) => {
                  const clickable = lesson.status === "now" && lesson.href;
                  const inner = (
                    <>
                      <span className={`lesson-ic ${lesson.status}`}>{icons[lesson.status]}</span>
                      <span className="lesson-info">
                        <b>{lesson.title}</b>
                        <span>{lesson.meta}</span>
                      </span>
                      {lesson.status === "now" && <span className="lesson-cta">Continuar →</span>}
                    </>
                  );
                  return clickable ? (
                    <Link key={k} href={lesson.href!} className="lesson-row clickable">
                      {inner}
                    </Link>
                  ) : (
                    <div key={k} className="lesson-row">
                      {inner}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
