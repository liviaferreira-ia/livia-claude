"use client";
import { useState } from "react";
import type { A1Draft } from "@/data/a1Drafts";

export function A1GuidedPractice({ questions }: { questions: A1Draft["questions"] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const normalize = (text: string) => text.trim().toLocaleLowerCase("en").replace(/[’‘]/g, "'").replace(/[.!?]+$/, "");
  return <section className="card" style={{ padding: 20, marginTop: 20 }}>
    <h3>Prática guiada</h3>
    {questions.map((question, index) => {
      const correct = normalize(answers[index] ?? "") === normalize(question.answer);
      return <form key={index} onSubmit={(event) => { event.preventDefault(); setChecked((current) => ({ ...current, [index]: true })); }} style={{ marginBottom: 24 }}>
        <fieldset style={{ border: 0, padding: 0, minWidth: 0 }}>
          <legend style={{ marginBottom: 10 }}>{question.prompt}</legend>
          {question.options ? question.options.map((option, optionIndex) => <label key={optionIndex} style={{ display: "block", margin: "10px 0" }}>
            <input type="radio" name={`question-${index}`} value={String(optionIndex)} checked={answers[index] === String(optionIndex)} onChange={(event) => { setAnswers((current) => ({ ...current, [index]: event.target.value })); setChecked((current) => ({ ...current, [index]: false })); }} /> {option}
          </label>) : <input aria-label={`Resposta para ${question.prompt}`} value={answers[index] ?? ""} onChange={(event) => { setAnswers((current) => ({ ...current, [index]: event.target.value })); setChecked((current) => ({ ...current, [index]: false })); }} style={{ maxWidth: "100%", boxSizing: "border-box", padding: 10 }} />}
          <button type="submit" className="btn ghost" disabled={!answers[index]?.trim()}>Conferir resposta</button>
          {checked[index] && <div role="status"><p><b>{correct ? "Isso mesmo!" : "Tente novamente."}</b> {correct ? question.feedback : question.hint ?? "Leia a explicação acima e tente outra resposta."}</p>
            {!correct && <details><summary>Ver orientação</summary><p>{question.feedback}</p></details>}
          </div>}
        </fieldset>
      </form>;
    })}
    <p className="muted">Você pode tentar quantas vezes precisar.</p>
  </section>;
}
