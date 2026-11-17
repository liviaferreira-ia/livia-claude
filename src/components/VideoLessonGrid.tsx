/**
 * "Aulas em vídeo" no design v2: grade com capas, tipo YouTube (pedido do Fabio em 17/11/2026),
 * agrupada por unidade. Mostra só as aulas já publicadas (mesma regra da versão atual).
 */
import Image from "next/image";
import Link from "next/link";
import styles from "./VideoLessonGrid.module.css";

export type VideoLessonCard = {
  id: string; unitNumber: number; unit: string; number: number;
  title: string; objective: string; minutes: string; href: string; poster: string;
};

export function VideoLessonGrid({ lessons }: { lessons: VideoLessonCard[] }) {
  const units = [...new Set(lessons.map((lesson) => lesson.unitNumber))];
  return <div className={`view ${styles.page}`}>
    <header className={styles.head}>
      <div className="eyebrow">Inglês A1 com Livia e Fabio</div>
      <h1>Aulas em vídeo</h1>
      <p className="muted">Conversas em inglês com legendas em português, explicação e prática guiada. Uma aula por vez, no seu ritmo.</p>
    </header>
    {units.map((unit) => {
      const items = lessons.filter((lesson) => lesson.unitNumber === unit);
      return <section key={unit} className={styles.unit} aria-label={`Unidade ${unit}`}>
        <h2 className={styles.unitTitle}><span>Unidade {unit}</span>{items[0].unit}</h2>
        <div className={styles.grid}>
          {items.map((lesson) => <Link key={lesson.id} href={lesson.href} className={styles.card}>
            <span className={styles.thumb}>
              <Image src={lesson.poster} alt="" width={640} height={360} unoptimized />
              <span className={styles.play} aria-hidden>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.4-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" /></svg>
              </span>
              {lesson.minutes && <span className={styles.duration}>{lesson.minutes.replace("–", "-")} min</span>}
            </span>
            <span className={styles.body}>
              <small>Aula {lesson.number}</small>
              <b>{lesson.title}</b>
              <span>{lesson.objective}</span>
            </span>
          </Link>)}
        </div>
      </section>;
    })}
  </div>;
}
