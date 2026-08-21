"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { BrandLockup } from "@/components/BrandLockup";
import { createClient } from "@/lib/supabase/client";

export default function DefinirSenhaPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState<{ token_hash: string; type: EmailOtpType } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reqs = [
    { label: "Mínimo 8 caracteres", ok: password.length >= 8 },
    { label: "Uma letra minúscula", ok: /[a-z]/.test(password) },
    { label: "Uma letra maiúscula", ok: /[A-Z]/.test(password) },
    { label: "Um número", ok: /[0-9]/.test(password) },
    { label: "Um caractere especial (ex: ! @ # $ %)", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const strengthScore = reqs.filter((requirement) => requirement.ok).length;
  const strength = password.length === 0
    ? { label: "Digite uma senha", className: "empty" }
    : strengthScore <= 2
      ? { label: "Senha fraca", className: "weak" }
      : strengthScore <= 4
        ? { label: "Senha média", className: "medium" }
        : { label: "Senha forte", className: "strong" };
  const passwordValid = reqs.every((r) => r.ok);

  // O link do convite entrega a sessão via #access_token/#refresh_token na URL
  // (fluxo antigo, "implicit") — mas o cliente do navegador (@supabase/ssr) é
  // configurado pro fluxo novo (PKCE, ?code=) e não detecta esse formato
  // sozinho. Por isso extraímos os tokens do hash na mão e chamamos
  // setSession() explicitamente, em vez de confiar em detecção automática.
  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.hash.slice(1));

    if (params.get("error")) {
      const timer = window.setTimeout(() => {
        setLinkError(params.get("error_description")?.replace(/\+/g, " ") || "Link inválido ou expirado.");
        setChecking(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(({ data, error }) => {
        setSessionReady(!!data.session && !error);
        setChecking(false);
      });
      return;
    }

    // Formato novo do link (?token_hash=...&type=...), pra parar de expor o
    // link cru do Supabase (auth/v1/verify) direto no e-mail — aquele link
    // faz o próprio GET já confirmar o convite, então qualquer prévia
    // automática (WhatsApp, scanner de segurança de e-mail corporativo,
    // pré-carregamento de imagem/link do cliente de e-mail) que só "abrir"
    // a URL pra gerar thumbnail já queima o token antes do aluno clicar de
    // verdade — o que combina exatamente com "link inválido" mesmo em
    // convite recém-criado. Por isso aqui só guardamos o token e exigimos um
    // clique de verdade da pessoa (handleConfirmInvite) antes de confirmar.
    const search = new URLSearchParams(window.location.search);
    const token_hash = search.get("token_hash");
    const type = search.get("type") as EmailOtpType | null;
    if (token_hash && type) {
      const timer = window.setTimeout(() => {
        setPendingConfirm({ token_hash, type });
        setChecking(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    // Sem token no hash nem na query (ex: página recarregada) — checa se já tem sessão salva.
    supabase.auth.getSession().then(({ data }) => {
      setSessionReady(!!data.session);
      setChecking(false);
    });
  }, []);

  async function handleConfirmInvite() {
    if (!pendingConfirm) return;
    setConfirming(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp(pendingConfirm);
    setConfirming(false);
    if (error || !data.session) {
      setLinkError("Esse link de convite não é válido ou já expirou.");
      setPendingConfirm(null);
      return;
    }
    setSessionReady(true);
    setPendingConfirm(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!passwordValid) {
      setError("A senha precisa atender todos os requisitos abaixo.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError("Não consegui salvar a senha. Peça um novo convite ao professor.");
      return;
    }
    router.push(data.user?.user_metadata?.onboarded === true ? "/aluno" : "/onboarding");
    router.refresh();
  }

  if (checking) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <p className="muted">Carregando…</p>
        </div>
      </div>
    );
  }

  if (pendingConfirm) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <BrandLockup width={230} />
          </div>
          <p className="muted" style={{ fontSize: 14, marginTop: 16, textAlign: "center" }}>
            Bem-vindo(a) à Central School! Toque no botão abaixo pra confirmar seu convite
            e definir sua senha.
          </p>
          <button
            type="button"
            className="btn primary"
            style={{ width: "100%", marginTop: 16, opacity: confirming ? 0.6 : 1 }}
            onClick={handleConfirmInvite}
            disabled={confirming}
          >
            {confirming ? "Confirmando…" : "Confirmar convite →"}
          </button>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <BrandLockup width={230} />
          </div>
          <p className="auth-msg err" style={{ marginTop: 16 }}>
            {linkError || "Esse link de convite não é válido ou já expirou."}
          </p>
          <p className="muted" style={{ fontSize: 13, marginTop: 12, textAlign: "center" }}>
            Peça pro professor enviar um novo convite.
          </p>
          <p className="est-note" style={{ marginTop: 12, textAlign: "center" }}>
            <Link href="/login" style={{ color: "var(--navy)", fontWeight: 700 }}>
              ← Ir pro login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BrandLockup width={230} />
        </div>
        <p className="muted" style={{ fontSize: 14, marginTop: 16 }}>
          Bem-vindo(a) à Central School! Defina sua senha pra começar.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <div className="field">
            <label htmlFor="senha">Nova senha</label>
            <div className="pw-wrap">
              <input
                id="senha"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPassword((v) => !v)}
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
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <div className="pw-strength" aria-live="polite">
              <div className={`pw-strength-bar ${strength.className}`}>
                <span style={{ width: `${password.length === 0 ? 0 : Math.max(20, strengthScore * 20)}%` }} />
              </div>
              <span>{strength.label}</span>
            </div>
            <ul className="pw-checklist">
              {reqs.map((r) => (
                <li key={r.label} className={r.ok ? "ok" : undefined}>
                  {r.ok ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  )}
                  {r.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="field">
            <label htmlFor="confirmar">Confirmar senha</label>
            <div className="pw-wrap">
              <input
                id="confirmar"
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Digite de novo"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {error && <p className="auth-msg err">{error}</p>}

          <button
            type="submit"
            className="btn primary"
            style={{ width: "100%", marginTop: 8, opacity: loading ? 0.6 : 1 }}
            disabled={loading}
          >
            {loading ? "Salvando…" : "Salvar e continuar →"}
          </button>
        </form>
      </div>
    </div>
  );
}
