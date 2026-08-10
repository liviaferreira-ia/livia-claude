"use client";

import Link from "next/link";
import { useState } from "react";
import { markSectionDone } from "@/lib/lessonProgress";

type Multiple = {
  kind: "mc";
  type: string;
  prompt: string;
  hint: string;
  options: string[];
  answer: number;
  feedbackOk: string;
  feedbackNo: string;
};

type Fill = {
  kind: "fill";
  type: string;
  prompt: string;
  hint: string;
  answers: string[];
  feedbackOk: string;
  feedbackNo: string;
};

type Question = Multiple | Fill;

const QUESTIONS: Question[] = [
  {
    kind: "mc",
    type: "Escolha a opção correta",
    prompt: "Good evening. I ___ a reservation under the name Souza.",
    hint: "Você chega ao hotel e informa que tem uma reserva.",
    options: ["has", "have", "had", "having"],
    answer: 1,
    feedbackOk: "Correto! Com o sujeito “I” usamos have. → “I have a reservation.”",
    feedbackNo: "Com o sujeito “I” usamos have. → “I have a reservation.”",
  },
  {
    kind: "fill",
    type: "Complete a frase",
    prompt: "___ time is breakfast?",
    hint: "Você quer saber o horário do café da manhã. (uma palavra)",
    answers: ["what"],
    feedbackOk: "Perfeito! “What time is breakfast?” = Que horas é o café da manhã?",
    feedbackNo: "A palavra é What. → “What time is breakfast?”",
  },
  {
    kind: "mc",
    type: "Escolha a opção correta",
    prompt: "Could I ___ in now, please?",
    hint: "Você quer fazer o registro de entrada no hotel.",
    options: ["check", "checking", "checked", "to check"],
    answer: 0,
    feedbackOk: "Isso! Depois de “Could I” usamos o verbo na forma base: check in.",
    feedbackNo: "Depois de “Could I” o verbo fica na forma base: “Could I check in?”",
  },
  {
    kind: "fill",
    type: "Tradução PT → EN",
    prompt: "Eu tenho uma reserva. → I ___ a reservation.",
    hint: "Lembre da regra do sujeito “I”.",
    answers: ["have"],
    feedbackOk: "Muito bem! “I have a reservation.”",
    feedbackNo: "A forma é have. → “I have a reservation.”",
  },
  {
    kind: "mc",
    type: "Escolha a opção correta",
    prompt: "Breakfast is served ___ 7 to 10 am.",
    hint: "Indicando o intervalo de horário.",
    options: ["in", "from", "at", "since"],
    answer: 1,
    feedbackOk: "Exato! Usamos from ... to para intervalos: “from 7 to 10 am.”",
    feedbackNo: "Para um intervalo usamos from ... to: “from 7 to 10 am.”",
  },
];

function normalize(s: string) {
  return (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/[.,!?;]/g, "")
    .replace(/\s+/g, " ");
}

export default function TarefaFinalPage() {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wasRight, setWasRight] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[index];
  const isLast = index === QUESTIONS.length - 1;

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
      markSectionDone("exercicios");
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
    const pct = Math.round((correct / QUESTIONS.length) * 100);
    const msg =
      pct >= 80
        ? "Excelente! Você domina o vocabulário do hotel. 🎉"
        : pct >= 50
          ? "Bom trabalho — revise os pontos que errou e tente de novo."
          : "Vamos praticar mais um pouco. Você consegue! 💪";
    return (
      <div className="view" style={{ maxWidth: 680 }}>
        <div className="card done" style={{ padding: 28 }}>
          <div className="big">
            {correct}/{QUESTIONS.length}
          </div>
          <p className="muted" style={{ margin: "6px 0 20px" }}>
            {pct}% de acerto · {msg}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn primary" onClick={restart}>
              Praticar de novo
            </button>
            <Link href="/aluno/licao" className="btn ghost">
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
            Tarefa final · Reservas e check-in
          </div>
          <h2 style={{ fontSize: 22, marginTop: 4 }}>Pratique tudo</h2>
        </div>
        <div className="dots" aria-label={`Questão ${index + 1} de ${QUESTIONS.length}`}>
          {QUESTIONS.map((_, k) => (
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
          <Link href="/aluno/licao" className="btn ghost">
            Sair
          </Link>
        </div>
      </div>
    </div>
  );
}
