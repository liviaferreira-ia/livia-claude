"use client";

/**
 * Painel lateral da aula (design v2, inspirado na referência mostrada pelo Fabio em 17/11/2026):
 * progresso do curso, aulas por unidade (concluída, atual, aberta, trancada) e Anterior/Próxima.
 */
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { durationRange, type CourseItem, type LessonOutline } from "@/lib/video-course-types";
import styles from "./LessonOutlinePanel.module.css";

const svg = (d: ReactNode) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>;
const I = {
  check: svg(<path d="M5 12.5 10 17l9-10" />),
  lock: svg(<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>),
  chev: svg(<path d="m6 9 6 6 6-6" />),
  left: svg(<path d="m15 6-6 6 6 6" />),
  right: svg(<path d="m9 6 6 6-6 6" />),
};

export function neighbors(outline: LessonOutline, completedNow = false) {
  const index = outline.items.findIndex((item) => item.id === outline.currentId);
  const prev = index > 0 ? outline.items[index - 1] : null;
  const rawNext = index >= 0 && index < outline.items.length - 1 ? outline.items[index + 1] : null;
  // Concluir a aula agora destrava a próxima antes mesmo de recarregar os dados.
  const next = rawNext && completedNow && !rawNext.open ? { ...rawNext, open: true, lockedForStudents: false } : rawNext;
  return { prev, next };
}

export function LessonOutlinePanel({ outline, completedNow = false, onNavigate }: { outline: LessonOutline; completedNow?: boolean; onNavigate?: () => void }) {
  const items = outline.items.map((item) => item.id === outline.currentId && completedNow ? { ...item, done: true } : item);
  const current = items.find((item) => item.id === outline.currentId);
  const done = items.filter((item) => item.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const units = [...new Set(items.map((item) => item.unitNumber))];
  const [manual, setManual] = useState<Record<number, boolean>>({});
  const { prev, next } = neighbors({ ...outline, items }, completedNow);

  return <div className={styles.panel}>
    <section className={`card ${styles.progress}`}>
      <div className={styles.progressTop}><b>{outline.progressLabel}</b><span>{done} / {items.length}</span></div>
      <div className={styles.bar}><i style={{ width: `${pct}%` }} /></div>
      <small>{pct}% · {outline.doneLabel}</small>
    </section>

    <section className={`card ${styles.units}`} aria-label="Aulas por unidade">
      <div className={styles.unitsHead}><b>Unidades</b><span>{units.length} {units.length === 1 ? "unidade" : "unidades"}</span></div>
      <div className={styles.scroll}>
        {units.map((unit) => {
          const unitItems = items.filter((item) => item.unitNumber === unit);
          const open = manual[unit] ?? unit === current?.unitNumber;
          const unitDone = unitItems.filter((item) => item.done).length;
          const duration = durationRange(unitItems);
          const allLocked = outline.mode === "student" && unitItems.every((item) => !item.open);
          return <div key={unit} className={styles.unit}>
            <button type="button" className={styles.unitBtn} aria-expanded={open} onClick={() => setManual((m) => ({ ...m, [unit]: !open }))}>
              <span className={`${styles.unitNum}${allLocked ? ` ${styles.unitLocked}` : ""}`}>{allLocked ? I.lock : String(unit).padStart(2, "0")}</span>
              <span className={styles.unitText}><b>Unidade {unit}</b>
                <small>{unitItems.length} {unitItems.length === 1 ? "aula" : "aulas"}{duration ? ` · ${duration}` : ""} · {unitDone} feita{unitDone === 1 ? "" : "s"}</small></span>
              <span className={`${styles.chev}${open ? ` ${styles.chevOpen}` : ""}`}>{I.chev}</span>
            </button>
            {open && <ul className={styles.list}>
              {unitItems.map((item) => <li key={item.id}><Row item={item} current={item.id === outline.currentId} mode={outline.mode} onNavigate={onNavigate} /></li>)}
            </ul>}
          </div>;
        })}
      </div>
      <div className={styles.nav}>
        {prev ? <Link href={prev.href} prefetch={false} className={styles.navBtn} onClick={onNavigate}>{I.left}Anterior</Link> : <span className={`${styles.navBtn} ${styles.navOff}`}>{I.left}Anterior</span>}
        {next && next.open
          ? <Link href={next.href} prefetch={false} className={`${styles.navBtn} ${styles.navNext}`} onClick={onNavigate}>Próxima{I.right}</Link>
          : <span className={`${styles.navBtn} ${styles.navOff}`} title={next ? "Conclua esta aula para abrir a próxima" : "Última aula publicada"}>{next ? I.lock : null}Próxima{next ? null : I.right}</span>}
      </div>
    </section>
  </div>;
}

function Row({ item, current, mode, onNavigate }: { item: CourseItem; current: boolean; mode: "student" | "teacher"; onNavigate?: () => void }) {
  const icon = item.done ? <span className={`${styles.state} ${styles.stateDone}`}>{I.check}</span>
    : current ? <span className={`${styles.state} ${styles.stateCurrent}`} />
      : item.lockedForStudents ? <span className={`${styles.state} ${styles.stateLocked}`}>{I.lock}</span>
        : <span className={styles.state} />;
  const content = <>{icon}<span className={styles.rowTitle}>Aula {item.number} · {item.title}</span>{item.minutes && <span className={styles.rowMin}>{item.minutes.replace("–", "-")}′</span>}</>;
  const cls = `${styles.row}${current ? ` ${styles.rowCurrent}` : ""}`;
  if (!item.open) return <span className={`${cls} ${styles.rowLocked}`} title="Conclua a aula anterior para abrir esta">{content}</span>;
  return <Link href={item.href} prefetch={false} className={cls} aria-current={current ? "page" : undefined} onClick={onNavigate}
    title={mode === "teacher" ? undefined : item.lockedForStudents ? "Trancada para alunos (aberta para a equipe)" : undefined}>{content}</Link>;
}
