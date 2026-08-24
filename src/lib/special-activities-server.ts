import "server-only";

import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const SPECIAL_BUCKET = "special-activities";
export const SPECIAL_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
export const SPECIAL_CONTENT_TYPES = new Set(["external_link", "material", "mixed"]);
export const SPECIAL_SUBMISSION_FORMATS = new Set(["pdf", "docx", "image", "audio", "video", "presentation", "zip"]);
const CLAUDE_ARTIFACT_URL = /^https:\/\/claude\.ai\/public\/artifacts\/([0-9a-f-]{36})(?:\/embed)?\/?(?:[?#].*)?$/i;
const BROWSER_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36";

type Admin = ReturnType<typeof createAdminClient>;
type ActivityRow = Record<string, unknown> & {
  id: string;
  publication_status: "draft" | "published" | "archived";
  starts_at: string | null;
  ends_at: string | null;
};
type TargetRow = { activity_id: string; target_type: "all" | "level" | "student"; target_value: string | null };
type AssetRow = Record<string, unknown> & { id: string; activity_id: string; storage_path: string };
type RecipientRow = { activity_id: string; student_id: string; assigned_at: string; viewed_at: string | null };

export function effectiveSpecialStatus(row: ActivityRow) {
  if (row.publication_status === "archived") return "archived";
  if (row.publication_status === "draft") return "draft";
  const now = Date.now();
  if (row.starts_at && new Date(row.starts_at).getTime() > now) return "scheduled";
  if (row.ends_at && new Date(row.ends_at).getTime() <= now) return "ended";
  return "available";
}

export async function importClaudeArtifact(sourceUrl: string | null) {
  const match = sourceUrl?.match(CLAUDE_ARTIFACT_URL);
  if (!match) return null;
  const canonicalUrl = `https://claude.ai/public/artifacts/${match[1]}`;
  const page = await fetch(canonicalUrl, { headers: { "user-agent": BROWSER_USER_AGENT }, signal: AbortSignal.timeout(20_000) });
  if (!page.ok) throw new Error("Não foi possível acessar o Artifact público. Confira se o link está publicado.");
  const getSetCookie = (page.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const cookies = getSetCookie?.call(page.headers).map((value) => value.split(";", 1)[0]).join("; ") ?? "";
  const artifact = await fetch(`https://claude.ai/api/published_artifacts/${match[1]}`, {
    headers: { "user-agent": BROWSER_USER_AGENT, referer: canonicalUrl, accept: "application/json", ...(cookies ? { cookie: cookies } : {}) },
    signal: AbortSignal.timeout(20_000),
  });
  if (!artifact.ok) throw new Error("Não foi possível importar o conteúdo do Artifact. Tente salvar novamente em alguns instantes.");
  const payload = await artifact.json() as { type?: unknown; content?: unknown };
  if (payload.type !== "text/html" || typeof payload.content !== "string" || !payload.content.trim()) {
    throw new Error("Este Artifact não contém uma atividade HTML compatível.");
  }
  if (payload.content.length > 2_000_000) throw new Error("Este Artifact é grande demais para ser importado automaticamente.");
  return payload.content;
}

export function targetsFromRows(rows: TargetRow[]) {
  if (rows.some((row) => row.target_type === "all")) return { mode: "all" as const, levels: [], studentIds: [] };
  const levels = rows.filter((row) => row.target_type === "level" && row.target_value).map((row) => row.target_value as string);
  if (levels.length) return { mode: "levels" as const, levels, studentIds: [] };
  return {
    mode: "students" as const,
    levels: [],
    studentIds: rows.filter((row) => row.target_type === "student" && row.target_value).map((row) => row.target_value as string),
  };
}

export function normalizeSpecialPayload(body: Record<string, unknown>) {
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 180) : "";
  const description = typeof body.description === "string" ? body.description.trim().slice(0, 3000) : "";
  const instructions = typeof body.instructions === "string" ? body.instructions.trim().slice(0, 12000) : "";
  const level = typeof body.level === "string" && SPECIAL_LEVELS.has(body.level) ? body.level : "";
  const contentType = typeof body.content_type === "string" && SPECIAL_CONTENT_TYPES.has(body.content_type) ? body.content_type : "";
  const externalUrl = typeof body.external_url === "string" ? body.external_url.trim().slice(0, 2000) : "";
  let startsAt: string | null = null;
  let endsAt: string | null = null;
  if (typeof body.starts_at === "string" && body.starts_at) {
    const value = new Date(body.starts_at);
    if (!Number.isNaN(value.getTime())) startsAt = value.toISOString();
  }
  if (typeof body.ends_at === "string" && body.ends_at) {
    const value = new Date(body.ends_at);
    if (!Number.isNaN(value.getTime())) endsAt = value.toISOString();
  }
  const targetBody = body.targets && typeof body.targets === "object" ? body.targets as Record<string, unknown> : {};
  const mode = targetBody.mode === "all" || targetBody.mode === "levels" || targetBody.mode === "students" ? targetBody.mode : "students";
  const levels = Array.isArray(targetBody.levels) ? targetBody.levels.filter((item): item is string => typeof item === "string" && SPECIAL_LEVELS.has(item)) : [];
  const studentIds = Array.isArray(targetBody.studentIds) ? targetBody.studentIds.filter((item): item is string => typeof item === "string" && /^[0-9a-f-]{36}$/i.test(item)) : [];
  const allowedFormats = Array.isArray(body.allowed_formats)
    ? body.allowed_formats.filter((item): item is string => typeof item === "string" && SPECIAL_SUBMISSION_FORMATS.has(item))
    : ["pdf", "docx", "image"];
  const maxFileMb = Math.max(1, Math.min(20, Math.round(Number(body.max_file_mb) || 20)));

  if (!title || !level || !contentType) throw new Error("Informe título, nível e tipo de conteúdo.");
  if ((contentType === "external_link" || contentType === "mixed") && !externalUrl) throw new Error("Informe o link externo da atividade.");
  if (externalUrl) {
    try {
      const parsed = new URL(externalUrl);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error();
    } catch {
      throw new Error("Informe um link válido, começando com https://.");
    }
  }
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) throw new Error("A data final deve ser posterior à data inicial.");
  if (mode === "levels" && levels.length === 0) throw new Error("Selecione pelo menos um nível.");
  if (mode === "students" && studentIds.length === 0) throw new Error("Selecione pelo menos um aluno.");
  if (body.requires_submission === true && allowedFormats.length === 0) throw new Error("Selecione pelo menos um formato aceito para a entrega.");

  return {
    values: {
      title, description: description || null, level, instructions: instructions || null,
      content_type: contentType, external_url: externalUrl || null, starts_at: startsAt, ends_at: endsAt,
      requires_submission: body.requires_submission === true, allow_download: body.allow_download !== false,
      allowed_formats: allowedFormats, max_file_mb: maxFileMb, allow_replacement: body.allow_replacement !== false,
      updated_at: new Date().toISOString(),
    },
    targets: { mode, levels, studentIds },
  };
}

export async function replaceSpecialTargets(admin: Admin, activityId: string, targets: { mode: string; levels: string[]; studentIds: string[] }) {
  const { error: deleteError } = await admin.from("special_activity_targets").delete().eq("activity_id", activityId);
  if (deleteError) throw deleteError;
  const rows = targets.mode === "all"
    ? [{ activity_id: activityId, target_type: "all", target_value: "all" }]
    : targets.mode === "levels"
      ? targets.levels.map((level) => ({ activity_id: activityId, target_type: "level", target_value: level }))
      : targets.studentIds.map((studentId) => ({ activity_id: activityId, target_type: "student", target_value: studentId }));
  const { error } = await admin.from("special_activity_targets").insert(rows);
  if (error) throw error;
}

export async function resolveSpecialRecipients(admin: Admin, targets: { mode: string; levels: string[]; studentIds: string[] }) {
  const { data, error } = await admin.from("student_activity").select("user_id,level").eq("role", "student");
  if (error) throw error;
  const students = data ?? [];
  if (targets.mode === "all") return students.map((row) => row.user_id as string);
  if (targets.mode === "levels") {
    return students.filter((row) => {
      const normalized = typeof row.level === "string" ? row.level.match(/A1|A2|B1|B2|C1|C2/)?.[0] : undefined;
      return normalized ? targets.levels.includes(normalized) : false;
    }).map((row) => row.user_id as string);
  }
  const valid = new Set(students.map((row) => row.user_id as string));
  return targets.studentIds.filter((id) => valid.has(id));
}

export async function assignSpecialRecipients(admin: Admin, activityId: string, targets: { mode: string; levels: string[]; studentIds: string[] }) {
  const ids = await resolveSpecialRecipients(admin, targets);
  if (!ids.length) throw new Error("Nenhum aluno corresponde aos destinatários selecionados.");
  const { error } = await admin.from("special_activity_recipients").upsert(
    ids.map((studentId) => ({ activity_id: activityId, student_id: studentId })),
    { onConflict: "activity_id,student_id", ignoreDuplicates: true },
  );
  if (error) throw error;
  return ids.length;
}

export async function loadSpecialActivityCollections(admin: Admin) {
  const [activities, targets, assets, recipients, submissions, students] = await Promise.all([
    admin.from("special_activities").select("*").order("created_at", { ascending: false }),
    admin.from("special_activity_targets").select("activity_id,target_type,target_value"),
    admin.from("special_activity_assets").select("*").order("created_at", { ascending: true }),
    admin.from("special_activity_recipients").select("activity_id,student_id,assigned_at,viewed_at"),
    admin.from("special_activity_submissions").select("activity_id,id"),
    admin.from("student_activity").select("user_id,student_name,level").eq("role", "student").order("student_name"),
  ]);
  const firstError = [activities.error, targets.error, assets.error, recipients.error, submissions.error, students.error].find(Boolean);
  if (firstError) throw firstError;
  return {
    activities: (activities.data ?? []) as ActivityRow[], targets: (targets.data ?? []) as TargetRow[],
    assets: (assets.data ?? []) as AssetRow[], recipients: (recipients.data ?? []) as RecipientRow[],
    submissions: (submissions.data ?? []) as { activity_id: string; id: string }[], students: students.data ?? [],
  };
}

export function assembleSpecialActivities(collections: Awaited<ReturnType<typeof loadSpecialActivityCollections>>) {
  return collections.activities.map((activity) => {
    const recipientRows = collections.recipients.filter((row) => row.activity_id === activity.id);
    return {
      ...activity,
      effective_status: effectiveSpecialStatus(activity),
      targets: targetsFromRows(collections.targets.filter((row) => row.activity_id === activity.id)),
      assets: collections.assets.filter((row) => row.activity_id === activity.id),
      metrics: {
        recipients: recipientRows.length,
        viewed: recipientRows.filter((row) => row.viewed_at).length,
        submissions: collections.submissions.filter((row) => row.activity_id === activity.id).length,
      },
    };
  });
}

export async function signedSpecialAssets(admin: Admin, assets: AssetRow[]) {
  return Promise.all(assets.map(async (asset) => {
    const { data } = await admin.storage.from(SPECIAL_BUCKET).createSignedUrl(asset.storage_path, 3600, { download: false });
    return { ...asset, signed_url: data?.signedUrl ?? null };
  }));
}

export function safeSpecialFileName(name: string) {
  const ext = name.includes(".") ? `.${name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")}` : "";
  const base = name.replace(/\.[^.]+$/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "arquivo";
  return `${randomUUID()}-${base}${ext}`;
}
