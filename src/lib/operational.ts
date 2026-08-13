"use client";

export type Incident = {
  id: string;
  trace_code: string;
  user_id: string | null;
  severity: "info" | "warning" | "error" | "critical";
  source: "client" | "server" | "webhook" | "cron";
  area: string;
  action: string | null;
  message: string;
  metadata: Record<string, unknown>;
  occurrences: number;
  first_seen_at: string;
  last_seen_at: string;
  status: "new" | "investigating" | "resolved";
  resolution_note: string | null;
  student_name?: string | null;
};

export type AuditLog = {
  id: number;
  actor_id: string | null;
  student_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
  student_name?: string | null;
};

export async function loadOperational(): Promise<{ incidents: Incident[]; audits: AuditLog[]; error: string | null }> {
  const response = await fetch("/api/professor/operacional", { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  return response.ok ? { incidents: body.incidents ?? [], audits: body.audits ?? [], error: null } : { incidents: [], audits: [], error: body.error || "Não consegui carregar os logs." };
}

export async function updateIncident(id: string, status: Incident["status"], resolutionNote: string) {
  const response = await fetch("/api/professor/operacional", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status, resolutionNote }) });
  const body = await response.json().catch(() => ({}));
  return response.ok ? null : body.error || "Não consegui atualizar o incidente.";
}
