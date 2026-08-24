"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getMySpecialActivity, submitSpecialActivity, type SpecialActivity } from "@/lib/special-activities";
import { useProfile } from "@/lib/profile";

function fileSize(value: number) {
  return value < 1024 * 1024 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AtividadeEspecialAlunoPage() {
  const { id } = useParams<{ id: string }>();
  const { ready } = useProfile();
  const [activity, setActivity] = useState<SpecialActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");

  async function sendSubmission() {
    if (!submissionFile) return;
    setSubmitting(true); setError(""); setSubmissionMessage("");
    try {
      await submitSpecialActivity(id, submissionFile);
      const result = await getMySpecialActivity(id);
      setActivity(result.activity); setSubmissionFile(null);
      setSubmissionMessage("Atividade enviada com sucesso.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível enviar sua atividade.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!ready) return;
    getMySpecialActivity(id).then((result) => setActivity(result.activity)).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Não foi possível abrir esta atividade.")).finally(() => setLoading(false));
  }, [id, ready]);

  if (!ready || loading) return <div className="view"><p className="muted">Abrindo atividade…</p></div>;
  if (!activity) return <div className="view"><Link href="/aluno/especial" className="muted">← Especial para você</Link><p className="auth-msg err">{error || "Atividade não encontrada."}</p></div>;
  return <div className="view special-detail-view">
    <Link href="/aluno/especial" className="muted" style={{ fontSize: 13 }}>← Voltar para Especial para você</Link>
    {error && <p className="auth-msg err" style={{ maxWidth: "none" }}>{error}</p>}
    <header className="special-detail-hero"><div><div className="eyebrow">⭐ Especial para você</div><h1>{activity.title}</h1><p>{activity.description}</p><div className="special-detail-tags"><span className="level-badge">Nível {activity.level}</span><span>{activity.ends_at ? `Até ${new Date(activity.ends_at).toLocaleDateString("pt-BR")}` : "Sem prazo final"}</span>{activity.effective_status === "ended" && <span className="flag att">Encerrada</span>}</div></div></header>
    {activity.instructions && <section className="card special-detail-section"><div className="eyebrow">Instruções</div><p className="special-instructions">{activity.instructions}</p></section>}
    {activity.internal_content ? <section className="card special-detail-section special-embedded-section">
      <div className="special-embedded-head"><div><div className="eyebrow">Atividade interativa</div><h3>Faça a atividade aqui</h3><p className="muted">Seu conteúdo foi integrado à Central School.</p></div>{activity.external_url && <a className="pill-btn" href={activity.external_url} target="_blank" rel="noopener noreferrer">Abrir em tela separada ↗</a>}</div>
      <iframe className="special-activity-frame" title={`Atividade: ${activity.title}`} srcDoc={activity.internal_content} sandbox="allow-scripts allow-forms allow-modals allow-downloads" allow="microphone; camera; fullscreen" />
    </section> : activity.external_url && <section className="card special-detail-section special-launch-card"><div><div className="eyebrow">Atividade</div><h3>Pronto para começar?</h3><p className="muted">Este conteúdo externo não permite importação automática e será aberto em uma nova aba.</p></div><a className="btn gold" href={activity.external_url} target="_blank" rel="noopener noreferrer">Abrir atividade ↗</a></section>}
    {activity.assets.length > 0 && <section className="card special-detail-section"><div className="eyebrow">Material complementar</div><div className="special-material-list">{activity.assets.map((asset) => <div key={asset.id}><span className="special-material-icon">▣</span><div><b>{asset.file_name}</b><span>{fileSize(asset.file_size)}</span></div>{asset.signed_url && <a className="btn light" href={asset.signed_url} target="_blank" rel="noopener noreferrer">{activity.allow_download ? "Abrir ou baixar" : "Visualizar"} ↗</a>}</div>)}</div></section>}
    {activity.requires_submission && <section className="card special-detail-section special-submission-card">
      <div className="eyebrow">Sua atividade</div><h3>{activity.student_state?.submission ? "Entrega realizada" : "Envie seu arquivo"}</h3>
      {activity.student_state?.submission ? <>
        <p className="auth-msg ok">✓ Enviado em {new Date(activity.student_state.submission.submitted_at).toLocaleString("pt-BR")}</p>
        <div className="special-submitted-files">{activity.student_state.submission.versions.map((version) => <div key={version.id ?? version.version_number}><div><b>{version.file_name}</b><span>Versão {version.version_number} · {fileSize(version.file_size)}</span></div>{version.signed_url && <a className="pill-btn" href={version.signed_url} target="_blank" rel="noopener noreferrer">Abrir</a>}</div>)}</div>
        {activity.allow_replacement && activity.effective_status === "available" && <p className="muted">Você pode enviar uma nova versão até o fim do prazo.</p>}
      </> : <p className="muted">Formatos aceitos: {activity.allowed_formats.join(", ").toUpperCase()} · máximo de {activity.max_file_mb} MB.</p>}
      {activity.effective_status === "available" && (!activity.student_state?.submission || activity.allow_replacement) && <div className="special-submit-controls"><input type="file" onChange={(event) => setSubmissionFile(event.target.files?.[0] ?? null)} /><button type="button" className="btn gold" disabled={!submissionFile || submitting} onClick={() => void sendSubmission()}>{submitting ? "Enviando…" : activity.student_state?.submission ? "Enviar nova versão" : "Enviar atividade"}</button></div>}
      {submissionMessage && <p className="auth-msg ok">✓ {submissionMessage}</p>}
      {activity.student_state?.submission?.feedback && <div className="special-feedback"><b>Feedback da professora</b><p>{activity.student_state.submission.feedback}</p></div>}
    </section>}
  </div>;
}
