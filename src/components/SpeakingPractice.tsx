"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SpeakButton } from "@/components/SpeakButton";
import styles from "./SpeakingPractice.module.css";

/**
 * "Converse com a Livia" — etapa "Sua vez" das aulas em vídeo (pedido do Fabio em 17/11/2026).
 * Uma pergunta por vez: o aluno toca no microfone, fala, a gravação para sozinha quando ele termina
 * (ou no botão Parar), o áudio é transcrito e conferido pela IA no servidor e só então aparece o resultado.
 * Acertou: segue para a próxima. Não acertou: vê a correção, ouve a frase sugerida e tenta de novo (ou pula).
 * Sem microfone, o aluno pode escrever a resposta.
 */

type Line = { en: string; pt: string; hint: string };
type Verdict = "certo" | "quase" | "tente_de_novo";
type Check = { heard: string; result: Verdict; feedback: string; suggestion: string };
type Phase = "ready" | "recording" | "checking" | "result" | "finished";

const LABEL: Record<Verdict, string> = { certo: "Muito bem!", quase: "Quase lá", tente_de_novo: "Tente de novo" };
const SPEECH_LEVEL = 0.035;
const SILENCE_MS = 1600;
const MAX_MS = 12_000;
const NO_SPEECH_MS = 7_000;

const icon = (d: ReactNode) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>;
const micIcon = icon(<><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" /></>);
const stopIcon = <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><rect x="6" y="6" width="12" height="12" rx="2" /></svg>;
const bulbIcon = icon(<><path d="M9 18h6M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></>);

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/ogg"].find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}
function extensionFor(type: string): string {
  const base = type.split(";")[0];
  return base === "audio/mp4" ? "mp4" : base === "audio/ogg" ? "ogg" : "webm";
}

export function SpeakingPractice({ lessonId, lines }: { lessonId: string; lines: Line[] }) {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [check, setCheck] = useState<Check | null>(null);
  const [results, setResults] = useState<(Verdict | null)[]>(() => lines.map(() => null));
  const [error, setError] = useState("");
  const [canRecord, setCanRecord] = useState(true);
  const [typed, setTyped] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);
  const micRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelledRef.current = false;
    const timer = window.setTimeout(() => setCanRecord(Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined"), 0);
    return () => { window.clearTimeout(timer); cancelledRef.current = true; releaseMic(); };
  }, []);

  function releaseMic() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }

  async function send(body: FormData | string) {
    setError("");
    setPhase("checking");
    try {
      const response = await fetch("/api/aluno/fala", typeof body === "string"
        ? { method: "POST", headers: { "Content-Type": "application/json" }, body }
        : { method: "POST", body });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.result) {
        setError(data?.error ?? "Não consegui conferir agora. Tente de novo.");
        setPhase("ready");
        return;
      }
      const verdict = data.result as Verdict;
      setCheck({ heard: data.heard ?? "", result: verdict, feedback: data.feedback ?? "", suggestion: data.suggestion ?? "" });
      setResults((prev) => prev.map((value, i) => (i === current ? (value === "certo" ? value : verdict) : value)));
      setPhase("result");
    } catch {
      setError("Falha de conexão. Tente de novo.");
      setPhase("ready");
    }
  }

  async function startRecording() {
    setError("");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setError(name === "NotAllowedError" ? "O microfone está bloqueado. Clique no cadeado ao lado do endereço do site, permita o microfone e tente de novo." : "Não encontrei um microfone. Verifique se há um conectado.");
      return;
    }
    streamRef.current = stream;
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = () => {
      releaseMic();
      if (cancelledRef.current) return;
      const type = recorder.mimeType || mimeType || "audio/webm";
      const blob = new Blob(chunks, { type });
      if (blob.size < 1200) {
        setError("Não ouvi nada. Toque no microfone e fale sua resposta em inglês.");
        setPhase("ready");
        return;
      }
      const form = new FormData();
      form.append("lessonId", lessonId);
      form.append("index", String(current));
      form.append("audio", new File([blob], `resposta.${extensionFor(type)}`, { type }));
      void send(form);
    };

    // Para sozinho: depois de ~1,6 s de silêncio que segue a fala, em 12 s no máximo,
    // ou em 7 s se não ouvir nada. O anel do botão acompanha o volume da voz.
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      const startedAt = performance.now();
      let spoke = false;
      let lastLoud = startedAt;
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) { const x = (data[i] - 128) / 128; sum += x * x; }
        const level = Math.sqrt(sum / data.length);
        const now = performance.now();
        if (level > SPEECH_LEVEL) { spoke = true; lastLoud = now; }
        micRef.current?.style.setProperty("--lvl", String(Math.min(1, level * 9)));
        if ((spoke && now - lastLoud > SILENCE_MS) || now - startedAt > MAX_MS || (!spoke && now - startedAt > NO_SPEECH_MS)) {
          stopRecording();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // Sem medidor de volume: o aluno para pelo botão (e o limite de 12 s continua valendo).
      window.setTimeout(stopRecording, MAX_MS);
    }

    recorder.start();
    setPhase("recording");
  }

  function retry() {
    setCheck(null);
    setError("");
    setTyped("");
    setPhase("ready");
  }

  function goTo(index: number) {
    if (phase === "recording" || phase === "checking") return;
    setCurrent(index);
    retry();
  }

  function next() {
    if (current >= lines.length - 1) { setPhase("finished"); setCheck(null); return; }
    goTo(current + 1);
  }

  function restart() {
    setResults(lines.map(() => null));
    setCurrent(0);
    retry();
  }

  if (lines.length === 0) return null;
  const line = lines[current];
  const rightCount = results.filter((value) => value === "certo").length;

  if (phase === "finished") {
    return (
      <section className={`card ${styles.wrap} ${styles.finished}`} aria-label="Converse com a Livia">
        <span className={styles.bigCheck} aria-hidden>{icon(<path d="M20 6 9 17l-5-5" />)}</span>
        <h3>Conversa concluída!</h3>
        <p>Você acertou {rightCount} de {lines.length} {lines.length === 1 ? "pergunta" : "perguntas"}. Quanto mais você fala, mais natural fica.</p>
        <button type="button" className="btn ghost" onClick={restart}>Praticar de novo</button>
      </section>
    );
  }

  return (
    <section className={`card ${styles.wrap}`} aria-label="Converse com a Livia">
      <div className={styles.top}>
        <span className={styles.count}>Pergunta {current + 1} de {lines.length}</span>
        <div className={styles.dots}>
          {lines.map((_, i) => (
            <button key={i} type="button" onClick={() => goTo(i)} disabled={phase === "recording" || phase === "checking"}
              className={`${styles.dot} ${i === current ? styles.dotOn : ""} ${results[i] ? styles[`dot_${results[i]}`] : ""}`}
              aria-label={`Pergunta ${i + 1}${results[i] ? `: ${LABEL[results[i] as Verdict]}` : ""}`} aria-current={i === current ? "step" : undefined} />
          ))}
        </div>
      </div>

      <div className={styles.question}>
        <p className={styles.en} lang="en" translate="no">{line.en}</p>
        <p className={styles.pt}>{line.pt}</p>
        <SpeakButton text={line.en} label="Ouvir a pergunta" />
      </div>
      <p className={styles.hint}>{bulbIcon}<span>{line.hint}</span></p>

      {(phase === "ready" || phase === "recording" || phase === "checking") && (canRecord ? (
        <div className={styles.recorder}>
          {phase === "recording" ? (
            <button ref={micRef} type="button" className={`${styles.mic} ${styles.recording}`} onClick={stopRecording} aria-label="Parar e conferir">{stopIcon}</button>
          ) : (
            <button type="button" className={styles.mic} onClick={() => void startRecording()} disabled={phase === "checking"} aria-label="Responder em voz alta">{micIcon}</button>
          )}
          <p className={styles.status} aria-live="polite">
            {phase === "recording" ? "Gravando… fale sua resposta. Paro sozinho quando você terminar." : phase === "checking" ? "Conferindo sua resposta…" : "Toque no microfone e responda em inglês"}
          </p>
          {phase === "checking" && <span className={styles.spinner} aria-hidden />}
        </div>
      ) : (
        <form className={styles.typeRow} onSubmit={(event) => { event.preventDefault(); if (typed.trim()) void send(JSON.stringify({ lessonId, index: current, heard: typed.trim() })); }}>
          <input value={typed} onChange={(event) => setTyped(event.target.value)} maxLength={300} placeholder="Escreva sua resposta em inglês" aria-label="Sua resposta em inglês" lang="en" disabled={phase === "checking"} />
          <button type="submit" className="btn primary" disabled={!typed.trim() || phase === "checking"}>{phase === "checking" ? "Conferindo…" : "Conferir"}</button>
        </form>
      ))}

      {error && <p className={styles.error} role="alert">{error}</p>}

      {phase === "result" && check && (
        <div className={`${styles.result} ${styles[check.result]}`} aria-live="polite">
          <div className={styles.resultHead}>
            <b>{LABEL[check.result]}</b>
            {check.heard && <span>Você disse: <i lang="en">“{check.heard}”</i></span>}
          </div>
          <p className={styles.feedback}>{check.feedback}</p>
          {check.suggestion && (
            <div className={styles.suggestion}>
              <span>{check.result === "certo" ? "Outra forma de dizer:" : "Repita assim:"}</span>
              <b lang="en" translate="no">{check.suggestion}</b>
              <SpeakButton text={check.suggestion} label="Ouvir" />
            </div>
          )}
          <div className={styles.actions}>
            {check.result === "certo" ? (
              <>
                <button type="button" className="btn primary" onClick={next}>{current >= lines.length - 1 ? "Concluir conversa" : "Próxima pergunta →"}</button>
                <button type="button" className="btn ghost" onClick={retry}>Responder de novo</button>
              </>
            ) : (
              <>
                <button type="button" className="btn primary" onClick={retry}>↺ Tentar de novo</button>
                <button type="button" className={styles.skip} onClick={next}>{current >= lines.length - 1 ? "Concluir mesmo assim" : "Pular para a próxima"}</button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
