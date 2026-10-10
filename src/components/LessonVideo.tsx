"use client";

import { useEffect, useRef, useState } from "react";
import { FIRST_LESSON_MEDIA } from "@/data/lessonMedia";
import styles from "./LessonVideo.module.css";

export function LessonVideo({ mode }: { mode: "dialogue" | "practice" }) {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const practice = mode === "practice";
  const media = FIRST_LESSON_MEDIA;
  const src = `${media.base}/${practice ? "sua-vez" : "conversa"}.mp4`;
  const chapters = practice ? media.practiceChapters : media.dialogueChapters;

  // Reload after hydration so media failures also reach the React handlers.
  useEffect(() => { video.current?.load(); }, [src]);

  function seek(start: number) {
    const player = video.current;
    if (!player) return;
    player.currentTime = start;
    void player.play().catch(() => { /* Native controls remain available. */ });
  }

  return (
    <section className={`card ${styles.lesson}`} aria-label={practice ? "Sua vez de falar" : "Conversa com Livia e Fabio"}>
      <h3>{practice ? "Sua vez de falar" : "Primeiro encontro: Livia e Fabio"}</h3>
      <p>{practice
        ? "Responda em inglês durante cada pausa de 7 segundos. Você pode pausar e tentar novamente."
        : "Assista à conversa em inglês com legendas em português. Depois, repita as falas que quiser."}</p>
      <video ref={video} key={src} controls playsInline preload="metadata"
        poster={`${media.base}/poster.png`} className={styles.video}
        onError={() => setFailed(true)}>
        <source src={src} type="video/mp4" onError={() => setFailed(true)} />
        <track kind="subtitles" src={`${media.base}/${practice ? "practice" : "dialogue"}.vtt`} srcLang="pt-BR" label="Português" />
        Seu navegador não conseguiu reproduzir o vídeo.
      </video>
      {failed && <p role="alert">Não foi possível carregar o vídeo. <a href={src}>Abrir o vídeo diretamente</a> ou recarregue a página.</p>}
      <details className={styles.chapters}>
        <summary>{practice ? "Repetir uma pergunta" : "Ler e repetir a conversa"}</summary>
        {chapters.map((chapter, index) => (
          <div className={styles.line} key={chapter.start}>
            <button type="button" className="btn ghost" onClick={() => seek(chapter.start)}
              aria-label={`Repetir: ${chapter.title}`}>{chapter.title}</button>
            {!practice && <p lang="pt-BR">{media.lines[index].pt}</p>}
          </div>
        ))}
      </details>
      <p className={`muted ${styles.note}`}>Áudio em inglês com vozes sintéticas. As legendas em português já aparecem no vídeo.</p>
      {practice && <p className={`muted ${styles.note}`}>Este vídeo é um treino de fala. Ele não grava nem avalia sua resposta.</p>}
    </section>
  );
}
