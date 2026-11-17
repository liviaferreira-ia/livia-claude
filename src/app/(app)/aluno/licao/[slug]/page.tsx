"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { LESSONS, lessonSteps } from "@/data/lesson";
import { useLessonProgress } from "@/lib/lessonProgress";
import { SceneArt } from "@/components/SceneArt";
import { FIRST_LESSON_MEDIA } from "@/data/lessonMedia";
import { useDesignV2 } from "@/lib/useDesignV2";
import v2s from "./licao-v2.module.css";

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

export default function LicaoOverview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const lesson = LESSONS[slug];
  const { isDone, ready } = useLessonProgress();
  const v2 = useDesignV2();

  if (!lesson) notFound();

  const steps = lessonSteps(lesson);
  const completed = ready ? steps.filter((s) => isDone(slug, s.id)).length : 0;
  const pct = Math.round((completed / steps.length) * 100);

  // Design v2: cabeçalho com progresso e próximo passo, aula em vídeo em destaque e etapas em grade
  // (ajuste do Fabio em 17/11/2026: a versão antiga ficava desalinhada, vazia e com texto pequeno).
  if (v2) {
    const doneOf = (id: (typeof steps)[number]["id"]) => ready && isDone(slug, id);
    const next = steps.find((s) => !doneOf(s.id));
    const allDone = ready && !next;
    const hasVideo = slug === FIRST_LESSON_MEDIA.slug;
    return (
      <div className={`view ${v2s.page}`}>
        <nav className={v2s.crumbs} aria-label="Você está em">
          <Link href="/aluno/curso">Meu curso</Link>
          <span aria-hidden>›</span>
          <span>{lesson.unit}</span>
        </nav>

        <header className={v2s.head}>
          <div className={v2s.headText}>
            <div className="eyebrow">Lição</div>
            <h1>{lesson.title}</h1>
            <p>{lesson.intro}</p>
          </div>
          <div className={`card ${v2s.progress}`} aria-label="Progresso da lição">
            <span className="eyebrow">Progresso da lição</span>
            <div className={v2s.progressTop}>
              <span className={v2s.big}>{pct}%</span>
              <small>{completed} de {steps.length} etapas</small>
            </div>
            <div className={v2s.bar}><i style={{ width: `${pct}%` }} /></div>
            {allDone ? (
              <>
                <span className={v2s.doneNote}>{check} Lição concluída</span>
                <Link href="/aluno/curso" className="btn">Voltar ao curso</Link>
              </>
            ) : (
              <Link href={(next ?? steps[0]).href} className="btn">
                {completed === 0 ? "Começar a lição" : `Continuar: ${(next ?? steps[0]).eyebrow}`} →
              </Link>
            )}
          </div>
        </header>

        {hasVideo && (
          <section className={`card ${v2s.video}`} aria-label="Aula em vídeo">
            <Link href={`/aluno/licao/${slug}/intro`} className={v2s.poster} aria-label="Assistir à aula com Livia e Fabio">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${FIRST_LESSON_MEDIA.base}/poster.png`} alt="" />
              <span className={v2s.play}><span><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg></span></span>
            </Link>
            <div className={v2s.videoText}>
              <div className="eyebrow">Aula em vídeo</div>
              <h2>Aula com Livia e Fabio</h2>
              <p>Conversa em inglês com legendas em português e um vídeo para você responder em voz alta.</p>
              <Link href={`/aluno/licao/${slug}/intro`} className="btn light">Assistir à aula →</Link>
            </div>
          </section>
        )}

        <div className={v2s.stepsHead}>
          <h2>Etapas da lição</h2>
          <span>Faça na ordem. Você pode voltar a qualquer etapa.</span>
        </div>
        <ol className={v2s.steps}>
          {steps.map((s, index) => {
            const done = doneOf(s.id);
            const isNext = ready && next?.id === s.id;
            return (
              <li key={s.id}>
                <Link href={s.href} className={`${v2s.step} ${done ? v2s.done : ""} ${isNext ? v2s.next : ""}`}>
                  <span className={v2s.num} aria-hidden>{done ? check : index + 1}</span>
                  <span className={v2s.stepText}>
                    <span className={v2s.eyebrow}>{s.eyebrow}</span>
                    <span className={v2s.title}>{s.title}</span>
                  </span>
                  <span className={v2s.state}>{done ? "Concluída" : isNext ? "Começar →" : "Abrir →"}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <div className="view v2-wide" style={{ maxWidth: 920 }}>
      <div className="eyebrow">{lesson.unit}</div>
      <h2 style={{ fontSize: 26, margin: "6px 0 4px" }}>{lesson.title}</h2>
      <p className="muted" style={{ margin: 0 }}>
        {completed} de {steps.length} etapas concluídas
      </p>
      <div className="unit-bar" style={{ maxWidth: 320, margin: "14px 0 24px" }}>
        <i style={{ width: `${pct}%` }} />
      </div>

      <div className="two-col top">
        <div>
          <SceneArt />
          {slug === FIRST_LESSON_MEDIA.slug && (
            <div className="card" style={{ padding: 20, marginTop: 16 }}>
              <h3 style={{ marginTop: 0 }}>Aula com Livia e Fabio</h3>
              <p>Conversa em inglês, legendas em português e um vídeo para você responder em voz alta.</p>
              <Link href={`/aluno/licao/${slug}/intro`} className="btn ghost">Assistir à aula →</Link>
            </div>
          )}
        </div>
        <div className="card" style={{ padding: "6px 20px" }}>
          {steps.map((s) => (
            <Link key={s.id} href={s.href} className="sec-row clickable">
              <span className="sec-body">
                <span className="sec-eyebrow">{s.eyebrow}</span>
                <span className="sec-title">{s.title}</span>
              </span>
              <span className={`sec-status ${ready && isDone(slug, s.id) ? "done" : "todo"}`}>
                {ready && isDone(slug, s.id) ? check : arrow}
              </span>
            </Link>
          ))}
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
