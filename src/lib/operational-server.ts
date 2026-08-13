import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

type IncidentInput = {
  userId?: string | null;
  severity?: "info" | "warning" | "error" | "critical";
  source: "client" | "server" | "webhook" | "cron";
  area: string;
  action?: string | null;
  message: string;
  metadata?: Record<string, unknown>;
};

const SECRET_KEY = /pass(word)?|senha|token|secret|authorization|cookie|api[-_]?key|service[-_]?role|card|cartao/i;

function safeText(value: unknown, max = 1000) {
  return String(value ?? "Erro sem mensagem")
    .replace(/Bearer\s+[\w.-]+/gi, "Bearer [REMOVIDO]")
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[EMAIL REMOVIDO]")
    .slice(0, max);
}

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 3) return "[LIMITE]";
  if (value === null || typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") return safeText(value, 2000);
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitize(item, depth + 1));
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).slice(0, 30).map(([key, item]) => [key, SECRET_KEY.test(key) ? "[REMOVIDO]" : sanitize(item, depth + 1)]));
  }
  return safeText(value, 200);
}

function fingerprint(input: IncidentInput) {
  const normalized = safeText(input.message, 500).replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, "{id}").replace(/\d+/g, "#");
  return createHash("sha256").update(`${input.source}|${input.area}|${input.action ?? ""}|${normalized}`).digest("hex");
}

function traceCode() {
  return `CS-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function recordIncident(input: IncidentInput): Promise<string> {
  const trace = traceCode();
  const cleanMessage = safeText(input.message);
  const key = fingerprint({ ...input, message: cleanMessage });
  try {
    const admin = createAdminClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    let query = admin.from("app_incidents").select("id,trace_code,occurrences").eq("fingerprint", key).neq("status", "resolved").gte("last_seen_at", since);
    query = input.userId ? query.eq("user_id", input.userId) : query.is("user_id", null);
    const { data: existing } = await query.order("last_seen_at", { ascending: false }).limit(1).maybeSingle();
    if (existing) {
      await admin.from("app_incidents").update({ occurrences: existing.occurrences + 1, last_seen_at: new Date().toISOString(), metadata: sanitize(input.metadata ?? {}) }).eq("id", existing.id);
      return existing.trace_code;
    }
    const { error } = await admin.from("app_incidents").insert({
      trace_code: trace,
      user_id: input.userId ?? null,
      severity: input.severity ?? "error",
      source: input.source,
      area: safeText(input.area, 100),
      action: input.action ? safeText(input.action, 100) : null,
      fingerprint: key,
      message: cleanMessage,
      metadata: sanitize(input.metadata ?? {}),
    });
    if (error) throw error;
  } catch (error) {
    console.error(JSON.stringify({ event: "incident_fallback", trace, area: input.area, message: cleanMessage, storage_error: error instanceof Error ? error.message : String(error) }));
  }
  return trace;
}

export async function recordAudit(actorId: string, studentId: string | null, action: string, metadata: Record<string, unknown> = {}) {
  try {
    const admin = createAdminClient();
    await admin.from("admin_audit_logs").insert({ actor_id: actorId, student_id: studentId, action: safeText(action, 100), metadata: sanitize(metadata) });
  } catch (error) {
    console.error(JSON.stringify({ event: "audit_fallback", action, error: error instanceof Error ? error.message : String(error) }));
  }
}
