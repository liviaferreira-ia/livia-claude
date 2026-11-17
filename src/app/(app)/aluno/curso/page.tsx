"use client";

import Link from "next/link";
import { LessonVideoEntry } from "@/components/LessonVideoEntry";
import { COURSES, LEARNING_CYCLE, resolveCourseLevel } from "@/data/curso";
import { levelBadge } from "@/data/placement";
import { parseCefrLevel, useProfile } from "@/lib/profile";
import { useCourseProgress } from "@/lib/courseProgress";
import styles from "./curso.module.css";
import v2s from "./curso-v2.module.css";
import { useDesignV2 } from "@/lib/useDesignV2";

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
  const { profile, ready, isTeacher } = useProfile();
  const v2 = useDesignV2();
  const studentLevel = parseCefrLevel(profile.level) ?? "A2";
  const contentLevel = resolveCourseLevel(studentLevel);
  const course = COURSES[contentLevel];
  const progress = useCourseProgress(contentLevel);
  const usesLearningCycle = course.units.some((unit) => unit.canDo?.length);
  const measured = progress.ready && !progress.error;
  const coursePct = measured ? progress.pct : course.pct;

  if (!ready) {
    return (
      <div className="view v2-accent-navy v2-wide">
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  // Design v2: trilha em uma coluna, ligada por um caminho, com só a unidade atual aberta
  // (ajuste do Fabio em 17/11/2026: a grade de duas colunas ficava desequilibrada).
  if (v2) {
    const statusOf = (n: number, fallback: string) => (measured ? progress.unitState(n)?.status : undefined) ?? fallback;
    const openUnit = course.units.find((unit) => statusOf(unit.n, unit.status) === "current")?.n
      ?? course.units.find((unit) => statusOf(unit.n, unit.status) !== "locked")?.n;
    const chev = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m6 9 6 6 6-6" /></svg>;
    return (
      <div className={`view v2-accent-navy ${v2s.page}`}>
        <header className={v2s.head}>
          <div className={v2s.headText}>
            <div className="eyebrow">Meu curso</div>
            <h1>Inglês · {levelBadge(contentLevel)}</h1>
            <p className="muted">Avance uma capacidade de cada vez. Você sempre verá o que vai aprender, praticar e conseguir fazer.</p>
            {contentLevel !== studentLevel && <p className={v2s.note}>Ainda não temos trilha própria para o nível {studentLevel} — mostrando a de {contentLevel} por enquanto.</p>}
          </div>
          <div className={`card ${v2s.progress}`} aria-label="Progresso do nível">
            <span className="eyebrow">Progresso do nível</span>
            <div className={v2s.big}>{coursePct}%</div>
            <div className={v2s.bar}><i style={{ width: `${coursePct}%` }} /></div>
            <small>{measured ? `${progress.completedCount} de ${progress.total} etapas concluídas` : "Carregando medição…"}</small>
          </div>
        </header>

        <LessonVideoEntry review={isTeacher} />

        {usesLearningCycle && (
          <section className={`card ${v2s.cycle}`} aria-labelledby="learning-cycle-title">
            <div className={v2s.cycleText}>
              <span className="eyebrow">Como você aprende</span>
              <h3 id="learning-cycle-title">Um caminho simples até usar o inglês</h3>
            </div>
            <ol className={v2s.cycleSteps}>
              {LEARNING_CYCLE.map((phase, index) => <li key={phase.id}><span>{index + 1}</span>{phase.label}</li>)}
            </ol>
          </section>
        )}

        <ol className={v2s.trail} aria-label="Unidades do curso">
          {course.units.map((unit) => {
            const measuredUnit = measured ? progress.unitState(unit.n) : null;
            const unitStatus = measuredUnit?.status ?? unit.status;
            const unitPct = measuredUnit?.pct ?? unit.pct;
            const isLocked = unitStatus === "locked";
            const isDone = unitStatus === "done";
            const stateClass = isDone ? v2s.done : isLocked ? v2s.locked : unit.n === openUnit ? v2s.current : "";
            return (
              <li key={unit.n} className={`${v2s.step} ${stateClass}`}>
                <span className={v2s.node} aria-hidden>{isDone ? icons.done : isLocked ? icons.locked : unit.n}</span>
                <details className={`card ${v2s.unit}`} open={unit.n === openUnit}>
                  <summary className={v2s.summary}>
                    <div className={v2s.sumText}>
                      <small>Unidade {unit.n}{unit.checkpoint ? ` · ${unit.checkpoint}` : ""}</small>
                      <h3>{unit.title}</h3>
                      <p>Você vai conseguir: {unit.objective}</p>
                    </div>
                    <span className={v2s.status}>{isLocked ? "Bloqueada" : isDone ? "Concluída" : `${unitPct}%`}</span>
                    <span className={v2s.chev}>{chev}</span>
                  </summary>
                  <div className={v2s.body}>
                    {!isLocked && <div className={v2s.bar}><i style={{ width: `${unitPct}%` }} /></div>}
                    <div className={v2s.cols}>
                      {unit.canDo && unit.canDo.length > 0 && (
                        <section className={v2s.box} aria-label={`Resultados da unidade ${unit.n}`}>
                          <h4>Ao final, eu consigo</h4>
                          <ul>{unit.canDo.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
                        </section>
                      )}
                      <div className={v2s.side}>
                        {unit.mission && <div className={v2s.mission}><span>Missão da unidade</span><p>{unit.mission}</p></div>}
                        {unit.languageFocus && unit.languageFocus.length > 0 && <div className={v2s.chips} aria-label="Focos da unidade">{unit.languageFocus.map((item) => <span key={item}>{item}</span>)}</div>}
                        {unit.pronunciation && <p className={v2s.support}><b>Pronúncia</b>{unit.pronunciation}</p>}
                        {unit.communicationStrategy && <p className={v2s.support}><b>Frase de apoio</b><span lang="en">{unit.communicationStrategy}</span></p>}
                      </div>
                    </div>
                    <div className={v2s.lessons}>
                      {unit.lessons.map((lesson, index) => {
                        const phaseStatus = measured && lesson.phase ? progress.phaseStatus(unit.n, lesson.phase) : lesson.status;
                        const clickable = (phaseStatus === "now" || phaseStatus === "done") && lesson.href;
                        const inner = <>
                          <span className={`lesson-ic ${phaseStatus}`}>{icons[phaseStatus]}</span>
                          <span className="lesson-info"><b>{lesson.title}</b><span>{lesson.meta}</span></span>
                          {clickable && <span className="lesson-cta">Começar →</span>}
                        </>;
                        return clickable
                          ? <Link key={index} href={lesson.href!} className="lesson-row clickable">{inner}</Link>
                          : <div key={index} className={`lesson-row${phaseStatus === "locked" ? " locked" : ""}`}>{inner}</div>;
                      })}
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <div className="view v2-accent-navy v2-wide" style={{ maxWidth: 760 }}>
      <LessonVideoEntry review={isTeacher} />
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
          <i style={{ width: `${coursePct}%` }} />
        </div>
        <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
          {coursePct}% do nível · {measured ? `${progress.completedCount} de ${progress.total} etapas` : "carregando medição"}
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
          const measuredUnit = measured ? progress.unitState(unit.n) : null;
          const unitStatus = measuredUnit?.status ?? unit.status;
          const unitPct = measuredUnit?.pct ?? unit.pct;
          const tint = unitStatus === "done" ? "tint-navy" : unitStatus === "current" ? "tint-gold" : "";
          const isLocked = unitStatus === "locked";

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
                      {isLocked ? "Bloqueada" : unitStatus === "done" ? "Concluída ✓" : `${unitPct}%`}
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
                    <i style={{ width: `${unitPct}%` }} />
                  </div>
                )}

                <div className={styles.lessonList}>
                  {unit.lessons.map((lesson, index) => {
                    const phaseStatus = measured && lesson.phase ? progress.phaseStatus(unit.n, lesson.phase) : lesson.status;
                    const clickable = (phaseStatus === "now" || phaseStatus === "done") && lesson.href;
                    const inner = (
                      <>
                        <span className={`lesson-ic ${phaseStatus}`}>{icons[phaseStatus]}</span>
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
                      <div key={index} className={`lesson-row${phaseStatus === "locked" ? " locked" : ""}`}>
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
