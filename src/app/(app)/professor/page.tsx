"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProfile } from "@/lib/profile";
import { listThreads, replyToStudent, type Thread } from "@/lib/messages";

export default function ProfessorInbox() {
  const { ready, isTeacher } = useProfile();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  async function refresh() {
    const { data } = await listThreads();
    setThreads(data);
    setLoading(false);
    setSelectedId((prev) => prev ?? data[0]?.studentId ?? null);
  }

  useEffect(() => {
    if (!ready || !isTeacher) return;
    refresh();
  }, [ready, isTeacher]);

  const selected = threads.find((t) => t.studentId === selectedId) ?? null;

  async function handleReply() {
    if (!selected) return;
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    setErr("");
    const { error } = await replyToStudent(selected.studentId, selected.studentName, text);
    setSending(false);
    if (error) {
      setErr("Não consegui enviar a resposta. Tente de novo.");
      return;
    }
    setDraft("");
    await refresh();
  }

  if (!ready) {
    return (
      <div className="view">
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div className="view">
        <div className="hero" style={{ maxWidth: 560 }}>
          <div className="eyebrow">Acesso restrito</div>
          <h2>Esta área é do professor</h2>
          <p>Sua conta é de aluno. Se você é professor(a), peça para marcarem sua conta.</p>
          <Link href="/aluno" className="btn light">
            Voltar para a área do aluno →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="view">
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Painel do professor
      </div>
      <h2 style={{ fontSize: 22, marginBottom: 4 }}>Recados dos alunos</h2>
      <p className="muted" style={{ margin: "0 0 20px" }}>
        Leia e responda as mensagens que os alunos enviaram pela plataforma.
      </p>

      {loading ? (
        <p className="muted">Carregando recados…</p>
      ) : threads.length === 0 ? (
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            Nenhum recado por enquanto. Quando um aluno enviar uma mensagem, ela aparece aqui.
          </p>
        </div>
      ) : (
        <div className="inbox">
          <div className="inbox-list card" style={{ padding: 6 }}>
            {threads.map((t) => {
              const last = t.messages[t.messages.length - 1];
              return (
                <button
                  key={t.studentId}
                  className={`inbox-item${t.studentId === selectedId ? " on" : ""}`}
                  onClick={() => setSelectedId(t.studentId)}
                >
                  <span className="mini-av" style={{ background: "linear-gradient(135deg,#274a7d,#16263f)" }}>
                    {(t.studentName || "A").slice(0, 2).toUpperCase()}
                  </span>
                  <span className="inbox-item-body">
                    <b>{t.studentName}</b>
                    <span>{last?.sender === "tutor" ? "Você: " : ""}{last?.body}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="inbox-thread card">
            {selected ? (
              <>
                <div className="inbox-thread-head">
                  <b>{selected.studentName}</b>
                </div>
                <div className="tutor-thread" style={{ maxHeight: 360 }}>
                  {selected.messages.map((m) => (
                    <div key={m.id} className={`tutor-msg ${m.sender === "tutor" ? "student" : "tutor"}`}>
                      <p>{m.body}</p>
                      <time>
                        {new Date(m.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  ))}
                </div>
                <textarea
                  className="tutor-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Responder para ${selected.studentName}…`}
                  rows={3}
                />
                {err && <p className="auth-msg err" style={{ maxWidth: "none" }}>{err}</p>}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                  <button
                    className="btn primary"
                    onClick={handleReply}
                    disabled={sending || !draft.trim()}
                    style={{ opacity: sending || !draft.trim() ? 0.6 : 1 }}
                  >
                    {sending ? "Enviando…" : "Responder"}
                  </button>
                </div>
              </>
            ) : (
              <p className="muted">Selecione um aluno para ver a conversa.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
