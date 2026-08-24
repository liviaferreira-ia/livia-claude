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
import { initials, levelDisplay, parseCefrLevel, useProfile } from "@/lib/profile";
import { courseTotalPhases, type CourseProjectionFields } from "@/lib/courseProgress";
import { replyToStudent } from "@/lib/messages";
import {
  createTemporaryStudentPassword,
  deleteStudentAccount,
  getStudentDetail,
  requestStudentAccess,
  updateStudentDetail,
  type StudentDetail,
} from "@/lib/student-admin";

type DrawerTab = "overview" | "history" | "messages";

function accessStatus(r: StudentActivity) {
  if (r.last_login_at || r.invite_status === "active") return { id: "active", text: "🟢 Ativo", cls: "ok" as const };
  if (r.invite_status === "error") return { id: "error", text: "🔴 Erro no convite", cls: "bad" as const };
  if (r.invite_status === "pending") return { id: "pending", text: "🟡 Convite pendente", cls: "att" as const };
  return { id: "not_sent", text: "⚪ Convite não enviado", cls: "" as const };
}

/** Texto curto explicando por que o aluno está em alerta (ou null se está tudo bem). */
function attentionReason(r: StudentActivity): string | null {
  if (!r.last_login_at) return "Convite pendente";
  const days = Math.floor((Date.now() - new Date(r.last_login_at).getTime()) / 86_400_000);
  if (days >= 7) return `Sem estudar há ${days}d`;
  if (practiceTotals(r).done === 0) return "Ainda não praticou";
  return null;
}

function dateTimeLabel(value: string | null) {
  return value ? new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";
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
  const [showInvite, setShowInvite] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [drawerStudent, setDrawerStudent] = useState<StudentActivity | null>(null);
  const [drawerDetail, setDrawerDetail] = useState<StudentDetail | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("overview");
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerReply, setDrawerReply] = useState("");

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [temporaryAccess, setTemporaryAccess] = useState<{ name: string; email: string; password: string } | null>(null);
  const [temporaryAccessCopied, setTemporaryAccessCopied] = useState(false);

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
        ? `Pausar o acesso de ${name}? O aluno ficará impedido de entrar na área de estudos.`
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
    if (!confirm(`Gerar um novo acesso para ${name}?`)) return;

    setBusyId(row.user_id);
    setActionMsg(null);
    setInviteLink(null);
    setLinkCopied(false);
    try {
      const { error, inviteLink: freshLink } = await requestStudentAccess(row.user_id);
      if (freshLink) setInviteLink(freshLink);
      setActionMsg(
        error
          ? { kind: "err", text: error }
          : { kind: "ok", text: freshLink ? `Novo acesso gerado para ${name}. Copie o link abaixo se o e-mail não chegar.` : `E-mail de redefinição enviado para ${name}.` },
      );
    } catch {
      setActionMsg({ kind: "err", text: "Falha de conexão. Tente novamente." });
    } finally {
      setBusyId(null);
    }
  }

  async function removeStudent(row: StudentActivity) {
    const name = row.student_name || "este aluno";
    const confirmation = prompt(`Excluir ${name}?\n\nEsta ação remove a conta e o progresso do aluno. Para confirmar, escreva DELETAR:`);
    if (confirmation === null) return;
    if (confirmation.trim().toUpperCase() !== "DELETAR") {
      setActionMsg({ kind: "err", text: "Exclusão cancelada: era necessário escrever DELETAR." });
      return;
    }

    setBusyId(row.user_id);
    setActionMsg(null);
    const error = await deleteStudentAccount(row.user_id);
    setBusyId(null);
    if (error) {
      setActionMsg({ kind: "err", text: error });
      return;
    }
    setRows((current) => current.filter((item) => item.user_id !== row.user_id));
    setSelectedIds((current) => { const next = new Set(current); next.delete(row.user_id); return next; });
    setActionMsg({ kind: "ok", text: `${name} foi excluído(a) com sucesso.` });
  }

  async function createTemporaryAccess(row: StudentActivity) {
    const name = row.student_name || "este aluno";
    if (!confirm(`Criar uma senha provisória para ${name}? A senha anterior deixará de funcionar.`)) return;
    setBusyId(row.user_id);
    setActionMsg(null);
    setTemporaryAccess(null);
    setTemporaryAccessCopied(false);
    const result = await createTemporaryStudentPassword(row.user_id);
    setBusyId(null);
    if (result.error || !result.email || !result.temporaryPassword) {
      setActionMsg({ kind: "err", text: result.error || "Não consegui criar o acesso provisório." });
      return;
    }
    setTemporaryAccess({ name, email: result.email, password: result.temporaryPassword });
    setActionMsg({ kind: "ok", text: `Acesso provisório criado para ${name}. Copie os dados abaixo.` });
  }

  async function copyTemporaryAccess() {
    if (!temporaryAccess) return;
    try {
      await navigator.clipboard.writeText(`Central School\nLogin: ${temporaryAccess.email}\nSenha provisória: ${temporaryAccess.password}`);
      setTemporaryAccessCopied(true);
      window.setTimeout(() => setTemporaryAccessCopied(false), 2500);
    } catch {
      setActionMsg({ kind: "err", text: "Não consegui copiar automaticamente. Selecione os dados e copie manualmente." });
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
      const refreshed = await listStudentActivity();
      if (!refreshed.error) setRows(refreshed.data);
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

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function openStudentDrawer(row: StudentActivity, tab: DrawerTab = "overview") {
    setOpenMenuId(null);
    setDrawerStudent(row);
    setDrawerDetail(null);
    setDrawerTab(tab);
    setDrawerLoading(true);
    const result = await getStudentDetail(row.user_id);
    setDrawerLoading(false);
    if (result.error) {
      setActionMsg({ kind: "err", text: result.error });
      setDrawerStudent(null);
      return;
    }
    setDrawerDetail(result.data);
  }

  async function sendDrawerMessage() {
    if (!drawerStudent || !drawerReply.trim()) return;
    setBulkBusy(true);
    const { error } = await replyToStudent(drawerStudent.user_id, drawerStudent.student_name || "Aluno(a)", drawerReply);
    setBulkBusy(false);
    if (error) { setActionMsg({ kind: "err", text: error }); return; }
    setDrawerReply("");
    await openStudentDrawer(drawerStudent, "messages");
    setActionMsg({ kind: "ok", text: "Mensagem enviada." });
  }

  async function bulkMessage() {
    const text = prompt(`Mensagem para ${selectedIds.size} aluno(s):`);
    if (!text?.trim()) return;
    const targets = rows.filter((row) => selectedIds.has(row.user_id));
    setBulkBusy(true); setActionMsg(null);
    const results = await Promise.all(targets.map((row) => replyToStudent(row.user_id, row.student_name || "Aluno(a)", text)));
    setBulkBusy(false);
    const failures = results.filter((result) => result.error).length;
    setActionMsg(failures ? { kind: "err", text: `Mensagem enviada, mas ${failures} aluno(s) apresentaram erro.` } : { kind: "ok", text: `Mensagem enviada para ${targets.length} aluno(s).` });
  }

  async function changeLevels(ids = Array.from(selectedIds)) {
    const requested = prompt("Digite o novo nível: A1, A2, B1, B2, C1 ou C2");
    const nextLevel = requested?.trim().toUpperCase();
    if (!nextLevel || !["A1", "A2", "B1", "B2", "C1", "C2"].includes(nextLevel)) {
      if (requested !== null) setActionMsg({ kind: "err", text: "Nível inválido. Use A1, A2, B1, B2, C1 ou C2." });
      return;
    }
    setBulkBusy(true); setActionMsg(null); setOpenMenuId(null);
    const results = await Promise.all(ids.map(async (studentId) => {
      const detailResult = await getStudentDetail(studentId);
      if (!detailResult.data) return detailResult.error || "Aluno não encontrado.";
      const detail = detailResult.data;
      const activity = detail.activity;
      return updateStudentDetail(studentId, {
        name: activity.student_name || "Aluno(a)", email: detail.email, level: nextLevel,
        whatsapp: activity.whatsapp || "", birthdate: activity.birthdate || "",
        focus: detail.settings?.focus || "", weekly_goal: detail.settings?.weekly_goal || 3,
        access_expires_on: detail.settings?.access_expires_on || "",
      });
    }));
    setBulkBusy(false);
    const failures = results.filter(Boolean).length;
    if (!failures) setRows((current) => current.map((row) => ids.includes(row.user_id) ? { ...row, level: nextLevel } : row));
    setActionMsg(failures ? { kind: "err", text: `${failures} aluno(s) não puderam ser atualizados.` } : { kind: "ok", text: `Nível alterado para ${nextLevel} em ${ids.length} aluno(s).` });
  }

  async function pauseSelected() {
    const targets = rows.filter((row) => selectedIds.has(row.user_id) && !row.blocked);
    if (!targets.length) return;
    if (!confirm(`Pausar o acesso de ${targets.length} aluno(s)?`)) return;
    setBulkBusy(true); setActionMsg(null);
    const results = await Promise.all(targets.map((row) => setStudentAccess(row.user_id, "pause")));
    setBulkBusy(false);
    const failures = results.filter((result) => result.error).length;
    const refreshed = await listStudentActivity();
    if (!refreshed.error) setRows(refreshed.data);
    setActionMsg(failures ? { kind: "err", text: `${failures} acesso(s) não puderam ser pausados.` } : { kind: "ok", text: `${targets.length} acesso(s) pausado(s).` });
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

  const activeCount = rows.filter((r) => !r.blocked && accessStatus(r).id === "active").length;
  const pendingInviteCount = rows.filter((r) => accessStatus(r).id === "pending").length;
  const inviteProblemCount = rows.filter((r) => ["error", "not_sent"].includes(accessStatus(r).id)).length;
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
      (filter === "pending" && accessStatus(r).id === "pending") ||
      (filter === "invite_problem" && ["error", "not_sent"].includes(accessStatus(r).id)) ||
      (filter === "active" && !r.blocked && accessStatus(r).id === "active") ||
      (filter === "blocked" && r.blocked) ||
      (filter === "inactive" && !!r.last_login_at && isInactive(r.last_login_at));
    return matchesName && matchesLevel && matchesFilter;
  });
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((row) => selectedIds.has(row.user_id));
  const maxStudySeconds = Math.max(1, ...rows.map((row) => row.total_seconds));

  return (
    <div className="view teacher-management-view">
      <div className="teacher-management-header">
        <div><div className="eyebrow" style={{ marginBottom: 8 }}>Painel do professor</div><h2>Gestão de alunos</h2><p className="muted">Progresso, atividade, comunicação e acesso em um só lugar.</p></div>
        <button type="button" className="btn gold teacher-add-button" onClick={() => setShowInvite((open) => !open)}>＋ Novo aluno</button>
      </div>

      <div className="teacher-kpi-grid">
        {[["👥", activeCount, "Alunos ativos", "ok"], ["◷", staleCount, "Inativos há 7 dias", "att"], ["↘", lowPerfCount, "Baixo desempenho", "bad"], ["✉", pendingInviteCount + inviteProblemCount, "Convites e acessos", "info"]].map(([icon, value, label, tone]) => <div className={`card teacher-kpi ${tone}`} key={String(label)}><span className="teacher-kpi-icon">{icon}</span><div><b>{value}</b><span>{label}</span></div></div>)}
      </div>

      {showInvite && <div className="card teacher-invite-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}><div><div className="eyebrow">Novo aluno</div><h3 style={{ margin: "5px 0 0" }}>Enviar convite de acesso</h3></div><button type="button" className="pill-btn" onClick={() => setShowInvite(false)}>Fechar</button></div>
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
      </div>}

      <div className="card teacher-filterbar">
        <input aria-label="Buscar aluno" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome…" style={{ flex: "1 1 240px" }} />
        <select aria-label="Filtrar por nível" value={level} onChange={(e) => setLevel(e.target.value)} style={{ minWidth: 140 }}>
          <option value="all">Todos os níveis</option>
          {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select aria-label="Filtrar alunos" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ minWidth: 180 }}>
          <option value="all">Todos os alunos</option><option value="pending">Convite pendente</option><option value="invite_problem">Erro ou não enviado</option><option value="active">Acesso ativo</option><option value="blocked">Acesso bloqueado</option><option value="inactive">Inativos há 7 dias</option>
        </select>
      </div>

      {selectedIds.size > 0 && <div className="bulk-toolbar"><b>{selectedIds.size} selecionado(s)</b><button type="button" disabled={bulkBusy} onClick={() => void bulkMessage()}>✉ Enviar mensagem</button><button type="button" disabled={bulkBusy} onClick={() => void changeLevels()}>↗ Mudar nível</button><button type="button" disabled={bulkBusy} onClick={() => void pauseSelected()}>⏸ Pausar selecionados</button><button type="button" onClick={() => setSelectedIds(new Set())}>Limpar seleção</button></div>}

      {actionMsg && <p className={`auth-msg ${actionMsg.kind}`}>{actionMsg.text}</p>}
      {temporaryAccess && <div className="card stat" style={{ marginBottom: 16, borderColor: "var(--gold)" }}><div className="eyebrow">Acesso provisório de {temporaryAccess.name}</div><p className="muted">Envie estes dados ao aluno. No primeiro acesso, ele será obrigado a criar uma senha própria.</p><div className="field"><label>Login</label><input readOnly value={temporaryAccess.email} onFocus={(event) => event.currentTarget.select()} /></div><div className="field"><label>Senha provisória</label><input readOnly value={temporaryAccess.password} onFocus={(event) => event.currentTarget.select()} style={{ fontFamily: "monospace", fontWeight: 800 }} /></div><button type="button" className="btn light" onClick={() => void copyTemporaryAccess()}>{temporaryAccessCopied ? "Copiado!" : "Copiar login e senha"}</button></div>}

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
        <div className="card teacher-roster-card">
          <div
            className="rosterrow management"
            style={{
              borderTop: "none",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink-faint)",
            }}
          >
            <span className="teacher-student-heading"><input type="checkbox" aria-label="Selecionar todos os alunos visíveis" checked={allVisibleSelected} onChange={() => setSelectedIds((current) => { const next = new Set(current); visibleRows.forEach((row) => allVisibleSelected ? next.delete(row.user_id) : next.add(row.user_id)); return next; })} /> Aluno</span>
            <span>Nível</span>
            <span>Último acesso</span>
            <span>Progresso / acertos</span>
            <span>Tempo de estudo</span>
            <span>Status do acesso</span>
            <span>Ações</span>
          </div>
          {visibleRows.map((r) => {
            const totals = practiceTotals(r);
            const course = r as StudentActivity & CourseProjectionFields;
            const cefr = parseCefrLevel(course.course_level ?? r.level ?? "");
            const totalPhases = cefr ? courseTotalPhases(cefr) : 0;
            const coursePct = totalPhases ? Math.round(((course.course_completed_phases ?? 0) / totalPhases) * 100) : 0;
            const name = r.student_name || "Aluno(a)";
            const reason = attentionReason(r);
            const access = accessStatus(r);
            const accessFlag = r.blocked
              ? { text: r.manual_block ? "Acesso pausado" : "Bloqueado automaticamente", cls: "bad" }
              : null;
            const situationNote = accessFlag ?? (r.last_login_at && reason ? { text: reason, cls: "att" as const } : null);
            return (
              <div key={r.user_id} className={`rosterrow management ${selectedIds.has(r.user_id) ? "selected" : ""}`}>
                <div className="teacher-student-cell">
                  <input type="checkbox" aria-label={`Selecionar ${name}`} checked={selectedIds.has(r.user_id)} onChange={() => toggleSelected(r.user_id)} />
                  <button type="button" className="std teacher-student-button" onClick={() => void openStudentDrawer(r)}>
                  <span className="mini-av" style={{ background: "linear-gradient(135deg,#274a7d,#16263f)" }}>
                    {initials(name)}
                  </span>
                  <span>
                    <b style={{ display: "block", fontSize: 14 }}>{name}</b>
                    {typeof calcAge(r.birthdate) === "number" && (
                      <span className="muted" style={{ fontSize: 12.5 }}>{calcAge(r.birthdate)} anos</span>
                    )}
                    {r.whatsapp && <span style={{ display: "block", fontSize: 12.5, color: "var(--good)", fontWeight: 700 }}>● WhatsApp cadastrado</span>}
                  </span>
                  </button>
                </div>
                <span style={{ fontSize: 13.5 }}>{r.level ? levelDisplay(r.level) : "—"}</span>
                <span style={{ fontSize: 13.5 }}>{formatLastLogin(r.last_login_at)}</span>
                <span className="teacher-metric"><span><b>{coursePct}%</b> do nível</span><span className="teacher-progress-track"><i style={{ width: `${coursePct}%` }} /></span><small>U{course.current_unit ?? 1} · {course.course_completed_phases ?? 0} etapas · {totals.pct}% acerto</small></span>
                <span className="teacher-metric"><span>◷ <b>{formatDuration(r.total_seconds)}</b></span><span className="teacher-progress-track time"><i style={{ width: `${Math.max(4, Math.round((r.total_seconds / maxStudySeconds) * 100))}%` }} /></span></span>
                <span>
                  <span className={`flag ${access.cls}`} title={access.id === "error" ? r.invite_error ?? "O último envio não foi concluído." : undefined}>{access.text}</span>
                  {situationNote && <span className={`flag ${situationNote.cls}`} style={{ display: "table", marginTop: 6 }}>{situationNote.text}</span>}
                </span>
                <div className="teacher-action-wrap" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenMenuId(null); }}>
                  <button type="button" className="teacher-more-button" aria-label={`Ações de ${name}`} aria-expanded={openMenuId === r.user_id} disabled={busyId === r.user_id} onClick={() => setOpenMenuId((current) => current === r.user_id ? null : r.user_id)}>{busyId === r.user_id ? "…" : "•••"}</button>
                  {openMenuId === r.user_id && <div className="teacher-context-menu" role="menu">
                    <button type="button" onClick={() => void openStudentDrawer(r, "messages")}>✉ Enviar mensagem</button>
                    <button type="button" onClick={() => void openStudentDrawer(r)}>▣ Ver resumo</button>
                    <Link href={`/professor/alunos/${r.user_id}`}>↗ Ver perfil completo</Link>
                    <button type="button" onClick={() => void changeLevels([r.user_id])}>⇅ Ajustar nível</button>
                    {access.id !== "active" && <button type="button" onClick={() => { setOpenMenuId(null); void createTemporaryAccess(r); }}>⌁ Criar senha provisória</button>}
                    {access.id !== "active" && <button type="button" onClick={() => { setOpenMenuId(null); void resendInvite(r); }}>↻ Gerar novo acesso</button>}
                    <button type="button" onClick={() => { setOpenMenuId(null); void toggleAccess(r); }}>{r.blocked ? "▶ Reativar acesso" : "⏸ Pausar acesso"}</button>
                    <button type="button" className="danger" onClick={() => { setOpenMenuId(null); void removeStudent(r); }}>× Excluir aluno</button>
                  </div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {drawerStudent && <div className="teacher-drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDrawerStudent(null); }}>
        <aside className="teacher-drawer" aria-label={`Detalhes de ${drawerStudent.student_name || "aluno"}`}>
          <div className="teacher-drawer-header"><div><div className="eyebrow">Detalhes do aluno</div><h3>{drawerStudent.student_name || "Aluno(a)"}</h3><span className="muted">{drawerStudent.level ? levelDisplay(drawerStudent.level) : "Nível não informado"}</span></div><button type="button" className="teacher-drawer-close" aria-label="Fechar detalhes" onClick={() => setDrawerStudent(null)}>×</button></div>
          <div className="teacher-drawer-tabs">{([['overview','Resumo'],['history','Histórico'],['messages','Mensagens']] as [DrawerTab,string][]).map(([tabId, label]) => <button type="button" key={tabId} className={drawerTab === tabId ? "active" : ""} onClick={() => setDrawerTab(tabId)}>{label}</button>)}</div>
          <div className="teacher-drawer-body">
            {drawerLoading && <p className="muted">Carregando dados…</p>}
            {!drawerLoading && drawerDetail && drawerTab === "overview" && (() => { const totals = practiceTotals(drawerDetail.activity); const projection = drawerDetail.activity as StudentActivity & CourseProjectionFields; const drawerLevel = parseCefrLevel(projection.course_level ?? projection.level ?? ""); const total = drawerLevel ? courseTotalPhases(drawerLevel) : 0; const progress = total ? Math.round(((projection.course_completed_phases ?? 0) / total) * 100) : 0; return <><div className="drawer-progress-hero"><span>{progress}% do nível</span><b>{drawerLevel ?? "—"}</b><div className="teacher-progress-track"><i style={{ width: `${progress}%` }} /></div></div><div className="drawer-stat-grid"><div><b>{formatDuration(drawerDetail.activity.total_seconds)}</b><span>Tempo de estudo</span></div><div><b>{drawerDetail.activity.session_count}</b><span>Sessões</span></div><div><b>{totals.pct}%</b><span>Acertos</span></div><div><b>{drawerDetail.assignments.filter((item) => item.status === "assigned").length}</b><span>Tarefas pendentes</span></div></div><div className="card stat"><div className="eyebrow">Próximo passo</div><p>{drawerDetail.settings?.focus || `Continuar a Unidade ${projection.current_unit ?? 1} e acompanhar a evolução dos acertos.`}</p></div></>; })()}
            {!drawerLoading && drawerDetail && drawerTab === "history" && <div>{drawerDetail.events.length === 0 ? <p className="muted">Nenhuma atividade registrada.</p> : drawerDetail.events.slice(0, 20).map((event) => <div className="drawer-list-item" key={event.id}><div><b>{event.event_type === "login" ? "Entrada na plataforma" : event.event_type === "course_phase" ? "Etapa do curso concluída" : event.event_type === "exercise" ? "Exercício respondido" : "Atividade realizada"}</b><span>{event.kind || "Central School"}</span></div><time>{dateTimeLabel(event.created_at)}</time></div>)}</div>}
            {!drawerLoading && drawerDetail && drawerTab === "messages" && <div><div className="drawer-message-list">{drawerDetail.messages.length === 0 ? <p className="muted">Nenhuma mensagem ainda.</p> : drawerDetail.messages.slice(-20).map((item) => <div key={item.id} className={`tutor-msg ${item.sender}`}><p>{item.body}</p><time>{dateTimeLabel(item.created_at)}</time></div>)}</div><textarea className="tutor-input" rows={3} value={drawerReply} onChange={(event) => setDrawerReply(event.target.value)} placeholder="Escreva uma mensagem para o aluno…" /><button type="button" className="btn primary" disabled={bulkBusy || !drawerReply.trim()} onClick={() => void sendDrawerMessage()}>Enviar mensagem</button></div>}
          </div>
          <div className="teacher-drawer-footer"><Link className="btn light" href={`/professor/alunos/${drawerStudent.user_id}`}>Abrir perfil completo →</Link></div>
        </aside>
      </div>}
    </div>
  );
}
