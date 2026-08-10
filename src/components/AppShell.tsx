"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Crest } from "./Crest";
import { ThemeToggle } from "./ThemeToggle";
import { initials, useProfile } from "@/lib/profile";

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
  help: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
  ),
};

const studentNav: { section: string; items: NavItem[] }[] = [
  {
    section: "Aprender",
    items: [
      { href: "/aluno", label: "Início", icon: I.home },
      { href: "/aluno/curso", label: "Meu curso", icon: I.path },
      { href: "/aluno/praticar", label: "Praticar", icon: I.target },
      { href: "/aluno/licao", label: "Minha lição", icon: I.book },
    ],
  },
  {
    section: "Praticar com IA",
    items: [
      { href: "/aluno/tutor", label: "Tutor de conversa", icon: I.chat },
      { href: "/aluno/roleplay", label: "Roleplay por voz", icon: I.mic },
      { href: "/aluno/pronuncia", label: "Pronúncia", icon: I.wave },
    ],
  },
  {
    section: "Progresso",
    items: [{ href: "/aluno/revisao", label: "Revisão", icon: I.review, badge: "8" }],
  },
  {
    section: "Você",
    items: [{ href: "/aluno/conta", label: "Minha conta", icon: I.user }],
  },
];

const teacherNav: { section: string; items: NavItem[] }[] = [
  {
    section: "Professor",
    items: [
      { href: "/professor/alunos", label: "Alunos", icon: I.users },
      { href: "/professor", label: "Recados dos alunos", icon: I.chat },
      { href: "/professor/marina", label: "Exemplo: Marina", icon: I.user },
    ],
  },
];

const CRUMBS: Record<string, string> = {
  "/aluno": "Início",
  "/aluno/curso": "Meu curso",
  "/aluno/praticar": "Praticar",
  "/aluno/licao": "Minha lição",
  "/aluno/tutor": "Tutor de conversa",
  "/aluno/roleplay": "Roleplay por voz",
  "/aluno/pronuncia": "Pronúncia",
  "/aluno/revisao": "Revisão",
  "/aluno/conta": "Minha conta",
  "/professor/alunos": "Alunos",
  "/professor": "Recados dos alunos",
  "/professor/marina": "Exemplo: Marina",
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useProfile();
  const isTeacher = pathname.startsWith("/professor");

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }
  const nav = isTeacher ? teacherNav : studentNav;
  const crumb = CRUMBS[pathname] ?? "";
  const [menuOpen, setMenuOpen] = useState(false);

  // Fecha o menu-gaveta ao trocar de página.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="app-shell">
      <aside className={`sidebar${menuOpen ? " open" : ""}`}>
        <Link
          href="/"
          className="brand"
          style={{ textDecoration: "none", color: "inherit" }}
          onClick={() => setMenuOpen(false)}
        >
          <Crest size={40} />
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
          {!isTeacher && (
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
          <Link
            href={isTeacher ? "/aluno" : "/professor"}
            className="btn ghost"
            style={{ width: "100%" }}
            onClick={() => setMenuOpen(false)}
          >
            {isTeacher ? "Ver como aluno" : "Ver como professor"}
          </Link>
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
            {isTeacher ? (
              <span className="chip">
                {profile.name ? `Prof. ${profile.name.split(" ")[0]}` : "Professor(a)"}
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
