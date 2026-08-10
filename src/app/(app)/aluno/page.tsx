"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { initials, totalExercises, useProfile } from "@/lib/profile";
import { listMyMessages, sendMessage, type Message } from "@/lib/messages";
import { CATEGORIES } from "@/data/exercises";

export default function AlunoDashboard() {
  const { profile, ready, reset, signOut } = useProfile();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [msgErr, setMsgErr] = useState("");

  useEffect(() => {
    if (!ready || !profile.onboarded) return;
    listMyMessages().then(({ data }) => setMessages(data));
  }, [ready, profile.onboarded]);

  async function handleSend() {
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    setMsgErr("");
    const { error } = await sendMessage(text);
    setSending(false);
    if (error) {
      setMsgErr("Não consegui enviar agora. Tente de novo.");
      return;
    }
    setDraft("");
    const { data } = await listMyMessages();
    setMessages(data);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  function clearProgress() {
    if (!confirm("Zerar o progresso deste navegador? Sua conta e seu perfil continuam salvos.")) {
      return;
    }
    try {
      window.localStorage.removeItem("central_lesson_sections_v1");
    } catch {}
    reset();
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

  const badges = [
    { emoji: "🌱", label: "Primeiro passo", got: totals.done >= 1, hint: "Faça 1 exercício" },
    { emoji: "📚", label: "Praticante", got: totals.done >= 10, hint: "Faça 10 exercícios" },
    { emoji: "🎯", label: "Pontaria", got: totals.done >= 5 && totals.pct >= 80, hint: "80% de acerto em 5+ exercícios" },
    { emoji: "🔥", label: "Chama acesa", got: profile.stats.streak >= 3, hint: "3 dias seguidos" },
    { emoji: "🏅", label: "Dedicado", got: totals.done >= 30, hint: "Faça 30 exercícios" },
    { emoji: "🎓", label: "Primeira lição", got: profile.stats.lessonsCompleted >= 1, hint: "Conclua 1 lição" },
  ];

  return (
    <div className="view">
      <div className="profile-hero">
        <div className="profile-hero-banner" />
        <div className="profile-hero-body">
          <div className="profile-hero-avatar">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="Foto de perfil" />
            ) : (
              <span>{initials(profile.name)}</span>
            )}
          </div>
          <div className="profile-hero-info">
            <h2>{profile.name}</h2>
            <div className="profile-hero-tags">
              {profile.level && <span className="level-badge">{profile.level}</span>}
              {profile.goal && <span className="muted">🎯 {profile.goal}</span>}
            </div>
          </div>
          <Link href="/aluno/conta" className="btn ghost profile-hero-btn">
            Ver minha conta
          </Link>
        </div>
        <div className="profile-stats">
          <div>
            <b>{totals.done}</b>
            <span>exercícios</span>
          </div>
          <div>
            <b>{totals.done ? `${totals.pct}%` : "—"}</b>
            <span>de acerto</span>
          </div>
          <div>
            <b>{profile.stats.streak}</b>
            <span>dias seguidos</span>
          </div>
          <div>
            <b>{profile.stats.lessonsCompleted}</b>
            <span>lições</span>
          </div>
        </div>
      </div>

      <p className="muted" style={{ margin: "14px 2px 20px" }}>
        {totals.done === 0
          ? `Bem-vindo(a), ${first}! Que tal começar com alguns exercícios?`
          : `Continue assim, ${first}! Você já fez ${totals.done} exercícios.`}
      </p>

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

          <div className="sec-h" style={{ marginTop: 26 }}>
            <h3>Fale com seu tutor</h3>
            <span className="muted">um professor de verdade acompanha você</span>
          </div>
          <div className="card">
            {messages.length > 0 && (
              <div className="tutor-thread">
                {messages.map((m) => (
                  <div key={m.id} className={`tutor-msg ${m.sender}`}>
                    <p>{m.body}</p>
                    <time>
                      {new Date(m.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                ))}
              </div>
            )}
            <textarea
              className="tutor-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escreva um recado, uma dúvida ou peça ajuda ao seu tutor…"
              rows={3}
            />
            {msgErr && <p className="auth-msg err" style={{ maxWidth: "none" }}>{msgErr}</p>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span className="muted" style={{ fontSize: 12.5 }}>
                Seu tutor responde em breve.
              </span>
              <button
                className="btn primary"
                onClick={handleSend}
                disabled={sending || !draft.trim()}
                style={{ opacity: sending || !draft.trim() ? 0.6 : 1 }}
              >
                {sending ? "Enviando…" : "Enviar recado"}
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="card stat">
            <div className="sec-h" style={{ marginBottom: 4 }}>
              <h3 style={{ fontSize: 15 }}>Conquistas</h3>
              <span className="muted">
                {badges.filter((b) => b.got).length}/{badges.length}
              </span>
            </div>
            <div className="badges">
              {badges.map((b) => (
                <div key={b.label} className={`badge-item${b.got ? " got" : ""}`} title={b.hint}>
                  <span className="badge-emoji">{b.got ? b.emoji : "🔒"}</span>
                  <span className="badge-label">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card stat" style={{ marginTop: 18 }}>
            <div className="eyebrow">Sua conta</div>
            <p className="muted" style={{ fontSize: 13, margin: "10px 0 12px" }}>
              Seu perfil e progresso ficam salvos na sua conta e acompanham você em qualquer
              aparelho.
            </p>
            <button className="btn primary" style={{ width: "100%" }} onClick={handleSignOut}>
              ↩ Sair da conta
            </button>
            <button
              className="btn ghost"
              style={{ width: "100%", marginTop: 8 }}
              onClick={clearProgress}
            >
              Zerar progresso deste navegador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
