"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Crest } from "./Crest";
import { ThemeToggle } from "./ThemeToggle";
import { initials, useProfile } from "@/lib/profile";
import { OperationalMonitor } from "@/components/OperationalMonitor";
import { useIdleLogout } from "@/hooks/useIdleLogout";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: string;
};

const I = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
  ),
  path: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
  ),
  mic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" /></svg>
  ),
  wave: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h3l3 8 4-16 3 8h5" /></svg>
  ),
  review: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6" /><path d="M3 8a9 9 0 1 0 3-6.7L3 8" /></svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 12 0v1" /></svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.8l6.5-.9L12 3z" /></svg>
  ),
  help: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
  ),
  pulse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2-7 4 14 2-7h6" /></svg>
  ),
  game: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="10" rx="5" /><path d="M7 10v4M5 12h4" /><circle cx="15" cy="10.5" r="1" /><circle cx="17.5" cy="13" r="1" /></svg>
  ),
};

const studentNav: { section: string; items: NavItem[] }[] = [
  {
    section: "Aprender",
    items: [
      { href: "/aluno", label: "Início", icon: I.home },
      { href: "/aluno/curso", label: "Meu curso", icon: I.path },
      { href: "/aluno/praticar", label: "Praticar", icon: I.target },
      { href: "/aluno/jogos", label: "Central Games", icon: I.game },
      { href: "/aluno/licao", label: "Minha lição", icon: I.book },
    ],
  },
  {
    section: "Praticar falando",
    items: [
      { href: "/aluno/tutor", label: "Prática de conversa", icon: I.chat },
      { href: "/aluno/roleplay", label: "Roleplay por voz", icon: I.mic },
      { href: "/aluno/pronuncia", label: "Pronúncia", icon: I.wave },
    ],
  },
  {
    section: "Progresso",
    items: [
      { href: "/aluno/progresso", label: "Meu progresso", icon: I.path },
      { href: "/aluno/revisao", label: "Revisão", icon: I.review },
      { href: "/aluno/palavras", label: "Minhas palavras", icon: I.star },
    ],
  },
  {
    section: "Você",
    items: [
      { href: "/aluno/professor", label: "Fale com o professor", icon: I.chat },
      { href: "/aluno/conta", label: "Minha conta", icon: I.user },
    ],
  },
];

const teacherNav: { section: string; items: NavItem[] }[] = [
  {
    section: "Professor",
    items: [
      { href: "/professor/alunos", label: "Alunos", icon: I.users },
      { href: "/professor/operacional", label: "Operacional", icon: I.pulse },
      { href: "/professor/validacao-conteudo", label: "Validação de conteúdo", icon: I.book },
      { href: "/professor", label: "Conversas", icon: I.chat },
    ],
  },
];

const CRUMBS: Record<string, string> = {
  "/aluno": "Início",
  "/aluno/curso": "Meu curso",
  "/aluno/praticar": "Praticar",
  "/aluno/jogos": "Central Games",
  "/aluno/licao": "Minha lição",
  "/aluno/tutor": "Prática de conversa",
  "/aluno/roleplay": "Roleplay por voz",
  "/aluno/pronuncia": "Pronúncia",
  "/aluno/revisao": "Revisão",
  "/aluno/progresso": "Meu progresso",
  "/aluno/palavras": "Minhas palavras",
  "/aluno/professor": "Fale com o professor",
  "/aluno/conta": "Minha conta",
  "/professor/alunos": "Painel do Professor · Gestão de Alunos",
  "/professor/operacional": "Operacional",
  "/professor/validacao-conteudo": "Validação de conteúdo",
  "/professor": "Conversas",
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user, role, isTeacher: hasTeacherAccess, ready, signOut } = useProfile();
  const isTeacherArea = pathname.startsWith("/professor");

  useIdleLogout({
    enabled: ready && Boolean(user),
    userId: user?.id,
    onIdle: async () => {
      try {
        await signOut("local");
      } finally {
        window.location.replace("/login?reason=inatividade");
      }
    },
  });

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }
  const nav = isTeacherArea && hasTeacherAccess ? teacherNav : studentNav;
  const crumb = pathname.startsWith("/professor/alunos/") ? "Detalhes do aluno" : CRUMBS[pathname] ?? "";
  const [menuOpen, setMenuOpen] = useState(false);

  // Fecha o menu-gaveta ao trocar de página.
  useEffect(() => {
    const timer = window.setTimeout(() => setMenuOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  // Evita que uma conta de aluno permaneça em uma URL da área da escola.
  // O middleware também aplica essa regra no servidor; este redirecionamento
  // cobre navegações client-side e mudanças de sessão.
  useEffect(() => {
    if (ready && isTeacherArea && !hasTeacherAccess) {
      router.replace("/aluno");
    }
  }, [hasTeacherAccess, isTeacherArea, ready, router]);

  return (
    <div className="app-shell">
      <OperationalMonitor />
      <aside className={`sidebar${menuOpen ? " open" : ""}`}>
        <Link
          href={isTeacherArea && hasTeacherAccess ? "/professor" : "/aluno"}
          className="brand"
          style={{ textDecoration: "none", color: "inherit" }}
          onClick={() => setMenuOpen(false)}
        >
          <Crest size={54} />
          <div>
            <b>Central School</b>
            <span>ENGLISH AS A LIFESTYLE</span>
          </div>
        </Link>

        {nav.map((group) => (
          <div key={group.section}>
            <div className="navlabel">{group.section}</div>
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav${active ? " on" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                  {item.badge ? <span className="badge">{item.badge}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="side-foot">
          {!isTeacherArea && (
            <Link
              href="/bem-vindo"
              className="nav"
              onClick={() => setMenuOpen(false)}
              style={{ marginBottom: 6 }}
            >
              {I.help}
              Como funciona
            </Link>
          )}
          {hasTeacherAccess && (
            <Link
              href={isTeacherArea ? "/aluno" : "/professor"}
              className="btn ghost"
              style={{ width: "100%" }}
              onClick={() => setMenuOpen(false)}
            >
              {isTeacherArea ? "Ver como aluno" : "Ver como professor"}
            </Link>
          )}
          <button
            className="btn ghost"
            style={{ width: "100%", marginTop: 6 }}
            onClick={() => {
              setMenuOpen(false);
              handleSignOut();
            }}
          >
            ↩ Sair
          </button>
        </div>
      </aside>

      <div
        className={`scrim${menuOpen ? " open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />

      <main>
        <div className="topbar">
          <button
            className="menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="crumb">
            <b>{crumb}</b>
          </div>
          <div className="top-right">
            {isTeacherArea && hasTeacherAccess ? (
              <span className="chip">
                {role === "admin"
                  ? profile.name || "Administrador(a)"
                  : profile.name
                    ? `Prof. ${profile.name.split(" ")[0]}`
                    : "Professor(a)"}
              </span>
            ) : (
              <>
                {profile.stats.streak > 0 && (
                  <span className="chip gold">🔥 {profile.stats.streak} dias</span>
                )}
                <span className="chip">{profile.name ? profile.name.split(" ")[0] : "Visitante"}</span>
              </>
            )}
            <ThemeToggle />
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="avatar" src={profile.avatarUrl} alt="Foto de perfil" />
            ) : (
              <span className="avatar">{initials(profile.name)}</span>
            )}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
