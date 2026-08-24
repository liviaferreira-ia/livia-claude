"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/** Azul-marinho é a cor primária da marca: tema escuro é o padrão pra quem nunca escolheu, independente do sistema. */
function getInitial(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem("central_theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "dark";
}

/** Aplica o tema salvo assim que o app monta (sem alterar o HTML do servidor). */
export function ThemeInit() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", getInitial());
  }, []);
  return null;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const t = getInitial();
      setTheme(t);
      document.documentElement.setAttribute("data-theme", t);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
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
