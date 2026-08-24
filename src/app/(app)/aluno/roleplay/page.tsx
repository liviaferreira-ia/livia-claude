"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ROLEPLAYS, resolveRoleplayLevel, type Roleplay } from "@/data/pratica";
import { levelBadge } from "@/data/placement";
import { parseCefrLevel, useProfile } from "@/lib/profile";
import { completeTrackedModule } from "@/lib/module-events";
import {
  createRecognition,
  isSTTSupported,
  recognitionErrorMessage,
  speak,
  type SpeechRecognitionLike,
} from "@/lib/speech";

type Msg = { who: "ai" | "me"; text: string };

export default function RoleplayPage() {
  const { profile, ready } = useProfile();
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"idle" | "listening" | "done">("idle");
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const roleplayLevel = resolveRoleplayLevel(parseCefrLevel(profile.level) ?? "A2");
  const scenarios = ROLEPLAYS[roleplayLevel];
  const roleplay = scenarios.find((r) => r.id === chosenId) ?? null;
  const SCRIPT = roleplay?.steps ?? [];
  const started = messages.length > 0;

  useEffect(() => {
    const timer = window.setTimeout(() => setSupported(isSTTSupported()), 0);
    return () => {
      window.clearTimeout(timer);
      recRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  function start(r: Roleplay) {
    setChosenId(r.id);
    setStep(0);
    setMessages([{ who: "ai", text: r.steps[0].ai }]);
    setPhase("idle");
    speak(r.steps[0].ai);
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
      if (roleplay) void completeTrackedModule("roleplay", roleplay.id).catch(() => {
        setError("A missão terminou, mas não foi possível registrar o progresso. Tente novamente.");
      });
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

  /** Volta pra lista de cenários. */
  function backToList() {
    setChosenId(null);
    setMessages([]);
    setStep(0);
    setPhase("idle");
    setError("");
  }

  // Tela inicial do cenário
  if (!ready) {
    return (
      <div className="view">
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  // Escolha do cenário
  if (!started || !roleplay) {
    return (
      <div className="view" style={{ maxWidth: 700 }}>
        <div className="eyebrow" style={{ color: "var(--gold)" }}>
          Roleplay por voz · {levelBadge(roleplayLevel)}
        </div>
        <h2 style={{ fontSize: 24, margin: "6px 0 6px" }}>Escolha uma situação</h2>
        <p className="muted" style={{ margin: "0 0 20px" }}>
          Seu par de conversa fala primeiro. Toque no microfone e responda em inglês — não precisa
          ser perfeito!
        </p>

        <div className="card" style={{ padding: 8 }}>
          {scenarios.map((r) => (
            <button
              key={r.id}
              className="m-item"
              onClick={() => start(r)}
              style={{ width: "100%", textAlign: "left", background: "none", border: 0, cursor: "pointer", font: "inherit", color: "inherit" }}
            >
              <span className="m-ic tint-gold" style={{ fontSize: 18 }}>
                {r.emoji}
              </span>
              <span className="m-body">
                <b>{r.title}</b>
                <span>{r.scenario}</span>
              </span>
              <span className="m-state todo">{r.steps.length} turnos</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Tela final
  if (phase === "done") {
    return (
      <div className="view" style={{ maxWidth: 640 }}>
        <div className="card done" style={{ padding: 28 }}>
          <div style={{ fontSize: 46 }}>🎉</div>
          <h2 style={{ fontSize: 22, margin: "6px 0 6px" }}>Você completou: {roleplay.title}!</h2>
          <p className="muted" style={{ margin: "0 0 20px" }}>
            Ótima conversa. Praticar situações reais é o que faz você falar com confiança.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn primary" onClick={() => start(roleplay)}>
              Fazer de novo
            </button>
            <button className="btn ghost" onClick={backToList}>
              Escolher outra situação
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
        <span>{roleplay.emoji}</span>
        <div>
          <b>{roleplay.title}</b>{" "}
          <span className="muted">
            Turno {step + 1} de {SCRIPT.length} · fale em inglês quando for sua vez.
          </span>
        </div>
        <button className="pill-btn" style={{ marginLeft: "auto" }} onClick={backToList}>
          Trocar
        </button>
      </div>

      <div className="chat" ref={chatRef}>
        {messages.map((m, i) => (
          <div className={`msg ${m.who}`} key={i}>
            <span className="who">{m.who === "me" ? "EU" : "EN"}</span>
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
