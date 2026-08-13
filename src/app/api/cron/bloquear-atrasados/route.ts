import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DIAS_DE_TOLERANCIA = 5;

/**
 * Bloqueia quem está atrasado há mais de 5 dias. Feito pra ser chamado uma vez
 * por dia por um cron job do servidor (DirectAdmin → Cron Jobs), não pelo navegador.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret") ?? request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - DIAS_DE_TOLERANCIA * 86_400_000).toISOString();

  const { data, error } = await admin
    .from("student_activity")
    .update({ blocked: true, updated_at: new Date().toISOString() })
    .eq("payment_status", "overdue")
    .eq("blocked", false)
    .lt("overdue_since", cutoff)
    .select("user_id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: expired } = await admin
    .from("student_settings")
    .select("student_id")
    .not("access_expires_on", "is", null)
    .lt("access_expires_on", today);
  const expiredIds = (expired ?? []).map((x) => x.student_id);
  let expiredBlocked = 0;
  if (expiredIds.length > 0) {
    const { data: blockedExpired, error: expiredError } = await admin
      .from("student_activity")
      .update({ blocked: true, manual_block: true, updated_at: new Date().toISOString() })
      .in("user_id", expiredIds)
      .eq("blocked", false)
      .select("user_id");
    if (expiredError) return NextResponse.json({ error: expiredError.message }, { status: 500 });
    expiredBlocked = blockedExpired?.length ?? 0;
  }

  return NextResponse.json({ blocked: data?.length ?? 0, expiredBlocked });
}
