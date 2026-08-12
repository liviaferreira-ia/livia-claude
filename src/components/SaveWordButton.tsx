"use client";

import { useState } from "react";
import { saveWord } from "@/lib/vocab";

/**
 * Salva uma palavra/expressão em "Minhas palavras".
 * Não lê o estado inicial do storage de propósito: isso exigiria ler durante a
 * renderização (quebra a hidratação) — salvar de novo é inofensivo, já que
 * `saveWord` não duplica.
 */
export function SaveWordButton({
  en,
  pt,
  example,
  source,
}: {
  en: string;
  pt: string;
  example?: string;
  source?: string;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      className="pill-btn"
      title="Salvar em Minhas palavras"
      style={saved ? { borderColor: "var(--good)", color: "var(--good)" } : undefined}
      onClick={() => {
        saveWord({ en, pt, example, source });
        setSaved(true);
      }}
    >
      {saved ? "★ Salva" : "☆ Salvar"}
    </button>
  );
}
