"use client";

import { useEffect, useState } from "react";
import { DESIGN_STORAGE_KEY, DESIGN_TEST_KEY } from "@/lib/design";

type Theme = "light" | "dark";

/**
 * Tema de quem nunca escolheu: no visual antigo, escuro (azul-marinho);
 * no design v2, claro (aprovado em 16/11/2026). A escolha salva sempre vence.
 */
export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem("central_theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return document.documentElement.getAttribute("data-design") === "v2" ? "light" : "dark";
}

/** Aplica o visual e o tema salvos assim que o app monta (sem alterar o HTML do servidor). */
export function ThemeInit() {
  useEffect(() => {
    try {
      // Contas da equipe já marcadas como v2 recebem o visual novo antes do perfil carregar.
      // Modo de teste: ?visual=novo liga o visual novo neste navegador; ?visual=atual desliga.
      const visual = new URLSearchParams(window.location.search).get("visual");
      if (visual === "novo") window.localStorage.setItem(DESIGN_TEST_KEY, "v2");
      if (visual === "atual") { window.localStorage.removeItem(DESIGN_TEST_KEY); window.localStorage.removeItem(DESIGN_STORAGE_KEY); }
      const teste = window.localStorage.getItem(DESIGN_TEST_KEY) === "v2";
      if (teste || window.localStorage.getItem(DESIGN_STORAGE_KEY) === "v2") document.documentElement.setAttribute("data-design", "v2");
    } catch {}
    document.documentElement.setAttribute("data-theme", getInitialTheme());
  }, []);
  return null;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const current = root.getAttribute("data-theme");
      setTheme(current === "light" || current === "dark" ? current : getInitialTheme());
      setReady(true);
    };
    const timer = window.setTimeout(sync, 0);
    // O tema pode mudar depois (ex.: o design v2 é ligado quando o perfil carrega).
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { window.clearTimeout(timer); observer.disconnect(); };
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem("central_theme", next);
    } catch {}
  }

  const showMoon = ready && theme === "dark";

  return (
    <button
      className="icon-btn"
      onClick={toggle}
      title={showMoon ? "Mudar para tema claro" : "Mudar para tema escuro"}
      aria-label="Alternar tema claro e escuro"
    >
      {showMoon ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}
