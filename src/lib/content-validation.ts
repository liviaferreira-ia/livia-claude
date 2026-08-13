"use client";

import type { CefrLevel } from "@/data/placement";

export type ContentValidation = {
  level: CefrLevel;
  validated: boolean;
  validated_by: string | null;
  validated_at: string | null;
  note: string | null;
  updated_at: string;
  validator_name?: string | null;
};

export async function loadContentValidations(): Promise<{ validations: ContentValidation[]; error: string | null }> {
  const response = await fetch("/api/professor/validacao-conteudo", { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  return response.ok ? { validations: body.validations ?? [], error: null } : { validations: [], error: body.error || "Não consegui carregar as validações." };
}

export async function updateContentValidation(level: CefrLevel, validated: boolean, note: string) {
  const response = await fetch("/api/professor/validacao-conteudo", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ level, validated, note }) });
  const body = await response.json().catch(() => ({}));
  return response.ok ? null : body.error || "Não consegui salvar a validação.";
}
