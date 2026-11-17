"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Gravação curta de uma resposta falada (Converse com a Livia e Pronúncia, design v2 — 17/11/2026).
 * Substitui o reconhecimento de voz do navegador, que falhou no teste do Fabio: grava com o MediaRecorder,
 * para sozinho depois de ~1,6 s de silêncio que segue a fala (máximo 12 s; 7 s se não ouvir nada)
 * e entrega o áudio para ser transcrito no servidor. O elemento ligado a `levelRef` recebe a variável
 * CSS `--lvl` (0 a 1) com o volume da voz, para animar o botão.
 */

const SPEECH_LEVEL = 0.035;
const SILENCE_MS = 1600;
const MAX_MS = 12_000;
const NO_SPEECH_MS = 7_000;

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/ogg"].find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function extensionFor(type: string): string {
  const base = type.split(";")[0];
  return base === "audio/mp4" ? "mp4" : base === "audio/ogg" ? "ogg" : "webm";
}

export function useAnswerRecorder(onRecorded: (audio: File) => void) {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);
  const levelRef = useRef<HTMLButtonElement | null>(null);
  const onRecordedRef = useRef(onRecorded);

  useEffect(() => { onRecordedRef.current = onRecorded; });

  useEffect(() => {
    cancelledRef.current = false;
    const timer = window.setTimeout(() => setSupported(Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined"), 0);
    return () => {
      window.clearTimeout(timer);
      cancelledRef.current = true;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      release();
    };
  }, []);

  function release() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }

  function stop() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }

  async function start() {
    setError("");
    if (recorderRef.current && recorderRef.current.state !== "inactive") return;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setError(name === "NotAllowedError"
        ? "O microfone está bloqueado. Clique no cadeado ao lado do endereço do site, permita o microfone e tente de novo."
        : "Não encontrei um microfone. Verifique se há um conectado.");
      return;
    }
    streamRef.current = stream;
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = () => {
      release();
      setRecording(false);
      if (cancelledRef.current) return;
      const type = recorder.mimeType || mimeType || "audio/webm";
      const blob = new Blob(chunks, { type });
      if (blob.size < 1200) {
        setError("Não ouvi nada. Toque no microfone e fale em inglês.");
        return;
      }
      onRecordedRef.current(new File([blob], `resposta.${extensionFor(type)}`, { type }));
    };

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      const startedAt = performance.now();
      let spoke = false;
      let lastLoud = startedAt;
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) { const x = (data[i] - 128) / 128; sum += x * x; }
        const level = Math.sqrt(sum / data.length);
        const now = performance.now();
        if (level > SPEECH_LEVEL) { spoke = true; lastLoud = now; }
        levelRef.current?.style.setProperty("--lvl", String(Math.min(1, level * 9)));
        if ((spoke && now - lastLoud > SILENCE_MS) || now - startedAt > MAX_MS || (!spoke && now - startedAt > NO_SPEECH_MS)) {
          stop();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // Sem medidor de volume: o aluno para pelo botão (o limite de 12 s continua valendo).
      window.setTimeout(stop, MAX_MS);
    }

    recorder.start();
    setRecording(true);
  }

  return { supported, recording, error, setError, start, stop, levelRef };
}
