"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  calcAge,
  formatDuration,
  formatLastLogin,
  isInactive,
  listStudentActivity,
  practiceTotals,
  type StudentActivity,
} from "@/lib/activity";
import { initials, levelDisplay, useProfile } from "@/lib/profile";

export default function ProfessorAlunosPage() {
  const { ready, isTeacher } = useProfile();
  const [rows, setRows] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!ready || !isTeacher) return;
    listStudentActivity().then(({ data, error }) => {
      setRows(data);
      setErr(error ?? "");
      setLoading(false);
    });
  }, [ready, isTeacher]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteMsg(null);
    try {
      const res = await fetch("/api/professor/convidar-aluno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inviteName.trim(), email: inviteEmail.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInviteMsg({ kind: "err", text: body.error || "Não consegui enviar o convite." });
        return;
      }
      setInviteMsg({ kind: "ok", text: `Convite enviado para ${inviteEmail.trim()}.` });
      setInviteName("");
      setInviteEmail("");
    } catch {
      setInviteMsg({ kind: "err", text: "Falha de conexão. Tente de novo." });
    } finally {
      setInviting(false);
    }
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
      <h2 style={{ fontSize: 22, marginBottom: 4 }}>Alunos</h2>
      <p className="muted" style={{ margin: "0 0 20px" }}>
        Último login, tempo médio na plataforma e progresso em prática de cada aluno.
      </p>

      <div className="card" style={{ padding: 18, marginBottom: 24, maxWidth: 520 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Cadastrar aluno
        </div>
        <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="field">
            <label htmlFor="invite-name">Nome do aluno</label>
            <input
              id="invite-name"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="invite-email">E-mail do aluno</label>
            <input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="aluno@exemplo.com"
              required
            />
          </div>
          {inviteMsg && <p className={`auth-msg ${inviteMsg.kind === "ok" ? "ok" : "err"}`}>{inviteMsg.text}</p>}
          <button
            type="submit"
            className="btn primary"
            style={{ alignSelf: "flex-start", opacity: inviting ? 0.6 : 1 }}
            disabled={inviting}
          >
            {inviting ? "Enviando…" : "Enviar convite por e-mail →"}
          </button>
          <p className="est-note" style={{ margin: 0 }}>
            O aluno recebe um e-mail pra criar a senha e já cai na plataforma.
          </p>
        </form>
      </div>

      {loading ? (
        <p className="muted">Carregando alunos…</p>
      ) : err ? (
        <div className="card" style={{ padding: 16 }}>
          <p className="muted" style={{ margin: 0 }}>Não consegui carregar os dados: {err}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="card" style={{ padding: 16 }}>
          <p className="muted" style={{ margin: 0 }}>
            Nenhum aluno logou ainda. Assim que alguém entrar na plataforma, aparece aqui.
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div
            className="rosterrow"
            style={{
              borderTop: "none",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink-faint)",
            }}
          >
            <span>Aluno</span>
            <span>Último login</span>
            <span>Tempo médio · exercícios</span>
            <span>Status</span>
          </div>
          {rows.map((r) => {
            const totals = practiceTotals(r);
            const avgSeconds = r.session_count > 0 ? r.total_seconds / r.session_count : 0;
            const needsAttention = totals.done === 0 || isInactive(r.last_login_at);
            const name = r.student_name || "Aluno(a)";
            return (
              <div key={r.user_id} className="rosterrow">
                <span className="std">
                  <span className="mini-av" style={{ background: "linear-gradient(135deg,#274a7d,#16263f)" }}>
                    {initials(name)}
                  </span>
                  <span>
                    <b style={{ display: "block", fontSize: 14 }}>{name}</b>
                    <span className="muted" style={{ fontSize: 12.5 }}>
                      {r.level ? levelDisplay(r.level) : "Nível não informado"}
                      {typeof calcAge(r.birthdate) === "number" && ` · ${calcAge(r.birthdate)} anos`}
                    </span>
                    {r.whatsapp && (
                      <a
                        href={`https://wa.me/${r.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "block", fontSize: 12.5, color: "var(--good)", fontWeight: 700 }}
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </span>
                </span>
                <span style={{ fontSize: 13.5 }}>{formatLastLogin(r.last_login_at)}</span>
                <span style={{ fontSize: 13.5 }}>
                  {formatDuration(avgSeconds)} / sessão
                  <br />
                  <span className="muted" style={{ fontSize: 12.5 }}>
                    {totals.done} exercícios · {totals.pct}% de acerto
                  </span>
                </span>
                <span className={`flag ${needsAttention ? "att" : "ok"}`}>
                  {needsAttention ? "Atenção" : "Em dia"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
