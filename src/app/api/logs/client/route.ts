import { NextResponse } from "next/server";
import { recordIncident } from "@/lib/operational-server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.message !== "string") return NextResponse.json({ ok: false }, { status: 400 });

  const minuteAgo = new Date(Date.now() - 60_000).toISOString();
  const admin = createAdminClient();
  const { count } = await admin.from("app_incidents").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("last_seen_at", minuteAgo);
  if ((count ?? 0) >= 10) return NextResponse.json({ ok: false }, { status: 429 });

  const traceCode = await recordIncident({
    userId: user.id,
    source: "client",
    area: typeof body.area === "string" ? body.area : "interface",
    action: typeof body.action === "string" ? body.action : null,
    message: body.message,
    metadata: {
      path: typeof body.path === "string" ? body.path : null,
      digest: typeof body.digest === "string" ? body.digest : null,
      details: typeof body.details === "string" ? body.details : null,
      browser: request.headers.get("user-agent"),
    },
  });
  return NextResponse.json({ ok: true, traceCode });
}
