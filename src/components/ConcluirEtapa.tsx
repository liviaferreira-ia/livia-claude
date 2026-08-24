"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { markSectionDone } from "@/lib/lessonProgress";

/** Marca a etapa como concluída e volta para a visão geral da lição. */
export function ConcluirEtapa({
  slug,
  id,
  label = "Concluir etapa →",
}: {
  slug: string;
  id: string;
  label?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      {error && <p className="auth-msg err" role="alert">{error}</p>}
      <button
        className="btn primary"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          setError("");
          try {
            await markSectionDone(slug, id);
            router.push(`/aluno/licao/${slug}`);
          } catch {
            setError("Não foi possível salvar esta etapa. Confira sua conexão e tente novamente.");
            setSaving(false);
          }
        }}
      >
        {saving ? "Salvando…" : label}
      </button>
    </div>
  );
}
