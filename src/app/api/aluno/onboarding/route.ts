import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Salva a meta semanal escolhida pelo aluno no onboarding (aluno não tem permissão de escrita direta em student_settings). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const weeklyGoal = Math.max(1, Math.min(7, Number(body?.weekly_goal) || 3));

  const admin = createAdminClient();
  const { error } = await admin
    .from("student_settings")
    .upsert({ student_id: user.id, weekly_goal: weeklyGoal, updated_at: new Date().toISOString() }, { onConflict: "student_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
