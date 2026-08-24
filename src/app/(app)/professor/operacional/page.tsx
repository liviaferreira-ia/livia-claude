"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadOperational, updateIncident, type AuditLog, type Incident } from "@/lib/operational";
import { useProfile } from "@/lib/profile";

const statusText = { new: "Novo", investigating: "Investigando", resolved: "Resolvido" };
const actionText: Record<string, string> = { student_invited: "Aluno convidado", invite_resent: "Convite reenviado", student_deleted: "Aluno excluído", student_updated: "Cadastro atualizado", access_paused: "Acesso pausado", access_resumed: "Acesso reativado", password_reset_sent: "Redefinição de senha enviada", note_added: "Anotação criada", note_deleted: "Anotação excluída", assignment_added: "Atividade atribuída", assignment_status_changed: "Status de atividade alterado", incident_status_changed: "Incidente atualizado", content_validation_changed: "Validação de conteúdo atualizada" };

function when(value: string) { return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }); }

export default function OperationalPage() {
  const { ready, isTeacher } = useProfile();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("open");
  const [selected, setSelected] = useState<Incident | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() { const result = await loadOperational(); setIncidents(result.incidents); setAudits(result.audits); setError(result.error ?? ""); }
  useEffect(() => {
    if (!ready || !isTeacher) return;
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [ready, isTeacher]);
  const shown = useMemo(() => incidents.filter((item) => {
    const matchesStatus = status === "all" || (status === "open" ? item.status !== "resolved" : item.status === status);
    const haystack = `${item.trace_code} ${item.student_name ?? ""} ${item.area} ${item.message}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase());
  }), [incidents, query, status]);
  const open = incidents.filter((x) => x.status !== "resolved");
  const critical = open.filter((x) => x.severity === "critical").length;
  const repeated = open.filter((x) => x.occurrences > 1).length;

  async function change(next: Incident["status"]) {
    if (!selected) return;
    setBusy(true); const failure = await updateIncident(selected.id, next, note); setBusy(false);
    if (failure) { setError(failure); return; }
    setSelected(null); setNote(""); await refresh();
  }

  if (!ready) return <div className="view"><p className="muted">Carregando…</p></div>;
  if (!isTeacher) return <div className="view"><p>Esta área é exclusiva do professor.</p></div>;
  return <div className="view">
    <div className="eyebrow">Saúde da plataforma</div><h1>Operacional</h1><p className="muted">Erros reais, códigos de atendimento e histórico de ações administrativas.</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, margin: "20px 0" }}>
      {[[String(open.length), "Incidentes abertos"], [String(critical), "Críticos"], [String(repeated), "Erros repetidos"], [String(incidents.filter((x) => x.status === "resolved").length), "Resolvidos"]].map(([value, label]) => <div className="card stat" key={label}><b style={{ display: "block", fontSize: 23 }}>{value}</b><span className="muted">{label}</span></div>)}
    </div>
    {error && <p className="auth-msg err" style={{ maxWidth: "none" }}>{error}</p>}
    <div className="card stat"><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar código, aluno, área ou erro" style={{ flex: 1, minWidth: 240 }} /><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="open">Em aberto</option><option value="new">Novos</option><option value="investigating">Investigando</option><option value="resolved">Resolvidos</option><option value="all">Todos</option></select></div>
      <div style={{ overflowX: "auto", marginTop: 14 }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}><thead><tr>{["Código", "Aluno", "Área", "Erro", "Repetições", "Última vez", "Status"].map((x) => <th key={x} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--line)" }}>{x}</th>)}</tr></thead><tbody>{shown.map((item) => <tr key={item.id} onClick={() => { setSelected(item); setNote(item.resolution_note ?? ""); }} style={{ cursor: "pointer", borderBottom: "1px solid var(--line)" }}><td style={{ padding: 10 }}><b>{item.trace_code}</b></td><td style={{ padding: 10 }}>{item.user_id ? <Link href={`/professor/alunos/${item.user_id}`}>{item.student_name || "Aluno"}</Link> : "Sistema"}</td><td style={{ padding: 10 }}>{item.area}</td><td style={{ padding: 10, maxWidth: 330 }}>{item.message}</td><td style={{ padding: 10 }}>{item.occurrences}×</td><td style={{ padding: 10 }}>{when(item.last_seen_at)}</td><td style={{ padding: 10 }}><span className={`flag ${item.status === "resolved" ? "ok" : item.severity === "critical" ? "bad" : "att"}`}>{statusText[item.status]}</span></td></tr>)}</tbody></table>{shown.length === 0 && <p className="muted">Nenhum incidente neste filtro.</p>}</div>
    </div>
    {selected && <div className="card stat" style={{ marginTop: 18 }}><div className="eyebrow">Incidente {selected.trace_code}</div><h3>{selected.message}</h3><p className="muted">{selected.source} · {selected.area} · primeira vez {when(selected.first_seen_at)} · {selected.occurrences} ocorrência(s)</p><div className="field"><label>Anotação da investigação / solução</label><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button className="btn light" disabled={busy} onClick={() => void change("investigating")}>Marcar investigando</button><button className="btn primary" disabled={busy || !note.trim()} onClick={() => void change("resolved")}>Resolver incidente</button><button className="btn ghost" onClick={() => setSelected(null)}>Fechar</button></div></div>}
    <div className="card stat" style={{ marginTop: 18 }}><div className="eyebrow">Auditoria administrativa recente</div>{audits.slice(0, 30).map((item) => <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--line)" }}><span>{actionText[item.action] ?? item.action}{item.student_name ? ` · ${item.student_name}` : ""}</span><span className="muted">{when(item.created_at)}</span></div>)}{audits.length === 0 && <p className="muted">As próximas alterações administrativas aparecerão aqui.</p>}</div>
  </div>;
}
