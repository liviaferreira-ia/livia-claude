/**
 * "Aulas em vídeo" no design v2: grade com capas, tipo YouTube (pedido do Fabio em 17/11/2026),
 * por unidade, com progresso do curso e desbloqueio em sequência (só avança depois de concluir
 * a anterior). A equipe vê tudo aberto, com o aviso de qual aula está trancada para os alunos.
 */
import Image from "next/image";
import Link from "next/link";
import { durationRange, type CourseItem } from "@/lib/video-course-types";
import styles from "./VideoLessonGrid.module.css";

const lockIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
const checkIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5 10 17l9-10" /></svg>;
const playIcon = <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.4-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" /></svg>;

export function VideoLessonGrid({ items, isStaff }: { items: CourseItem[]; isStaff: boolean }) {
  const units = [...new Set(items.map((item) => item.unitNumber))];
  const done = items.filter((item) => item.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  return <div className={`view ${styles.page}`}>
    <header className={styles.head}>
      <div>
        <div className="eyebrow">Inglês A1 com Livia e Fabio</div>
        <h1>Aulas em vídeo</h1>
        <p className="muted">Conversas em inglês com legendas em português, explicação e prática guiada. Conclua uma aula para abrir a próxima.</p>
      </div>
      <div className={`card ${styles.progress}`} aria-label="Progresso do curso">
        <div className={styles.progressTop}><b>Meu progresso</b><span>{done} de {items.length} aulas</span></div>
        <div className={styles.bar}><i style={{ width: `${pct}%` }} /></div>
        <small>{pct}% concluído</small>
      </div>
    </header>
    {isStaff && <p className={styles.staffNote}>Você é da equipe: todas as aulas ficam abertas para você revisar. O cadeado mostra o que os alunos ainda não conseguem abrir.</p>}
    {units.map((unit) => {
      const unitItems = items.filter((item) => item.unitNumber === unit);
      const duration = durationRange(unitItems);
      return <section key={unit} className={styles.unit} aria-label={`Unidade ${unit}`}>
        <h2 className={styles.unitTitle}><span>Unidade {unit}</span>{unitItems[0].unit}
          <small>{unitItems.length} {unitItems.length === 1 ? "aula" : "aulas"}{duration ? ` · ${duration}` : ""}</small></h2>
        <div className={styles.grid}>
          {unitItems.map((item) => {
            const card = <>
              <span className={`${styles.thumb}${item.lockedForStudents && !isStaff ? ` ${styles.locked}` : ""}`}>
                <Image src={item.poster} alt="" width={640} height={360} unoptimized />
                {item.open && <span className={styles.play}>{playIcon}</span>}
                {item.done && <span className={styles.doneTag}>{checkIcon}Concluída</span>}
                {item.lockedForStudents && <span className={styles.lockTag}>{lockIcon}{isStaff ? "Trancada para alunos" : "Trancada"}</span>}
                {item.minutes && <span className={styles.duration}>{item.minutes.replace("–", "-")} min</span>}
              </span>
              <span className={styles.body}>
                <small>Aula {item.number}</small>
                <b>{item.title}</b>
                <span>{item.lockedForStudents && !isStaff ? "Conclua a aula anterior para abrir esta." : item.objective}</span>
              </span>
            </>;
            return item.open
              ? <Link key={item.id} href={item.href} className={styles.card}>{card}</Link>
              : <div key={item.id} className={`${styles.card} ${styles.cardLocked}`} aria-disabled="true">{card}</div>;
          })}
        </div>
      </section>;
    })}
  </div>;
}
