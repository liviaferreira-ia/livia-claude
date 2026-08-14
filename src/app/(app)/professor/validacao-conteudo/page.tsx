"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categoriesFor } from "@/data/exercises";
import { LEVEL_ORDER, levelBadge, type CefrLevel } from "@/data/placement";
import { loadContentValidations, updateContentValidation, type ContentValidation } from "@/lib/content-validation";
import { useProfile } from "@/lib/profile";

function when(value: string) { return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }); }

export default function ContentValidationPage() {
  const { ready, isTeacher } = useProfile();
  const [validations, setValidations] = useState<ContentValidation[]>([]);
  const [notes, setNotes] = useState<Partial<Record<CefrLevel, string>>>({});
  const [checked, setChecked] = useState<Partial<Record<CefrLevel, boolean>>>({});
  const [busy, setBusy] = useState<CefrLevel | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    const result = await loadContentValidations();
    setValidations(result.validations);
    setNotes(Object.fromEntries(result.validations.map((item) => [item.level, item.note ?? ""])));
    setChecked(Object.fromEntries(result.validations.map((item) => [item.level, item.validated])));
    setError(result.error ?? "");
  }

  useEffect(() => {
    if (!ready || !isTeacher) return;
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [ready, isTeacher]);

  async function save(level: CefrLevel) {
    setBusy(level);
    setError("");
    const failure = await updateContentValidation(level, checked[level] ?? false, notes[level] ?? "");
    setBusy(null);
    if (failure) { setError(failure); return; }
    await refresh();
  }

  if (!ready) return <div className="view"><p className="muted">Carregando…</p></div>;
  if (!isTeacher) return <div className="view"><p>Esta área é exclusiva do professor.</p></div>;
  return <div className="view">
    <div className="eyebrow">Revisão pedagógica</div><h1>Validação de conteúdo</h1><p className="muted">Faça os exercícios de cada nível CEFR e registre a validação com uma observação opcional. As respostas feitas neste modo não alteram o progresso de nenhum aluno.</p>
    {error && <p className="auth-msg err" style={{ maxWidth: "none" }}>{error}</p>}
    <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
      {LEVEL_ORDER.map((level) => {
        const item = validations.find((validation) => validation.level === level);
        const isValidated = checked[level] ?? false;
        const exerciseCount = categoriesFor(level).reduce((sum, category) => sum + category.count, 0);
        return <div className="card stat" key={level} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(240px,100%),1fr))", gap: 16, alignItems: "end" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}><b style={{ fontSize: 20 }}>{levelBadge(level)}</b><span className={`flag ${isValidated ? "ok" : "att"}`}>{isValidated ? "Validado" : "Pendente"}</span></div>
            <p className="muted" style={{ margin: "10px 0 0" }}>{exerciseCount} exercícios em 4 blocos</p>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}><input type="checkbox" checked={isValidated} onChange={(event) => setChecked((current) => ({ ...current, [level]: event.target.checked }))} /> Conteúdo validado</label>
            <p className="muted" style={{ margin: "10px 0 0" }}>{item?.validated_at ? `${item.validator_name || "Professor(a)"} · ${when(item.validated_at)}` : "Ainda não validado"}</p>
          </div>
          <div className="field" style={{ margin: 0 }}><label htmlFor={`note-${level}`}>Observação</label><textarea id={`note-${level}`} rows={3} value={notes[level] ?? ""} maxLength={2000} onChange={(event) => setNotes((current) => ({ ...current, [level]: event.target.value }))} placeholder="Observação opcional sobre o conteúdo deste nível" /></div>
          <div style={{ display: "grid", gap: 10 }}>
            <Link className="btn ghost" href={`/aluno/praticar?revisao=${level}`}>Revisar exercícios →</Link>
            <button className="btn primary" disabled={busy !== null} onClick={() => void save(level)}>{busy === level ? "Salvando…" : "Salvar validação"}</button>
          </div>
        </div>;
      })}
    </div>
  </div>;
}
