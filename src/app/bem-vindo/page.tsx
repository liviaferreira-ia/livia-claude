"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { SceneArt } from "@/components/SceneArt";
import { ThemeToggle } from "@/components/ThemeToggle";
import { levelDisplay, useProfile } from "@/lib/profile";

type Step = { eyebrow: string; title: string; desc: string; tint: string; icon: ReactNode };

const STEPS: Step[] = [
  {
    eyebrow: "Trilha",
    title: "Aulas passo a passo",
    desc: "Avance por unidades e lições no seu nível, sem pressa.",
    tint: "tint-navy",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg>
    ),
  },
  {
    eyebrow: "Prática",
    title: "Exercícios do dia a dia",
    desc: "Gramática e vocabulário com correção na hora.",
    tint: "tint-gold",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg>
    ),
  },
  {
    eyebrow: "Fala",
    title: "Pronúncia e conversa",
    desc: "Treine frases e situações reais por voz, com atividades guiadas.",
    tint: "tint-navy",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" /></svg>
    ),
  },
  {
    eyebrow: "Revisão",
    title: "Fixe o que aprendeu",
    desc: "Revisão na hora certa pra não esquecer.",
    tint: "tint-warn",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6" /><path d="M3 8a9 9 0 1 0 3-6.7L3 8" /></svg>
    ),
  },
  {
    eyebrow: "Professor",
    title: "Você não estuda sozinha",
    desc: "Seus professores acompanham seu progresso e ajudam no caminho.",
    tint: "tint-gold",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
  },
];

export default function BemVindoPage() {
  const { profile, ready } = useProfile();
  const first = ready && profile.name ? profile.name.split(" ")[0] : null;

  return (
    <div className="welcome-wrap">
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 20 }}>
        <ThemeToggle />
      </div>

      <div className="welcome-inner">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <BrandLockup width={210} />
        </div>

        <h1 style={{ fontSize: 30, textAlign: "center", lineHeight: 1.15 }}>
          {first ? `Boas-vindas, ${first}! 👋` : "Boas-vindas! 👋"}
        </h1>
        <p
          className="muted"
          style={{ textAlign: "center", fontSize: 15.5, maxWidth: 460, margin: "10px auto 0" }}
        >
          Aqui você vai aprender a <strong style={{ color: "var(--ink)" }}>falar inglês</strong> de
          verdade — no seu ritmo, praticando todos os dias, com o acompanhamento dos seus
          professores.
        </p>

        {first && (
          <div className="wc-personal">
            Sua trilha começa no nível <b>{(profile.level && levelDisplay(profile.level)) || "inicial"}</b>
            {profile.goal ? (
              <>
                {" "}
                com foco em <b>{profile.goal.toLowerCase()}</b>.
              </>
            ) : (
              "."
            )}
          </div>
        )}

        <div className="two-col top" style={{ marginTop: 24 }}>
          <div>
            <SceneArt />
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>
              Como funciona
            </p>
            <div className="card" style={{ padding: "6px 20px" }}>
              {STEPS.map((s) => (
                <div className="wc-row" key={s.eyebrow}>
                  <span className={`wc-ic ${s.tint}`}>{s.icon}</span>
                  <span className="wc-text">
                    <span className="wc-eyebrow">{s.eyebrow}</span>
                    <span className="wc-title">
                      {s.title}
                      <span>{s.desc}</span>
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <Link href="/aluno" className="btn primary" style={{ padding: "13px 28px", fontSize: 15.5 }}>
            Começar meus estudos →
          </Link>
        </div>
      </div>
    </div>
  );
}
