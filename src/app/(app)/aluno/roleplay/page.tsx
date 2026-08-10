"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  createRecognition,
  isSTTSupported,
  recognitionErrorMessage,
  speak,
  type SpeechRecognitionLike,
} from "@/lib/speech";

const SCRIPT = [
  {
    ai: "Good evening! Welcome to Central Hotel. How can I help you?",
    hint: 'Diga que tem uma reserva: "I have a reservation under Souza."',
  },
  {
    ai: "Let me check... Yes, for two nights, correct? Could I have your ID, please?",
    hint: 'Entregue o documento — "Here you are." — e pergunte: "What time is breakfast?"',
  },
  {
    ai: "Breakfast is from 7 to 10 am. Would you like a wake-up call?",
    hint: 'Responda: "Yes, please, at 7." ou "No, thank you."',
  },
  {
    ai: "Perfect. Here is your key card. Your room is 305. Enjoy your stay!",
    hint: 'Agradeça: "Thank you very much!"',
  },
];

type Msg = { who: "ai" | "me"; text: string };

export default function RoleplayPage() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"idle" | "listening" | "done">("idle");
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSupported(isSTTSupported());
    return () => recRef.current?.abort();
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  function start() {
    setStarted(true);
    setStep(0);
    setMessages([{ who: "ai", text: SCRIPT[0].ai }]);
    setPhase("idle");
    speak(SCRIPT[0].ai);
  }

  function handleStudent(said: string) {
    setMessages((m) => [...m, { who: "me", text: said }]);
    if (step < SCRIPT.length - 1) {
      const nextStep = step + 1;
      const line = SCRIPT[nextStep].ai;
      setStep(nextStep);
      setMessages((m) => [...m, { who: "ai", text: line }]);
      setPhase("idle");
      speak(line);
    } else {
      setPhase("done");
    }
  }

  function listen() {
    setError("");
    const rec = createRecognition();
    if (!rec) {
      setSupported(false);
      return;
    }
    recRef.current = rec;
    rec.onresult = (e) => handleStudent(e.results[0][0].transcript as string);
    rec.onerror = (e) => {
      setError(recognitionErrorMessage(e?.error ?? ""));
      setPhase("idle");
    };
    rec.onend = () => setPhase((p) => (p === "listening" ? "idle" : p));
    setPhase("listening");
    try {
      rec.start();
    } catch {
      setPhase("idle");
    }
  }

  function restart() {
    setStarted(false);
    setMessages([]);
    setStep(0);
    setPhase("idle");
    setError("");
  }

  // Tela inicial do cenário
  if (!started) {
    return (
      <div className="view" style={{ maxWidth: 640 }}>
        <div className="eyebrow" style={{ color: "var(--gold)" }}>
          Roleplay por voz
        </div>
        <h2 style={{ fontSize: 24, margin: "6px 0 12px" }}>🏨 Check-in no hotel</h2>
        <div className="card" style={{ padding: 24 }}>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6 }}>
            Você é o <b>hóspede</b> e a IA é o <b>recepcionista</b>. O objetivo é confirmar sua
            reserva, pegar a chave e perguntar o horário do café da manhã.
          </p>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 12 }}>
            A IA fala primeiro. Toque no microfone e responda em inglês — não precisa ser perfeito!
          </p>
        </div>
        <button className="btn primary" style={{ marginTop: 20 }} onClick={start}>
          Começar conversa →
        </button>
      </div>
    );
  }

  // Tela final
  if (phase === "done") {
    return (
      <div className="view" style={{ maxWidth: 640 }}>
        <div className="card done" style={{ padding: 28 }}>
          <div style={{ fontSize: 46 }}>🎉</div>
          <h2 style={{ fontSize: 22, margin: "6px 0 6px" }}>Você fez o check-in em inglês!</h2>
          <p className="muted" style={{ margin: "0 0 20px" }}>
            Ótima conversa. Praticar situações reais é o que faz você falar com confiança.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn primary" onClick={restart}>
              Fazer de novo
            </button>
            <Link href="/aluno" className="btn ghost">
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const lastAi = [...messages].reverse().find((m) => m.who === "ai");

  return (
    <div className="view" style={{ maxWidth: 640 }}>
      <div className="objbar">
        <span>🏨</span>
        <div>
          <b>Check-in no hotel</b> · você é o hóspede.{" "}
          <span className="muted">Fale em inglês quando for sua vez.</span>
        </div>
      </div>

      <div className="chat" ref={chatRef}>
        {messages.map((m, i) => (
          <div className={`msg ${m.who}`} key={i}>
            <span className="who">{m.who === "me" ? "EU" : "AI"}</span>
            <div className="bubble">{m.text}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "var(--gold-soft)",
          color: "var(--gold)",
          borderRadius: 12,
          padding: "12px 16px",
          fontSize: 14,
          margin: "14px 0",
        }}
      >
        💡 <b>Tente dizer:</b> {SCRIPT[step].hint}
      </div>

      {supported ? (
        <div style={{ textAlign: "center" }}>
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
            {phase === "listening" ? "🎙️ Ouvindo… fale agora" : "Toque no microfone e responda"}
          </div>
          {lastAi && (
            <div style={{ marginTop: 10 }}>
              <button className="speak-btn" onClick={() => speak(lastAi.text)}>
                🔊 Ouvir de novo
              </button>
            </div>
          )}
          {error && (
            <div className="fb no" style={{ marginTop: 16, textAlign: "left" }}>
              {error}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="fb no">
            <strong>Microfone não disponível neste navegador. </strong>
            O reconhecimento de fala funciona no <b>Chrome</b> ou <b>Edge</b>.
          </div>
          <button
            className="btn ghost"
            style={{ marginTop: 12 }}
            onClick={() => handleStudent("…")}
          >
            Avançar a conversa (sem falar)
          </button>
        </div>
      )}
    </div>
  );
}
