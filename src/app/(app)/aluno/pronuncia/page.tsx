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

type Phase = "idle" | "listening" | "result";

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

  const pronunciationLevel = resolvePronunciationLevel(
    courseQuery.context?.level ?? parseCefrLevel(profile.level) ?? "A2",
  );
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
    rec.onresult = (e) => {
      const said = e.results[0][0].transcript as string;
      setTranscript(said);
      const hw = normalize(said).split(" ");
      const m = normalize(target).split(" ").filter((w) => hw.includes(w)).length;
      setScoreSum((s) => s + Math.round((m / targetWords.length) * 100));
      setAnswered((a) => a + 1);
      setPhase("result");
    };
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

  function next() {
    if (index === SENTENCES.length - 1) {
      setIndex(SENTENCES.length); // marca fim
      const finalAvg = answered ? Math.round(scoreSum / answered) : 0;
      void completeTrackedModule("pronunciation", String(SENTENCES.length), finalAvg >= 70).catch(() => {
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
      <div className="view">
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  // Tela final
  if (index >= SENTENCES.length) {
    const avg = answered ? Math.round(scoreSum / answered) : 0;
    return (
      <div className="view" style={{ maxWidth: 640 }}>
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

  return (
    <div className="view" style={{ maxWidth: 640 }}>
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
