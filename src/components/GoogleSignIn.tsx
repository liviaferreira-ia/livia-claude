"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GOOGLE_CLIENT_ID } from "@/lib/auth-google";

/**
 * Login com Google pelo botão oficial (Google Identity Services), 17/11/2026.
 * O Google abre uma janelinha que mostra "centralschool.com.br" (antes mostrava o endereço do
 * Supabase) e devolve um token; a sessão é criada aqui mesmo com signInWithIdToken, sem a volta
 * por /auth/confirm. Depois, /auth/entrar marca a sessão e leva cada pessoa ao lugar certo.
 *
 * `enabled = false` mostra um botão travado (ex.: no teste grátis, antes de aceitar as condições);
 * o clique nele chama `onBlocked`.
 */

type GoogleCredential = { credential?: string };
type GoogleId = {
  initialize: (config: Record<string, unknown>) => void;
  renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
};
declare global {
  interface Window { google?: { accounts?: { id?: GoogleId } } }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const tag = document.createElement("script");
      tag.src = SCRIPT_SRC;
      tag.async = true;
      tag.defer = true;
      tag.onload = () => resolve();
      tag.onerror = () => { scriptPromise = null; reject(new Error("gsi")); };
      document.head.appendChild(tag);
    });
  }
  return scriptPromise;
}

async function makeNonce(): Promise<{ raw: string; hashed: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const raw = btoa(String.fromCharCode(...bytes)).replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return { raw, hashed };
}

const googleLogo = (
  <svg viewBox="0 0 48 48" aria-hidden width="20" height="20">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

export function GoogleSignIn({ label = "Continuar com o Google", mode = "signin", enabled = true, onBlocked }: {
  label?: string;
  mode?: "signin" | "signup";
  enabled?: boolean;
  onBlocked?: () => void;
}) {
  const holderRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        await loadScript();
        const google = window.google?.accounts?.id;
        if (cancelled || !google || !holderRef.current) return;
        const nonce = await makeNonce();
        google.initialize({
          client_id: GOOGLE_CLIENT_ID,
          nonce: nonce.hashed,
          context: mode === "signup" ? "signup" : "signin",
          ux_mode: "popup",
          itp_support: true,
          use_fedcm_for_button: true,
          callback: async (response: GoogleCredential) => {
            if (!response.credential) return;
            setBusy(true);
            setError("");
            const { error: authError } = await createClient().auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
              nonce: nonce.raw,
            });
            if (authError) {
              setBusy(false);
              setError("Não foi possível entrar com o Google. Tente de novo ou use e-mail e senha.");
              return;
            }
            // Recarrega a página (de propósito) para o servidor já enxergar a sessão nova.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.assign("/auth/entrar");
          },
        });
        const width = Math.min(400, Math.max(220, Math.round(holderRef.current.getBoundingClientRect().width)));
        holderRef.current.innerHTML = "";
        google.renderButton(holderRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: mode === "signup" ? "signup_with" : "continue_with",
          logo_alignment: "center",
          locale: "pt-BR",
          width,
        });
        setReady(true);
      } catch {
        if (!cancelled) setError("Não foi possível carregar o login do Google. Verifique a conexão ou use e-mail e senha.");
      }
    })();
    return () => { cancelled = true; };
  }, [enabled, mode]);

  if (!enabled) {
    return (
      <button type="button" className="google-btn google-btn-off" onClick={onBlocked}>
        {googleLogo}<span>{label}</span>
      </button>
    );
  }

  return (
    <>
      <div className="google-holder" aria-busy={busy || !ready}>
        <div ref={holderRef} className="google-gsi" />
        {!ready && <div className="google-btn google-btn-loading" aria-hidden>{googleLogo}<span>{label}</span></div>}
        {busy && <p className="google-note">Entrando…</p>}
      </div>
      {error && <p className="auth-msg err">{error}</p>}
    </>
  );
}
