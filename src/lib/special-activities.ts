"use client";

export type SpecialActivityEffectiveStatus = "draft" | "scheduled" | "available" | "ended" | "archived";
export type SpecialActivityContentType = "external_link" | "material" | "mixed" | "internal" | "ai_generated";

export type SpecialActivityAsset = {
  id: string;
  activity_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number;
  asset_kind: "material" | "cover";
  created_at: string;
  signed_url?: string | null;
};

export type SpecialActivityTargets = {
  mode: "all" | "levels" | "students";
  levels: string[];
  studentIds: string[];
};

export type SpecialActivity = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  instructions: string | null;
  content_type: SpecialActivityContentType;
  external_url: string | null;
  publication_status: "draft" | "published" | "archived";
  effective_status: SpecialActivityEffectiveStatus;
  starts_at: string | null;
  ends_at: string | null;
  requires_submission: boolean;
  allowed_formats: string[];
  max_file_mb: number;
  allow_replacement: boolean;
  allow_download: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  targets: SpecialActivityTargets;
  assets: SpecialActivityAsset[];
  metrics: { recipients: number; viewed: number; submissions: number };
  student_state?: {
    viewed_at: string | null;
    assigned_at: string;
    is_new: boolean;
    submission?: SpecialActivitySubmission | null;
  };
  recipient_states?: SpecialActivityRecipientState[];
};

export type SpecialActivitySubmissionVersion = {
  id: string;
  version_number: number;
  file_name: string;
  mime_type: string | null;
  file_size: number;
  created_at: string;
  signed_url?: string | null;
};

export type SpecialActivitySubmission = {
  id: string;
  status: "submitted" | "reviewing" | "reviewed";
  correction_status: "not_reviewed" | "reviewing" | "reviewed";
  feedback: string | null;
  submitted_at: string;
  versions: SpecialActivitySubmissionVersion[];
};

export type SpecialActivityRecipientState = {
  student_id: string;
  student_name: string | null;
  level: string | null;
  assigned_at: string;
  viewed_at: string | null;
  submission: SpecialActivitySubmission | null;
};

export type SpecialActivityStudent = {
  user_id: string;
  student_name: string | null;
  level: string | null;
};

export type SpecialActivityInput = {
  title: string;
  description: string;
  level: string;
  instructions: string;
  content_type: SpecialActivityContentType;
  external_url: string;
  starts_at: string;
  ends_at: string;
  requires_submission: boolean;
  allowed_formats: string[];
  max_file_mb: number;
  allow_replacement: boolean;
  allow_download: boolean;
  targets: SpecialActivityTargets;
};

async function json<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Não foi possível concluir a operação.");
  return body as T;
}

export async function listSpecialActivities(): Promise<{ activities: SpecialActivity[]; students: SpecialActivityStudent[] }> {
  return json(await fetch("/api/professor/atividades-especiais", { cache: "no-store" }));
}

export async function getSpecialActivity(id: string): Promise<{ activity: SpecialActivity; students: SpecialActivityStudent[] }> {
  return json(await fetch(`/api/professor/atividades-especiais/${encodeURIComponent(id)}`, { cache: "no-store" }));
}

export async function createSpecialActivity(values: SpecialActivityInput): Promise<{ id: string }> {
  return json(await fetch("/api/professor/atividades-especiais", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
  }));
}

export async function updateSpecialActivity(id: string, values: SpecialActivityInput): Promise<void> {
  await json(await fetch(`/api/professor/atividades-especiais/${encodeURIComponent(id)}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", ...values }),
  }));
}

export async function specialActivityAction(id: string, action: "publish" | "archive" | "restore" | "duplicate"): Promise<{ id?: string }> {
  return json(await fetch(`/api/professor/atividades-especiais/${encodeURIComponent(id)}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
  }));
}

export async function uploadSpecialActivityAsset(id: string, file: File): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  await json(await fetch(`/api/professor/atividades-especiais/${encodeURIComponent(id)}/arquivos`, { method: "POST", body: form }));
}

export async function deleteSpecialActivityAsset(id: string, assetId: string): Promise<void> {
  await json(await fetch(`/api/professor/atividades-especiais/${encodeURIComponent(id)}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete_asset", asset_id: assetId }),
  }));
}

export async function deleteSpecialActivity(id: string): Promise<void> {
  await json(await fetch(`/api/professor/atividades-especiais/${encodeURIComponent(id)}`, { method: "DELETE" }));
}

export async function listMySpecialActivities(): Promise<{ current: SpecialActivity[]; history: SpecialActivity[]; unseenCount: number }> {
  return json(await fetch("/api/aluno/especiais", { cache: "no-store" }));
}

export async function getMySpecialActivity(id: string): Promise<{ activity: SpecialActivity }> {
  return json(await fetch(`/api/aluno/especiais/${encodeURIComponent(id)}`, { cache: "no-store" }));
}

export async function submitSpecialActivity(id: string, file: File): Promise<{ submission: SpecialActivitySubmission }> {
  const form = new FormData();
  form.append("file", file);
  return json(await fetch(`/api/aluno/especiais/${encodeURIComponent(id)}/entrega`, { method: "POST", body: form }));
}
