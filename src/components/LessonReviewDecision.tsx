"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { REVIEW_LABELS, reviewStatus, type LessonReview } from "@/lib/lesson-review-types";

export function LessonReviewDecision({ id, revision, initialReview }: { id: string; revision: string; initialReview: LessonReview | null }) {
  const router = useRouter();
  const [review, setReview] = useState(initialReview);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(initialReview?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const status = reviewStatus(review, revision);
  async function save(decision: "approved" | "rejected") {
    setError(""); setMessage("");
    if (decision === "rejected" && !note.trim()) { setError("Explique o que precisa ser corrigido."); return; }
    setSaving(true);
    try {
      const response = await fetch(`/api/professor/aulas/${id}/revisao`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: decision, note, revision, expectedUpdatedAt: review?.updated_at ?? null }) });
      const body = await response.json();
      if (!response.ok) { setError(body.error || "Não consegui salvar a decisão."); return; }
      setReview(body.review); setEditing(false);
      setMessage(decision === "approved" ? "Aula aprovada e publicada para os alunos." : "Correção solicitada. A aula fica fora da biblioteca dos alunos.");
      router.refresh();
    } catch { setError("A conexão falhou. Confira a decisão após atualizar a página antes de tentar novamente."); }
    finally { setSaving(false); }
  }
  return <section className="card" aria-label="Decisão sobre a aula" style={{ padding: 20, margin: "20px 0" }}>
    <h3>Revisão e publicação</h3><p><b>{REVIEW_LABELS[status]}</b></p>
    {review && <p className="muted">Última decisão: {new Date(review.updated_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>}
    {review?.note && <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}><b>Correção solicitada:</b> {review.note}</p>}
    <p>Aprovar libera esta versão da aula imediatamente para os alunos. Reprovar mantém a aula em revisão e retira uma publicação anterior.</p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <button className="btn light" disabled={saving || status === "approved"} onClick={() => void save("approved")}>Aprovar e publicar</button>
      <button className="btn ghost" disabled={saving} onClick={() => { setEditing(true); setError(""); setMessage(""); }}>Reprovar / solicitar correção</button>
    </div>
    {editing && <form onSubmit={(event) => { event.preventDefault(); void save("rejected"); }} style={{ marginTop: 16 }}>
      <label htmlFor={`correcao-${id}`}>O que precisa ser corrigido?</label>
      <textarea id={`correcao-${id}`} value={note} onChange={(event) => setNote(event.target.value)} required maxLength={2000} rows={5} disabled={saving} style={{ display: "block", width: "100%", boxSizing: "border-box", margin: "8px 0 12px", padding: 12 }} />
      <button className="btn light" disabled={saving || !note.trim()} type="submit">Salvar reprovação</button>{" "}
      <button className="btn ghost" disabled={saving} type="button" onClick={() => setEditing(false)}>Cancelar</button>
    </form>}
    {saving && <p role="status">Salvando decisão…</p>}{message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
    {status === "approved" && <p><Link href={`/aluno/aulas/${id}`}>Ver aula publicada →</Link></p>}
  </section>;
}
