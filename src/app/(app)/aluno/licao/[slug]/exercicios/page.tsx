"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { LESSONS } from "@/data/lesson";
import { markSectionDone } from "@/lib/lessonProgress";
import { useProfile } from "@/lib/profile";
import { lessonCourseLocation, markCoursePhase } from "@/lib/courseProgress";

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
  const { bumpPractice } = useProfile();

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wasRight, setWasRight] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (!lesson) notFound();

  const questions = lesson.exercises.questions;
  const q = questions[index];
  const isLast = index === questions.length - 1;

  async function check() {
    if (answered) {
      await next();
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
    setSaving(true);
    setSaveError("");
    try {
      await bumpPractice(q.kind, ok, `${slug}-final-${index + 1}`, lesson.level, lesson.exercises.title);
      setWasRight(ok);
      setAnswered(true);
      if (ok) setCorrect((c) => c + 1);
    } catch {
      setSaveError("Não foi possível salvar esta resposta. Confira sua conexão e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function next() {
    if (isLast) {
      setSaving(true);
      setSaveError("");
      try {
        await markSectionDone(slug, "exercicios");
        const location = lessonCourseLocation(slug);
        const pct = Math.round((correct / questions.length) * 100);
        if (location && pct >= 80) {
          await markCoursePhase({
            ...location,
            phase: "mastery",
            source: "lesson_assessment",
            evidenceId: `${slug}:${correct}/${questions.length}`,
            path: `/aluno/licao/${slug}/exercicios`,
            title: lesson.exercises.title,
          });
        }
        setDone(true);
      } catch {
        setSaveError("Não foi possível concluir a tarefa. Confira sua conexão e tente novamente.");
      } finally {
        setSaving(false);
      }
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
  const selectedWord = q.kind === "mc" && selected !== null ? q.options[selected] : "";

  function chooseWord(optionIndex: number) {
    if (!answered) setSelected(optionIndex);
  }

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
          {promptHtml.length > 1 && q.kind === "mc" ? (
            <span
              className={`word-dropzone${selectedWord ? " filled" : ""}${answered ? (wasRight ? " ok" : " no") : ""}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const optionIndex = Number(event.dataTransfer.getData("text/plain"));
                if (Number.isInteger(optionIndex) && optionIndex >= 0 && optionIndex < q.options.length) {
                  chooseWord(optionIndex);
                }
              }}
            >
              {selectedWord || "clique ou arraste aqui"}
            </span>
          ) : promptHtml.length > 1 ? (
            <span className="blank">______</span>
          ) : null}
          {promptHtml[1]}
        </p>
        <p className="muted" style={{ margin: "0 0 20px" }}>
          {q.hint}
        </p>

        {q.kind === "mc" ? (
          <div className="word-bank" aria-label="Palavras disponíveis">
            {q.options.map((opt, k) => {
              let cls = "word-chip exercise-word";
              if (answered) {
                if (k === q.answer) cls += " ok";
                else if (k === selected) cls += " no";
              } else if (k === selected) {
                cls += " sel";
              }
              return (
                <button
                  key={k}
                  type="button"
                  className={cls}
                  disabled={answered}
                  draggable={!answered}
                  onDragStart={(event) => event.dataTransfer.setData("text/plain", String(k))}
                  onClick={() => chooseWord(k)}
                >
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
              if (e.key === "Enter") void check();
            }}
          />
        )}

        {answered && (
          <div className={`fb ${wasRight ? "ok" : "no"}`}>
            <strong>{wasRight ? "✓ Correto! " : "✗ Quase lá. "}</strong>
            {wasRight ? q.feedbackOk : q.feedbackNo}
          </div>
        )}

        {saveError && <p className="auth-msg err" role="alert">{saveError}</p>}

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button
            className="btn primary"
            style={{ flex: 1 }}
            disabled={saving || (!answered && (q.kind === "mc" ? selected === null : !text.trim()))}
            onClick={() => void check()}
          >
            {saving ? "Salvando…" : answered ? (isLast ? "Concluir tarefa" : "Próxima →") : "Verificar"}
          </button>
          <Link href={`/aluno/licao/${slug}`} className="btn ghost">
            Sair
          </Link>
        </div>
      </div>
    </div>
  );
}
