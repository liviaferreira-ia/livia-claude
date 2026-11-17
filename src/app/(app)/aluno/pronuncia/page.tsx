"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { normalize } from "@/data/exercises";
import { SpeakButton } from "@/components/SpeakButton";
import { PRONUNCIATION, resolvePronunciationLevel } from "@/data/pratica";
import { parseCefrLevel, useProfile } from "@/lib/profile";
import { completeTrackedModule } from "@/lib/module-events";
import { useCourseContextFromLocation } from "@/lib/courseProgress";
import {
  createRecognition,
  isSTTSupported,
  recognitionErrorMessage,
  speak,
  type SpeechRecognitionLike,
} from "@/lib/speech";
import { useDesignV2 } from "@/lib/useDesignV2";
import { useAnswerRecorder } from "@/lib/useAnswerRecorder";
import v2s from "./pronuncia-v2.module.css";

type Phase = "idle" | "listening" | "checking" | "result";

export default function PronunciaPage() {
  const { profile, ready } = useProfile();
  const courseQuery = useCourseContextFromLocation();
  const [supported, setSupported] = useState(true);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [scoreSum, setScoreSum] = useState(0);
  const [answered, setAnswered] = useState(0);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const v2 = useDesignV2();

  const studentLevel = courseQuery.context?.level ?? parseCefrLevel(profile.level) ?? "A2";
  const pronunciationLevel = resolvePronunciationLevel(studentLevel);
  const SENTENCES = PRONUNCIATION[pronunciationLevel];

  useEffect(() => {
    const timer = window.setTimeout(() => setSupported(isSTTSupported()), 0);
    return () => {
      window.clearTimeout(timer);
      recRef.current?.abort();
    };
  }, []);

  // Toca a frase de referência automaticamente ao abrir e ao trocar de frase.
  useEffect(() => {
    if (!ready || !courseQuery.ready) return;
    const sentence = SENTENCES[index];
    if (sentence) speak(sentence);
  }, [index, ready, courseQuery.ready, SENTENCES]);

  const target = SENTENCES[index] ?? "";
  const targetWords = normalize(target).split(" ");
  const heardWords = transcript ? normalize(transcript).split(" ") : [];
  const matched = targetWords.filter((w) => heardWords.includes(w)).length;
  const pct = phase === "result" ? Math.round((matched / targetWords.length) * 100) : 0;

  function listen() {
    setError("");
    setTranscript("");
    const rec = createRecognition();
    if (!rec) {
      setSupported(false);
      return;
    }
    recRef.current = rec;
    rec.onresult = (e) => applyHeard(e.results[0][0].transcript as string);
    rec.onerror = (e) => {
      setError(recognitionErrorMessage(e?.error ?? ""));
      setPhase("idle");
    };
    rec.onend = () => {
      setPhase((p) => (p === "listening" ? "idle" : p));
    };
    setPhase("listening");
    try {
      rec.start();
    } catch {
      setPhase("idle");
    }
  }

  function applyHeard(said: string) {
    setTranscript(said);
    const hw = normalize(said).split(" ");
    const m = normalize(target).split(" ").filter((w) => hw.includes(w)).length;
    setScoreSum((s) => s + Math.round((m / targetWords.length) * 100));
    setAnswered((a) => a + 1);
    setPhase("result");
  }

  async function transcribe(audio: File) {
    setPhase("checking");
    try {
      const form = new FormData();
      form.append("audio", audio);
      const response = await fetch("/api/aluno/transcrever", { method: "POST", body: form });
      const data = await response.json().catch(() => null);
      if (!response.ok || typeof data?.heard !== "string") {
        setError(data?.error ?? "Não consegui ouvir agora. Tente de novo.");
        setPhase("idle");
        return;
      }
      applyHeard(data.heard);
    } catch {
      setError("Falha de conexão. Tente de novo.");
      setPhase("idle");
    }
  }

  // Visual novo: grava e transcreve no servidor (o reconhecimento do navegador falhou no teste do Fabio, 17/11/2026).
  const { supported: canRecord, recording, error: recError, setError: setRecError, start: startRecording, stop: stopRecording, levelRef } =
    useAnswerRecorder((audio) => void transcribe(audio));

  function listenV2() {
    setError("");
    setTranscript("");
    setRecError("");
    void startRecording();
  }

  function next() {
    if (index === SENTENCES.length - 1) {
      setIndex(SENTENCES.length); // marca fim
      const finalAvg = answered ? Math.round(scoreSum / answered) : 0;
      void completeTrackedModule("pronunciation", String(SENTENCES.length), finalAvg >= 70, studentLevel).catch(() => {
        setError("A prática terminou, mas não foi possível registrar o progresso. Tente novamente.");
      });
      return;
    }
    setIndex((i) => i + 1);
    setPhase("idle");
    setTranscript("");
    setError("");
  }

  function restart() {
    setIndex(0);
    setPhase("idle");
    setTranscript("");
    setError("");
    setScoreSum(0);
    setAnswered(0);
  }

  if (!ready || !courseQuery.ready) {
    return (
      <div className="view v2-wide">
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  // Tela final
  if (index >= SENTENCES.length) {
    const avg = answered ? Math.round(scoreSum / answered) : 0;
    return (
      <div className="view v2-wide" style={{ maxWidth: 640 }}>
        <div className="card done" style={{ padding: 28 }}>
          <div className="big">{avg}%</div>
          <p className="muted" style={{ margin: "6px 0 20px" }}>
            Média de clareza nas {answered} frases. Continue praticando o som das palavras! 🌱
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn primary" onClick={restart}>
              Praticar de novo
            </button>
            <Link href="/aluno" className="btn ghost">
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Design v2: frase de um lado (ouça e leia) e microfone/resultado do outro (fale)
  // (ajuste do Fabio em 17/11/2026: melhorar a disposição das informações).
  if (v2) {
    const micIcon = (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
      </svg>
    );
    return (
      <div className={`view ${v2s.page}`}>
        <header className={v2s.head}>
          <div className={v2s.headText}>
            <div className="eyebrow">Pronúncia · nível {pronunciationLevel}</div>
            <h1>Fale em inglês</h1>
            <p>Ouça a frase, repita em voz alta e veja quais palavras ficaram claras.</p>
          </div>
          <div className={v2s.headSide}>
            <div className={v2s.count}>
              <span><b>Frase {index + 1}</b> de {SENTENCES.length}</span>
              <div className={v2s.bar}><i style={{ width: `${Math.round((index / SENTENCES.length) * 100)}%` }} /></div>
            </div>
            <Link href="/aluno" className="btn ghost">Sair</Link>
          </div>
        </header>

        <section className={`card ${v2s.stage}`}>
          <div className={v2s.col}>
            <span className={v2s.label}><i>1</i> Ouça e leia</span>
            {phase === "result" ? (
              <div className={v2s.words}>
                {targetWords.map((w, i) => (
                  <span key={i} className={`pw ${heardWords.includes(w) ? "ok" : "no"}`}>
                    {target.split(" ")[i] ?? w}
                  </span>
                ))}
              </div>
            ) : (
              <p className={v2s.sentence} lang="en">{target}</p>
            )}
            <SpeakButton text={target} label="Ouvir de novo" className={v2s.listen} />
          </div>

          <div className={`${v2s.col} ${v2s.speakCol}`}>
            <span className={v2s.label}><i>2</i> Fale em voz alta</span>
            {!canRecord ? (
              <div className={`fb no ${v2s.error}`}>
                <strong>Este navegador não permite gravar áudio. </strong>
                Use o Chrome, o Edge ou o Safari atualizados. Você ainda pode ouvir a frase e repetir.
              </div>
            ) : phase === "result" ? (
              <div className={`${v2s.result} ${pct >= 70 ? v2s.ok : v2s.no}`}>
                <div className={v2s.score}>
                  <b>{pct}%</b>
                  <span>{pct >= 85 ? "Muito claro!" : pct >= 60 ? "Quase lá!" : "Vamos praticar mais."}</span>
                </div>
                <p className={v2s.heard}>Das palavras da frase, {matched} de {targetWords.length} foram reconhecidas. Eu ouvi: <i>“{transcript}”</i></p>
                <div className={v2s.actions}>
                  <button className="btn ghost" onClick={listenV2}>↺ Tentar de novo</button>
                  <button className="btn primary" onClick={next}>
                    {index === SENTENCES.length - 1 ? "Ver resultado" : "Próxima →"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {recording ? (
                  <button ref={levelRef} className={`mic-big ${v2s.recording}`} onClick={stopRecording} aria-label="Parar e conferir">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                  </button>
                ) : (
                  <button className="mic-big" onClick={listenV2} disabled={phase === "checking"} aria-label="Falar">
                    {micIcon}
                  </button>
                )}
                <p className={v2s.hint} aria-live="polite">
                  {recording ? "Gravando… leia a frase. Paro sozinho quando você terminar." : phase === "checking" ? "Conferindo sua fala…" : "Toque no microfone e leia a frase"}
                </p>
                {(error || recError) && <div className={`fb no ${v2s.error}`}>{error || recError}</div>}
              </>
            )}
          </div>
        </section>

        <p className={v2s.tip}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
          Dica: fale perto do microfone, num lugar silencioso. Toque no microfone, leia a frase inteira e espere: a gravação para sozinha.
        </p>
      </div>
    );
  }

  return (
    <div className="view v2-wide" style={{ maxWidth: 640 }}>
      <div className="lesson-head">
        <div>
          <div className="eyebrow" style={{ color: "var(--gold)" }}>
            Pronúncia · fale em inglês
          </div>
          <h2 style={{ fontSize: 20, marginTop: 4 }}>
            Frase {index + 1} de {SENTENCES.length}
          </h2>
        </div>
        <Link href="/aluno" className="btn ghost" style={{ padding: "8px 14px" }}>
          Sair
        </Link>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <p className="muted" style={{ textAlign: "center", margin: 0 }}>
          Repita a frase em voz alta:
        </p>

        {phase === "result" ? (
          <div className="pron-words">
            {targetWords.map((w, i) => (
              <span key={i} className={`pw ${heardWords.includes(w) ? "ok" : "no"}`}>
                {target.split(" ")[i] ?? w}
              </span>
            ))}
          </div>
        ) : (
          <div className="pron-sentence">{target}</div>
        )}

        <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
          <SpeakButton text={target} label="Ouvir referência" />
        </div>

        {!supported ? (
          <div className="fb no" style={{ marginTop: 22 }}>
            <strong>Microfone não disponível neste navegador. </strong>
            O reconhecimento de fala funciona no <b>Chrome</b> ou <b>Edge</b>. Você
            ainda pode usar o botão “Ouvir referência” acima.
          </div>
        ) : phase === "result" ? (
          <>
            <div className={`fb ${pct >= 70 ? "ok" : "no"}`} style={{ marginTop: 22 }}>
              <strong>
                {pct >= 85
                  ? "✓ Muito claro! "
                  : pct >= 60
                    ? "Quase lá! "
                    : "Vamos praticar mais. "}
                {pct}% das palavras reconhecidas.
              </strong>
              <div style={{ marginTop: 4, color: "var(--ink)" }}>
                Eu ouvi: <i>“{transcript}”</i>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
              <button className="btn ghost" style={{ flex: 1 }} onClick={listen}>
                ↺ Tentar de novo
              </button>
              <button className="btn primary" style={{ flex: 1 }} onClick={next}>
                {index === SENTENCES.length - 1 ? "Ver resultado" : "Próxima →"}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button
              className={`mic-big${phase === "listening" ? " rec" : ""}`}
              onClick={listen}
              disabled={phase === "listening"}
              aria-label="Falar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
              </svg>
            </button>
            <div className="muted" style={{ fontSize: 13, marginTop: 12 }}>
              {phase === "listening" ? "🎙️ Ouvindo… fale agora" : "Toque no microfone e leia a frase"}
            </div>
            {error && (
              <div className="fb no" style={{ marginTop: 16, textAlign: "left" }}>
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="muted" style={{ textAlign: "center", fontSize: 12.5, marginTop: 14 }}>
        A fala usa a voz do navegador (grátis). Depois dá para evoluir para avaliação
        por fonema (Azure) e conversa por voz com IA (OpenAI).
      </p>
    </div>
  );
}
