"use client";

/**
 * Painel "Aulas para revisar" no design v2 (protótipo aprovado por Fabio em 17/11/2026).
 * Mesma fila da versão atual (decisões do banco + revisão atual do conteúdo), com:
 * "Próxima da fila", progresso do curso, abas, filtros e unidades recolhíveis.
 */
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import type { ReviewStatus } from "@/lib/lesson-review-types";
import styles from "./LessonQueueV2.module.css";

export type QueueRow = {
  id: string; unitNumber: number; unit: string; number: number;
  title: string; objective: string; status: ReviewStatus; note: string | null;
};
type Filter = "all" | ReviewStatus;

const LABEL: Record<ReviewStatus, string> = {
  pending: "Nunca revisada", outdated: "Revisar de novo", rejected: "Correção pedida", approved: "Aprovada",
};
const icon = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
);
const I = {
  arrow: icon(<path d="M5 12h14M13 6l6 6-6 6" />),
  chev: icon(<path d="m6 9 6 6 6-6" />),
  right: icon(<path d="m9 6 6 6-6 6" />),
  book: icon(<><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" /></>),
};

type Props = {
  tab: "pending" | "approved";
  rows: QueueRow[];
  legacy: { slug: string; title: string; level: string }[];
};

export function LessonQueueV2({ tab, rows, legacy }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const counts = useMemo(() => {
    const c: Record<ReviewStatus, number> = { pending: 0, outdated: 0, rejected: 0, approved: 0 };
    rows.forEach((row) => { c[row.status] += 1; });
    return c;
  }, [rows]);
  const waiting = counts.pending + counts.outdated + counts.rejected;
  const total = rows.length;

  // Próxima da fila: primeiro as de conteúdo alterado, depois as nunca revisadas, na ordem do curso.
  // As de correção pedida esperam a nova versão do conteúdo.
  const next = rows.find((row) => row.status === "outdated") ?? rows.find((row) => row.status === "pending") ?? null;

  const visible = rows.filter((row) => tab === "approved"
    ? row.status === "approved"
    : row.status !== "approved" && (filter === "all" || row.status === filter));
  const units = [...new Set(visible.map((row) => row.unitNumber))];
  const [manual, setManual] = useState<Record<number, boolean>>({});
  const defaultOpen = new Set(tab === "approved" ? units : units.slice(0, 2));
  if (next) defaultOpen.add(next.unitNumber);

  const filters: [Filter, string, number][] = [
    ["all", "Todas", waiting],
    ["outdated", "Revisar de novo", counts.outdated],
    ["rejected", "Correção pedida", counts.rejected],
    ["pending", "Nunca revisadas", counts.pending],
  ];

  return <div className={`view ${styles.queue}`}>
    <header className={styles.head}>
      <span className="eyebrow">Validação pedagógica · Curso A1 com avatares</span>
      <h1>{tab === "approved" ? "Aulas aprovadas" : "Aulas para revisar"}</h1>
      <p>{tab === "approved"
        ? "Aulas publicadas para os alunos. Para pedir uma correção, abra a aula e registre a nova decisão."
        : "Aprovar publica a aula para os alunos. Pedir correção mantém a aula fora do ar até a nova versão."}</p>
    </header>

    <section className={styles.summary}>
      {next
        ? <div className={styles.next}>
          <div>
            <span className={styles.eyebrowLight}>Próxima da fila</span>
            <h2>{next.title}</h2>
            <p>Unidade {next.unitNumber} · Aula {next.number} · {next.objective}</p>
            {next.status === "outdated" && <span className={styles.tag}>Conteúdo alterado depois da última decisão</span>}
          </div>
          <Link className={styles.btnLight} href={`/professor/aulas/${next.id}`} prefetch={false}>Revisar agora{I.arrow}</Link>
        </div>
        : <div className={styles.next}>
          <div>
            <span className={styles.eyebrowLight}>{counts.rejected ? "Aguardando correções" : "Fila vazia"}</span>
            <h2>{counts.rejected ? `${counts.rejected} ${counts.rejected === 1 ? "aula espera" : "aulas esperam"} a nova versão` : "Todas as aulas foram aprovadas"}</h2>
            <p>{counts.rejected ? "Quando o conteúdo corrigido chegar, a aula volta para esta fila." : "Você pode consultar as aulas publicadas em Aprovadas."}</p>
          </div>
        </div>}
      <div className={`card ${styles.progress}`}>
        <span className="eyebrow">Progresso do curso</span>
        <div className={styles.bigNum}>{counts.approved} <small>de {total} aprovadas</small></div>
        <div className={styles.bar}><i style={{ width: `${total ? (counts.approved / total) * 100 : 0}%` }} /></div>
        <ul className={styles.legend}>
          <li><i className={styles.dotOk} />{counts.approved} aprovadas</li>
          {counts.outdated > 0 && <li><i className={styles.dotWarn} />{counts.outdated} para revisar de novo</li>}
          {counts.rejected > 0 && <li><i className={styles.dotWarn} />{counts.rejected} com correção pedida</li>}
          <li><i className={styles.dotIdle} />{counts.pending} nunca revisadas</li>
        </ul>
      </div>
    </section>

    <div className={styles.toolbar}>
      <nav className={styles.tabs} aria-label="Situação das aulas">
        <Link href="/professor/aulas" prefetch={false} className={styles.tab} aria-current={tab === "pending" ? "page" : undefined}>Pendentes <span>{waiting}</span></Link>
        <Link href="/professor/aulas?status=aprovadas" prefetch={false} className={styles.tab} aria-current={tab === "approved" ? "page" : undefined}>Aprovadas <span>{counts.approved}</span></Link>
      </nav>
      {tab === "pending" && <div className={styles.filters} role="group" aria-label="Filtrar pendentes">
        {filters.filter(([key, , n]) => key === "all" || n > 0).map(([key, label, n]) =>
          <button key={key} type="button" className={styles.filter} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label} · {n}</button>)}
      </div>}
    </div>

    {units.length === 0
      ? <div className={`card ${styles.empty}`} role="status">{tab === "approved" ? "Nenhuma aula aprovada ainda." : "Nenhuma aula pendente neste filtro."}</div>
      : <div className={styles.units}>
        {units.map((unit) => {
          const unitRows = visible.filter((row) => row.unitNumber === unit);
          const all = rows.filter((row) => row.unitNumber === unit);
          const done = all.filter((row) => row.status === "approved").length;
          const open = manual[unit] ?? defaultOpen.has(unit);
          const id = `unidade-${unit}`;
          return <section key={unit} className={`card ${styles.unit}`}>
            <button type="button" className={styles.unitHead} aria-expanded={open} aria-controls={id} onClick={() => setManual((m) => ({ ...m, [unit]: !open }))}>
              <span className={styles.unitNum}>{unit}</span>
              <span className={styles.unitText}><b>{unitRows[0].unit}</b>
                <small>{unitRows.length} {tab === "approved" ? (unitRows.length === 1 ? "aprovada" : "aprovadas") : (unitRows.length === 1 ? "pendente" : "pendentes")} · {done} de {all.length} aprovadas</small></span>
              <span className={`${styles.chev}${open ? ` ${styles.chevOpen}` : ""}`}>{I.chev}</span>
            </button>
            <div id={id} className={styles.rows} hidden={!open}>
              {unitRows.map((row) => <Link key={row.id} href={`/professor/aulas/${row.id}`} prefetch={false} className={styles.row}>
                <span className={styles.no}>{String(row.number).padStart(2, "0")}</span>
                <span className={styles.rowText}><b>{row.title}</b>
                  <span className={styles.obj}>{row.status === "rejected" && row.note ? `Correção pedida: ${row.note}` : row.objective}</span></span>
                <span className={`${styles.pill} ${styles[row.status]}`}>{LABEL[row.status]}</span>
                <span className={styles.go}>{I.right}</span>
              </Link>)}
            </div>
          </section>;
        })}
      </div>}

    {legacy.length > 0 && <details className={styles.legacy}>
      <summary>{I.book}Lições antigas da plataforma, fora desta fila ({legacy.length})</summary>
      <div className={`card ${styles.legacyList}`}>
        {legacy.map((lesson) => <Link key={lesson.slug} href={`/professor/aulas/${lesson.slug}`} prefetch={false} className={styles.row}>
          <span className={styles.no}>{lesson.level}</span>
          <span className={styles.rowText}><b>{lesson.title}</b></span>
          <span />
          <span className={styles.go}>{I.right}</span>
        </Link>)}
      </div>
    </details>}
  </div>;
}
