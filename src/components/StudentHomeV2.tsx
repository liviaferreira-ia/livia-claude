"use client";

/**
 * Tela inicial do aluno no design v2 (protótipo aprovado por Fabio em 16/11/2026).
 * No máximo 6 blocos: próximo passo, meta de hoje, meta da semana, "Para fazer",
 * atalhos de prática e último recado da professora. Os dados vêm da página
 * /aluno, a mesma lógica do visual atual (missão, metas, atividades e recados).
 */
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./StudentHomeV2.module.css";

const icon = (children: ReactNode, fill = false) => (
  <svg viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
);
const I = {
  play: icon(<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.4-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />, true),
  arrow: icon(<path d="M5 12h14M13 6l6 6-6 6" />),
  star: icon(<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />),
  task: icon(<><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>),
  film: icon(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3z" /></>),
  target: icon(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>),
  chat: icon(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />),
  game: icon(<><rect x="2" y="7" width="20" height="10" rx="5" /><path d="M7 12h4M9 10v4" /><circle cx="15.5" cy="11" r=".6" /><circle cx="17.5" cy="13" r=".6" /></>),
  check: icon(<path d="M5 12.5 10 17l9-10" />),
};

const TILES = [
  { href: "/aluno/aulas", label: "Aulas em vídeo", hint: "Livia e Fabio", icon: I.film, accent: false },
  { href: "/aluno/praticar", label: "Exercícios", hint: "Alguns minutos", icon: I.target, accent: false },
  { href: "/aluno/tutor", label: "Conversa com IA", hint: "Escreva em inglês", icon: I.chat, accent: false },
  { href: "/aluno/jogos", label: "Central Games", hint: "Jogos rápidos", icon: I.game, accent: true },
];

export type HomeMission = { eyebrow: string; title: string; text: string; href: string; action: string };

type Props = {
  firstName: string;
  levelLabel: string | null;
  streak: number;
  mission: HomeMission;
  poster: string;
  dailyDone: number;
  dailyGoal: number;
  weekly: { goal: number; activeDays: number; focus: string | null } | null;
  specials: { id: string; title: string; description: string | null }[];
  assignments: { id: string; title: string; details: string | null; due_date: string | null }[];
  onFinishAssignment: (id: string) => void;
  lastTeacherMessage: { body: string; created_at: string } | null;
  error: string;
};

const R = 26;
const C = 2 * Math.PI * R;
const dateTime = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function StudentHomeV2(p: Props) {
  const done = Math.min(p.dailyDone, p.dailyGoal);
  const left = p.dailyGoal - done;
  const todo = p.specials.length + p.assignments.length;
  const weekGoal = p.weekly ? Math.max(1, Math.min(7, p.weekly.goal)) : 0;
  const weekDone = p.weekly ? Math.min(p.weekly.activeDays, weekGoal) : 0;

  return <div className={`view ${styles.home}`}>
    <header className={styles.head}>
      <h1>Olá, {p.firstName}</h1>
      <div className={styles.chips}>
        {p.levelLabel && <span className={`${styles.chip} ${styles.level}`}>{p.levelLabel}</span>}
        {p.streak > 0 && <span className={styles.chip}>🔥 {p.streak} {p.streak === 1 ? "dia seguido" : "dias seguidos"}</span>}
      </div>
    </header>

    <div className={styles.grid}>
      <div className={styles.main}>
        <section className={styles.next} aria-label="Próximo passo">
          <Link href={p.mission.href} className={styles.media} tabIndex={-1} aria-hidden>
            <Image src={p.poster} alt="" width={640} height={360} unoptimized />
            <span className={styles.play}>{I.play}</span>
          </Link>
          <div className={styles.nextBody}>
            <p className={styles.eyebrowLight}>{p.mission.eyebrow}</p>
            <h2>{p.mission.title}</h2>
            <p className={styles.nextText}>{p.mission.text}</p>
            <Link href={p.mission.href} className={styles.btnLight}>{p.mission.action}{I.arrow}</Link>
          </div>
        </section>

        {todo > 0 && <section id="atividades" className={styles.todoSec}>
          <div className={styles.secHead}><h3>Para fazer</h3><span>{todo}</span></div>
          <ul className={`card ${styles.todo}`}>
            {p.specials.map((s) => <li key={s.id}>
              <span className={`${styles.ic} ${styles.icAccent}`}>{I.star}</span>
              <div className={styles.txt}><b>{s.title}</b><small>Especial para você{s.description ? ` · ${s.description}` : ""}</small></div>
              <Link className={styles.btnSm} href={`/aluno/especial/${s.id}`}>Abrir</Link>
            </li>)}
            {p.assignments.map((a) => <li key={a.id}>
              <span className={styles.ic}>{I.task}</span>
              <div className={styles.txt}><b>{a.title}</b>
                <small>Atividade da professora · {a.due_date ? `prazo ${new Date(`${a.due_date}T12:00:00`).toLocaleDateString("pt-BR")}` : "sem prazo"}{a.details ? ` · ${a.details}` : ""}</small></div>
              <button type="button" className={styles.btnSm} onClick={() => p.onFinishAssignment(a.id)}>Concluir</button>
            </li>)}
          </ul>
          {p.error && <p role="alert" className={styles.err}>{p.error}</p>}
        </section>}


      </div>

      <aside className={styles.side}>
        <div className={`${styles.stats}${p.weekly ? "" : ` ${styles.single}`}`}>
          <section className={`card ${styles.today}`} aria-label="Meta de hoje">
            <div className={styles.ring}>
              <svg viewBox="0 0 64 64" aria-hidden><circle className={styles.track} cx="32" cy="32" r={R} fill="none" strokeWidth="6" />
                <circle className={styles.fill} cx="32" cy="32" r={R} fill="none" strokeWidth="6" strokeDasharray={`${(done / p.dailyGoal) * C} ${C}`} /></svg>
              <span>{done}/{p.dailyGoal}</span>
            </div>
            <div>
              <p className="eyebrow">Meta de hoje</p>
              <b>{done} de {p.dailyGoal} exercícios</b>
              <small>{left > 0 ? `Faltam ${left} para fechar o dia.` : "Meta batida! 🎉"}</small>
            </div>
          </section>
          {p.weekly && <section className={`card ${styles.week}`} aria-label="Meta da semana">
            <div className={styles.row}><p className="eyebrow">Esta semana</p><span>{weekDone} de {weekGoal} dias</span></div>
            <div className={styles.dots} aria-hidden>
              {Array.from({ length: weekGoal }, (_, i) => <i key={i} className={i < weekDone ? styles.on : undefined}>{i < weekDone && I.check}</i>)}
            </div>
            {p.weekly.focus && <p className={styles.focus}><b>Foco combinado:</b> {p.weekly.focus}</p>}
          </section>}
        </div>

        <section className={`card ${styles.teacher}`} aria-label="Recados da professora">
          <div className={styles.who}><span className={styles.whoIc}>{I.chat}</span><div><b>Sua professora</b>
            <small>{p.lastTeacherMessage ? dateTime(p.lastTeacherMessage.created_at) : "Recados"}</small></div></div>
          {p.lastTeacherMessage
            ? <p className={styles.bubble}>{p.lastTeacherMessage.body}</p>
            : <p className={styles.empty}>Tem uma dúvida ou quer orientação? Mande um recado; a resposta aparece aqui.</p>}
          <Link href="/aluno/professor" className={styles.link}>{p.lastTeacherMessage ? "Responder" : "Escrever recado"}{I.arrow}</Link>
        </section>
      </aside>
    </div>

    {/* Ajuste do Fabio (17/11/2026): atalhos na largura toda, sem coluna vazia ao lado. */}
    <section className={styles.tilesSec}>
      <div className={styles.secHead}><h3>Praticar agora</h3></div>
      <div className={styles.tiles}>
        {TILES.map((t) => <Link key={t.href} href={t.href} className={`card ${styles.tile}`}>
          <span className={`${styles.ic} ${t.accent ? styles.icAccent : ""}`}>{t.icon}</span>
          <span><b>{t.label}</b><small>{t.hint}</small></span>
        </Link>)}
      </div>
    </section>
  </div>;
}
