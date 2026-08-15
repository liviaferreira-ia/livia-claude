"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadMyTrial, type TrialSummary } from "@/lib/trial";

export function TrialBanner() {
  const [trial, setTrial] = useState<TrialSummary | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMyTrial().then((result) => setTrial(result.trial)), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!trial || trial.status !== "active" || trial.daysRemaining === null || trial.daysRemaining > 3) return null;
  const label = trial.daysRemaining === 1 ? "Seu período gratuito termina amanhã." : `Restam ${trial.daysRemaining} dias do seu período gratuito.`;
  return (
    <div className="objbar" role="status" style={{ margin: "18px 34px 0", flexWrap: "wrap" }}>
      <div style={{ flex: 1 }}><b>{label}</b><div className="muted" style={{ fontSize: 13 }}>Seu progresso ficará salvo mesmo se você decidir continuar depois.</div></div>
      <Link href="/continuar" className="pill-btn">Conhecer a assinatura →</Link>
    </div>
  );
}
