"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categoriesFor, resolveExerciseLevel, type Kind } from "@/data/exercises";
import { parseCefrLevel, totalExercises, useProfile } from "@/lib/profile";
import { countMyActiveDaysThisWeek, getMySettings, type StudentSettings } from "@/lib/student-admin";

const LABEL: Record<Kind, string> = { mc: "Múltipla escolha", fill: "Completar", translate: "Tradução", order: "Ordenar frases" };

export default function ProgressoPage() {
  const { profile, ready } = useProfile();
  const [activeDays, setActiveDays] = useState(0);
  const [settings, setSettings] = useState<StudentSettings | null>(null);
  const level = resolveExerciseLevel(parseCefrLevel(profile.level) ?? "A2");
  const totals = totalExercises(profile);

  useEffect(() => {
    if (!ready) return;
    void Promise.all([countMyActiveDaysThisWeek(), getMySettings()]).then(([days, studentSettings]) => {
      setActiveDays(days);
      setSettings(studentSettings);
    });
  }, [ready]);

  if (!ready) return <div className="view"><p className="muted">Carregando…</p></div>;

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
  </div>;
}
