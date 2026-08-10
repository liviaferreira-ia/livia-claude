"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

type Msg = { who: "ai" | "me"; text: string; corr?: string };

const OPENING: Msg[] = [
  { who: "ai", text: "Hi Marina! 👋 Let's talk about travel. Where did you go on your last trip?" },
  {
    who: "me",
    text: "I go to Rio de Janeiro last month.",
    corr: 'mais natural: "I went to Rio last month."',
  },
  { who: "ai", text: "Nice! Rio is beautiful. What did you do there?" },
];

const REPLIES = [
  "Great! Did you go to the beach?",
  "Sounds fun! Who did you travel with?",
  "Nice. What food did you try there?",
  "Awesome. Would you like to go back someday?",
];

export default function TutorPage() {
  const [msgs, setMsgs] = useState<Msg[]>(OPENING);
  const [text, setText] = useState("");
  const [replyIndex, setReplyIndex] = useState(0);
  const [ended, setEnded] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [msgs]);

  function push(m: Msg) {
    setMsgs((prev) => [...prev, m]);
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
          Você falou sobre sua viagem ao Rio 🎉
        </h2>
        <p className="muted" style={{ margin: "0 0 12px" }}>
          Boa conversa! Você se comunicou bem e experimentou o passado simples.
        </p>
        <div className="card" style={{ padding: 22 }}>
          <div className="scores">
            <div className="scorecell"><b>84</b><span>Comunicação</span></div>
            <div className="scorecell"><b>71</b><span>Gramática</span></div>
            <div className="scorecell"><b>78</b><span>Vocabulário</span></div>
            <div className="scorecell"><b>74</b><span>Fluência</span></div>
          </div>
          <div className="fbrow">
            <span className="ic tint-navy">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5" /></svg>
            </span>
            <div>
              <b style={{ fontSize: 14 }}>Ponto forte — pedidos claros</b>
              <div className="muted" style={{ fontSize: 13.5 }}>
                &quot;Could you help me, please?&quot; — ótimo uso de linguagem educada.
              </div>
            </div>
          </div>
          <div className="fbrow">
            <span className="ic tint-gold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
            </span>
            <div>
              <b style={{ fontSize: 14 }}>Para melhorar — passado simples</b>
              <div className="muted" style={{ fontSize: 13.5 }}>
                Você disse <i>&quot;I go to Rio&quot;</i> → o correto é{" "}
                <b>&quot;I went to Rio&quot;</b>. Para ações concluídas no passado, use{" "}
                <i>went</i>.
              </div>
            </div>
          </div>
          <div className="fbrow">
            <span className="ic tint-warn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2v20M2 12h20" /></svg>
            </span>
            <div>
              <b style={{ fontSize: 14 }}>Próximo passo</b>
              <div className="muted" style={{ fontSize: 13.5 }}>
                Adicionamos <b>passado simples</b> ao seu foco. A missão de amanhã
                terá 1 atividade sobre isso.
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
          <Link href="/aluno" className="btn primary">Voltar ao início</Link>
          <button className="btn ghost" onClick={() => { setMsgs(OPENING); setEnded(false); setReplyIndex(0); }}>
            Praticar de novo
          </button>
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
          <span className="muted">Nível A2 · ~8 min</span>
        </div>
      </div>

      <div className="chat" ref={chatRef}>
        {msgs.map((m, i) => (
          <div className={`msg ${m.who}`} key={i}>
            <span className="who">{m.who === "me" ? "MS" : "AI"}</span>
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
