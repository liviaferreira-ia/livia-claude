"use client";

/**
 * "Modo aula" do design v2 (protótipo aprovado por Fabio em 17/11/2026).
 * Uma etapa por vez, na ordem do padrão pedagógico aprovado em 09/10/2026:
 * Contexto → Conversa → Entenda → Pratique → Sua vez → Revisão.
 * Mesmo conteúdo, mesmos vídeos e a mesma regra de revisão da versão atual
 * (DraftLessonReview + LessonReviewDecision + A1GuidedPractice).
 */
import Image from "next/image";
import { SpeakingPractice } from "@/components/SpeakingPractice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { A1Draft } from "@/data/a1Drafts";
import { PendingReviewsLink } from "@/components/PendingReviewsLink";
import { REVIEW_LABELS, reviewStatus, type LessonReview } from "@/lib/lesson-review-types";
import { LessonOutlinePanel, neighbors } from "@/components/LessonOutlinePanel";
import { LessonComplete } from "@/components/LessonComplete";
import type { LessonOutline } from "@/lib/video-course-types";
import { createClient } from "@/lib/supabase/client";
import styles from "./LessonPlayerV2.module.css";

const STEPS = ["Contexto", "Conversa", "Entenda", "Pratique", "Sua vez", "Revisão"] as const;

const icon = (children: ReactNode, fill = false) => (
  <svg viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
);
const I = {
  x: icon(<path d="M6 6l12 12M18 6 6 18" />),
  arrow: icon(<path d="M5 12h14M13 6l6 6-6 6" />),
  back: icon(<path d="M19 12H5M11 6l-6 6 6 6" />),
  play: icon(<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.4-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />, true),
  replay: icon(<><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></>),
  check: icon(<path d="M5 12.5 10 17l9-10" />),
  clock: icon(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  film: icon(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3z" /></>),
  pencil: icon(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>),
  info: icon(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>),
  alert: icon(<><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></>),
  bulb: icon(<><path d="M9 18h6M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z" /></>),
  cal: icon(<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>),
};

/** Mesma comparação da prática guiada atual. */
const normalize = (text: string) => text.trim().toLocaleLowerCase("en").replace(/[’‘]/g, "'").replace(/[.!?]+$/, "");

type Props = {
  lesson: A1Draft;
  mode: "student" | "teacher";
  review?: LessonReview | null;
  revision?: string;
  /** Painel lateral com as aulas (progresso, unidades, Anterior/Próxima). */
  outline?: LessonOutline | null;
};

/** Quanto do vídeo já foi assistido (fração 0–1), guardado neste aparelho. */
function readWatched(key: string): number {
  try { const raw = window.localStorage.getItem(key); return raw ? Number((JSON.parse(raw) as { f?: number }).f) || 0 : 0; } catch { return 0; }
}

export function LessonPlayerV2({ lesson, mode, review = null, revision = "", outline = null }: Props) {
  const teacher = mode === "teacher";
  const storageKey = `central_aula_etapa:${mode}:${lesson.id}`;
  const [step, setStep] = useState(1);
  const [maxSeen, setMaxSeen] = useState(1);
  const dialogueRef = useRef<HTMLVideoElement>(null);
  const practiceRef = useRef<HTMLVideoElement>(null);
  const media = lesson.media;
  const watchKey = (kind: "conversa" | "pratica") => `central_assistido:${mode}:${lesson.id}:${kind}`;
  const [watched, setWatched] = useState({ conversa: 0, pratica: 0 });
  const [completed, setCompleted] = useState(() => Boolean(outline?.items.find((item) => item.id === lesson.id)?.done));
  const [panelOpen, setPanelOpen] = useState(false);
  const nextLesson = outline ? neighbors(outline, completed).next : null;

  // Recupera o quanto dos vídeos já foi assistido neste aparelho (para concluir mesmo depois de recarregar).
  useEffect(() => {
    const timer = window.setTimeout(() => setWatched({
      conversa: readWatched(`central_assistido:${mode}:${lesson.id}:conversa`),
      pratica: readWatched(`central_assistido:${mode}:${lesson.id}:pratica`),
    }), 0);
    return () => window.clearTimeout(timer);
  }, [mode, lesson.id]);

  // Aluno: "Continue de onde parou" da tela inicial passa a levar para esta aula.
  useEffect(() => {
    if (teacher || !outline) return;
    createClient().rpc("record_learning_position", { p_path: `/aluno/aulas/${lesson.id}`, p_title: lesson.title, p_activity_type: "lesson" }).then(() => {}, () => {});
  }, [teacher, outline, lesson.id, lesson.title]);

  // Volta para a etapa em que a pessoa estava (se recarregar a página).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = Number(window.sessionStorage.getItem(storageKey));
        if (saved >= 1 && saved <= 6) { setStep(saved); setMaxSeen(saved); }
      } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

  function go(n: number) {
    const next = Math.min(6, Math.max(1, n));
    dialogueRef.current?.pause(); practiceRef.current?.pause();
    setStep(next); setMaxSeen((m) => Math.max(m, next));
    try { window.sessionStorage.setItem(storageKey, String(next)); } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function seek(ref: RefObject<HTMLVideoElement | null>, start: number) {
    const player = ref.current;
    if (!player) return;
    player.currentTime = start;
    void player.play().catch(() => { /* os controles nativos continuam disponíveis */ });
    player.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const exit = teacher
    ? <PendingReviewsLink className={styles.iconBtn}><span className={styles.srOnly}>Sair da revisão</span>{I.x}</PendingReviewsLink>
    : <Link href="/aluno/aulas" className={styles.iconBtn} aria-label="Sair da aula">{I.x}</Link>;
  const unitLabel = `A1 · Unidade ${lesson.unitNumber} · Aula ${lesson.number}`;

  return <div className={`${styles.player}${outline ? ` ${styles.hasOutline}` : ""}${teacher ? ` ${styles.isTeacher}` : ""}`}>
    <header className={styles.top}>
      <div className={styles.topInner}>
        {exit}
        <div className={styles.topTitle}>
          {outline
            ? <nav className={styles.crumbs} aria-label="Caminho">{outline.breadcrumb.map((crumb, i) => <span key={i}>{i > 0 && <i aria-hidden>/</i>}{crumb.href ? <Link href={crumb.href} prefetch={false}>{crumb.label}</Link> : crumb.label}</span>)}</nav>
            : <span className={styles.eyebrow}>{unitLabel}{teacher && " · Revisão"}</span>}
          <b>{lesson.title}</b>
        </div>
        <div className={styles.topRight}>
          <span className={styles.count}>{step}/6</span>
          {outline && <button type="button" className={styles.outlineBtn} onClick={() => setPanelOpen(true)}>Aulas</button>}
        </div>
        <ol className={styles.stepper}>
          {STEPS.map((name, i) => {
            const n = i + 1;
            const cls = n === step ? styles.current : n < step || n <= maxSeen ? styles.done : "";
            return <li key={name} className={cls}>
              <button type="button" onClick={() => go(n)} aria-label={`Etapa ${n}: ${name}`} aria-current={n === step ? "step" : undefined}><i /><span>{name}</span></button>
            </li>;
          })}
        </ol>
      </div>
      {teacher && <ReviewBar id={lesson.id} revision={revision} initialReview={review} />}
    </header>

    <div className={outline ? styles.withPanel : undefined}>
    <main className={styles.stage}>
      {step === 1 && <section className={styles.step}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>Etapa 1 de 6 · Contexto</span>
          <h1>{lesson.title}</h1>
          <p className={styles.lead}>{lesson.objective}</p>
          <div className={styles.chips}>
            <span className={styles.chip}>{I.clock}{lesson.minutes.replace("–", " a ")} min</span>
            <span className={styles.chip}>{I.film}2 vídeos</span>
            <span className={styles.chip}>{I.pencil}{lesson.questions.length} exercícios</span>
          </div>
        </div>
        <div className={styles.stack}>
          <div className={`card ${styles.scene}`}>
            <div className={styles.heroImg}><Image src={`${media.base}/poster.png`} alt="Livia e Fabio na sala de aula" width={1280} height={720} unoptimized /></div>
            <div className={styles.pad}><h3>A cena</h3><p className={styles.muted}>{lesson.situation}</p></div>
          </div>
          {lesson.prerequisite && <div className={`${styles.callout} ${styles.info}`}>{I.info}<div><b>Antes de começar</b>{lesson.prerequisite}</div></div>}
        </div>
      </section>}

      {step === 2 && <section className={styles.step}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>Etapa 2 de 6 · Conversa</span>
          <h2>Assista à conversa</h2>
          <p className={styles.lead}>Em inglês, com legendas em português. Toque numa fala para ouvir de novo.</p>
        </div>
        <LessonVideoV2 refEl={dialogueRef} src={`${media.base}/conversa.mp4`} poster={`${media.base}/poster.png`} track={`${media.base}/dialogue.vtt`}
          watchKey={watchKey("conversa")} onProgress={(f) => setWatched((w) => ({ ...w, conversa: Math.max(w.conversa, f) }))} />
        <Transcript media={media} onSeek={(start) => seek(dialogueRef, start)} />
        <p className={styles.small}>Áudio em inglês com vozes sintéticas. As legendas em português já aparecem no vídeo.</p>
      </section>}

      {step === 3 && <section className={styles.step}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>Etapa 3 de 6 · Entenda</span>
          <h2>Entenda as frases</h2>
        </div>
        <div className={styles.stack}>
          {lesson.explanation.map((part, i) => <div key={i} className={`card ${styles.pad} ${styles.exp}`}>
            <span className={styles.num}>{i + 1}</span>
            <div>
              <h3>{part.title}</h3>
              <div className={styles.phrases}>{part.phrases.map((phrase, j) => <span key={j} className={styles.phrase} lang="en" translate="no">{phrase}</span>)}</div>
              <p>{part.text}</p>
            </div>
          </div>)}
          {lesson.commonMistake && <div className={`${styles.callout} ${styles.attention}`}>{I.alert}<div><b>Atenção</b>{lesson.commonMistake}</div></div>}
        </div>
      </section>}

      {step === 4 && <section className={styles.step}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>Etapa 4 de 6 · Pratique</span>
          <h2>{teacher ? "Exercícios e gabarito" : "Pratique"}</h2>
          <p className={styles.lead}>{teacher ? "Como os alunos veem: uma pergunta por vez, com nova tentativa. Abaixo, o gabarito completo." : `${lesson.questions.length} perguntas rápidas. Se errar, você recebe uma dica; no segundo erro, a resposta certa.`}</p>
        </div>
        {teacher ? <AnswerKey questions={lesson.questions} /> : <Quiz questions={lesson.questions} />}
      </section>}

      {step === 5 && <section className={styles.step}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>Etapa 5 de 6 · Sua vez</span>
          <h2>Sua vez de falar</h2>
          <p className={styles.lead}>Assista ao vídeo e responda em inglês nas pausas. Depois, converse com a Livia: uma pergunta por vez, você responde no microfone e a IA confere. Sua voz é usada só para conferir a resposta e não fica guardada.</p>
        </div>
        <LessonVideoV2 refEl={practiceRef} src={`${media.base}/sua-vez.mp4`} poster={`${media.base}/poster.png`} track={`${media.base}/practice.vtt`}
          watchKey={watchKey("pratica")} onProgress={(f) => setWatched((w) => ({ ...w, pratica: Math.max(w.pratica, f) }))} />
        <div className={styles.sectionHead}><h3>Converse com a Livia</h3></div>
        <SpeakingPractice lessonId={lesson.id} lines={lesson.practice} />
        {teacher && <>
        <div className={styles.sectionHead}><h3>Todas as perguntas (visão da professora)</h3></div>
        <div className={styles.prompts}>
          {lesson.practice.map((line, i) => {
            const start = media.practiceChapters[i]?.start;
            return <div key={i} className={`card ${styles.promptCard}`}>
              <button type="button" className={styles.playBtn} disabled={start === undefined} onClick={() => start !== undefined && seek(practiceRef, start)} aria-label={`Tocar: ${line.en}`}>{I.play}</button>
              <div><span className={styles.en} lang="en" translate="no">{line.en}</span><span className={styles.pt}>{line.pt}</span>
                <span className={styles.tip}>{I.bulb}<span>{line.hint}</span></span></div>
            </div>;
          })}
        </div>
        </>}
        <Application text={lesson.application} model={lesson.model} />
      </section>}

      {step === 6 && <section className={styles.step}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>Etapa 6 de 6 · Revisão</span>
          <h2>Antes de terminar</h2>
          <p className={styles.lead}>Marque o que você já consegue fazer.</p>
        </div>
        <div className={styles.stack}>
          {!teacher && outline && <LessonComplete lessonId={lesson.id} watched={watched} done={completed} onDone={() => setCompleted(true)} nextHref={nextLesson?.href ?? null} />}
          <Checklist items={lesson.checklist} />
          <div className={`card ${styles.pad} ${styles.rowIc}`}><span className={styles.ic}>{I.cal}</span><div><h3>Revisão de amanhã</h3><p className={styles.muted}>{lesson.review}</p></div></div>
          {lesson.next && <div className={`card ${styles.pad} ${styles.nextLesson}`}><span className={styles.eyebrowLight}>Próxima aula</span><p>{lesson.next}</p></div>}
        </div>
      </section>}
    </main>
    {outline && <aside className={`${styles.side}${panelOpen ? ` ${styles.sideOpen}` : ""}`} aria-label="Aulas do curso">
      <div className={styles.sideHead}><b>Aulas do curso</b><button type="button" className={styles.iconBtn} onClick={() => setPanelOpen(false)} aria-label="Fechar">{I.x}</button></div>
      <LessonOutlinePanel outline={outline} completedNow={completed} onNavigate={() => setPanelOpen(false)} />
    </aside>}
    {outline && panelOpen && <div className={styles.scrim} onClick={() => setPanelOpen(false)} aria-hidden />}
    </div>

    <nav className={styles.bottom} aria-label="Navegação da aula">
      <div className={styles.bottomInner}>
        <button type="button" className={`btn ghost ${styles.prev}`} onClick={() => go(step - 1)} style={{ visibility: step === 1 ? "hidden" : "visible" }}>{I.back}Voltar</button>
        <span className={styles.nextLabel}>{step < 6 ? `Próximo: ${STEPS[step]}` : ""}</span>
        {step < 6
          ? <button type="button" className={`btn primary ${styles.next}`} onClick={() => go(step + 1)}>{step === 1 ? "Começar aula" : "Continuar"}{I.arrow}</button>
          : teacher
            ? <PendingReviewsLink className={`btn primary ${styles.next}`}>Voltar às pendentes</PendingReviewsLink>
            : completed && nextLesson
              ? <Link href={nextLesson.href} prefetch={false} className={`btn primary ${styles.next}`}>Próxima aula{I.arrow}</Link>
              : <Link href="/aluno/aulas" className={`btn primary ${styles.next}`}>Voltar às aulas</Link>}
      </div>
    </nav>
  </div>;
}

function LessonVideoV2({ refEl, src, poster, track, watchKey, onProgress }: {
  refEl: RefObject<HTMLVideoElement | null>; src: string; poster: string; track: string;
  watchKey?: string; onProgress?: (fraction: number) => void;
}) {
  const [failed, setFailed] = useState(false);
  const [fraction, setFraction] = useState(0);
  const seen = useRef<Set<number>>(new Set());
  useEffect(() => { refEl.current?.load(); }, [refEl, src]);
  useEffect(() => {
    if (!watchKey) return;
    try {
      const raw = window.localStorage.getItem(watchKey);
      if (raw) seen.current = new Set((JSON.parse(raw) as { s?: number[] }).s ?? []);
    } catch {}
  }, [watchKey]);

  // Conta os segundos realmente assistidos (pular para frente não conta).
  function measure() {
    const video = refEl.current;
    if (!video || !watchKey || !Number.isFinite(video.duration) || video.duration <= 0) return;
    const f = Math.min(1, seen.current.size / Math.max(1, Math.floor(video.duration)));
    setFraction(f); onProgress?.(f);
    try { window.localStorage.setItem(watchKey, JSON.stringify({ s: [...seen.current], f })); } catch {}
  }
  function onTime() {
    const video = refEl.current;
    if (!video || video.paused || video.seeking) return;
    const second = Math.floor(video.currentTime);
    if (!seen.current.has(second)) { seen.current.add(second); measure(); }
  }

  return <div>
    <video ref={refEl} key={src} controls playsInline preload="metadata" poster={poster} className={styles.video}
      onError={() => setFailed(true)} onTimeUpdate={onTime} onLoadedMetadata={measure}>
      <source src={src} type="video/mp4" onError={() => setFailed(true)} />
      <track kind="subtitles" src={track} srcLang="pt-BR" label="Português" />
      Seu navegador não conseguiu reproduzir o vídeo.
    </video>
    {watchKey && <div className={styles.watch}><div className={styles.watchBar}><i style={{ width: `${Math.round(fraction * 100)}%` }} /></div><span>Assistido {Math.round(fraction * 100)}%</span></div>}
    {failed && <p role="alert" className={styles.small}>Não foi possível carregar o vídeo. <a href={src}>Abrir o vídeo diretamente</a> ou recarregue a página.</p>}
  </div>;
}

function Transcript({ media, onSeek }: { media: A1Draft["media"]; onSeek: (start: number) => void }) {
  const [showPt, setShowPt] = useState(true);
  const speakers = [...new Set(media.lines.map((line) => line.who))];
  return <>
    <div className={styles.sectionHead}>
      <h3>A conversa</h3>
      <button type="button" className={styles.switch} role="switch" aria-checked={showPt} onClick={() => setShowPt((v) => !v)}><span className={styles.track} />Tradução</button>
    </div>
    <div className={`${styles.lines}${showPt ? "" : ` ${styles.hidePt}`}`}>
      {media.lines.map((line, i) => {
        const right = speakers.indexOf(line.who) % 2 === 1;
        const start = media.dialogueChapters[i]?.start;
        return <div key={i} className={`${styles.line}${right ? ` ${styles.right}` : ""}`}>
          <span className={styles.who} aria-hidden>{line.who.charAt(0)}</span>
          <div className={styles.bubble}>
            <span className={styles.speaker}>{line.who}</span>
            <span className={styles.en} lang="en" translate="no">{line.en}</span>
            <span className={styles.pt}>{line.pt}</span>
            {start !== undefined && <button type="button" className={styles.replay} onClick={() => onSeek(start)} aria-label={`Ouvir de novo: ${line.en}`}>{I.replay}</button>}
          </div>
        </div>;
      })}
    </div>
  </>;
}

/**
 * Exercícios um por vez. Regra de erro (decidida com o Fabio em 17/11/2026):
 * 1º erro mostra só a dica e a pessoa tenta de novo; 2º erro mostra a resposta
 * certa com a explicação e libera a próxima pergunta. Ninguém fica preso.
 */
function Quiz({ questions }: { questions: A1Draft["questions"] }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [state, setState] = useState<"answer" | "right" | "wrong" | "revealed">("answer");
  const [wrongCount, setWrongCount] = useState(0);
  const [firstTry, setFirstTry] = useState(0);

  function reset() { setAnswer(""); setState("answer"); setWrongCount(0); }
  if (index >= questions.length) {
    return <div className={`card ${styles.pad} ${styles.doneBox}`}>
      <div className={styles.big}>{I.check}</div>
      <h3>Prática concluída</h3>
      <p className={styles.muted}>Você acertou {firstTry} de {questions.length} na primeira tentativa.</p>
      <button type="button" className={styles.linkBtn} onClick={() => { setIndex(0); reset(); setFirstTry(0); }}>Refazer as perguntas</button>
    </div>;
  }
  const q = questions[index];
  const answerText = q.options ? q.options[Number(q.answer)] ?? q.answer : q.answer;
  const locked = state === "right" || state === "revealed";
  function check() {
    if (normalize(answer) === normalize(q.answer)) {
      if (wrongCount === 0) setFirstTry((n) => n + 1);
      setState("right");
      return;
    }
    const errors = wrongCount + 1;
    setWrongCount(errors);
    setState(errors >= 2 ? "revealed" : "wrong");
  }
  function next() { setIndex((i) => i + 1); reset(); }
  function pick(value: string) { setAnswer(value); if (state === "wrong") setState("answer"); }

  return <form className={`card ${styles.pad}`} onSubmit={(e) => { e.preventDefault(); if (locked) next(); else if (answer.trim()) check(); }}>
    <div className={styles.quizTop}>
      <span className={styles.eyebrow}>Pergunta {index + 1} de {questions.length}</span>
      <span className={styles.dots} aria-hidden>{questions.map((_, i) => <i key={i} className={i < index ? styles.dotDone : i === index ? styles.dotCur : undefined} />)}</span>
    </div>
    <fieldset className={styles.fieldset}>
      <legend className={styles.prompt}>{q.prompt}</legend>
      {q.options
        ? <div className={styles.opts} role="radiogroup">
          {q.options.map((option, i) => {
            const value = String(i);
            const cls = locked && value === q.answer ? styles.isOk : (state === "wrong" || state === "revealed") && value === answer ? styles.isBad : "";
            return <button key={i} type="button" role="radio" aria-checked={answer === value} disabled={locked} className={`${styles.opt} ${cls}`} onClick={() => pick(value)}>
              <span className={styles.mark} /><span lang="en">{option}</span>
            </button>;
          })}
        </div>
        : <input className={`${styles.fill}${state === "revealed" ? ` ${styles.fillBad}` : ""}`} lang="en" autoComplete="off" aria-label={`Resposta para ${q.prompt}`} placeholder="Digite sua resposta" value={answer} disabled={locked} onChange={(e) => pick(e.target.value)} />}
    </fieldset>
    {state === "right" && <div className={`${styles.feedback} ${styles.ok}`} role="status"><b>Isso mesmo!</b>{q.feedback}</div>}
    {wrongCount === 1 && !locked && <div className={`${styles.feedback} ${styles.bad}`} role="status"><b>Ainda não. Tente de novo.</b>{q.hint ? `Dica: ${q.hint}` : "Releia a etapa Entenda e escolha outra resposta."}</div>}
    {state === "revealed" && <div className={`${styles.feedback} ${styles.reveal}`} role="status">
      <b>A resposta certa é: <span lang="en" translate="no">{answerText}</span></b>{q.feedback}</div>}
    <div className={styles.quizActions}>
      {locked
        ? <button type="submit" className="btn primary">{index === questions.length - 1 ? "Ver resultado" : "Próxima pergunta"}{I.arrow}</button>
        : <button type="submit" className="btn primary" disabled={!answer.trim()}>{wrongCount > 0 ? "Conferir de novo" : "Conferir"}</button>}
    </div>
  </form>;
}

function AnswerKey({ questions }: { questions: A1Draft["questions"] }) {
  return <div className={`card ${styles.pad}`}>
    {questions.map((q, i) => <div key={i} className={styles.key}>
      <b>{i + 1}. {q.prompt}</b>
      {q.options
        ? <ol type="a">{q.options.map((option, j) => <li key={j} className={String(j) === q.answer ? styles.correct : undefined}><span lang="en">{option}</span>{String(j) === q.answer && <span className={styles.tag}>resposta</span>}</li>)}</ol>
        : <p className={styles.answer}>Resposta: <span lang="en">{q.answer}</span></p>}
      <p>{q.feedback}</p>
      {q.hint && <p className={styles.small}>Dica mostrada ao aluno no 1º erro: {q.hint}</p>}
      <p className={styles.small}>No 2º erro, o aluno vê a resposta certa e esta explicação.</p>
    </div>)}
  </div>;
}

function Application({ text, model }: { text: string; model: string }) {
  const [open, setOpen] = useState(false);
  return <div className={`card ${styles.pad} ${styles.application}`}>
    <h3>Agora, com você</h3>
    <p className={styles.muted}>{text}</p>
    <button type="button" className={styles.linkBtn} aria-expanded={open} onClick={() => setOpen((v) => !v)}>{open ? "Esconder modelo" : "Ver modelo"}</button>
    {open && <div className={styles.model} lang="en" translate="no">{model}</div>}
  </div>;
}

function Checklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return <div className={`card ${styles.pad}`}>
    <ul className={styles.checks}>
      {items.map((item, i) => <li key={i}>
        <button type="button" role="checkbox" aria-checked={Boolean(checked[i])} className={styles.check} onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}>
          <span className={styles.box}>{I.check}</span><span>{item}</span>
        </button>
      </li>)}
    </ul>
  </div>;
}

/** Barra de revisão da professora: mesma API e mesmas regras do LessonReviewDecision. */
function ReviewBar({ id, revision, initialReview }: { id: string; revision: string; initialReview: LessonReview | null }) {
  const router = useRouter();
  const [review, setReview] = useState(initialReview);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(initialReview?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const status = reviewStatus(review, revision);

  async function save(decision: "approved" | "rejected") {
    setError(""); setMessage("");
    if (decision === "rejected" && !note.trim()) { setError("Explique o que precisa ser corrigido."); return; }
    setSaving(true);
    try {
      const response = await fetch(`/api/professor/aulas/${id}/revisao`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: decision, note, revision, expectedUpdatedAt: review?.updated_at ?? null }) });
      const body = await response.json();
      if (!response.ok) { setError(body.error || "Não consegui salvar a decisão."); return; }
      setReview(body.review); setEditing(false);
      setMessage(decision === "approved" ? "Aula aprovada e publicada para os alunos." : "Correção solicitada. A aula fica fora da biblioteca dos alunos.");
      router.refresh();
    } catch { setError("A conexão falhou. Confira a decisão após atualizar a página antes de tentar novamente."); }
    finally { setSaving(false); }
  }

  const pill = status === "approved" ? styles.pillOk : status === "pending" ? styles.pillNeutral : styles.pillWarn;
  return <div className={styles.review}>
    <div className={styles.reviewInner}>
      <div className={styles.reviewStatus}>
        <span className={`${styles.pill} ${pill}`}>{REVIEW_LABELS[status]}</span>
        <small>{review ? `Última decisão: ${new Date(review.updated_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}` : "Ainda sem decisão"}</small>
      </div>
      {!editing && <div className={styles.reviewActions}>
        <button type="button" className="btn ghost" disabled={saving} onClick={() => { setEditing(true); setError(""); setMessage(""); }}>
          <span className={styles.long}>Pedir correção</span><span className={styles.short}>Corrigir</span></button>
        <button type="button" className="btn primary" disabled={saving || status === "approved"} onClick={() => void save("approved")}>
          <span className={styles.long}>Aprovar e publicar</span><span className={styles.short}>Aprovar</span></button>
      </div>}
      {review?.note && status !== "approved" && !editing && <p className={styles.reviewText}><b>Correção pedida:</b> {review.note}</p>}
      {editing && <form className={styles.reviewForm} onSubmit={(e) => { e.preventDefault(); void save("rejected"); }}>
        <label htmlFor={`correcao-${id}`}>O que precisa ser corrigido? (obrigatório)</label>
        <textarea id={`correcao-${id}`} value={note} onChange={(e) => setNote(e.target.value)} required maxLength={2000} rows={3} disabled={saving} />
        <div className={styles.reviewFormActions}>
          <button type="button" className="btn ghost" disabled={saving} onClick={() => setEditing(false)}>Cancelar</button>
          <button type="submit" className="btn primary" disabled={saving || !note.trim()}>Enviar pedido de correção</button>
        </div>
      </form>}
      {(saving || message || error) && <p className={styles.reviewText} role={error ? "alert" : "status"}>{saving ? "Salvando decisão…" : error || message}</p>}
      {status === "approved" && <p className={styles.reviewLinks}>
        <PendingReviewsLink>Próxima pendente →</PendingReviewsLink>
        <Link href={`/aluno/aulas/${id}`}>Ver como aluno →</Link>
      </p>}
    </div>
  </div>;
}
