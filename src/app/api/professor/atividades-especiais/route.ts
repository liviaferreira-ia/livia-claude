import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/staff-server";
import {
  assembleSpecialActivities,
  loadSpecialActivityCollections,
  normalizeSpecialPayload,
  replaceSpecialTargets,
} from "@/lib/special-activities-server";

export async function GET() {
  const session = await requireStaff();
  if (session.error) return session.error;
  try {
    const collections = await loadSpecialActivityCollections(createAdminClient());
    return NextResponse.json({ activities: assembleSpecialActivities(collections), students: collections.students });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível carregar as atividades." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireStaff();
  if (session.error) return session.error;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const admin = createAdminClient();
  let activityId: string | null = null;
  try {
    const normalized = normalizeSpecialPayload(body as Record<string, unknown>);
    const { data, error } = await admin.from("special_activities").insert({
      ...normalized.values,
      publication_status: "draft",
      created_by: session.user!.id,
      updated_by: session.user!.id,
    }).select("id").single();
    if (error) throw error;
    if (!data?.id) throw new Error("A atividade foi criada sem um identificador válido.");
    activityId = data.id;
    await replaceSpecialTargets(admin, data.id, normalized.targets);
    return NextResponse.json({ id: activityId }, { status: 201 });
  } catch (error) {
    if (activityId) await admin.from("special_activities").delete().eq("id", activityId);
    const message = error instanceof Error ? error.message : "Não foi possível criar a atividade.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
