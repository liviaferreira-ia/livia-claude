"use client";

import { useRef, useState } from "react";
import { normalize } from "@/data/exercises";
import { createRecognition, isSTTSupported, recognitionErrorMessage, type SpeechRecognitionLike } from "@/lib/speech";

function scorePhrase(target: string, heard: string) {
  const expected = normalize(target).split(" ").filter(Boolean);
  const actual = normalize(heard).split(" ").filter(Boolean);
  if (!expected.length) return 0;
  let cursor = 0;
  let matches = 0;
  for (const word of actual) {
    const found = expected.indexOf(word, cursor);
    if (found >= 0) { matches += 1; cursor = found + 1; }
  }
  return Math.round((matches / expected.length) * 100);
}

export function PhrasePracticeButton({ text }: { text: string }) {
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<{ transcript: string; score: number } | null>(null);
  const [error, setError] = useState("");
  const recognition = useRef<SpeechRecognitionLike | null>(null);

  function listen() {
    setError(""); setResult(null);
    if (!isSTTSupported()) { setError("Use Chrome ou Edge para praticar com o microfone."); return; }
    const instance = createRecognition();
    if (!instance) { setError("Microfone não disponível neste navegador."); return; }
    recognition.current = instance;
    instance.onresult = (event) => {
      const transcript = String(event.results[0][0].transcript ?? "");
      setResult({ transcript, score: scorePhrase(text, transcript) });
      setListening(false);
    };
    instance.onerror = (event) => { setError(recognitionErrorMessage(event?.error ?? "")); setListening(false); };
    instance.onend = () => setListening(false);
    setListening(true);
    try { instance.start(); } catch { setListening(false); }
  }

  return <div className="phrase-practice">
    <button type="button" className={`speak-btn${listening ? " listening" : ""}`} disabled={listening} onClick={listen}>🎙 {listening ? "Ouvindo…" : "Repetir"}</button>
    {result && <span className={result.score >= 70 ? "phrase-result ok" : "phrase-result att"}>{result.score >= 85 ? "Muito bem!" : result.score >= 70 ? "Boa pronúncia!" : "Tente novamente"} · {result.score}%<small>Ouvi: “{result.transcript}”</small></span>}
    {error && <span className="phrase-result att">{error}</span>}
  </div>;
}

