"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

type Particle = { id: number; style: CSSProperties; rain?: boolean };
let particleId = 0;
const COLORS = ["#1c4a85", "#b31942", "#0a3161", "#ef5a73"];

function calmMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type QuizQuestion = { id: string; level: string; prompt: string; options: string[]; answer: number; explain: string };

/** "Teste seu inglês em 30 segundos": perguntas reais do banco da plataforma, sem cadastro. */
export function QuickQuiz({ questions }: { questions: QuizQuestion[] }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const done = step >= questions.length;
  const q = questions[step];

  // Estrelinhas: explosão no botão certo; chuva quando acerta tudo. Nada disso com "reduzir movimento".
  const spawn = useCallback((list: Particle[]) => {
    setParticles((p) => [...p, ...list]);
    const ids = new Set(list.map((x) => x.id));
    window.setTimeout(() => setParticles((p) => p.filter((x) => !ids.has(x.id))), 2800);
  }, []);

  function burst(target: HTMLElement) {
    if (calmMotion() || !box.current) return;
    const b = box.current.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    const x = r.left - b.left + r.width / 2;
    const y = r.top - b.top + r.height / 2;
    spawn(Array.from({ length: 14 }, (_, k) => {
      const angle = (Math.PI * 2 * k) / 14 + Math.random() * 0.4;
      const dist = 60 + Math.random() * 70;
      return { id: ++particleId, style: { left: x, top: y, color: COLORS[k % COLORS.length], ["--dx" as string]: `${Math.cos(angle) * dist}px`, ["--dy" as string]: `${Math.sin(angle) * dist - 30}px`, ["--rot" as string]: `${Math.random() * 360}deg`, fontSize: 12 + Math.random() * 10 } };
    }));
  }

  function choose(i: number, event: MouseEvent<HTMLButtonElement>) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) {
      setScore((s) => s + 1);
      burst(event.currentTarget);
    }
  }

  function next() {
    setPicked(null);
    setStep((s) => s + 1);
  }

  function restart() {
    setPicked(null);
    setScore(0);
    setStep(0);
  }

  const perfect = done && score === questions.length;
  useEffect(() => {
    if (!perfect || calmMotion()) return;
    const t = window.setTimeout(() => spawn(Array.from({ length: 42 }, (_, k) => ({
      id: ++particleId,
      rain: true,
      style: { left: `${Math.random() * 100}%`, color: COLORS[k % COLORS.length], fontSize: 12 + Math.random() * 14, animationDelay: `${Math.random() * 0.9}s`, animationDuration: `${1.6 + Math.random() * 1.2}s`, ["--rot" as string]: `${Math.random() * 540}deg` },
    }))), 250);
    return () => window.clearTimeout(t);
  }, [perfect, spawn]);

  const verdict = score === questions.length
    ? "Excelente! Você já tem uma base forte. Na plataforma, a trilha começa no nível certo para você continuar avançando."
    : score >= 3
      ? "Muito bom! Você já tem uma base. Com prática no seu nível, as dúvidas que apareceram viram resposta automática."
      : "Ótimo ponto de partida. A trilha começa do seu nível e avança um passo de cada vez, sem pular etapas.";

  return (
    <div className="lp-quiz" aria-live="polite" ref={box}>
      <div className="lp-confetti" aria-hidden>{particles.map((p) => <i key={p.id} className={p.rain ? "rain" : ""} style={p.style}>★</i>)}</div>
      {!done ? (
        <>
          <div className="lp-quiz-top">
            <span className="lp-quiz-level">Nível {q.level}</span>
            <span className="lp-quiz-dots" aria-label={`Pergunta ${step + 1} de ${questions.length}`}>
              {questions.map((item, i) => <i key={item.id} data-state={i < step || (i === step && picked !== null) ? "feita" : i === step ? "atual" : "proxima"} />)}
            </span>
          </div>
          <p className="lp-quiz-label">Complete a frase</p>
          <h3 key={q.id} className="lp-quiz-prompt">{q.prompt}</h3>
          <div className="lp-quiz-options">
            {q.options.map((option, i) => {
              const state = picked === null ? "" : i === q.answer ? "ok" : i === picked ? "bad" : "dim";
              return (
                <button key={option} type="button" className={state} disabled={picked !== null} onClick={(event) => choose(i, event)}>
                  {option}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className={`lp-quiz-feedback ${picked === q.answer ? "ok" : "bad"}`}>
              <b>{picked === q.answer ? "Isso mesmo!" : `Quase! A resposta é "${q.options[q.answer]}".`}</b>
              <span>{q.explain}</span>
              <button type="button" className="btn primary" onClick={next}>
                {step + 1 < questions.length ? "Próxima pergunta →" : "Ver meu resultado →"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="lp-quiz-result">
          <span className="lp-quiz-score"><b>{score}</b>/{questions.length}</span>
          <h3>Você acertou {score} de {questions.length}</h3>
          <p>{verdict}</p>
          <div className="lp-quiz-result-actions">
            <Link href="/experimente" className="btn primary">Começar meus 7 dias grátis →</Link>
            <button type="button" className="btn ghost" onClick={restart}>Refazer o teste</button>
          </div>
          <small>Na plataforma são 1.000 exercícios como estes, do A1 ao C2.</small>
        </div>
      )}
    </div>
  );
}
