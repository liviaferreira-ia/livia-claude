"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { initials, useProfile } from "@/lib/profile";

type Msg = { who: "ai" | "me"; text: string; corr?: string };

const REPLIES = [
  "Great! Did you go to the beach?",
  "Sounds fun! Who did you travel with?",
  "Nice. What food did you try there?",
  "Awesome. Would you like to go back someday?",
];

export default function TutorPage() {
  const { profile, ready } = useProfile();
  const first = profile.name.split(" ")[0] || "there";
  const opening: Msg[] = [
    { who: "ai", text: `Hi ${first}! 👋 Let's talk about travel. Where did you go on your last trip?` },
  ];

  // Só as mensagens trocadas depois da saudação. A saudação é derivada aqui
  // porque depende do nome, que só chega depois da sessão carregar.
  const [replies, setReplies] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [replyIndex, setReplyIndex] = useState(0);
  const [ended, setEnded] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const msgs: Msg[] = ready ? [...opening, ...replies] : replies;
  const written = replies.filter((m) => m.who === "me").length;

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [msgs.length]);

  function push(m: Msg) {
    setReplies((prev) => [...prev, m]);
  }

  function send() {
    const v = text.trim();
    if (!v) return;
    push({ who: "me", text: v });
    setText("");
    setTimeout(() => {
      push({ who: "ai", text: REPLIES[replyIndex % REPLIES.length] });
      setReplyIndex((i) => i + 1);
    }, 600);
  }

  if (ended) {
    return (
      <div className="view" style={{ maxWidth: 700 }}>
        <div className="eyebrow">Prática concluída</div>
        <h2 style={{ fontSize: 22, margin: "6px 0 4px" }}>
          Você escreveu {written} {written === 1 ? "frase" : "frases"} em inglês 🎉
        </h2>
        <p className="muted" style={{ margin: "0 0 12px" }}>
          Escrever sem medo de errar é o que destrava a conversa. Continue praticando!
        </p>
        <div className="card" style={{ padding: 22 }}>
          <div className="fbrow">
            <span className="ic tint-navy">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5" /></svg>
            </span>
            <div>
              <b style={{ fontSize: 14 }}>Quer correção de verdade?</b>
              <div className="muted" style={{ fontSize: 13.5 }}>
                Mande suas dúvidas para o seu professor pelos recados, na tela inicial — ele lê e
                responde pessoalmente.
              </div>
            </div>
          </div>
          <div className="fbrow">
            <span className="ic tint-gold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
            </span>
            <div>
              <b style={{ fontSize: 14 }}>Treine a mesma estrutura</b>
              <div className="muted" style={{ fontSize: 13.5 }}>
                Os exercícios do seu nível têm correção automática e explicação em cada questão.
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
          <Link href="/aluno/praticar" className="btn primary">Ir para os exercícios →</Link>
          <button className="btn ghost" onClick={() => { setReplies([]); setEnded(false); setReplyIndex(0); }}>
            Praticar de novo
          </button>
          <Link href="/aluno" className="btn ghost">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="view" style={{ maxWidth: 700 }}>
      <div className="objbar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <div>
          <b>Objetivo:</b> falar sobre uma viagem recente usando o passado simples.{" "}
          <span className="muted">~8 min</span>
        </div>
      </div>

      <p className="est-note" style={{ margin: "0 0 12px" }}>
        Prática guiada com perguntas prontas — ela puxa conversa, mas ainda não lê o que você
        escreve. Para correção de verdade, use os exercícios ou fale com seu professor.
      </p>

      <div className="chat" ref={chatRef}>
        {msgs.map((m, i) => (
          <div className={`msg ${m.who}`} key={i}>
            <span className="who">{m.who === "me" ? initials(profile.name) : "EN"}</span>
            <div className="bubble">
              {m.text}
              {m.corr && <span className="corr">✎ {m.corr}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="composer">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Escreva sua resposta em inglês…"
          autoComplete="off"
        />
        <button className="btn primary" onClick={send} aria-label="Enviar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>

      <div className="tutor-tools">
        <button className="pill-btn" onClick={() => push({ who: "ai", text: "Em português: estou te perguntando o que você fez na viagem. Tente responder no passado — por exemplo: \"I visited...\", \"I ate...\"." })}>
          🇧🇷 Explicar em português
        </button>
        <button className="pill-btn" onClick={() => push({ who: "ai", text: '💡 Dica: comece com "I went to..." ou "I visited...".' })}>
          💡 Dica
        </button>
        <button className="pill-btn" onClick={() => setEnded(true)}>
          ✓ Encerrar e ver feedback
        </button>
      </div>
    </div>
  );
}
