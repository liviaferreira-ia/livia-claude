"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { createClient } from "@/lib/supabase/client";

export default function DefinirSenhaPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [linkError, setLinkError] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // O link do convite entrega a sessão via #access_token/#refresh_token na URL
  // (fluxo antigo, "implicit") — mas o cliente do navegador (@supabase/ssr) é
  // configurado pro fluxo novo (PKCE, ?code=) e não detecta esse formato
  // sozinho. Por isso extraímos os tokens do hash na mão e chamamos
  // setSession() explicitamente, em vez de confiar em detecção automática.
  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.hash.slice(1));

    if (params.get("error")) {
      setLinkError(params.get("error_description")?.replace(/\+/g, " ") || "Link inválido ou expirado.");
      setChecking(false);
      return;
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

    // Sem token no hash (ex: página recarregada) — checa se já tem sessão salva.
    supabase.auth.getSession().then(({ data }) => {
      setSessionReady(!!data.session);
      setChecking(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("A senha precisa de pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError("Não consegui salvar a senha. Peça um novo convite ao professor.");
      return;
    }
    router.push("/onboarding");
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
            <input
              id="senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="confirmar">Confirmar senha</label>
            <input
              id="confirmar"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Digite de novo"
              autoComplete="new-password"
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
            {loading ? "Salvando…" : "Salvar e continuar →"}
          </button>
        </form>
      </div>
    </div>
  );
}
