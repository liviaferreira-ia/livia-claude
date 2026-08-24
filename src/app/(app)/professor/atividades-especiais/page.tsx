"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  deleteSpecialActivity,
  listSpecialActivities,
  specialActivityAction,
  type SpecialActivity,
  type SpecialActivityEffectiveStatus,
} from "@/lib/special-activities";
import { useProfile } from "@/lib/profile";

const STATUS: Record<SpecialActivityEffectiveStatus, { label: string; cls: string }> = {
  draft: { label: "Rascunho", cls: "" }, scheduled: { label: "Agendada", cls: "info" },
  available: { label: "Disponível", cls: "ok" }, ended: { label: "Encerrada", cls: "att" }, archived: { label: "Arquivada", cls: "" },
};
const TYPE: Record<string, string> = { external_link: "Link externo", material: "Material", mixed: "Conteúdo misto", internal: "Atividade interna", ai_generated: "Gerada por IA" };

function date(value: string | null) {
  return value ? new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Sem limite";
}

export default function AtividadesEspeciaisAdminPage() {
  const { ready, isTeacher } = useProfile();
  const [activities, setActivities] = useState<SpecialActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | SpecialActivityEffectiveStatus | "library">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const result = await listSpecialActivities();
      setActivities(result.activities); setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar as atividades.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready || !isTeacher) return;
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [ready, isTeacher]);

  const visible = useMemo(() => activities.filter((activity) => {
    const matchesSearch = `${activity.title} ${activity.level} ${activity.description ?? ""}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === "all" || (filter === "library" ? ["ended", "archived"].includes(activity.effective_status) : activity.effective_status === filter);
    return matchesSearch && matchesFilter;
  }), [activities, filter, query]);

  async function action(activity: SpecialActivity, value: "publish" | "archive" | "restore" | "duplicate" | "delete") {
    const question = value === "archive" ? "Arquivar esta atividade?" : value === "delete" ? "Excluir definitivamente esta atividade?" : value === "duplicate" ? "Criar uma cópia desta atividade na biblioteca?" : null;
    if (question && !confirm(question)) return;
    setBusyId(activity.id); setError("");
    try {
      if (value === "delete") await deleteSpecialActivity(activity.id);
      else await specialActivityAction(activity.id, value);
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Não foi possível concluir a ação.");
    } finally {
      setBusyId(null);
    }
  }

  if (!ready || loading) return <div className="view"><p className="muted">Carregando atividades especiais…</p></div>;
  if (!isTeacher) return <div className="view"><p>Área exclusiva da equipe da escola.</p></div>;

  const available = activities.filter((item) => item.effective_status === "available").length;
  const scheduled = activities.filter((item) => item.effective_status === "scheduled").length;
  const drafts = activities.filter((item) => item.effective_status === "draft").length;
  const totalViews = activities.reduce((sum, item) => sum + item.metrics.viewed, 0);

  return <div className="view special-admin-view">
    <div className="special-page-heading"><div><div className="eyebrow">Painel do professor</div><h2>Atividades Especiais</h2><p className="muted">Conteúdos personalizados, materiais e experiências extras para os alunos.</p></div><div className="special-heading-actions"><button className="btn light" disabled title="Em breve">✨ Criar com IA</button><Link href="/professor/atividades-especiais/nova" className="btn gold">＋ Nova atividade</Link></div></div>
    <div className="special-kpi-grid"><div className="card"><b>{available}</b><span>Disponíveis</span></div><div className="card"><b>{scheduled}</b><span>Agendadas</span></div><div className="card"><b>{drafts}</b><span>Rascunhos</span></div><div className="card"><b>{totalViews}</b><span>Visualizações</span></div></div>
    <div className="card special-toolbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar atividade…" /><div className="special-filter-tabs">{([['all','Todas'],['available','Disponíveis'],['scheduled','Agendadas'],['ended','Encerradas'],['draft','Rascunhos'],['library','Biblioteca']] as const).map(([id, label]) => <button type="button" key={id} className={filter === id ? "active" : ""} onClick={() => setFilter(id)}>{label}</button>)}</div></div>
    {error && <p className="auth-msg err" style={{ maxWidth: "none" }}>{error}</p>}
    {visible.length === 0 ? <div className="card special-empty"><span>⭐</span><h3>Nenhuma atividade aqui ainda</h3><p className="muted">Crie a primeira experiência especial e escolha quem irá recebê-la.</p><Link href="/professor/atividades-especiais/nova" className="btn gold">Criar atividade</Link></div> : <div className="special-activity-list">{visible.map((activity) => { const status = STATUS[activity.effective_status]; return <article className="card special-admin-card" key={activity.id}>
      <div className="special-admin-card-main"><div className="special-level-box">{activity.level}</div><div><div className="special-card-title"><h3>{activity.title}</h3><span className={`flag ${status.cls}`}>{status.label}</span></div><p>{activity.description || "Sem descrição."}</p><div className="special-card-meta"><span>{TYPE[activity.content_type] ?? activity.content_type}</span><span>{activity.starts_at ? date(activity.starts_at) : "Disponível ao publicar"} → {date(activity.ends_at)}</span><span>{activity.assets.length} material(is)</span></div></div></div>
      <div className="special-admin-metrics"><span><b>{activity.metrics.recipients}</b> alunos</span><span><b>{activity.metrics.viewed}</b> visualizaram</span><span><b>{activity.metrics.submissions}</b> entregas</span></div>
      <div className="special-admin-actions"><Link className="pill-btn" href={`/professor/atividades-especiais/${activity.id}`}>Editar</Link>{activity.publication_status === "draft" && <button className="pill-btn" disabled={busyId === activity.id} onClick={() => void action(activity, "publish")}>Publicar</button>}<button className="pill-btn" disabled={busyId === activity.id} onClick={() => void action(activity, "duplicate")}>Duplicar</button>{activity.publication_status === "archived" ? <button className="pill-btn" disabled={busyId === activity.id} onClick={() => void action(activity, "restore")}>Restaurar</button> : <button className="pill-btn" disabled={busyId === activity.id} onClick={() => void action(activity, "archive")}>Arquivar</button>}<button className="pill-btn danger-text" disabled={busyId === activity.id} onClick={() => void action(activity, "delete")}>Excluir</button></div>
    </article>; })}</div>}
  </div>;
}
