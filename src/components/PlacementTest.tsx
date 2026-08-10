"use client";

import { useState } from "react";
import { LEVEL_ORDER, LEVEL_LABEL, PASS_THRESHOLD, PLACEMENT_BANK } from "@/data/placement";

type Phase = "quiz" | "result";

export function PlacementTest({
  value,
  onComplete,
}: {
  value: string;
  onComplete: (level: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>(value ? "result" : "quiz");
  const [levelIdx, setLevelIdx] = useState(0);
  const [qInLevel, setQInLevel] = useState(0);
  const [blockCorrect, setBlockCorrect] = useState(0);
  const [highestPassed, setHighestPassed] = useState(-1);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [resultLevel, setResultLevel] = useState(value);

  const level = LEVEL_ORDER[levelIdx];
  const questions = PLACEMENT_BANK[level];
  const item = questions[qInLevel];

  function restart() {
    setPhase("quiz");
    setLevelIdx(0);
    setQInLevel(0);
    setBlockCorrect(0);
    setHighestPassed(-1);
    setSelected(null);
    setAnswered(false);
  }

  function finish(finalIdx: number) {
    const finalLevel = LEVEL_ORDER[Math.max(finalIdx, 0)];
    setResultLevel(finalLevel);
    setPhase("result");
    onComplete(finalLevel);
  }

  function next() {
    if (!answered) {
      if (selected === null) return;
      const ok = selected === item.answer;
      setAnswered(true);
      if (ok) setBlockCorrect((c) => c + 1);
      return;
    }

    if (qInLevel < questions.length - 1) {
      setQInLevel((q) => q + 1);
      setSelected(null);
      setAnswered(false);
      return;
    }

    const passed = blockCorrect >= PASS_THRESHOLD;
    const newHighest = passed ? levelIdx : highestPassed;
    if (passed && levelIdx < LEVEL_ORDER.length - 1) {
      setHighestPassed(newHighest);
      setLevelIdx((l) => l + 1);
      setQInLevel(0);
      setBlockCorrect(0);
      setSelected(null);
      setAnswered(false);
      return;
    }
    finish(newHighest);
  }

  if (phase === "result") {
    const label = LEVEL_LABEL[resultLevel as keyof typeof LEVEL_LABEL];
    return (
      <div>
        <h2 style={{ fontSize: 21, textAlign: "center" }}>Seu nível é {resultLevel}! 🎉</h2>
        <p className="muted" style={{ fontSize: 14, textAlign: "center", margin: "6px 0 20px" }}>
          {label ? `${label} — vamos calibrar sua trilha nesse ponto.` : "Vamos calibrar sua trilha nesse ponto."}
        </p>
        <button className="btn ghost" style={{ width: "100%" }} onClick={restart}>
          ↺ Refazer o teste
        </button>
      </div>
    );
  }

  const fb = answered ? { ok: selected === item.answer, explain: item.explain } : null;

  return (
    <div>
      <h2 style={{ fontSize: 21, textAlign: "center" }}>Vamos descobrir seu nível 📈</h2>
      <p className="muted" style={{ fontSize: 14, textAlign: "center", margin: "6px 0 8px" }}>
        Responda o quanto conseguir. O teste ajusta a dificuldade sozinho e para assim que encontra
        o seu nível — pode errar sem problema.
      </p>
      <p className="muted" style={{ fontSize: 12.5, textAlign: "center", margin: "0 0 18px", fontWeight: 700 }}>
        Testando nível {level} · questão {qInLevel + 1} de {questions.length}
      </p>

      <p className="q-prompt" style={{ fontSize: 17 }}>{item.prompt}</p>
      <div style={{ marginTop: 10 }}>
        {item.options.map((opt, k) => {
          let cls = "opt";
          if (answered) {
            if (k === item.answer) cls += " ok";
            else if (k === selected) cls += " no";
          } else if (k === selected) cls += " ok";
          return (
            <button key={k} className={cls} disabled={answered} onClick={() => setSelected(k)}>
              <span className="k">{"ABCD"[k]}</span>
              {opt}
            </button>
          );
        })}
      </div>

      {fb && (
        <div className={`fb ${fb.ok ? "ok" : "no"}`}>
          <strong>{fb.ok ? "✓ Correto! " : "✗ Quase lá. "}</strong>
          {fb.explain}
        </div>
      )}

      <button
        className="btn primary"
        style={{ width: "100%", marginTop: 16, opacity: !answered && selected === null ? 0.5 : 1 }}
        disabled={!answered && selected === null}
        onClick={next}
      >
        {answered ? "Continuar →" : "Verificar"}
      </button>
    </div>
  );
}
