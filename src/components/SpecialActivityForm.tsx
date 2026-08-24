"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  createSpecialActivity,
  deleteSpecialActivityAsset,
  getSpecialActivity,
  listSpecialActivities,
  specialActivityAction,
  updateSpecialActivity,
  uploadSpecialActivityAsset,
  type SpecialActivity,
  type SpecialActivityContentType,
  type SpecialActivityInput,
  type SpecialActivityStudent,
} from "@/lib/special-activities";
import { levelDisplay, useProfile } from "@/lib/profile";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SUBMISSION_FORMATS = [
  ["pdf", "PDF"], ["docx", "DOCX"], ["image", "Imagem"], ["audio", "Áudio"],
  ["video", "Vídeo"], ["presentation", "Apresentação"], ["zip", "ZIP"],
] as const;

function toInputDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function fileSize(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function SpecialActivityForm({ activityId }: { activityId?: string }) {
  const { ready, isTeacher } = useProfile();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState<SpecialActivity | null>(null);
  const [students, setStudents] = useState<SpecialActivityStudent[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("A2");
  const [instructions, setInstructions] = useState("");
  const [contentType, setContentType] = useState<SpecialActivityContentType>("external_link");
  const [externalUrl, setExternalUrl] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [noEnd, setNoEnd] = useState(true);
  const [allowDownload, setAllowDownload] = useState(true);
  const [requiresSubmission, setRequiresSubmission] = useState(false);
  const [allowedFormats, setAllowedFormats] = useState<string[]>(["pdf", "docx", "image"]);
  const [maxFileMb, setMaxFileMb] = useState(20);
  const [allowReplacement, setAllowReplacement] = useState(true);
  const [targetMode, setTargetMode] = useState<"all" | "levels" | "students">("students");
  const [targetLevels, setTargetLevels] = useState<string[]>([]);
  const [studentIds, setStudentIds] = useState<string[]>([]);

  useEffect(() => {
    if (!ready || !isTeacher) return;
    const load = async () => {
      try {
        const result = activityId ? await getSpecialActivity(activityId) : await listSpecialActivities();
        setStudents(result.students);
        if (activityId && "activity" in result) {
          const item = result.activity;
          setActivity(item); setTitle(item.title); setDescription(item.description ?? ""); setLevel(item.level);
          setInstructions(item.instructions ?? ""); setContentType(item.content_type); setExternalUrl(item.external_url ?? "");
          setStartsAt(toInputDate(item.starts_at)); setEndsAt(toInputDate(item.ends_at)); setNoEnd(!item.ends_at);
          setAllowDownload(item.allow_download); setTargetMode(item.targets.mode);
          setRequiresSubmission(item.requires_submission); setAllowedFormats(item.allowed_formats ?? ["pdf", "docx", "image"]);
          setMaxFileMb(item.max_file_mb ?? 20); setAllowReplacement(item.allow_replacement ?? true);
          setTargetLevels(item.targets.levels); setStudentIds(item.targets.studentIds);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o formulário.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [activityId, isTeacher, ready]);

  const visibleStudents = useMemo(() => {
    const search = studentSearch.trim().toLowerCase();
    return students.filter((student) => !search || `${student.student_name ?? ""} ${student.level ?? ""}`.toLowerCase().includes(search));
  }, [studentSearch, students]);

  function values(): SpecialActivityInput {
    return {
      title, description, level, instructions, content_type: contentType, external_url: externalUrl,
      starts_at: startsAt ? new Date(startsAt).toISOString() : "",
      ends_at: !noEnd && endsAt ? new Date(endsAt).toISOString() : "",
      requires_submission: requiresSubmission, allowed_formats: allowedFormats, max_file_mb: maxFileMb,
      allow_replacement: allowReplacement, allow_download: allowDownload,
      targets: { mode: targetMode, levels: targetLevels, studentIds },
    };
  }

  async function save(publish: boolean) {
    setBusy(true); setError("");
    try {
      if ((contentType === "material" || contentType === "mixed") && (activity?.assets.length ?? 0) + files.length === 0) {
        throw new Error("Adicione pelo menos um material para este tipo de atividade.");
      }
      let id = activityId;
      if (id) await updateSpecialActivity(id, values());
      else id = (await createSpecialActivity(values())).id;
      for (const file of files) await uploadSpecialActivityAsset(id, file);
      if (publish) await specialActivityAction(id, "publish");
      router.push("/professor/atividades-especiais");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar a atividade.");
      setBusy(false);
    }
  }

  async function removeAsset(assetId: string) {
    if (!activityId || !confirm("Remover este material da atividade?")) return;
    setBusy(true); setError("");
    try {
      await deleteSpecialActivityAsset(activityId, assetId);
      const result = await getSpecialActivity(activityId);
      setActivity(result.activity);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Não foi possível remover o arquivo.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready || loading) return <div className="view"><p className="muted">Carregando atividade…</p></div>;
  if (!isTeacher) return <div className="view"><p>Área exclusiva da equipe da escola.</p></div>;

  return <div className="view special-admin-view">
    <Link href="/professor/atividades-especiais" className="muted" style={{ fontSize: 13 }}>← Voltar para atividades</Link>
    <div className="special-page-heading"><div><div className="eyebrow">Atividades especiais</div><h2>{activityId ? "Editar atividade" : "Nova atividade"}</h2><p className="muted">Prepare o conteúdo, escolha os alunos e publique quando estiver pronto.</p></div><button type="button" className="btn light" disabled title="Em breve">✨ Criar com IA · em breve</button></div>
    {error && <p className="auth-msg err" style={{ maxWidth: "none" }}>{error}</p>}

    <div className="special-form-grid">
      <section className="card special-form-section">
        <div className="eyebrow">1 · Informações básicas</div>
        <div className="field"><label htmlFor="special-title">Título *</label><input id="special-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: At the Airport" /></div>
        <div className="field"><label htmlFor="special-description">Descrição</label><textarea id="special-description" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Explique o objetivo da atividade." /></div>
        <div className="field"><label htmlFor="special-level">Nível *</label><select id="special-level" value={level} onChange={(event) => setLevel(event.target.value)}>{LEVELS.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="field"><label htmlFor="special-instructions">Instruções para o aluno</label><textarea id="special-instructions" rows={7} value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Passo a passo, orientações e o que o aluno deverá fazer." /></div>
      </section>

      <section className="card special-form-section">
        <div className="eyebrow">2 · Conteúdo e materiais</div>
        <div className="field"><label htmlFor="special-type">Tipo de conteúdo</label><select id="special-type" value={contentType} onChange={(event) => setContentType(event.target.value as SpecialActivityContentType)}><option value="external_link">Link externo</option><option value="material">PDF / material</option><option value="mixed">Conteúdo misto</option><option disabled>Atividade interna · em breve</option><option disabled>Atividade gerada por IA · em breve</option></select></div>
        {(contentType === "external_link" || contentType === "mixed") && <div className="field"><label htmlFor="special-url">Link da atividade *</label><input id="special-url" type="url" value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="https://…" /><small className="special-field-help">Links públicos de Claude Artifacts são importados automaticamente e aparecem dentro da Central School.</small></div>}
        <div className="field"><label htmlFor="special-files">Materiais complementares · até 20 MB</label><input id="special-files" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.mp3,.m4a,.wav,.mp4,.zip" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></div>
        {files.length > 0 && <div className="special-file-list">{files.map((file) => <span key={`${file.name}-${file.size}`}>{file.name} · {fileSize(file.size)}</span>)}</div>}
        {activity?.assets.map((asset) => <div className="special-existing-file" key={asset.id}><div><b>{asset.file_name}</b><span>{fileSize(asset.file_size)}</span></div><div>{asset.signed_url && <a className="pill-btn" href={asset.signed_url} target="_blank" rel="noopener noreferrer">Abrir</a>}<button type="button" className="pill-btn" disabled={busy} onClick={() => void removeAsset(asset.id)}>Remover</button></div></div>)}
        <label className="special-check"><input type="checkbox" checked={allowDownload} onChange={(event) => setAllowDownload(event.target.checked)} /> Permitir download dos materiais</label>
        <label className="special-check"><input type="checkbox" checked={requiresSubmission} onChange={(event) => setRequiresSubmission(event.target.checked)} /> Esta atividade exige entrega do aluno</label>
        {requiresSubmission && <div className="special-submission-settings">
          <div><b>Formatos aceitos</b><div className="special-format-picker">{SUBMISSION_FORMATS.map(([value, label]) => <label key={value}><input type="checkbox" checked={allowedFormats.includes(value)} onChange={() => setAllowedFormats((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])} /> {label}</label>)}</div></div>
          <div className="field"><label htmlFor="special-max-file">Tamanho máximo por arquivo</label><select id="special-max-file" value={maxFileMb} onChange={(event) => setMaxFileMb(Number(event.target.value))}><option value={5}>5 MB</option><option value={10}>10 MB</option><option value={20}>20 MB</option></select></div>
          <label className="special-check"><input type="checkbox" checked={allowReplacement} onChange={(event) => setAllowReplacement(event.target.checked)} /> Permitir substituir a entrega até o prazo</label>
        </div>}
      </section>

      <section className="card special-form-section">
        <div className="eyebrow">3 · Disponibilidade</div>
        <div className="special-date-grid"><div className="field"><label htmlFor="special-start">Disponível a partir de</label><input id="special-start" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></div><div className="field"><label htmlFor="special-end">Disponível até</label><input id="special-end" type="datetime-local" value={endsAt} disabled={noEnd} onChange={(event) => setEndsAt(event.target.value)} /></div></div>
        <label className="special-check"><input type="checkbox" checked={noEnd} onChange={(event) => setNoEnd(event.target.checked)} /> Sem data de encerramento</label>
        <p className="muted" style={{ fontSize: 13 }}>Sem data inicial, a atividade fica disponível assim que for publicada.</p>
      </section>

      <section className="card special-form-section">
        <div className="eyebrow">4 · Destinatários</div>
        <div className="special-target-options"><label><input type="radio" name="target" checked={targetMode === "all"} onChange={() => setTargetMode("all")} /> Todos os alunos</label><label><input type="radio" name="target" checked={targetMode === "levels"} onChange={() => setTargetMode("levels")} /> Níveis selecionados</label><label><input type="radio" name="target" checked={targetMode === "students"} onChange={() => setTargetMode("students")} /> Alunos específicos</label></div>
        {targetMode === "levels" && <div className="special-level-picker">{LEVELS.map((item) => <button type="button" key={item} className={targetLevels.includes(item) ? "active" : ""} onClick={() => setTargetLevels((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])}>{item}</button>)}</div>}
        {targetMode === "students" && <><div className="field"><label htmlFor="student-search">Buscar aluno</label><input id="student-search" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Nome ou nível…" /></div><div className="special-student-picker">{visibleStudents.map((student) => <label key={student.user_id}><input type="checkbox" checked={studentIds.includes(student.user_id)} onChange={() => setStudentIds((current) => current.includes(student.user_id) ? current.filter((id) => id !== student.user_id) : [...current, student.user_id])} /><span><b>{student.student_name || "Aluno(a)"}</b><small>{student.level ? levelDisplay(student.level) : "Nível não informado"}</small></span></label>)}</div><p className="muted" style={{ fontSize: 12 }}>{studentIds.length} aluno(s) selecionado(s)</p></>}
      </section>
    </div>

    {activityId && activity && <section className="card special-tracking-section">
      <div className="special-tracking-head"><div><div className="eyebrow">Acompanhamento dos alunos</div><h3>Visualizações e entregas</h3></div><span className="muted">{activity.recipient_states?.length ?? 0} aluno(s) vinculado(s)</span></div>
      {!activity.recipient_states?.length ? <p className="muted">Os alunos aparecerão aqui depois que a atividade for publicada.</p> : <div className="special-tracking-list">
        {activity.recipient_states.map((recipient) => {
          const latest = recipient.submission?.versions?.[0];
          return <div key={recipient.student_id} className="special-tracking-row">
            <div><b>{recipient.student_name || "Aluno(a)"}</b><span>{recipient.level ? levelDisplay(recipient.level) : "Nível não informado"}</span></div>
            <span className={`flag ${recipient.viewed_at ? "ok" : ""}`}>{recipient.viewed_at ? `Visualizou ${new Date(recipient.viewed_at).toLocaleDateString("pt-BR")}` : "Não visualizou"}</span>
            <span className={`flag ${recipient.submission ? "info" : "att"}`}>{recipient.submission ? "Entregue" : requiresSubmission ? "Entrega pendente" : "Sem entrega"}</span>
            {latest?.signed_url ? <a className="pill-btn" href={latest.signed_url} target="_blank" rel="noopener noreferrer">Abrir entrega</a> : <span />}
          </div>;
        })}
      </div>}
    </section>}

    <div className="special-form-actions"><Link href="/professor/atividades-especiais" className="btn ghost">Cancelar</Link><button type="button" className="btn light" disabled={busy || !title.trim()} onClick={() => void save(false)}>{busy ? "Salvando…" : activity?.publication_status === "published" ? "Salvar alterações" : "Salvar rascunho"}</button><button type="button" className="btn gold" disabled={busy || !title.trim()} onClick={() => void save(true)}>{busy ? "Publicando…" : "Publicar atividade"}</button></div>
  </div>;
}
