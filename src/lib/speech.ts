// Sistema de falas usando a Web Speech API do navegador (grátis, sem contas).
// - Text-to-speech (o app pronuncia inglês)
// - Speech recognition (o aluno fala e o navegador transcreve)
// Reconhecimento funciona melhor no Chrome/Edge e exige HTTPS ou localhost.

/* eslint-disable @typescript-eslint/no-explicit-any */

export function isTTSSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (!isTTSSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => /en[-_]US/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null
  );
}

/** Pronuncia um texto em inglês. */
export function speak(text: string, opts?: { rate?: number }): void {
  if (!isTTSSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = pickEnglishVoice();
  if (voice) u.voice = voice;
  u.lang = "en-US";
  u.rate = opts?.rate ?? 0.95;
  synth.speak(u);
}

export function isSTTSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  );
}

export type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

/** Cria um reconhecedor de fala em inglês, ou null se o navegador não suporta. */
export function createRecognition(): SpeechRecognitionLike | null {
  if (!isSTTSupported()) return null;
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const rec: SpeechRecognitionLike = new SR();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false;
  return rec;
}

/** Traduz o código de erro do reconhecimento para uma mensagem amigável em PT. */
export function recognitionErrorMessage(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Permissão do microfone negada. Autorize o microfone no navegador e tente de novo.";
    case "no-speech":
      return "Não ouvi nada. Toque no microfone e fale a frase.";
    case "audio-capture":
      return "Não encontrei um microfone. Verifique se há um conectado.";
    case "network":
      return "Falha de rede no reconhecimento de fala. Tente novamente.";
    default:
      return "Não consegui reconhecer a fala. Tente novamente.";
  }
}
