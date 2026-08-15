import { NextResponse } from "next/server";
import { createRecurringCheckout } from "@/lib/asaas";
import { recordIncident } from "@/lib/operational-server";
import { SITE_URL } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { trialMonthlyPrice, trialPlanName } from "@/lib/trial-server";

const TERMS_VERSION = "2026-08-15";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (body?.accepted !== true || body?.termsVersion !== TERMS_VERSION) {
    return NextResponse.json({ error: "Confirme as condições da assinatura para continuar." }, { status: 400 });
  }

  const price = trialMonthlyPrice();
  if (!price) {
    return NextResponse.json({ error: "O plano mensal ainda não foi configurado. Fale com a Central School." }, { status: 503 });
  }

  const admin = createAdminClient();
  const { data: trial, error: trialError } = await admin
    .from("student_trials")
    .select("status,checkout_url,checkout_created_at")
    .eq("student_id", user.id)
    .maybeSingle();
  if (trialError) return NextResponse.json({ error: "Não consegui consultar seu período gratuito." }, { status: 500 });
  if (!trial) return NextResponse.json({ error: "Esta conta não possui período gratuito." }, { status: 404 });
  if (trial.status === "converted") return NextResponse.json({ error: "Sua assinatura já está ativa." }, { status: 409 });
  if (trial.status === "cancelled") return NextResponse.json({ error: "Este período gratuito foi cancelado." }, { status: 409 });

  const checkoutAge = trial.checkout_created_at ? Date.now() - new Date(trial.checkout_created_at).getTime() : Infinity;
  if (trial.checkout_url && checkoutAge < 25 * 60 * 60 * 1000) {
    return NextResponse.json({ checkoutUrl: trial.checkout_url });
  }
  if (trial.checkout_url) {
    await admin.from("student_trials").update({
      checkout_id: null,
      checkout_url: null,
      checkout_created_at: null,
      updated_at: new Date().toISOString(),
    }).eq("student_id", user.id).neq("status", "converted");
  }

  const { data: claimed, error: claimError } = await admin.rpc("claim_trial_checkout", { p_student_id: user.id });
  if (claimError) return NextResponse.json({ error: "Não consegui preparar o pagamento agora." }, { status: 500 });
  if (!claimed) return NextResponse.json({ error: "O pagamento já está sendo preparado. Aguarde um instante e tente novamente." }, { status: 409 });

  try {
    const checkout = await createRecurringCheckout({
      externalReference: `central-trial:${user.id}`,
      itemName: trialPlanName(),
      itemDescription: "Assinatura mensal após período gratuito. Cancele quando quiser.",
      value: price,
      successUrl: `${SITE_URL}/continuar?checkout=sucesso`,
      cancelUrl: `${SITE_URL}/continuar?checkout=cancelado`,
      expiredUrl: `${SITE_URL}/continuar?checkout=expirado`,
    });
    if (!checkout.link) throw new Error("Asaas: checkout criado sem URL de pagamento.");

    const now = new Date().toISOString();
    const { error } = await admin.from("student_trials").update({
      status: "checkout_pending",
      checkout_id: checkout.id,
      checkout_url: checkout.link,
      checkout_created_at: now,
      conversion_requested_at: now,
      updated_at: now,
    }).eq("student_id", user.id);
    if (error) throw new Error(`Não foi possível salvar o checkout: ${error.message}`);
    return NextResponse.json({ checkoutUrl: checkout.link });
  } catch (error) {
    const now = new Date();
    await admin.from("student_trials").update({
      status: trial.status === "pending" ? "pending" : "active",
      checkout_created_at: null,
      updated_at: now.toISOString(),
    }).eq("student_id", user.id).is("checkout_url", null).neq("status", "converted");
    const trace = await recordIncident({
      userId: user.id,
      source: "server",
      area: "trial/checkout",
      action: "create_checkout",
      severity: "error",
      message: error instanceof Error ? error.message : "Erro criando checkout do período gratuito",
    });
    return NextResponse.json({ error: "Não foi possível abrir o pagamento agora. Tente novamente.", trace }, { status: 502 });
  }
}
