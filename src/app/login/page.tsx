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
          Entre para continuar seus estudos.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
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
          <div className="field">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              minLength={6}
              required
            />
          </div>

          {error && <p className="auth-msg err">{error}</p>}

          <button
            type="submit"
            className="btn primary"
            style={{ width: "100%", marginTop: 8, opacity: loading ? 0.6 : 1 }}
            disabled={loading}
          >
            {loading ? "Aguarde…" : "Entrar →"}
          </button>
        </form>

        <p className="muted" style={{ fontSize: 13, marginTop: 16, textAlign: "center" }}>
          Ainda não tem conta? Fale com a Central School pra receber seu acesso.
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
