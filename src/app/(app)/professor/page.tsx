"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProfile } from "@/lib/profile";
import { listThreads, replyToStudent, type Thread } from "@/lib/messages";
import { listStudentActivity, type StudentActivity } from "@/lib/activity";

type Conversation = Thread & { level: string | null };

export default function ProfessorInbox() {
  const { ready, isTeacher } = useProfile();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const [threadResult, studentResult] = await Promise.all([listThreads(), listStudentActivity()]);
    setThreads(threadResult.data);
    setStudents(studentResult.data);
    setLoadErr(threadResult.error || studentResult.error ? "Não foi possível carregar todas as conversas. Tente atualizar." : "");
    setLoading(false);
    const availableIds = new Set([
      ...threadResult.data.map((thread) => thread.studentId),
      ...studentResult.data.map((student) => student.user_id),
    ]);
    setSelectedId((previous) =>
      previous && availableIds.has(previous)
        ? previous
        : threadResult.data[0]?.studentId ?? studentResult.data[0]?.user_id ?? null,
    );
  }, []);

  useEffect(() => {
    if (!ready || !isTeacher) return;
    const timer = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), 30_000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [ready, isTeacher, refresh]);

  const conversations = useMemo<Conversation[]>(() => {
    const byStudent = new Map<string, Conversation>();
    for (const thread of threads) {
      const student = students.find((item) => item.user_id === thread.studentId);
      byStudent.set(thread.studentId, {
        ...thread,
        studentName: student?.student_name || thread.studentName,
        level: student?.level ?? null,
      });
    }
    for (const student of students) {
      if (byStudent.has(student.user_id)) continue;
      byStudent.set(student.user_id, {
        studentId: student.user_id,
        studentName: student.student_name || "Aluno(a)",
        level: student.level,
        messages: [],
        lastAt: "",
      });
    }
    return [...byStudent.values()].sort((a, b) => {
      if (a.lastAt && b.lastAt) return a.lastAt < b.lastAt ? 1 : -1;
      if (a.lastAt) return -1;
      if (b.lastAt) return 1;
      return a.studentName.localeCompare(b.studentName, "pt-BR");
    });
  }, [students, threads]);

  const selected = conversations.find((conversation) => conversation.studentId === selectedId) ?? null;

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [selectedId, selected?.messages.length]);

  function selectStudent(studentId: string) {
    setSelectedId(studentId);
    setDraft("");
    setErr("");
  }

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
      <h2 style={{ fontSize: 22, marginBottom: 4 }}>Conversas com os alunos</h2>
      <p className="muted" style={{ margin: "0 0 20px" }}>
        Escolha qualquer aluno para ler o histórico ou iniciar uma nova conversa.
      </p>

      {loading ? (
        <p className="muted">Carregando recados…</p>
      ) : conversations.length === 0 ? (
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            Nenhum aluno cadastrado foi encontrado.
          </p>
        </div>
      ) : (
        <>
          {loadErr && <p className="auth-msg err" role="alert" style={{ maxWidth: "none" }}>{loadErr}</p>}
          <div className="card" style={{ marginBottom: 14, padding: 16 }}>
            <label htmlFor="conversation-student" style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 7 }}>
              Com quem você quer falar?
            </label>
            <select
              id="conversation-student"
              value={selectedId ?? ""}
              onChange={(event) => selectStudent(event.target.value)}
              style={{ width: "100%", maxWidth: 430 }}
            >
              {conversations.map((conversation) => (
                <option key={conversation.studentId} value={conversation.studentId}>
                  {conversation.studentName}{conversation.level ? ` · ${conversation.level}` : ""}{conversation.messages.length ? "" : " · nova conversa"}
                </option>
              ))}
            </select>
          </div>

          <div className="inbox">
          <div className="inbox-list card" style={{ padding: 6 }}>
            {conversations.map((t) => {
              const last = t.messages[t.messages.length - 1];
              return (
                <button
                  key={t.studentId}
                  className={`inbox-item${t.studentId === selectedId ? " on" : ""}`}
                  onClick={() => selectStudent(t.studentId)}
                >
                  <span className="mini-av" style={{ background: "linear-gradient(135deg,#274a7d,#16263f)" }}>
                    {(t.studentName || "A").slice(0, 2).toUpperCase()}
                  </span>
                  <span className="inbox-item-body">
                    <b>{t.studentName}{t.level ? ` · ${t.level}` : ""}</b>
                    <span>{last ? `${last.sender === "tutor" ? "Você: " : ""}${last.body}` : "Iniciar nova conversa"}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="inbox-thread card">
            {selected ? (
              <>
                <div className="inbox-thread-head">
                  <div>
                    <b>{selected.studentName}</b>
                    {selected.level && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Nível {selected.level}</div>}
                  </div>
                </div>
                <div className="tutor-thread" ref={threadRef} style={{ maxHeight: 360 }}>
                  {selected.messages.length === 0 ? (
                    <div className="empty-state" style={{ padding: "28px 12px" }}>
                      <p style={{ margin: 0 }}><b>Ainda não há mensagens.</b></p>
                      <p className="muted" style={{ margin: "5px 0 0" }}>Envie uma orientação para iniciar a conversa com {selected.studentName}.</p>
                    </div>
                  ) : selected.messages.map((m) => (
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
                  maxLength={2000}
                />
                {err && <p className="auth-msg err" style={{ maxWidth: "none" }}>{err}</p>}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginTop: 10 }}>
                  <span className="muted" style={{ fontSize: 12 }}>{draft.length}/2000</span>
                  <button
                    className="btn primary"
                    onClick={handleReply}
                    disabled={sending || !draft.trim()}
                    style={{ opacity: sending || !draft.trim() ? 0.6 : 1 }}
                  >
                    {sending ? "Enviando…" : selected.messages.length ? "Responder" : "Iniciar conversa"}
                  </button>
                </div>
              </>
            ) : (
              <p className="muted">Selecione um aluno para ver a conversa.</p>
            )}
          </div>
          </div>
        </>
      )}
    </div>
  );
}
