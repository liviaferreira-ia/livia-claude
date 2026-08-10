"use client";

import Link from "next/link";
import { LESSON } from "@/data/lesson";
import { useLessonProgress } from "@/lib/lessonProgress";
import { SceneArt } from "@/components/SceneArt";

const check = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const arrow = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function LicaoOverview() {
  const { done, ready } = useLessonProgress();
  const total = LESSON.sections.length;
  const completed = ready ? LESSON.sections.filter((s) => done[s.id]).length : 0;
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="view" style={{ maxWidth: 920 }}>
      <div className="eyebrow">{LESSON.unit}</div>
      <h2 style={{ fontSize: 26, margin: "6px 0 4px" }}>{LESSON.title}</h2>
      <p className="muted" style={{ margin: 0 }}>
        {completed} de {total} etapas concluídas
      </p>
      <div className="unit-bar" style={{ maxWidth: 320, margin: "14px 0 24px" }}>
        <i style={{ width: `${pct}%` }} />
      </div>

      <div className="two-col top">
        <div>
          <SceneArt />
        </div>
        <div className="card" style={{ padding: "6px 20px" }}>
          {LESSON.sections.map((s) => {
            const isDone = ready && done[s.id];
            return (
              <Link key={s.id} href={s.href} className="sec-row clickable">
                <span className="sec-body">
                  <span className="sec-eyebrow">{s.eyebrow}</span>
                  <span className="sec-title">{s.title}</span>
                </span>
                <span className={`sec-status ${isDone ? "done" : "todo"}`}>
                  {isDone ? check : arrow}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <Link href="/aluno/curso" className="btn ghost">
          ← Voltar ao curso
        </Link>
      </div>
    </div>
  );
}
