"use client";

/**
 * Conclusão da aula em vídeo (design v2, pedido do Fabio em 17/11/2026): a aula conclui quando o
 * aluno assistiu pelo menos 80% dos dois vídeos (conversa e "Sua vez") e chegou à revisão.
 * Grava pela função mark_video_lesson (supabase-setup-25). Concluir destrava a próxima aula.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./LessonComplete.module.css";

export const WATCH_GOAL = 0.8;

type Props = {
  lessonId: string;
  watched: { conversa: number; pratica: number };
  done: boolean;
  onDone: () => void;
  nextHref: string | null;
};

export function LessonComplete({ lessonId, watched, done, onDone, nextHref }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const ready = watched.conversa >= WATCH_GOAL && watched.pratica >= WATCH_GOAL;
  const pct = (n: number) => `${Math.min(100, Math.round(n * 100))}%`;

  async function complete() {
    setSaving(true); setError("");
    const { error: rpcError } = await createClient().rpc("mark_video_lesson", { p_lesson_id: lessonId });
    setSaving(false);
    if (rpcError) { setError("Não consegui registrar a conclusão agora. Confira a conexão e tente de novo."); return; }
    onDone();
    router.refresh();
  }

  if (done) {
    return <div className={`card ${styles.box} ${styles.done}`} role="status">
      <span className={styles.big} aria-hidden>✓</span>
      <div><b>Aula concluída</b><p>{nextHref ? "A próxima aula já está aberta para você." : "Você concluiu a última aula publicada até agora."}</p></div>
      {nextHref ? <Link href={nextHref} className="btn primary">Próxima aula →</Link> : <Link href="/aluno/aulas" className="btn ghost">Ver todas as aulas</Link>}
    </div>;
  }

  return <div className={`card ${styles.box}`}>
    <div className={styles.text}>
      <b>Concluir esta aula</b>
      <p>Para concluir, assista pelo menos 80% de cada vídeo. A próxima aula abre em seguida.</p>
      <ul className={styles.checks}>
        <li className={watched.conversa >= WATCH_GOAL ? styles.ok : undefined}><span aria-hidden>{watched.conversa >= WATCH_GOAL ? "✓" : "○"}</span>Vídeo da conversa · assistido {pct(watched.conversa)}</li>
        <li className={watched.pratica >= WATCH_GOAL ? styles.ok : undefined}><span aria-hidden>{watched.pratica >= WATCH_GOAL ? "✓" : "○"}</span>Vídeo &quot;Sua vez&quot; · assistido {pct(watched.pratica)}</li>
      </ul>
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </div>
    <button type="button" className="btn primary" disabled={!ready || saving} onClick={() => void complete()}>{saving ? "Salvando…" : "Concluir aula"}</button>
  </div>;
}
