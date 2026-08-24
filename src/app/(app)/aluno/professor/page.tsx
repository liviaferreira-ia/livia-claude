"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { listMyMessages, MAX_MESSAGE_LENGTH, sendMessage, type Message } from "@/lib/messages";
import { useProfile } from "@/lib/profile";

function messageTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StudentProfessorConversation() {
  const { ready } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const result = await listMyMessages();
    if (result.error) {
      setError("Não foi possível atualizar a conversa. Confira sua conexão.");
    } else {
      setMessages(result.data);
      setError("");
    }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(true), 30_000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [ready, refresh]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError("");
    setSent(false);
    const result = await sendMessage(text);
    if (result.error) {
      setError("Não foi possível enviar a mensagem. Tente novamente.");
      setSending(false);
      return;
    }
    setDraft("");
    setSent(true);
    await refresh(true);
    setSending(false);
  }

  if (!ready || loading) {
    return <div className="view"><p className="muted">Carregando conversa…</p></div>;
  }

  return (
    <div className="view" style={{ maxWidth: 780 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Acompanhamento humano</div>
      <h2 style={{ fontSize: 24, marginBottom: 5 }}>Fale com seu professor</h2>
      <p className="muted" style={{ margin: "0 0 20px" }}>
        Envie dúvidas sobre as aulas, peça orientação ou conte onde está com dificuldade.
      </p>

      <div className="card conversation-card">
        <div className="inbox-thread-head" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <b>Conversa com a Central School</b>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>As respostas aparecem aqui automaticamente.</div>
          </div>
          <button className="btn ghost" type="button" onClick={() => void refresh(true)} disabled={sending}>Atualizar</button>
        </div>

        <div className="tutor-thread" ref={threadRef} aria-live="polite">
          {messages.length === 0 ? (
            <div className="empty-state" style={{ padding: "28px 16px" }}>
              <p style={{ margin: 0 }}><b>A conversa começa por você.</b></p>
              <p className="muted" style={{ margin: "6px 0 0" }}>Escreva sua primeira mensagem abaixo.</p>
            </div>
          ) : messages.map((message) => (
            <div key={message.id} className={`tutor-msg ${message.sender}`}>
              <b style={{ display: "block", fontSize: 11.5, marginBottom: 4 }}>
                {message.sender === "student" ? "Você" : "Professor"}
              </b>
              <p>{message.body}</p>
              <time>{messageTime(message.created_at)}</time>
            </div>
          ))}
        </div>

        <label htmlFor="student-professor-message" style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 7 }}>
          Sua mensagem
        </label>
        <textarea
          id="student-professor-message"
          className="tutor-input"
          value={draft}
          onChange={(event) => { setDraft(event.target.value); setSent(false); }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Ex.: Professor, pode me ajudar a entender esta atividade?"
          rows={4}
          maxLength={MAX_MESSAGE_LENGTH}
        />
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginTop: 9, flexWrap: "wrap" }}>
          <span className="muted" style={{ fontSize: 12 }}>{draft.length}/{MAX_MESSAGE_LENGTH} · Ctrl + Enter para enviar</span>
          <button className="btn primary" type="button" onClick={() => void handleSend()} disabled={sending || !draft.trim()}>
            {sending ? "Enviando…" : "Enviar ao professor"}
          </button>
        </div>
        {error && <p className="auth-msg err" role="alert" style={{ maxWidth: "none" }}>{error}</p>}
        {sent && <p className="auth-msg ok" role="status" style={{ maxWidth: "none" }}>Mensagem enviada ao professor.</p>}
      </div>

      <Link href="/aluno" className="btn ghost" style={{ marginTop: 16 }}>← Voltar ao início</Link>
    </div>
  );
}
