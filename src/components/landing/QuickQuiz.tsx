"use client";

import Link from "next/link";
import { useState } from "react";

export type QuizQuestion = { id: string; level: string; prompt: string; options: string[]; answer: number; explain: string };

/** "Teste seu inglês em 30 segundos": perguntas reais do banco da plataforma, sem cadastro. */
export function QuickQuiz({ questions }: { questions: QuizQuestion[] }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = step >= questions.length;
  const q = questions[step];

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
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

  const verdict = score === questions.length
    ? "Excelente! Você já tem uma base forte. Na plataforma, a trilha começa no nível certo para você continuar avançando."
    : score >= 3
      ? "Muito bom! Você já tem uma base. Com prática no seu nível, as dúvidas que apareceram viram resposta automática."
      : "Ótimo ponto de partida. A trilha começa do seu nível e avança um passo de cada vez, sem pular etapas.";

  return (
    <div className="lp-quiz" aria-live="polite">
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
                <button key={option} type="button" className={state} disabled={picked !== null} onClick={() => choose(i)}>
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
