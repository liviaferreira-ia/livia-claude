"use client";

import { useEffect, useRef, useState } from "react";
import { SpeakButton } from "@/components/SpeakButton";
import { createRecognition, isSTTSupported, recognitionErrorMessage, type SpeechRecognitionLike } from "@/lib/speech";
import styles from "./SpeakCheck.module.css";

type Verdict = "certo" | "quase" | "tente_de_novo";
type Check = { result: Verdict; feedback: string; suggestion: string };
type Phase = "idle" | "listening" | "checking" | "done";

const LABEL: Record<Verdict, string> = { certo: "Muito bem!", quase: "Quase lá", tente_de_novo: "Tente de novo" };

const micIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
  </svg>
);

/**
 * Microfone de uma pergunta da etapa "Sua vez": o aluno responde em voz alta, o navegador
 * transforma a fala em texto e a IA diz se a resposta foi entendida e está adequada.
 * Sem reconhecimento de voz no navegador, o aluno pode escrever a resposta.
 */
export function SpeakCheck({ lessonId, index }: { lessonId: string; index: number }) {
  const [supported, setSupported] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [heard, setHeard] = useState("");
  const [typed, setTyped] = useState("");
  const [check, setCheck] = useState<Check | null>(null);
  const [error, setError] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSupported(isSTTSupported()), 0);
    return () => { window.clearTimeout(timer); recRef.current?.abort(); };
  }, []);

  async function submit(text: string) {
    setHeard(text);
    setCheck(null);
    setError("");
    setPhase("checking");
    try {
      const response = await fetch("/api/aluno/fala", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, index, heard: text }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.result) {
        setError(body?.error ?? "Não consegui conferir agora. Tente de novo.");
        setPhase("idle");
        return;
      }
      setCheck({ result: body.result, feedback: body.feedback, suggestion: body.suggestion });
      setPhase("done");
    } catch {
      setError("Falha de conexão. Tente de novo.");
      setPhase("idle");
    }
  }

  function listen() {
    setError("");
    const rec = createRecognition();
    if (!rec) { setSupported(false); return; }
    recRef.current = rec;
    rec.onresult = (event) => {
      const said = String(event.results[0][0].transcript ?? "").trim();
      if (said) void submit(said);
      else { setError("Não ouvi nada. Toque no microfone e responda em inglês."); setPhase("idle"); }
    };
    rec.onerror = (event) => { setError(recognitionErrorMessage(event?.error ?? "")); setPhase("idle"); };
    rec.onend = () => setPhase((current) => (current === "listening" ? "idle" : current));
    setPhase("listening");
    try { rec.start(); } catch { setPhase("idle"); }
  }

  function reset() {
    setPhase("idle");
    setCheck(null);
    setHeard("");
    setTyped("");
    setError("");
  }

  return (
    <div className={styles.box}>
      {phase !== "done" && (supported ? (
        <div className={styles.row}>
          <button type="button" className={`${styles.mic}${phase === "listening" ? ` ${styles.rec}` : ""}`} onClick={listen} disabled={phase === "listening" || phase === "checking"} aria-label="Responder em voz alta">
            {micIcon}
          </button>
          <span className={styles.status} aria-live="polite">
            {phase === "listening" ? "Ouvindo… responda em inglês" : phase === "checking" ? "Conferindo sua resposta…" : "Responda em voz alta e confira"}
          </span>
        </div>
      ) : (
        <form className={styles.typeRow} onSubmit={(event) => { event.preventDefault(); if (typed.trim()) void submit(typed.trim()); }}>
          <input value={typed} onChange={(event) => setTyped(event.target.value)} maxLength={300} placeholder="Escreva sua resposta em inglês" aria-label="Sua resposta em inglês" lang="en" disabled={phase === "checking"} />
          <button type="submit" className="btn primary" disabled={!typed.trim() || phase === "checking"}>{phase === "checking" ? "Conferindo…" : "Conferir"}</button>
        </form>
      ))}

      {error && <p className={styles.error} role="alert">{error}</p>}

      {phase === "done" && check && (
        <div className={`${styles.result} ${styles[check.result]}`} aria-live="polite">
          <div className={styles.resultHead}>
            <b>{LABEL[check.result]}</b>
            <span>Você disse: <i lang="en">“{heard}”</i></span>
          </div>
          <p className={styles.feedback}>{check.feedback}</p>
          {check.suggestion && (
            <div className={styles.suggestion}>
              <span>Sugestão:</span>
              <b lang="en" translate="no">{check.suggestion}</b>
              <SpeakButton text={check.suggestion} label="Ouvir" />
            </div>
          )}
          <button type="button" className={styles.again} onClick={reset}>↺ Responder de novo</button>
        </div>
      )}
    </div>
  );
}
