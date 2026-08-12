"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { LESSONS } from "@/data/lesson";
import { markSectionDone } from "@/lib/lessonProgress";

function normalize(s: string) {
  return (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/[.,!?;]/g, "")
    .replace(/\s+/g, " ");
}

export default function TarefaFinalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const lesson = LESSONS[slug];

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wasRight, setWasRight] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  if (!lesson) notFound();

  const questions = lesson.exercises.questions;
  const q = questions[index];
  const isLast = index === questions.length - 1;

  function check() {
    if (answered) {
      next();
      return;
    }
    let ok = false;
    if (q.kind === "mc") {
      if (selected === null) return;
      ok = selected === q.answer;
    } else {
      if (!text.trim()) return;
      ok = q.answers.some((a) => normalize(a) === normalize(text));
    }
    setWasRight(ok);
    setAnswered(true);
    if (ok) setCorrect((c) => c + 1);
  }

  function next() {
    if (isLast) {
      markSectionDone(slug, "exercicios");
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(false);
    setWasRight(false);
    setSelected(null);
    setText("");
  }

  function restart() {
    setIndex(0);
    setAnswered(false);
    setWasRight(false);
    setSelected(null);
    setText("");
    setCorrect(0);
    setDone(false);
  }

  if (done) {
    const pct = Math.round((correct / questions.length) * 100);
    const msg =
      pct >= 80
        ? lesson.exercises.praise
        : pct >= 50
          ? "Bom trabalho — revise os pontos que errou e tente de novo."
          : "Vamos praticar mais um pouco. Você consegue! 💪";
    return (
      <div className="view" style={{ maxWidth: 680 }}>
        <div className="card done" style={{ padding: 28 }}>
          <div className="big">
            {correct}/{questions.length}
          </div>
          <p className="muted" style={{ margin: "6px 0 20px" }}>
            {pct}% de acerto · {msg}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn primary" onClick={restart}>
              Praticar de novo
            </button>
            <Link href={`/aluno/licao/${slug}`} className="btn ghost">
              Voltar à lição
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const promptHtml = q.prompt.split("___");

  return (
    <div className="view" style={{ maxWidth: 680 }}>
      <div className="lesson-head">
        <div>
          <div className="eyebrow" style={{ color: "var(--gold)" }}>
            Tarefa final · {lesson.title}
          </div>
          <h2 style={{ fontSize: 22, marginTop: 4 }}>{lesson.exercises.title}</h2>
        </div>
        <div className="dots" aria-label={`Questão ${index + 1} de ${questions.length}`}>
          {questions.map((_, k) => (
            <i key={k} className={k < index ? "on" : k === index ? "cur" : ""} />
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <div className="eyebrow" style={{ color: "var(--gold)" }}>
          {q.type}
        </div>
        <p className="q-prompt">
          {promptHtml[0]}
          {promptHtml.length > 1 && <span className="blank">______</span>}
          {promptHtml[1]}
        </p>
        <p className="muted" style={{ margin: "0 0 20px" }}>
          {q.hint}
        </p>

        {q.kind === "mc" ? (
          <div>
            {q.options.map((opt, k) => {
              let cls = "opt";
              if (answered) {
                if (k === q.answer) cls += " ok";
                else if (k === selected) cls += " no";
              } else if (k === selected) {
                cls += " ok";
              }
              return (
                <button key={k} className={cls} disabled={answered} onClick={() => setSelected(k)}>
                  <span className="k">{"ABCD"[k]}</span>
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            className="fill-input"
            value={text}
            disabled={answered}
            autoComplete="off"
            placeholder="Digite sua resposta em inglês…"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") check();
            }}
          />
        )}

        {answered && (
          <div className={`fb ${wasRight ? "ok" : "no"}`}>
            <strong>{wasRight ? "✓ Correto! " : "✗ Quase lá. "}</strong>
            {wasRight ? q.feedbackOk : q.feedbackNo}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button className="btn primary" style={{ flex: 1 }} onClick={check}>
            {answered ? (isLast ? "Concluir tarefa" : "Próxima →") : "Verificar"}
          </button>
          <Link href={`/aluno/licao/${slug}`} className="btn ghost">
            Sair
          </Link>
        </div>
      </div>
    </div>
  );
}
