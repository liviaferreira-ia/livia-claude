"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categoriesFor, resolveExerciseLevel, type Kind } from "@/data/exercises";
import { LEARNING_CYCLE, resolveCourseLevel } from "@/data/curso";
import { parseCefrLevel, totalExercises, useProfile } from "@/lib/profile";
import { useCourseProgress } from "@/lib/courseProgress";
import { countMyActiveDaysThisWeek, getMySettings, type StudentSettings } from "@/lib/student-admin";
import { useDesignV2 } from "@/lib/useDesignV2";
import { StudentBadges } from "@/components/StudentBadges";
import styles from "./progresso.module.css";

const LABEL: Record<Kind, string> = { mc: "Múltipla escolha", fill: "Completar", translate: "Tradução", order: "Ordenar frases" };

export default function ProgressoPage() {
  const { profile, ready } = useProfile();
  const v2 = useDesignV2();
  const [activeDays, setActiveDays] = useState(0);
  const [settings, setSettings] = useState<StudentSettings | null>(null);
  const level = resolveExerciseLevel(parseCefrLevel(profile.level) ?? "A2");
  const courseLevel = resolveCourseLevel(parseCefrLevel(profile.level) ?? "A2");
  const courseProgress = useCourseProgress(courseLevel);
  const totals = totalExercises(profile);

  useEffect(() => {
    if (!ready) return;
    void Promise.all([countMyActiveDaysThisWeek(), getMySettings()]).then(([days, studentSettings]) => {
      setActiveDays(days);
      setSettings(studentSettings);
    });
  }, [ready]);

  if (!ready) return <div className="view"><p className="muted">Carregando…</p></div>;

  // Design v2: mesma informação, distribuída sem cartões esticados nem coluna vazia (ajuste de 17/11/2026).
  if (v2) {
    const goal = settings?.weekly_goal ?? 3;
    const phase = LEARNING_CYCLE.find((item) => item.id === courseProgress.currentPhase)?.label;
    const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
    return <div className={`view ${styles.page}`}>
      <header className={styles.head}>
        <div className="eyebrow">Sua evolução</div>
        <h1>Meu progresso</h1>
        <p className="muted">Veja sua constância, o que já concluiu e onde vale concentrar a próxima prática.</p>
      </header>

      <div className={`card ${styles.stats}`}>
        <div><b>{totals.done}</b><span>exercícios</span></div>
        <div><b>{totals.done ? `${totals.pct}%` : "—"}</b><span>de acerto</span></div>
        <div><b>{profile.stats.lessonsCompleted}</b><span>{profile.stats.lessonsCompleted === 1 ? "lição" : "lições"}</span></div>
        <div><b>{profile.stats.bestStreak}</b><span>melhor sequência</span></div>
      </div>

      <div className={styles.row}>
        <section className={`card ${styles.card}`}>
          <div className="eyebrow">Jornada do nível {courseLevel}</div>
          <h3>{courseProgress.pct}% concluído</h3>
          <div className={styles.bar}><i style={{ width: `${courseProgress.pct}%` }} /></div>
          <p>{courseProgress.completedCount} de {courseProgress.total} etapas · Unidade {courseProgress.currentUnit}{phase ? ` · ${phase}` : ""}</p>
          <div className={styles.actions}><Link className="btn primary" href="/aluno/curso">Continuar jornada →</Link></div>
        </section>
        <section className={`card ${styles.card}`}>
          <div className="eyebrow">Ritmo de estudo</div>
          <h3>{activeDays} de {plural(goal, "dia", "dias")} nesta semana</h3>
          <div className={styles.bar}><i style={{ width: `${Math.min(100, Math.round((activeDays / goal) * 100))}%` }} /></div>
          <p>Sequência atual: {plural(profile.stats.streak, "dia", "dias")}. Seu progresso acompanha sua conta em qualquer aparelho.</p>
          {settings?.focus && <p className={styles.focus}><b>Foco combinado:</b> {settings.focus}</p>}
          <div className={styles.actions}>
            <Link className="btn primary" href="/aluno/revisao">Fazer revisão</Link>
            <Link className="btn ghost" href="/aluno/curso">Ver meu curso</Link>
          </div>
        </section>
      </div>

      <section className={`card ${styles.card} ${styles.full}`}>
        <div className="eyebrow">Desempenho por atividade</div>
        <div className={styles.activities}>
          {categoriesFor(level).map((category) => {
            const stat = profile.stats.practice[category.kind];
            const pct = stat.done ? Math.round((stat.correct / stat.done) * 100) : 0;
            return <div key={category.kind} className={`${styles.activity}${stat.done ? "" : ` ${styles.empty}`}`}>
              <b>{LABEL[category.kind]}</b>
              <strong>{stat.done ? `${pct}%` : "—"}</strong>
              <small>{stat.done ? `de acerto · ${plural(stat.done, "feita", "feitas")}` : "Ainda sem dados"}</small>
              <div className={styles.bar}><i style={{ width: `${pct}%` }} /></div>
            </div>;
          })}
        </div>
      </section>

      <StudentBadges totals={totals} stats={profile.stats} />
    </div>;
  }

  return <div className="view" style={{ maxWidth: 900 }}>
    <div className="eyebrow">Sua evolução</div>
    <h1>Meu progresso</h1>
    <p className="muted">Veja sua constância, o que já concluiu e onde vale concentrar a próxima prática.</p>

    <div className="profile-stats" style={{ marginTop: 22, border: "1px solid var(--line)", borderRadius: 14 }}>
      <div><b>{totals.done}</b><span>exercícios</span></div>
      <div><b>{totals.done ? `${totals.pct}%` : "—"}</b><span>de acerto</span></div>
      <div><b>{profile.stats.lessonsCompleted}</b><span>lições</span></div>
      <div><b>{profile.stats.bestStreak}</b><span>melhor sequência</span></div>
    </div>

    <div className="grid cols-2" style={{ marginTop: 22 }}>
      <section className="card stat">
        <div className="eyebrow">Jornada do nível {courseLevel}</div>
        <h3 style={{ marginTop: 10 }}>{courseProgress.pct}% concluído</h3>
        <div className="unit-bar" style={{ marginTop: 12 }}><i style={{ width: `${courseProgress.pct}%` }} /></div>
        <p className="muted">
          {courseProgress.completedCount} de {courseProgress.total} etapas · Unidade {courseProgress.currentUnit} · {LEARNING_CYCLE.find((phase) => phase.id === courseProgress.currentPhase)?.label}
        </p>
        <Link className="btn primary" href="/aluno/curso">Continuar jornada →</Link>
      </section>

      <section className="card stat">
        <div className="eyebrow">Desempenho por atividade</div>
        {categoriesFor(level).map((category) => {
          const stat = profile.stats.practice[category.kind];
          const pct = stat.done ? Math.round((stat.correct / stat.done) * 100) : 0;
          return <div key={category.kind} style={{ padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <b>{LABEL[category.kind]}</b><span className="muted">{stat.done ? `${pct}% · ${stat.done} feitas` : "Ainda sem dados"}</span>
            </div>
            <div className="unit-bar" style={{ marginTop: 9 }}><i style={{ width: `${pct}%` }} /></div>
          </div>;
        })}
      </section>

      <section className="card stat">
        <div className="eyebrow">Ritmo de estudo</div>
        <h3 style={{ marginTop: 10 }}>{activeDays}/{settings?.weekly_goal ?? 3} dias nesta semana</h3>
        <div className="unit-bar" style={{ marginTop: 12 }}><i style={{ width: `${Math.min(100, Math.round(activeDays / (settings?.weekly_goal ?? 3) * 100))}%` }} /></div>
        <p className="muted">Sequência atual: {profile.stats.streak} dias. Seu progresso agora acompanha sua conta em qualquer aparelho.</p>
        {settings?.focus && <p style={{ paddingTop: 12, borderTop: "1px solid var(--line)" }}><b>Foco combinado:</b> {settings.focus}</p>}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <Link className="btn primary" href="/aluno/revisao">Fazer revisão</Link>
          <Link className="btn ghost" href="/aluno/curso">Ver meu curso</Link>
        </div>
      </section>
    </div>
    {v2 && <StudentBadges totals={totals} stats={profile.stats} />}
  </div>;
}
