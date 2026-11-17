"use client";

/**
 * Menu do design v2 (aprovado em 16 e 17/11/2026).
 * Aluno: 6 itens; grupos abrem para mostrar as telas de dentro, então nenhuma
 * tela existente fica sem acesso. Professora: lista curta, sem item duplicado.
 */
import Link from "next/link";
import { useState, type ReactNode } from "react";

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
);
const ICONS = {
  home: svg(<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />),
  course: svg(<><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" /></>),
  target: svg(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>),
  mic: svg(<><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4" /></>),
  chart: svg(<><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 5-6" /></>),
  chat: svg(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />),
  users: svg(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>),
  star: svg(<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />),
  list: svg(<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />),
  pulse: svg(<path d="M22 12h-4l-3 9L9 3l-3 9H2" />),
  eye: svg(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>),
  chev: svg(<path d="m6 9 6 6 6-6" />),
};

type Sub = { href: string; label: string; badge?: "special" };
type Item = { label: string; icon: keyof typeof ICONS; href?: string; items?: Sub[]; badge?: "special" };

const STUDENT: Item[] = [
  { label: "Início", icon: "home", href: "/aluno" },
  { label: "Meu curso", icon: "course", items: [
    { href: "/aluno/curso", label: "Trilha do curso" },
    { href: "/aluno/aulas", label: "Aulas em vídeo" },
    { href: "/aluno/licao", label: "Minha lição" },
  ] },
  { label: "Praticar", icon: "target", items: [
    { href: "/aluno/praticar", label: "Exercícios" },
    { href: "/aluno/jogos", label: "Central Games" },
    { href: "/aluno/revisao", label: "Revisão" },
    { href: "/aluno/palavras", label: "Minhas palavras" },
  ] },
  { label: "Falar", icon: "mic", items: [
    { href: "/aluno/tutor", label: "Conversa com IA" },
    { href: "/aluno/roleplay", label: "Roleplay por voz" },
    { href: "/aluno/pronuncia", label: "Pronúncia" },
  ] },
  { label: "Progresso", icon: "chart", href: "/aluno/progresso" },
  { label: "Professora", icon: "chat", badge: "special", items: [
    { href: "/aluno/professor", label: "Recados" },
    { href: "/aluno/especial", label: "Especial para você", badge: "special" },
  ] },
];

const TEACHER: { section?: string; items: Item[] }[] = [
  { items: [
    { label: "Aulas para revisar", icon: "course", href: "/professor/aulas" },
    { label: "Alunos", icon: "users", href: "/professor/alunos" },
    { label: "Recados", icon: "chat", href: "/professor" },
    { label: "Atividades especiais", icon: "star", href: "/professor/atividades-especiais" },
  ] },
  { section: "Conteúdo e sistema", items: [
    { label: "Banco de exercícios", icon: "list", href: "/professor/validacao-conteudo" },
    { label: "Operacional", icon: "pulse", href: "/professor/operacional" },
  ] },
];

/** Rota ativa: início e recados só com caminho exato; o resto também nas subpáginas. */
export function isActive(pathname: string, href: string) {
  if (href === "/aluno" || href === "/professor") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavProps = {
  area: "student" | "teacher";
  pathname: string;
  specialCount: number;
  /** Aulas A1 esperando decisão (só professora); null enquanto carrega. */
  pendingReviews?: number | null;
  onNavigate: () => void;
};

export function SidebarNavV2({ area, pathname, specialCount, pendingReviews = null, onNavigate }: NavProps) {
  // Grupo aberto: escolha manual da pessoa; sem escolha, abre o grupo da tela atual.
  const [manual, setManual] = useState<Record<string, boolean>>({});
  const badge = (kind?: "special") => kind === "special" && specialCount > 0 ? <span className="badge">{specialCount}</span> : null;

  if (area === "teacher") {
    return <nav className="v2-nav" aria-label="Menu da professora">
      {TEACHER.map((group, gi) => <div key={gi}>
        {group.section && <div className="navlabel">{group.section}</div>}
        {group.items.map((item) => <Link key={item.href} href={item.href!} onClick={onNavigate}
          className={`nav${isActive(pathname, item.href!) ? " on" : ""}`} aria-current={isActive(pathname, item.href!) ? "page" : undefined}>
          {ICONS[item.icon]}{item.label}
          {item.href === "/professor/aulas" && pendingReviews ? <span className="badge" aria-label={`${pendingReviews} pendentes`}>{pendingReviews}</span> : null}
        </Link>)}
      </div>)}
    </nav>;
  }

  return <nav className="v2-nav" aria-label="Menu do aluno">
    {STUDENT.map((item) => {
      if (item.href) {
        const on = isActive(pathname, item.href);
        return <Link key={item.label} href={item.href} onClick={onNavigate} className={`nav${on ? " on" : ""}`} aria-current={on ? "page" : undefined}>
          {ICONS[item.icon]}{item.label}
        </Link>;
      }
      const containsActive = item.items!.some((sub) => isActive(pathname, sub.href));
      const open = manual[item.label] ?? containsActive;
      const id = `grupo-${item.label.toLowerCase().replace(/\W+/g, "-")}`;
      return <div key={item.label} className={`v2-group${open ? " open" : ""}`}>
        <button type="button" className={`nav${containsActive ? " in" : ""}`} aria-expanded={open} aria-controls={id}
          onClick={() => setManual((m) => ({ ...m, [item.label]: !open }))}>
          {ICONS[item.icon]}{item.label}{!open && badge(item.badge)}<span className="v2-chev">{ICONS.chev}</span>
        </button>
        <div id={id} className="v2-sub" hidden={!open}>
          {item.items!.map((sub) => {
            const on = isActive(pathname, sub.href);
            return <Link key={sub.href} href={sub.href} onClick={onNavigate} className={`nav sub${on ? " on" : ""}`} aria-current={on ? "page" : undefined}>
              {sub.label}{badge(sub.badge)}
            </Link>;
          })}
        </div>
      </div>;
    })}
  </nav>;
}

type FootProps = {
  area: "student" | "teacher";
  hasTeacherAccess: boolean;
  name: string;
  avatar: ReactNode;
  onNavigate: () => void;
  onSignOut: () => void;
};

export function SidebarFootV2({ area, hasTeacherAccess, name, avatar, onNavigate, onSignOut }: FootProps) {
  return <div className="side-foot v2-foot">
    {hasTeacherAccess && <Link className="v2-switch" href={area === "teacher" ? "/aluno" : "/professor/aulas"} onClick={onNavigate}>
      {ICONS.eye}{area === "teacher" ? "Ver como aluno" : "Painel da professora"}
    </Link>}
    <Link className="v2-me" href="/aluno/conta" onClick={onNavigate}>
      {avatar}<span><b>{name || "Minha conta"}</b><small>Minha conta</small></span>
    </Link>
    <div className="v2-foot-links">
      {area === "student" && <Link href="/bem-vindo" onClick={onNavigate}>Como funciona</Link>}
      <button type="button" onClick={onSignOut}>Sair</button>
    </div>
  </div>;
}

const TABS: { label: string; icon: keyof typeof ICONS; href: string; group: string[] }[] = [
  { label: "Início", icon: "home", href: "/aluno", group: [] },
  { label: "Curso", icon: "course", href: "/aluno/curso", group: ["/aluno/curso", "/aluno/aulas", "/aluno/licao"] },
  { label: "Praticar", icon: "target", href: "/aluno/praticar", group: ["/aluno/praticar", "/aluno/jogos", "/aluno/revisao", "/aluno/palavras"] },
  { label: "Falar", icon: "mic", href: "/aluno/tutor", group: ["/aluno/tutor", "/aluno/roleplay", "/aluno/pronuncia"] },
  { label: "Progresso", icon: "chart", href: "/aluno/progresso", group: ["/aluno/progresso"] },
];

/** Barra de abas do celular (área do aluno). O menu completo continua no botão do topo. */
export function StudentTabBar({ pathname }: { pathname: string }) {
  return <nav className="v2-tabbar" aria-label="Atalhos">
    {TABS.map((tab) => {
      const on = tab.group.length ? tab.group.some((href) => isActive(pathname, href)) : pathname === tab.href;
      return <Link key={tab.href} href={tab.href} className={on ? "on" : undefined} aria-current={on ? "page" : undefined}>
        {ICONS[tab.icon]}{tab.label}
      </Link>;
    })}
  </nav>;
}
