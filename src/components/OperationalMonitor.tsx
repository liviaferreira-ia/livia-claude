"use client";

import { useEffect } from "react";

const recent = new Map<string, { at: number; result: Promise<string | null> }>();

export async function reportClientError(message: string, details?: string, digest?: string) {
  const key = `${message}|${window.location.pathname}`;
  const now = Date.now();
  const previous = recent.get(key);
  if (previous && now - previous.at < 30_000) return previous.result;
  const result = (async () => { try {
    const response = await fetch("/api/logs/client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ area: "interface", action: "runtime", message, details, digest, path: window.location.pathname }),
      keepalive: true,
    });
    const body = await response.json().catch(() => ({}));
    return typeof body.traceCode === "string" ? body.traceCode : null;
  } catch {
    return null;
  } })();
  recent.set(key, { at: now, result });
  return result;
}

export function OperationalMonitor() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => { void reportClientError(event.message || "Erro inesperado no navegador", event.error?.stack); };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      void reportClientError(reason instanceof Error ? reason.message : "Falha inesperada em uma operação", reason instanceof Error ? reason.stack : String(reason));
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => { window.removeEventListener("error", onError); window.removeEventListener("unhandledrejection", onRejection); };
  }, []);
  return null;
}
