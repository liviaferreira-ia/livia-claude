"use client";

import { useRouter } from "next/navigation";
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
  return (
    <button
      className="btn primary"
      onClick={() => {
        markSectionDone(slug, id);
        router.push(`/aluno/licao/${slug}`);
      }}
    >
      {label}
    </button>
  );
}
