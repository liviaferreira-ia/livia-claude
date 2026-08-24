"use client";

import Link from "next/link";
import { COURSES, LEARNING_CYCLE, resolveCourseLevel } from "@/data/curso";
import { levelBadge } from "@/data/placement";
import { parseCefrLevel, useProfile } from "@/lib/profile";
import styles from "./curso.module.css";

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
  const usesLearningCycle = course.units.some((unit) => unit.canDo?.length);

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
        Avance uma capacidade de cada vez. Você sempre verá o que vai aprender, praticar e conseguir fazer.
      </p>
      {contentLevel !== studentLevel && (
        <p className="muted" style={{ margin: "0 0 6px", fontSize: 13 }}>
          Ainda não temos trilha própria para o nível {studentLevel} — mostrando a de {contentLevel} por enquanto.
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

      {usesLearningCycle && (
        <section className={styles.cycle} aria-labelledby="learning-cycle-title">
          <div>
            <span className={styles.cycleEyebrow}>Como você aprende</span>
            <h3 id="learning-cycle-title">Um caminho simples até usar o inglês</h3>
          </div>
          <ol className={styles.cycleSteps}>
            {LEARNING_CYCLE.map((phase, index) => (
              <li key={phase.id}>
                <span>{index + 1}</span>
                {phase.label}
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="trilha">
        {course.units.map((unit) => {
          const tint = unit.status === "done" ? "tint-navy" : unit.status === "current" ? "tint-gold" : "";
          const isLocked = unit.status === "locked";

          return (
            <details
              key={unit.n}
              className={`card unit ${styles.unit}${isLocked ? " locked" : ""}`}
              open={!isLocked}
            >
              <summary className={styles.unitSummary}>
                <div className="unit-head">
                  <span
                    className={`unit-num ${tint}`}
                    style={isLocked ? { background: "var(--panel-2)", color: "var(--ink-faint)" } : undefined}
                  >
                    {unit.n}
                  </span>
                  <div className="unit-title">
                    <h3>{unit.title}</h3>
                    <p>Você vai conseguir: {unit.objective}</p>
                  </div>
                  <span className={styles.summaryMeta}>
                    {unit.checkpoint && <small>{unit.checkpoint}</small>}
                    <span className="unit-pct">
                      {isLocked ? "Ver unidade" : unit.status === "done" ? "Concluída ✓" : `${unit.pct}%`}
                    </span>
                  </span>
                </div>
              </summary>

              <div className={styles.unitBody}>
                {unit.canDo && unit.canDo.length > 0 && (
                  <section className={styles.canDo} aria-label={`Resultados da unidade ${unit.n}`}>
                    <h4>Ao final, eu consigo</h4>
                    <ul>
                      {unit.canDo.map((outcome) => (
                        <li key={outcome}>{outcome}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {unit.languageFocus && unit.languageFocus.length > 0 && (
                  <div className={styles.focus} aria-label="Focos da unidade">
                    {unit.languageFocus.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                )}

                {(unit.pronunciation || unit.communicationStrategy) && (
                  <div className={styles.supportGrid}>
                    {unit.pronunciation && (
                      <p>
                        <b>Pronúncia</b>
                        {unit.pronunciation}
                      </p>
                    )}
                    {unit.communicationStrategy && (
                      <p>
                        <b>Frase de apoio</b>
                        <span lang="en">{unit.communicationStrategy}</span>
                      </p>
                    )}
                  </div>
                )}

                {unit.mission && (
                  <div className={styles.mission}>
                    <span>Missão da unidade</span>
                    <p>{unit.mission}</p>
                  </div>
                )}

                {!isLocked && (
                  <div className="unit-bar">
                    <i style={{ width: `${unit.pct}%` }} />
                  </div>
                )}

                <div className={styles.lessonList}>
                  {unit.lessons.map((lesson, index) => {
                    const clickable = lesson.status === "now" && lesson.href;
                    const inner = (
                      <>
                        <span className={`lesson-ic ${lesson.status}`}>{icons[lesson.status]}</span>
                        <span className="lesson-info">
                          <b>{lesson.title}</b>
                          <span>{lesson.meta}</span>
                        </span>
                        {clickable && <span className="lesson-cta">Começar →</span>}
                      </>
                    );

                    return clickable ? (
                      <Link key={index} href={lesson.href!} className="lesson-row clickable">
                        {inner}
                      </Link>
                    ) : (
                      <div key={index} className="lesson-row">
                        {inner}
                      </div>
                    );
                  })}
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
