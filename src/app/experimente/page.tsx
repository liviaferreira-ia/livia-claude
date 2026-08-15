"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/client";

export default function ExperimentePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!accepted) return setError("Confirme as condições do período gratuito para continuar.");
    if (!/[A-Z]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return setError("A senha precisa ter uma letra maiúscula e um caractere especial.");
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/onboarding`,
        data: { name: name.trim(), trial_requested: true },
      },
    });
    setLoading(false);
    if (signupError) {
      setError(signupError.message.toLowerCase().includes("already registered")
        ? "Este e-mail já possui uma conta. Entre normalmente para continuar."
        : "Não foi possível criar sua conta agora. Tente novamente.");
      return;
    }
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }
    setSent(true);
  }

  return (
    <div className="login-wrap">
      <div style={{ position: "fixed", top: 16, right: 16 }}><ThemeToggle /></div>
      <div className="login-card">
        <div style={{ display: "flex", justifyContent: "center" }}><BrandLockup width={230} /></div>
        <h1 style={{ fontSize: 25, textAlign: "center", marginTop: 20 }}>Experimente grátis por 7 dias</h1>
        <p className="muted" style={{ textAlign: "center", fontSize: 14, marginTop: 8 }}>
          Sem cartão e sem cobrança automática. Os sete dias começam no seu primeiro acesso.
        </p>

        {sent ? (
          <div style={{ marginTop: 22 }}>
            <p className="auth-msg ok">Confira seu e-mail para confirmar a conta e começar o período gratuito.</p>
            <Link href="/login" className="btn primary" style={{ display: "block", textAlign: "center", marginTop: 16 }}>Ir para o login</Link>
          </div>
        ) : (
          <form onSubmit={submit} style={{ marginTop: 20 }}>
            <div className="field"><label htmlFor="trial-name">Nome</label><input id="trial-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required minLength={2} /></div>
            <div className="field"><label htmlFor="trial-email">E-mail</label><input id="trial-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div>
            <div className="field"><label htmlFor="trial-password">Crie uma senha</label><input id="trial-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required minLength={8} /><small className="muted">Mínimo de 8 caracteres, com maiúscula e caractere especial.</small></div>
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, margin: "16px 0" }}>
              <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} style={{ marginTop: 3 }} />
              <span>Li e aceito as <Link href="/termos-teste" target="_blank">condições do período gratuito</Link>. Sei que não haverá cobrança ao final sem minha confirmação.</span>
            </label>
            {error && <p className="auth-msg err" role="alert">{error}</p>}
            <button className="btn primary" style={{ width: "100%" }} disabled={loading}>{loading ? "Criando conta…" : "Começar meus 7 dias grátis →"}</button>
          </form>
        )}
        <p className="muted" style={{ textAlign: "center", fontSize: 13, marginTop: 18 }}>Já possui uma conta? <Link href="/login">Entrar</Link></p>
      </div>
    </div>
  );
}
