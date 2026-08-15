import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trialDaysRemaining, type TrialStatus } from "@/lib/trial";
import { trialMonthlyPrice } from "@/lib/trial-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });

  await supabase.rpc("activate_my_trial");
  const { data, error } = await supabase
    .from("student_trials")
    .select("status,starts_at,ends_at,checkout_url")
    .eq("student_id", user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Não consegui consultar seu período gratuito." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Esta conta não possui período gratuito." }, { status: 404 });

  const daysRemaining = trialDaysRemaining(data.ends_at);
  const effectiveStatus: TrialStatus =
    data.status === "active" && daysRemaining === 0 ? "expired" : data.status as TrialStatus;
  return NextResponse.json({
    trial: {
      status: effectiveStatus,
      startsAt: data.starts_at,
      endsAt: data.ends_at,
      daysRemaining,
      checkoutUrl: data.checkout_url,
      monthlyPrice: trialMonthlyPrice(),
    },
  });
}
