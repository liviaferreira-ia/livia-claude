"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listMySpecialActivities, type SpecialActivity } from "@/lib/special-activities";
import { useProfile } from "@/lib/profile";

function dueDate(value: string | null) {
  return value ? `Disponível até ${new Date(value).toLocaleDateString("pt-BR")}` : "Sem data de encerramento";
}

function ActivityCard({ activity, history = false }: { activity: SpecialActivity; history?: boolean }) {
  const isNew = activity.student_state?.is_new;
  const submitted = Boolean(activity.student_state?.submission);
  return <article className={`card special-student-card${isNew ? " new" : ""}`}>
    <div className="special-student-card-top"><span className="special-level-box">{activity.level}</span>{submitted ? <span className="flag ok">✓ Entregue</span> : history ? <span className="flag">Encerrada</span> : isNew ? <span className="flag info">Nova</span> : activity.requires_submission ? <span className="flag att">Pendente</span> : <span className="flag ok">Visualizada</span>}</div>
    <h3>{activity.title}</h3><p>{activity.description || "Uma atividade preparada especialmente para você."}</p>
    <div className="special-student-card-meta"><span>{dueDate(activity.ends_at)}</span>{activity.assets.length > 0 && <span>{activity.assets.length} material(is)</span>}</div>
    <Link href={`/aluno/especial/${activity.id}`} className="btn light">{history ? "Revisar atividade" : "Ver atividade"} →</Link>
  </article>;
}

export default function EspecialParaVocePage() {
  const { ready } = useProfile();
  const [current, setCurrent] = useState<SpecialActivity[]>([]);
  const [history, setHistory] = useState<SpecialActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    listMySpecialActivities().then((result) => { setCurrent(result.current); setHistory(result.history); }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar suas atividades.")).finally(() => setLoading(false));
  }, [ready]);

  if (!ready || loading) return <div className="view"><p className="muted">Carregando suas atividades…</p></div>;
  return <div className="view special-student-view">
    <div className="special-student-hero"><span>⭐</span><div><div className="eyebrow">Conteúdo personalizado</div><h2>Especial para você</h2><p>Atividades e materiais preparados para complementar a sua jornada.</p></div></div>
    {error && <p className="auth-msg err" style={{ maxWidth: "none" }}>{error}</p>}
    <div className="sec-h"><h3>Atividades atuais</h3><span className="muted">{current.length} disponível(is)</span></div>
    {current.length === 0 ? <div className="card special-empty"><span>✨</span><h3>Nenhuma atividade nova</h3><p className="muted">Quando a professora preparar algo especial, aparecerá aqui.</p></div> : <div className="special-student-grid">{current.map((activity) => <ActivityCard activity={activity} key={activity.id} />)}</div>}
    {history.length > 0 && <><div className="sec-h" style={{ marginTop: 30 }}><h3>Histórico</h3><span className="muted">para revisar quando quiser</span></div><div className="special-student-grid">{history.map((activity) => <ActivityCard activity={activity} history key={activity.id} />)}</div></>}
  </div>;
}
