"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/BrandLockup";
import { loadMyTrial, type TrialSummary } from "@/lib/trial";
import { useProfile } from "@/lib/profile";

const TERMS_VERSION = "2026-08-15";
const WHATSAPP = "5511933779408";
const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Oi! Meu período gratuito da Central School terminou e preciso de ajuda para continuar.")}`;

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ContinuarPage() {
  const router = useRouter();
  const { signOut } = useProfile();
  const [trial, setTrial] = useState<TrialSummary | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const checkout = new URLSearchParams(window.location.search).get("checkout");
      if (checkout === "sucesso") setMessage("Pagamento enviado. Assim que o Asaas confirmar, seu acesso será liberado automaticamente.");
      if (checkout === "cancelado") setMessage("Pagamento cancelado. Nenhuma contratação foi concluída.");
      if (checkout === "expirado") setMessage("O link de pagamento expirou. Você pode gerar outro quando quiser.");
      void loadMyTrial().then((result) => { setTrial(result.trial); setError(result.error ?? ""); setLoading(false); });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function checkout() {
    setCreating(true);
    setError("");
    const response = await fetch("/api/trial/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accepted, termsVersion: TERMS_VERSION }),
    });
    const body = await response.json().catch(() => ({}));
    setCreating(false);
    if (!response.ok || typeof body.checkoutUrl !== "string") {
      setError(body.error || "Não foi possível abrir o pagamento agora.");
      return;
    }
    window.location.assign(body.checkoutUrl);
  }

  async function logout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="login-wrap">
      <div className="login-card" style={{ maxWidth: 520 }}>
        <div style={{ display: "flex", justifyContent: "center" }}><BrandLockup width={230} /></div>
        {loading ? <p className="muted" style={{ textAlign: "center", marginTop: 24 }}>Carregando…</p> : trial?.status === "converted" ? (
          <div style={{ textAlign: "center", marginTop: 24 }}><h1 style={{ fontSize: 25 }}>Sua assinatura está ativa</h1><p className="muted">Seu acesso já foi liberado.</p><Link href="/aluno" className="btn primary" style={{ display: "block", marginTop: 18 }}>Voltar aos estudos →</Link></div>
        ) : (
          <>
            <h1 style={{ fontSize: 25, textAlign: "center", marginTop: 22 }}>{trial?.status === "active" ? "Continue depois do período gratuito" : "Seu progresso está esperando por você"}</h1>
            <p className="muted" style={{ textAlign: "center", lineHeight: 1.6, marginTop: 10 }}>Assine para continuar estudando do ponto em que parou. Nada do que você fez durante o teste será perdido.</p>
            {trial?.monthlyPrice ? <div className="card" style={{ padding: 18, textAlign: "center", marginTop: 18 }}><div className="eyebrow">Assinatura mensal</div><strong style={{ display: "block", fontSize: 27, marginTop: 4 }}>{money(trial.monthlyPrice)}<small className="muted" style={{ fontSize: 13 }}>/mês</small></strong><span className="muted" style={{ fontSize: 13 }}>Renovação mensal. Cancele quando quiser.</span></div> : null}
            {message && <p className="auth-msg ok" role="status">{message}</p>}
            {error && <p className="auth-msg err" role="alert">{error}</p>}
            {trial?.checkoutUrl ? (
              <a href={trial.checkoutUrl} className="btn primary" style={{ display: "block", textAlign: "center", marginTop: 18 }}>Retomar pagamento seguro →</a>
            ) : trial?.monthlyPrice ? (
              <>
                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, margin: "18px 0" }}><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} style={{ marginTop: 3 }} /><span>Quero continuar e concordo com a assinatura mensal de <b>{money(trial.monthlyPrice)}</b>, cobrada pelo Asaas até o cancelamento.</span></label>
                <button className="btn primary" style={{ width: "100%" }} disabled={!accepted || creating} onClick={() => void checkout()}>{creating ? "Abrindo pagamento…" : "Quero continuar →"}</button>
              </>
            ) : <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn primary" style={{ display: "block", textAlign: "center", marginTop: 18 }}>Falar com a Central School →</a>}
            {trial?.status === "active" && <Link href="/aluno" className="btn ghost" style={{ display: "block", textAlign: "center", marginTop: 10 }}>Continuar no período gratuito</Link>}
            <button className="btn ghost" style={{ width: "100%", marginTop: 10 }} onClick={() => void logout()}>Sair da conta</button>
          </>
        )}
      </div>
    </div>
  );
}
