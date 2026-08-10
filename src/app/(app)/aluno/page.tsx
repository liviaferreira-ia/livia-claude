"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { totalExercises, useProfile } from "@/lib/profile";
import { CATEGORIES } from "@/data/exercises";

export default function AlunoDashboard() {
  const { profile, ready, reset } = useProfile();
  const router = useRouter();

  function fullReset() {
    if (!confirm("Recomeçar do zero? Isto apaga o perfil e o progresso deste navegador para você se cadastrar de novo.")) {
      return;
    }
    try {
      window.localStorage.removeItem("central_lesson_sections_v1");
    } catch {}
    reset();
    router.push("/onboarding");
  }

  if (!ready) {
    return (
      <div className="view">
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  // Ainda não criou o perfil → convida para o onboarding
  if (!profile.onboarded) {
    return (
      <div className="view">
        <div className="hero" style={{ maxWidth: 620 }}>
          <div className="eyebrow">Bem-vinda</div>
          <h2>Vamos criar o seu perfil 🎓</h2>
          <p>Leva 1 minuto: seu nome, seu objetivo e seu nível. Depois você já começa a praticar.</p>
          <Link href="/onboarding" className="btn light">
            Criar meu perfil →
          </Link>
        </div>
      </div>
    );
  }

  const totals = totalExercises(profile);
  const first = profile.name.split(" ")[0];

  return (
    <div className="view">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 26 }}>Olá, {first}! 👋</h2>
        <p className="muted" style={{ marginTop: 2 }}>
          {totals.done === 0
            ? "Seu perfil está pronto. Que tal começar com alguns exercícios?"
            : `Você já fez ${totals.done} exercícios. Continue assim!`}
        </p>
      </div>

      <div className="grid cols-2">
        <div>
          <div className="hero">
            <div className="eyebrow">Comece por aqui</div>
            <h2>{totals.done === 0 ? "Seu primeiro exercício" : "Continuar praticando"}</h2>
            <p>
              Mais de 30 exercícios de cada tipo (múltipla escolha, completar, tradução e ordenar
              palavras), no seu nível.
            </p>
            <Link href="/aluno/praticar" className="btn light">
              Praticar agora →
            </Link>
          </div>

          <div className="sec-h" style={{ marginTop: 26 }}>
            <h3>Tipos de exercício</h3>
            <span className="muted">escolha por onde começar</span>
          </div>
          <div className="card" style={{ padding: 8 }}>
            {CATEGORIES.map((cat) => {
              const stat = profile.stats.practice[cat.kind];
              return (
                <Link key={cat.kind} href="/aluno/praticar" className="m-item">
                  <span className="m-ic tint-navy" style={{ fontWeight: 800, fontSize: 12 }}>
                    {cat.kind === "mc" ? "ABC" : cat.kind === "fill" ? "__" : cat.kind === "translate" ? "PT" : "1·2"}
                  </span>
                  <span className="m-body">
                    <b>{cat.title}</b>
                    <span>{cat.count} exercícios disponíveis</span>
                  </span>
                  <span className={`m-state ${stat.done > 0 ? "done" : "todo"}`}>
                    {stat.done > 0 ? `${stat.done} feitos` : "Novo"}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="sec-h" style={{ marginTop: 26 }}>
            <h3>Explorar</h3>
            <span className="muted">outras áreas da plataforma</span>
          </div>
          <div className="card" style={{ padding: 8 }}>
            <Link href="/aluno/curso" className="m-item">
              <span className="m-ic tint-gold" style={{ fontWeight: 800, fontSize: 11 }}>A2</span>
              <span className="m-body">
                <b>Meu curso</b>
                <span>Trilha de unidades e lições</span>
              </span>
              <span className="m-state todo">Ver</span>
            </Link>
            <Link href="/aluno/tutor" className="m-item">
              <span className="m-ic tint-navy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span className="m-body">
                <b>Tutor de conversa</b>
                <span>Praticar escrevendo com a IA</span>
              </span>
              <span className="m-state todo">Abrir</span>
            </Link>
          </div>
        </div>

        <div>
          <div className="card stat">
            <div className="eyebrow">Seu progresso</div>
            <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--navy)" }}>{totals.done}</div>
                <div className="muted" style={{ fontSize: 12.5 }}>exercícios feitos</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--gold)" }}>
                  {totals.done ? `${totals.pct}%` : "—"}
                </div>
                <div className="muted" style={{ fontSize: 12.5 }}>de acerto</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)" }}>{profile.stats.streak}</div>
                <div className="muted" style={{ fontSize: 12.5 }}>dias seguidos</div>
              </div>
            </div>
          </div>

          <div className="card stat" style={{ marginTop: 18 }}>
            <div className="eyebrow">Seu perfil</div>
            <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.9 }}>
              <div><b>Nome:</b> {profile.name}</div>
              <div><b>Objetivo:</b> {profile.goal || "—"}</div>
              <div><b>Nível:</b> {profile.level || "—"}</div>
            </div>
            <p className="est-note" style={{ marginTop: 8 }}>
              Suas habilidades por skill aparecerão aqui conforme você praticar.
            </p>
          </div>

          <div className="card stat" style={{ marginTop: 18 }}>
            <div className="eyebrow">Modo teste</div>
            <p className="muted" style={{ fontSize: 13, margin: "10px 0 12px" }}>
              Quer recomeçar do zero e se cadastrar de novo? Isto apaga o perfil e o progresso deste
              navegador.
            </p>
            <button className="btn ghost" style={{ width: "100%" }} onClick={fullReset}>
              ↺ Zerar e cadastrar de novo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
