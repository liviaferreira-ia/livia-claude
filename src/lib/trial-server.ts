import "server-only";

export function trialMonthlyPrice(): number | null {
  const raw = process.env.TRIAL_MONTHLY_PRICE?.trim().replace(",", ".");
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null;
}

export function trialPlanName(): string {
  return process.env.TRIAL_PLAN_NAME?.trim() || "Acesso digital Central School";
}
