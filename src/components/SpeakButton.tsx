"use client";

import { speak } from "@/lib/speech";

type Props = {
  text: string;
  label?: string;
  className?: string;
};

/** Botão que pronuncia um texto em inglês (text-to-speech do navegador). */
export function SpeakButton({ text, label = "Ouvir", className }: Props) {
  return (
    <button
      type="button"
      className={`speak-btn${className ? ` ${className}` : ""}`}
      onClick={() => speak(text)}
      aria-label={`Ouvir: ${text}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H2v6h4l5 4z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" />
      </svg>
      {label}
    </button>
  );
}
