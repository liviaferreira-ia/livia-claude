"use client";

import { useRouter } from "next/navigation";
import { BrandLockup } from "@/components/BrandLockup";
import { useProfile } from "@/lib/profile";

// Mesmo número placeholder usado na landing page (src/app/page.tsx) — troque os dois juntos.
const WHATSAPP = "5599999999999";
const WA_MSG = "Oi! Meu acesso à plataforma da Central School está pausado e queria resolver.";
const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WA_MSG)}`;

export default function PagamentoPendentePage() {
  const router = useRouter();
  const { signOut } = useProfile();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BrandLockup width={230} />
        </div>
        <p style={{ fontSize: 18, fontWeight: 800, marginTop: 20, textAlign: "center" }}>
          Acesso pausado
        </p>
        <p className="muted" style={{ fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 1.6 }}>
          Seu acesso à plataforma está temporariamente pausado. Se for questão de mensalidade em
          atraso, ele volta sozinho assim que o pagamento for confirmado. Qualquer outra situação, é
          só falar com a gente que resolvemos rapidinho.
        </p>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn primary"
          style={{ width: "100%", marginTop: 20, textAlign: "center" }}
        >
          Falar com a Central School →
        </a>
        <button
          className="btn ghost"
          style={{ width: "100%", marginTop: 10 }}
          onClick={handleSignOut}
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}
