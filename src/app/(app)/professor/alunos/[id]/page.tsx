"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { calcAge, formatDuration, formatLastLogin, practiceTotals, setStudentAccess } from "@/lib/activity";
import { replyToStudent } from "@/lib/messages";
import {
  deleteStudentAccount,
  createTemporaryStudentPassword,
  getStudentDetail,
  requestStudentAccess,
  studentAdminAction,
  updateStudentDetail,
  type StudentDetail,
} from "@/lib/student-admin";
import { initials, levelDisplay, parseCefrLevel, useProfile } from "@/lib/profile";
import { LEARNING_CYCLE } from "@/data/curso";
import { courseTotalPhases, type CourseProjectionFields } from "@/lib/courseProgress";

type Tab = "overview" | "progress" | "activity" | "notes" | "logs" | "access";
const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Visão geral" },
  { id: "progress", label: "Progresso" },
  { id: "activity", label: "Atividades" },
  { id: "notes", label: "Recados e anotações" },
  { id: "logs", label: "Logs e suporte" },
  { id: "access", label: "Acesso e cadastro" },
];
const kindLabels = { mc: "Múltipla escolha", fill: "Completar", translate: "Tradução", order: "Ordenar" };

function eventLabel(e: { event_type: string; kind: string | null; correct: boolean | null }): string {
  if (e.event_type === "course_phase") {
    const [level, unit, phase] = (e.kind ?? "").split(":");
    const phaseLabel = LEARNING_CYCLE.find((item) => item.id === phase)?.label ?? "Etapa";
    return `✓ ${phaseLabel} concluída · ${level} Unidade ${unit}`;
  }
  if (e.event_type === "login") return "Entrou na plataforma";
  if (e.event_type === "tutor") return "Praticou no tutor de conversa (IA)";
  if (e.event_type === "roleplay") return "Completou um roleplay por voz";
  if (e.event_type === "pronunciation") {
    return e.correct === null ? "Praticou pronúncia" : `Praticou pronúncia · ${e.correct ? "clara" : "precisa treinar mais"}`;
  }
  const kind = e.kind && e.kind in kindLabels ? kindLabels[e.kind as keyof typeof kindLabels] : "prática";
  return `${e.correct ? "✓" : "✕"} Exercício de ${kind.toLowerCase()}`;
}

function dateLabel(value: string | null, withTime = false) {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return date.toLocaleDateString("pt-BR", withTime ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" } : undefined);
}

export default function ProfessorStudentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ready, isTeacher } = useProfile();
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [accessLink, setAccessLink] = useState<string | null>(null);
  const [accessLinkCopied, setAccessLinkCopied] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [temporaryPasswordCopied, setTemporaryPasswordCopied] = useState(false);
  const [note, setNote] = useState("");
  const [reply, setReply] = useState("");
  const [assignment, setAssignment] = useState({ title: "", details: "", due_date: "" });
  const [form, setForm] = useState({ name: "", email: "", level: "A1", whatsapp: "", birthdate: "", focus: "", weekly_goal: 3, access_expires_on: "" });

  const load = useCallback(async () => {
    const result = await getStudentDetail(id);
    setError(result.error ?? "");
    setDetail(result.data);
    if (result.data) {
      const a = result.data.activity;
      setForm({
        name: a.student_name ?? "",
        email: result.data.email,
        level: a.level?.split("·")[0].trim().toUpperCase() || "A1",
        whatsapp: a.whatsapp ?? "",
        birthdate: a.birthdate ?? "",
        focus: result.data.settings?.focus ?? "",
        weekly_goal: result.data.settings?.weekly_goal ?? 3,
        access_expires_on: result.data.settings?.access_expires_on ?? "",
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!ready || !isTeacher) return;
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [ready, isTeacher, load]);

  const skills = useMemo(() => {
    if (!detail) return [];
    const a = detail.activity;
    return [
      { kind: "mc" as const, done: a.practice_mc_done, correct: a.practice_mc_correct },
      { kind: "fill" as const, done: a.practice_fill_done, correct: a.practice_fill_correct },
      { kind: "translate" as const, done: a.practice_translate_done, correct: a.practice_translate_correct },
      { kind: "order" as const, done: a.practice_order_done, correct: a.practice_order_correct },
    ].map((x) => ({ ...x, pct: x.done ? Math.round((x.correct / x.done) * 100) : 0 }));
  }, [detail]);

  async function run(action: () => Promise<string | null>, success: string) {
    setBusy(true); setError(""); setMessage("");
    const err = await action();
    setBusy(false);
    if (err) { setError(err); return false; }
    setMessage(success);
    await load();
    return true;
  }

  async function resendAccess() {
    setBusy(true); setError(""); setMessage(""); setAccessLink(null); setAccessLinkCopied(false);
    const result = await requestStudentAccess(id);
    setBusy(false);
    if (result.error) { setError(result.error); return; }
    setAccessLink(result.inviteLink);
    setMessage(result.inviteLink ? "Novo acesso gerado. Se o e-mail não chegar, copie o link abaixo." : "E-mail de redefinição enviado.");
    await load();
  }

  async function copyAccessLink() {
    if (!accessLink) return;
    try {
      await navigator.clipboard.writeText(accessLink);
      setAccessLinkCopied(true);
      window.setTimeout(() => setAccessLinkCopied(false), 2500);
    } catch {
      setError("Não consegui copiar automaticamente. Selecione o link e copie manualmente.");
    }
  }

  async function removeStudent() {
    const studentName = detail?.activity.student_name || "este aluno";
    const confirmation = prompt(`Excluir ${studentName}?\n\nEsta ação remove a conta e o progresso do aluno. Para confirmar, escreva DELETAR:`);
    if (confirmation === null) return;
    if (confirmation.trim().toUpperCase() !== "DELETAR") {
      setError("Exclusão cancelada: era necessário escrever DELETAR.");
      return;
    }
    setBusy(true); setError(""); setMessage("");
    const deleteError = await deleteStudentAccount(id);
    setBusy(false);
    if (deleteError) { setError(deleteError); return; }
    router.push("/professor/alunos");
    router.refresh();
  }

  async function createTemporaryAccess() {
    if (!confirm(`Criar uma senha provisória para ${name}? A senha anterior deixará de funcionar.`)) return;
    setBusy(true); setError(""); setMessage(""); setTemporaryPassword(null); setTemporaryPasswordCopied(false);
    const result = await createTemporaryStudentPassword(id);
    setBusy(false);
    if (result.error || !result.temporaryPassword) { setError(result.error || "Não consegui criar o acesso provisório."); return; }
    setTemporaryPassword(result.temporaryPassword);
    setMessage("Senha provisória criada. Copie os dados abaixo e envie ao aluno.");
    await load();
  }

  async function copyTemporaryAccess() {
    if (!temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(`Central School\nLogin: ${detail?.email ?? form.email}\nSenha provisória: ${temporaryPassword}`);
      setTemporaryPasswordCopied(true);
      window.setTimeout(() => setTemporaryPasswordCopied(false), 2500);
    } catch {
      setError("Não consegui copiar automaticamente. Selecione os dados e copie manualmente.");
    }
  }

  if (!ready || loading) return <div className="view"><p className="muted">Carregando aluno…</p></div>;
  if (!isTeacher) return <div className="view"><p>Esta área é exclusiva do professor.</p></div>;
  if (!detail) return <div className="view"><Link href="/professor/alunos">← Alunos</Link><p className="auth-msg err">{error || "Aluno não encontrado."}</p></div>;

  const a = detail.activity;
  const courseProjection = a as typeof a & CourseProjectionFields;
  const totals = practiceTotals(a);
  const name = a.student_name || "Aluno(a)";
  const invitePending = !detail.auth.lastSignInAt;
  const accessState = !invitePending || a.invite_status === "active"
    ? { text: "🟢 Ativo", cls: "ok" }
    : a.invite_status === "error"
      ? { text: "🔴 Erro no convite", cls: "bad" }
      : a.invite_status === "pending"
        ? { text: "🟡 Convite pendente", cls: "att" }
        : { text: "⚪ Convite não enviado", cls: "" };
  const avg = a.session_count ? a.total_seconds / a.session_count : 0;
  const weakest = skills.filter((s) => s.done > 0).sort((x, y) => x.pct - y.pct)[0];
  const courseLevel = parseCefrLevel(courseProjection.course_level ?? a.level ?? "");
  const totalCoursePhases = courseLevel ? courseTotalPhases(courseLevel) : 0;
  const courseCompleted = courseProjection.course_completed_phases ?? detail.courseProgress.filter((row) => row.level === courseLevel).length;
  const coursePct = totalCoursePhases ? Math.round((courseCompleted / totalCoursePhases) * 100) : 0;

  return (
    <div className="view">
      <Link href="/professor/alunos" className="muted" style={{ fontSize: 13 }}>← Voltar para alunos</Link>
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "16px 0 20px", flexWrap: "wrap" }}>
        <span className="avatar" style={{ width: 54, height: 54, fontSize: 18 }}>{initials(name)}</span>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 22, marginBottom: 3 }}>{name}</h2>
          <div className="muted" style={{ fontSize: 13.5 }}>
            {a.level ? levelDisplay(a.level) : "Nível não informado"} · {detail.email}
            {calcAge(a.birthdate) !== null && ` · ${calcAge(a.birthdate)} anos`}
          </div>
        </div>
        <span className={`flag ${a.blocked ? "bad" : accessState.cls}`} title={accessState.text.includes("Erro") ? a.invite_error ?? undefined : undefined}>
          {a.blocked ? (a.manual_block ? "Acesso pausado" : "Bloqueado automaticamente") : accessState.text}
        </span>
      </div>

      <div className="card" style={{ padding: 8, display: "flex", gap: 6, overflowX: "auto", marginBottom: 20 }}>
        {tabs.map((item) => <button key={item.id} className={tab === item.id ? "btn primary" : "btn ghost"} style={{ whiteSpace: "nowrap", padding: "9px 12px" }} onClick={() => setTab(item.id)}>{item.label}</button>)}
      </div>
      {error && <p className="auth-msg err" style={{ maxWidth: "none" }}>{error}</p>}
      {message && <p className="auth-msg ok" style={{ maxWidth: "none" }}>{message}</p>}

      {tab === "overview" && <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14 }}>
          {[[formatLastLogin(a.last_login_at), "Último acesso"], [formatDuration(a.total_seconds), "Tempo total"], [String(a.session_count), "Sessões"], [`${totals.done} · ${totals.pct}%`, "Exercícios · acertos"]].map(([v, l]) => <div className="card stat" key={l}><b style={{ display: "block", fontSize: 21 }}>{v}</b><span className="muted" style={{ fontSize: 12.5 }}>{l}</span></div>)}
        </div>
        <div className="grid cols-2" style={{ marginTop: 18 }}>
          <div className="card stat"><div className="eyebrow">Foco recomendado</div><p style={{ lineHeight: 1.6 }}>{form.focus || (weakest ? `Reforçar ${kindLabels[weakest.kind].toLowerCase()}: ${weakest.pct}% de acerto em ${weakest.done} exercícios.` : "O aluno ainda não realizou exercícios suficientes para uma recomendação.")}</p></div>
          <div className="card stat"><div className="eyebrow">Status do acesso</div><p style={{ lineHeight: 1.6 }}>{a.blocked ? (a.manual_block ? "Acesso pausado manualmente." : "Acesso bloqueado automaticamente.") : "Acesso liberado para estudar."}</p><button className="btn light" onClick={() => setTab("access")}>Gerenciar acesso →</button></div>
        </div>
      </>}

      {tab === "progress" && <div className="grid cols-2">
        <div className="card stat"><div className="eyebrow">Jornada curricular</div><h3 style={{ marginTop: 10 }}>{coursePct}% do nível {courseLevel ?? "—"}</h3><div className="unit-bar" style={{ marginTop: 12 }}><i style={{ width: `${coursePct}%` }} /></div><p className="muted">{courseCompleted} de {totalCoursePhases} etapas · Unidade {courseProjection.current_unit ?? 1} · {LEARNING_CYCLE.find((phase) => phase.id === courseProjection.current_phase)?.label ?? "Aprender"}</p><div style={{ marginTop: 12 }}>{detail.courseProgress.slice(0, 8).map((row) => <div key={`${row.level}-${row.unit_number}-${row.phase}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderTop: "1px solid var(--line)", fontSize: 13 }}><span>{row.level} · Unidade {row.unit_number} · {LEARNING_CYCLE.find((phase) => phase.id === row.phase)?.label}</span><span className="muted">{dateLabel(row.completed_at)}</span></div>)}</div></div>
        <div className="card stat"><div className="eyebrow">Desempenho por exercício</div><div style={{ marginTop: 14 }}>{skills.map((s) => <div className="skill-row" key={s.kind}><span className="lbl">{kindLabels[s.kind]}</span><span className="track"><i style={{ width: `${s.pct}%`, background: s.done && s.pct < 60 ? "linear-gradient(90deg,var(--warn),var(--gold))" : undefined }} /></span><span className="val">{s.done ? `${s.pct}%` : "—"}</span></div>)}</div></div>
        <div className="card stat"><div className="eyebrow">Leitura pedagógica</div><ul style={{ lineHeight: 1.8, paddingLeft: 18 }}><li>{totals.done ? `${totals.correct} respostas corretas em ${totals.done}.` : "Nenhuma prática registrada."}</li><li>{weakest ? `Maior oportunidade: ${kindLabels[weakest.kind]} (${weakest.pct}%).` : "Aguardando mais dados."}</li><li>Média de {formatDuration(avg)} por sessão.</li><li>Meta semanal: {detail.settings?.weekly_goal ?? 3} dias.</li></ul></div>
      </div>}

      {tab === "activity" && <div className="grid cols-2">
        <div className="card stat"><div className="eyebrow">Atribuir atividade</div><div className="field" style={{ marginTop: 12 }}><label>Título</label><input value={assignment.title} onChange={(e) => setAssignment({ ...assignment, title: e.target.value })} placeholder="Ex.: Revisar present simple" /></div><div className="field"><label>Orientações</label><textarea value={assignment.details} onChange={(e) => setAssignment({ ...assignment, details: e.target.value })} rows={3} /></div><div className="field"><label>Prazo</label><input type="date" value={assignment.due_date} onChange={(e) => setAssignment({ ...assignment, due_date: e.target.value })} /></div><button className="btn primary" disabled={busy || !assignment.title.trim()} onClick={async () => { const ok = await run(() => studentAdminAction(id, { action: "add_assignment", ...assignment }), "Atividade atribuída."); if (ok) setAssignment({ title: "", details: "", due_date: "" }); }}>Atribuir ao aluno</button></div>
        <div><div className="card stat"><div className="eyebrow">Tarefas</div>{detail.assignments.length === 0 ? <p className="muted">Nenhuma atividade atribuída.</p> : detail.assignments.map((x) => <div key={x.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--line)" }}><b>{x.title}</b><div className="muted" style={{ fontSize: 12.5 }}>{x.due_date ? `Prazo: ${dateLabel(x.due_date)}` : "Sem prazo"} · {x.status === "done" ? "Concluída" : x.status === "cancelled" ? "Cancelada" : "Pendente"}</div>{x.status === "assigned" && <button className="pill-btn" style={{ marginTop: 6 }} onClick={() => void run(() => studentAdminAction(id, { action: "assignment_status", assignment_id: x.id, status: "cancelled" }), "Atividade cancelada.")}>Cancelar</button>}</div>)}</div></div>
        <div className="card stat" style={{ gridColumn: "1 / -1" }}><div className="eyebrow">Linha do tempo recente</div>{detail.events.length === 0 ? <p className="muted">O histórico começará a ser registrado após a migração desta entrega.</p> : detail.events.map((e) => <div key={e.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--line)", fontSize: 13.5 }}><span>{eventLabel(e)}</span><span className="muted">{dateLabel(e.created_at, true)}</span></div>)}</div>
      </div>}

      {tab === "notes" && <div className="grid cols-2">
        <div className="card stat"><div className="eyebrow">Conversa com o aluno</div><div style={{ maxHeight: 360, overflowY: "auto", margin: "12px 0" }}>{detail.messages.length === 0 ? <p className="muted">Nenhum recado ainda.</p> : detail.messages.map((m) => <div key={m.id} className={`tutor-msg ${m.sender}`}><p>{m.body}</p><time>{dateLabel(m.created_at, true)}</time></div>)}</div><textarea className="tutor-input" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Escreva uma resposta…" /><button className="btn primary" style={{ marginTop: 10 }} disabled={busy || !reply.trim()} onClick={async () => { const ok = await run(async () => (await replyToStudent(id, name, reply)).error, "Recado enviado."); if (ok) setReply(""); }}>Enviar recado</button></div>
        <div className="card stat"><div className="eyebrow">Anotações privadas</div><textarea className="tutor-input" rows={4} style={{ marginTop: 12 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Observações pedagógicas que o aluno não verá…" /><button className="btn primary" style={{ marginTop: 10 }} disabled={busy || !note.trim()} onClick={async () => { const ok = await run(() => studentAdminAction(id, { action: "add_note", body: note }), "Anotação salva."); if (ok) setNote(""); }}>Salvar anotação</button><div style={{ marginTop: 14 }}>{detail.notes.map((n) => <div key={n.id} style={{ padding: "12px 0", borderTop: "1px solid var(--line)" }}><p style={{ margin: "0 0 5px", whiteSpace: "pre-wrap" }}>{n.body}</p><span className="muted" style={{ fontSize: 12 }}>{dateLabel(n.created_at, true)}</span><button className="pill-btn" style={{ marginLeft: 8 }} onClick={() => void run(() => studentAdminAction(id, { action: "delete_note", note_id: n.id }), "Anotação removida.")}>Excluir</button></div>)}</div></div>
      </div>}

      {tab === "logs" && <div className="grid cols-2">
        <div className="card stat"><div className="eyebrow">Incidentes deste aluno</div>{detail.incidents.length === 0 ? <p className="muted">Nenhum erro registrado para este aluno.</p> : detail.incidents.map((item) => <div key={item.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--line)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><b>{item.trace_code}</b><span className={`flag ${item.status === "resolved" ? "ok" : item.severity === "critical" ? "bad" : "att"}`}>{item.status === "resolved" ? "Resolvido" : item.status === "investigating" ? "Investigando" : "Novo"}</span></div><p style={{ margin: "7px 0" }}>{item.message}</p><span className="muted" style={{ fontSize: 12 }}>{item.area} · {item.occurrences} ocorrência(s) · {dateLabel(item.last_seen_at, true)}</span>{item.resolution_note && <p style={{ fontSize: 13 }}><b>Solução:</b> {item.resolution_note}</p>}</div>)}<Link className="btn light" style={{ marginTop: 12 }} href="/professor/operacional">Abrir painel operacional →</Link></div>
        <div className="card stat"><div className="eyebrow">Histórico administrativo</div>{detail.audits.length === 0 ? <p className="muted">As próximas alterações feitas pela escola aparecerão aqui.</p> : detail.audits.map((item) => <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--line)" }}><span>{({ student_invited: "Aluno convidado", student_updated: "Cadastro atualizado", access_paused: "Acesso pausado", access_resumed: "Acesso reativado", password_reset_sent: "Redefinição de senha enviada", note_added: "Anotação criada", note_deleted: "Anotação excluída", assignment_added: "Atividade atribuída", assignment_status_changed: "Atividade atualizada" } as Record<string, string>)[item.action] ?? item.action}</span><span className="muted" style={{ fontSize: 12 }}>{dateLabel(item.created_at, true)}</span></div>)}</div>
      </div>}

      {tab === "access" && <div className="grid cols-2">
        <div className="card stat"><div className="eyebrow">Cadastro e plano</div>{[["Nome", "name", "text"], ["E-mail de acesso", "email", "email"], ["WhatsApp", "whatsapp", "text"], ["Nascimento", "birthdate", "date"], ["Validade do acesso", "access_expires_on", "date"]].map(([label, key, type]) => <div className="field" key={key}><label>{label}</label><input type={type} value={String(form[key as keyof typeof form])} disabled={key === "email" && !invitePending} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />{key === "email" && <small className="muted">{invitePending ? "Pode ser corrigido enquanto o convite não foi aceito." : "Conta ativa: a troca de e-mail exige um fluxo de segurança próprio."}</small>}</div>)}<div className="field"><label>Nível</label><select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>{["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => <option key={l}>{l}</option>)}</select></div><div className="field"><label>Foco recomendado</label><textarea rows={3} value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })} /></div><div className="field"><label>Meta semanal (dias)</label><input type="number" min={1} max={7} value={form.weekly_goal} onChange={(e) => setForm({ ...form, weekly_goal: Number(e.target.value) })} /></div><button className="btn primary" disabled={busy} onClick={() => void run(() => updateStudentDetail(id, form), form.email.trim().toLowerCase() !== detail.email.toLowerCase() ? "Cadastro e e-mail atualizados. Agora reenvie o acesso." : "Cadastro atualizado.")}>Salvar alterações</button></div>
        <div><div className="card stat"><div className="eyebrow">Acesso à plataforma</div><p className="muted">{a.blocked ? "O aluno está impedido de acessar a área de estudos." : invitePending ? `O primeiro acesso de ${detail.email} ainda não foi concluído. Confirme o endereço antes de gerar um novo link.` : "O acesso do aluno está ativo."}</p>{!invitePending && <button className={a.blocked ? "btn primary" : "btn light"} disabled={busy} onClick={() => { const action = a.blocked ? "resume" : "pause"; if (!confirm(a.blocked ? `Reativar ${name}?` : `Pausar o acesso de ${name}?`)) return; void run(async () => (await setStudentAccess(id, action)).error, a.blocked ? "Acesso reativado." : "Acesso pausado."); }}>{a.blocked ? "Reativar acesso" : "Pausar acesso"}</button>}</div><div className="card stat" style={{ marginTop: 18 }}><div className="eyebrow">{invitePending ? "Convite e senha" : "Senha"}</div><p className="muted">{invitePending ? "Gera um link novo e válido para o aluno definir a senha. Depois, basta copiar e enviar pelo WhatsApp." : "Envia um e-mail para o aluno criar uma nova senha. A senha atual nunca fica visível para a escola."}</p><button className="btn light" disabled={busy} onClick={() => { const actionLabel = invitePending ? "Gerar novo acesso" : "Enviar redefinição de senha"; if (confirm(`${actionLabel} para ${detail.email}?`)) void resendAccess(); }}>{invitePending ? "Gerar novo acesso" : "Enviar redefinição de senha"}</button></div></div>
      </div>}
      {tab === "access" && accessLink && <div className="card stat" style={{ marginTop: 18 }}><div className="eyebrow">Link alternativo de acesso</div><p className="muted">Se o e-mail não chegar, envie este link diretamente para o aluno por WhatsApp.</p><div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><input readOnly value={accessLink} onFocus={(event) => event.currentTarget.select()} style={{ flex: "1 1 280px", fontSize: 13, fontFamily: "monospace" }} /><button type="button" className="btn light" onClick={() => void copyAccessLink()}>{accessLinkCopied ? "Copiado!" : "Copiar link"}</button></div></div>}
      {tab === "access" && invitePending && <div className="card stat" style={{ marginTop: 18, borderColor: "var(--gold)" }}><div className="eyebrow">Acesso sem depender de e-mail</div><p className="muted">Crie uma senha provisória individual. No primeiro login, o aluno será obrigado a substituí-la.</p><button type="button" className="btn gold" disabled={busy} onClick={() => void createTemporaryAccess()}>Criar senha provisória</button>{temporaryPassword && <div style={{ marginTop: 14 }}><div className="field"><label>Login</label><input readOnly value={detail.email} onFocus={(event) => event.currentTarget.select()} /></div><div className="field"><label>Senha provisória</label><input readOnly value={temporaryPassword} onFocus={(event) => event.currentTarget.select()} style={{ fontFamily: "monospace", fontWeight: 800 }} /></div><button type="button" className="btn light" onClick={() => void copyTemporaryAccess()}>{temporaryPasswordCopied ? "Copiado!" : "Copiar login e senha"}</button></div>}</div>}
      {tab === "access" && <div className="card stat" style={{ marginTop: 18, borderColor: "var(--bad)" }}><div className="eyebrow" style={{ color: "var(--bad)" }}>Excluir aluno</div><p className="muted">Remove a conta e os dados de estudo deste aluno. Para sua segurança, o sistema pedirá que você escreva DELETAR.</p><button type="button" className="btn light" disabled={busy} onClick={() => void removeStudent()} style={{ color: "var(--bad)", borderColor: "var(--bad)" }}>Excluir aluno</button></div>}
    </div>
  );
}
