"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/client";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/aluno";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function friendlyError(message: string): string {
    const m = message.toLowerCase();
    if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
    return message;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(friendlyError(error.message));
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/definir-senha`,
    });
    setLoading(false);
    if (error) {
      setError("Não foi possível enviar o link agora. Aguarde um instante e tente novamente.");
      return;
    }
    setResetSent(true);
  }

  return (
    <div className="login-wrap">
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 20 }}>
        <ThemeToggle />
      </div>
      <div className="login-card">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BrandLockup width={230} />
        </div>
        <p className="muted" style={{ fontSize: 14, marginTop: 16 }}>
          {resetMode ? "Informe seu e-mail para criar uma nova senha." : "Entre para continuar seus estudos."}
        </p>

        <form onSubmit={resetMode ? handleReset : handleSubmit} style={{ marginTop: 20 }}>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              autoComplete="email"
              required
            />
          </div>
          {!resetMode && <div className="field">
            <label htmlFor="senha">Senha</label>
            <div className="pw-wrap">
              <input
                id="senha"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
                minLength={6}
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                aria-pressed={showPassword}
                title={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <path d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>}

          {error && <p className="auth-msg err">{error}</p>}
          {resetSent && <p className="auth-msg ok">Se este e-mail estiver cadastrado, você receberá um link para criar uma nova senha. Verifique também a caixa de spam.</p>}

          <button
            type="submit"
            className="btn primary"
            style={{ width: "100%", marginTop: 8, opacity: loading ? 0.6 : 1 }}
            disabled={loading || resetSent}
          >
            {loading ? "Aguarde…" : resetMode ? "Enviar link de recuperação" : "Entrar →"}
          </button>
        </form>

        <button
          type="button"
          className="link-btn"
          style={{ marginTop: 14 }}
          onClick={() => { setResetMode((current) => !current); setResetSent(false); setError(""); }}
        >
          {resetMode ? "Voltar para o login" : "Esqueci minha senha"}
        </button>

        <p className="muted" style={{ fontSize: 13, marginTop: 16, textAlign: "center" }}>
          Ainda não tem conta? <Link href="/experimente">Experimente grátis por 7 dias</Link>.
        </p>

        <p className="est-note" style={{ marginTop: 12, textAlign: "center" }}>
          <Link href="/" style={{ color: "var(--navy)", fontWeight: 700 }}>
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
