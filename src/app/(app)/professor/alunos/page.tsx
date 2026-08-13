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
  setStudentAccess,
  type StudentActivity,
} from "@/lib/activity";
import { initials, levelDisplay, useProfile } from "@/lib/profile";

export default function ProfessorAlunosPage() {
  const { ready, isTeacher } = useProfile();
  const [rows, setRows] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

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

  async function toggleAccess(row: StudentActivity) {
    const name = row.student_name || "este aluno";
    const pausing = !row.blocked;
    const ok = confirm(
      pausing
        ? `Pausar o acesso de ${name}? Ele verá um aviso de pagamento pendente ao entrar.`
        : `Reativar o acesso de ${name}?`,
    );
    if (!ok) return;

    setBusyId(row.user_id);
    const { error } = await setStudentAccess(row.user_id, pausing ? "pause" : "resume");
    setBusyId(null);
    if (error) {
      setErr(error);
      return;
    }
    const { data } = await listStudentActivity();
    setRows(data);
  }

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

  const activeCount = rows.filter((r) => !r.blocked).length;
  const overdueCount = rows.filter((r) => r.payment_status === "overdue").length;
  const attentionCount = rows.filter((r) => practiceTotals(r).done === 0 || isInactive(r.last_login_at)).length;
  const visibleRows = rows.filter((r) => {
    const matchesName = (r.student_name ?? "").toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === "all" || (filter === "active" && !r.blocked) || (filter === "blocked" && r.blocked) || (filter === "overdue" && r.payment_status === "overdue") || (filter === "inactive" && isInactive(r.last_login_at));
    return matchesName && matchesFilter;
  });

  return (
    <div className="view">
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Painel do professor
      </div>
      <h2 style={{ fontSize: 22, marginBottom: 4 }}>Alunos</h2>
      <p className="muted" style={{ margin: "0 0 20px" }}>
        Acompanhe progresso, atividade, financeiro, recados e acesso de cada aluno.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 20 }}>
        {[[rows.length, "Alunos"], [activeCount, "Acessos ativos"], [overdueCount, "Em atraso"], [attentionCount, "Precisam de atenção"]].map(([value, label]) => <div className="card stat" key={String(label)}><b style={{ display: "block", fontSize: 22 }}>{value}</b><span className="muted" style={{ fontSize: 12.5 }}>{label}</span></div>)}
      </div>

      <details className="card" style={{ padding: 18, marginBottom: 20, maxWidth: 560 }}>
        <summary style={{ cursor: "pointer", fontWeight: 800, color: "var(--navy)" }}>＋ Adicionar aluno</summary>
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
      </details>

      <div className="card" style={{ padding: 14, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input aria-label="Buscar aluno" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome…" style={{ flex: "1 1 240px" }} />
        <select aria-label="Filtrar alunos" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ minWidth: 180 }}>
          <option value="all">Todos os alunos</option><option value="active">Acesso ativo</option><option value="blocked">Acesso bloqueado</option><option value="overdue">Pagamento atrasado</option><option value="inactive">Inativos há 7 dias</option>
        </select>
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
            <span>Status / acesso</span>
          </div>
          {visibleRows.map((r) => {
            const totals = practiceTotals(r);
            const avgSeconds = r.session_count > 0 ? r.total_seconds / r.session_count : 0;
            const needsAttention = totals.done === 0 || isInactive(r.last_login_at);
            const name = r.student_name || "Aluno(a)";
            const paymentFlag = r.blocked
              ? { text: r.manual_block ? "Acesso pausado" : "Bloqueado (atraso)", cls: "bad" }
              : r.payment_status === "overdue"
                ? { text: "Pagamento atrasado", cls: "att" }
                : null;
            return (
              <div key={r.user_id} className="rosterrow">
                <Link href={`/professor/alunos/${r.user_id}`} className="std" style={{ textDecoration: "none", color: "inherit" }}>
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
                </Link>
                <span style={{ fontSize: 13.5 }}>{formatLastLogin(r.last_login_at)}</span>
                <span style={{ fontSize: 13.5 }}>
                  {formatDuration(avgSeconds)} / sessão
                  <br />
                  <span className="muted" style={{ fontSize: 12.5 }}>
                    {totals.done} exercícios · {totals.pct}% de acerto
                  </span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                  <span className={`flag ${paymentFlag ? paymentFlag.cls : needsAttention ? "att" : "ok"}`}>
                    {paymentFlag ? paymentFlag.text : needsAttention ? "Atenção" : "Em dia"}
                  </span>
                  <button
                    type="button"
                    className="pill-btn"
                    disabled={busyId === r.user_id}
                    onClick={() => toggleAccess(r)}
                    style={busyId === r.user_id ? { opacity: 0.6 } : undefined}
                  >
                    {busyId === r.user_id ? "…" : r.blocked ? "Reativar acesso" : "Pausar acesso"}
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
