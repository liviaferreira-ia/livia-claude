"use client";

import Link from "next/link";
import { COURSES, resolveCourseLevel } from "@/data/curso";
import { levelBadge } from "@/data/placement";
import { parseCefrLevel, useProfile } from "@/lib/profile";

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
  const { profile, ready } = useProfile();
  const studentLevel = parseCefrLevel(profile.level) ?? "A2";
  const contentLevel = resolveCourseLevel(studentLevel);
  const course = COURSES[contentLevel];

  if (!ready) {
    return (
      <div className="view">
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="view" style={{ maxWidth: 760 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Meu curso
      </div>
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>Inglês · {levelBadge(contentLevel)}</h2>
      <p className="muted" style={{ margin: "0 0 6px" }}>
        Sua trilha de aprendizado. Conclua uma lição para desbloquear a próxima.
      </p>
      {contentLevel !== studentLevel && (
        <p className="muted" style={{ margin: "0 0 6px", fontSize: 13 }}>
          Ainda não temos trilha própria pro nível {studentLevel} — mostrando a de {contentLevel} por
          enquanto.
        </p>
      )}
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
