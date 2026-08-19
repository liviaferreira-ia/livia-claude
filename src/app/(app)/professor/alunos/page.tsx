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
import { categoriesFor, resolveExerciseLevel } from "@/data/exercises";
import { initials, levelDisplay, parseCefrLevel, useProfile } from "@/lib/profile";
import { studentAdminAction } from "@/lib/student-admin";

/** % do banco de exercícios do nível já feito (0 se nunca praticou, sem nível fixo assume A2). */
function progressPct(r: StudentActivity): number {
  const level = resolveExerciseLevel(parseCefrLevel(r.level ?? "") ?? "A2");
  const total = categoriesFor(level).reduce((sum, c) => sum + c.count, 0);
  return total ? Math.min(100, Math.round((practiceTotals(r).done / total) * 100)) : 0;
}

/** Texto curto explicando por que o aluno está em alerta (ou null se está tudo bem). */
function attentionReason(r: StudentActivity): string | null {
  if (!r.last_login_at) return "Convite pendente";
  const days = Math.floor((Date.now() - new Date(r.last_login_at).getTime()) / 86_400_000);
  if (days >= 7) return `Sem estudar há ${days}d`;
  if (practiceTotals(r).done === 0) return "Ainda não praticou";
  return null;
}

export default function ProfessorAlunosPage() {
  const { ready, isTeacher } = useProfile();
  const [rows, setRows] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [level, setLevel] = useState("all");

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

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

  async function resendInvite(row: StudentActivity) {
    const name = row.student_name || "este aluno";
    if (!confirm(`Reenviar o convite de acesso para ${name}?`)) return;

    setBusyId(row.user_id);
    setActionMsg(null);
    try {
      const error = await studentAdminAction(row.user_id, { action: "reset_password" });
      setActionMsg(
        error
          ? { kind: "err", text: error }
          : { kind: "ok", text: `Convite reenviado para ${name}.` },
      );
    } catch {
      setActionMsg({ kind: "err", text: "Falha de conexão. Tente novamente." });
    } finally {
      setBusyId(null);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteMsg(null);
    setInviteLink(null);
    setLinkCopied(false);
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
      // O e-mail do convite às vezes cai em spam — por isso sempre guardamos
      // o link também, pra dar pro professor copiar e mandar na mão (WhatsApp
      // etc.) sem depender do e-mail chegar.
      if (body.inviteLink) setInviteLink(body.inviteLink as string);
      setInviteName("");
      setInviteEmail("");
    } catch {
      setInviteMsg({ kind: "err", text: "Falha de conexão. Tente de novo." });
    } finally {
      setInviting(false);
    }
  }

  async function handleCopyInviteLink() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      // Clipboard pode falhar em contexto não-seguro/permissão negada — o
      // link continua selecionável na tela, só não copia sozinho.
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

  const activeCount = rows.filter((r) => !r.blocked && r.last_login_at).length;
  const pendingInviteCount = rows.filter((r) => !r.last_login_at).length;
  const staleCount = rows.filter((r) => r.last_login_at && isInactive(r.last_login_at)).length;
  const lowPerfCount = rows.filter((r) => {
    const t = practiceTotals(r);
    return t.done >= 5 && t.pct < 60;
  }).length;
  const visibleRows = rows.filter((r) => {
    const matchesName = (r.student_name ?? "").toLowerCase().includes(query.trim().toLowerCase());
    const matchesLevel = level === "all" || r.level === level;
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && !r.last_login_at) ||
      (filter === "active" && !r.blocked && !!r.last_login_at) ||
      (filter === "blocked" && r.blocked) ||
      (filter === "overdue" && r.payment_status === "overdue") ||
      (filter === "inactive" && !!r.last_login_at && isInactive(r.last_login_at));
    return matchesName && matchesLevel && matchesFilter;
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
        {[[activeCount, "Alunos ativos"], [pendingInviteCount, "Convites pendentes"], [staleCount, "Sem entrar há 7 dias"], [lowPerfCount, "Baixo desempenho"]].map(([value, label]) => <div className="card stat" key={String(label)}><b style={{ display: "block", fontSize: 22 }}>{value}</b><span className="muted" style={{ fontSize: 12.5 }}>{label}</span></div>)}
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
          {inviteLink && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--panel-2)",
              }}
            >
              <p className="est-note" style={{ margin: 0 }}>
                Se o e-mail não chegar (spam é comum), copie este link e mande direto pro aluno por WhatsApp ou outro canal:
              </p>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  readOnly
                  value={inviteLink}
                  onFocus={(e) => e.currentTarget.select()}
                  style={{ flex: "1 1 260px", fontSize: 13, fontFamily: "monospace" }}
                />
                <button type="button" className="btn" onClick={handleCopyInviteLink}>
                  {linkCopied ? "Copiado!" : "Copiar link"}
                </button>
              </div>
            </div>
          )}
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
        <select aria-label="Filtrar por nível" value={level} onChange={(e) => setLevel(e.target.value)} style={{ minWidth: 140 }}>
          <option value="all">Todos os níveis</option>
          {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select aria-label="Filtrar alunos" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ minWidth: 180 }}>
          <option value="all">Todos os alunos</option><option value="pending">Convite pendente</option><option value="active">Acesso ativo</option><option value="blocked">Acesso bloqueado</option><option value="overdue">Pagamento atrasado</option><option value="inactive">Inativos há 7 dias</option>
        </select>
      </div>

      {actionMsg && <p className={`auth-msg ${actionMsg.kind}`}>{actionMsg.text}</p>}

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
            <span>Nível</span>
            <span>Último acesso</span>
            <span>Progresso / acertos</span>
            <span>Tempo de estudo</span>
            <span>Situação</span>
            <span>Ações</span>
          </div>
          {visibleRows.map((r) => {
            const totals = practiceTotals(r);
            const name = r.student_name || "Aluno(a)";
            const reason = attentionReason(r);
            const paymentFlag = r.blocked
              ? { text: r.manual_block ? "Acesso pausado" : "Bloqueado (atraso)", cls: "bad" }
              : r.payment_status === "overdue"
                ? { text: "Pagamento atrasado", cls: "att" }
                : null;
            const situation = paymentFlag ?? (reason ? { text: reason, cls: "att" as const } : { text: "Em dia", cls: "ok" as const });
            return (
              <div key={r.user_id} className="rosterrow">
                <Link href={`/professor/alunos/${r.user_id}`} className="std" style={{ textDecoration: "none", color: "inherit" }}>
                  <span className="mini-av" style={{ background: "linear-gradient(135deg,#274a7d,#16263f)" }}>
                    {initials(name)}
                  </span>
                  <span>
                    <b style={{ display: "block", fontSize: 14 }}>{name}</b>
                    {typeof calcAge(r.birthdate) === "number" && (
                      <span className="muted" style={{ fontSize: 12.5 }}>{calcAge(r.birthdate)} anos</span>
                    )}
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
                <span style={{ fontSize: 13.5 }}>{r.level ? levelDisplay(r.level) : "—"}</span>
                <span style={{ fontSize: 13.5 }}>{formatLastLogin(r.last_login_at)}</span>
                <span style={{ fontSize: 13.5 }}>
                  {progressPct(r)}% do nível
                  <br />
                  <span className="muted" style={{ fontSize: 12.5 }}>
                    {totals.done} exercícios · {totals.pct}% de acerto
                  </span>
                </span>
                <span style={{ fontSize: 13.5 }}>{formatDuration(r.total_seconds)}</span>
                <span>
                  <span className={`flag ${situation.cls}`}>{situation.text}</span>
                </span>
                <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                  {!r.last_login_at && (
                    <button
                      type="button"
                      className="pill-btn"
                      disabled={busyId === r.user_id}
                      onClick={() => void resendInvite(r)}
                      style={busyId === r.user_id ? { opacity: 0.6 } : undefined}
                    >
                      {busyId === r.user_id ? "Enviando…" : "Reenviar convite"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="pill-btn"
                    disabled={busyId === r.user_id}
                    onClick={() => void toggleAccess(r)}
                    style={busyId === r.user_id ? { opacity: 0.6 } : undefined}
                  >
                    {busyId === r.user_id ? "…" : r.blocked ? "Reativar" : "Pausar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
