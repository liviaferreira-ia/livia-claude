"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { createClient } from "@/lib/supabase/client";

export default function DefinirSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
