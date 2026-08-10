"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/aluno";

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  function friendlyError(message: string): string {
    const m = message.toLowerCase();
    if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
    if (m.includes("already registered") || m.includes("already been registered"))
      return "Este e-mail já tem conta. Tente entrar.";
    if (m.includes("password") && m.includes("6")) return "A senha precisa de pelo menos 6 caracteres.";
    if (m.includes("email") && m.includes("valid")) return "Digite um e-mail válido.";
    return message;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(friendlyError(error.message));
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

    // Cadastro
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim() } },
    });
    setLoading(false);
    if (error) {
      setError(friendlyError(error.message));
      return;
    }
    // Se a confirmação de e-mail estiver DESLIGADA, já vem uma sessão pronta.
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
    } else {
      setInfo(
        "Conta criada! Enviamos um e-mail de confirmação. Confirme e depois volte para entrar.",
      );
      setMode("signin");
    }
  }

  const isSignup = mode === "signup";

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
          {isSignup
            ? "Crie sua conta para começar a estudar."
            : "Entre para continuar seus estudos."}
        </p>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={!isSignup ? "on" : ""}
            onClick={() => {
              setMode("signin");
              setError("");
              setInfo("");
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={isSignup ? "on" : ""}
            onClick={() => {
              setMode("signup");
              setError("");
              setInfo("");
            }}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="field">
              <label htmlFor="nome">Seu nome</label>
              <input
                id="nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como podemos te chamar?"
                autoComplete="name"
                required
              />
            </div>
          )}
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
              placeholder="Mínimo 6 caracteres"
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={6}
              required
            />
          </div>

          {error && <p className="auth-msg err">{error}</p>}
          {info && <p className="auth-msg ok">{info}</p>}

          <button
            type="submit"
            className="btn primary"
            style={{ width: "100%", marginTop: 8, opacity: loading ? 0.6 : 1 }}
            disabled={loading}
          >
            {loading
              ? "Aguarde…"
              : isSignup
                ? "Criar conta →"
                : "Entrar →"}
          </button>
        </form>

        <p className="muted" style={{ fontSize: 13, marginTop: 16, textAlign: "center" }}>
          {isSignup ? (
            <>
              Já tem conta?{" "}
              <button type="button" className="link-btn" onClick={() => setMode("signin")}>
                Entrar
              </button>
            </>
          ) : (
            <>
              Primeira vez?{" "}
              <button type="button" className="link-btn" onClick={() => setMode("signup")}>
                Criar minha conta
              </button>
            </>
          )}
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
