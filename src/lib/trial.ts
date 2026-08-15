export type TrialStatus = "pending" | "active" | "checkout_pending" | "converted" | "expired" | "cancelled";

export type TrialSummary = {
  status: TrialStatus;
  startsAt: string | null;
  endsAt: string | null;
  daysRemaining: number | null;
  checkoutUrl: string | null;
  monthlyPrice: number | null;
};

export function trialDaysRemaining(endsAt: string | null, now = Date.now()): number | null {
  if (!endsAt) return null;
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - now) / 86_400_000));
}

export async function loadMyTrial(): Promise<{ trial: TrialSummary | null; error: string | null }> {
  const response = await fetch("/api/trial/status", { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (response.status === 404) return { trial: null, error: null };
  if (!response.ok) return { trial: null, error: body.error || "Não consegui consultar seu período gratuito." };
  return { trial: body.trial as TrialSummary, error: null };
}
