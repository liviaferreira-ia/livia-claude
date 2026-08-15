import { NextResponse } from "next/server";
import { LEVEL_ORDER, type CefrLevel } from "@/data/placement";
import { recordAudit } from "@/lib/operational-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function teacher() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "teacher") return { error: NextResponse.json({ error: "Área exclusiva do professor." }, { status: 403 }) };
  return { user };
}

export async function GET() {
  const session = await teacher();
  if (session.error) return session.error;
  const admin = createAdminClient();
  const { data, error } = await admin.from("content_validations").select("*").order("level");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const validatorIds = [...new Set((data ?? []).map((item) => item.validated_by).filter((id): id is string => Boolean(id)))];
  const validatorEntries = await Promise.all(validatorIds.map(async (id) => {
    const { data: result } = await admin.auth.admin.getUserById(id);
    const name = typeof result.user?.user_metadata?.name === "string" ? result.user.user_metadata.name : result.user?.email ?? null;
    return [id, name] as const;
  }));
  const validatorNames = new Map(validatorEntries);
  const rows = [...(data ?? [])]
    .sort((a, b) => LEVEL_ORDER.indexOf(a.level as CefrLevel) - LEVEL_ORDER.indexOf(b.level as CefrLevel))
    .map((item) => ({ ...item, validator_name: item.validated_by ? validatorNames.get(item.validated_by) ?? null : null }));
  return NextResponse.json({ validations: rows });
}

export async function PATCH(request: Request) {
  const session = await teacher();
  if (session.error) return session.error;
  const body = await request.json().catch(() => null);
  const level = typeof body?.level === "string" && (LEVEL_ORDER as string[]).includes(body.level) ? body.level as CefrLevel : null;
  const validated = typeof body?.validated === "boolean" ? body.validated : null;
  const hasNote = typeof body?.note === "string";
  const note = hasNote ? body.note.trim().slice(0, 2000) : null;
  if (!level || validated === null) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const admin = createAdminClient();
  const changes: {
    validated: boolean;
    validated_by: string | null;
    validated_at: string | null;
    updated_at: string;
    note?: string | null;
  } = {
    validated,
    validated_by: validated ? session.user!.id : null,
    validated_at: validated ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  if (hasNote) changes.note = note || null;

  const { data, error } = await admin.from("content_validations")
    .update(changes)
    .eq("level", level)
    .select("level, validated, validated_at, note, updated_at")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Nível não encontrado." }, { status: 404 });
  await recordAudit(session.user!.id, null, "content_validation_changed", { level, validated });
  return NextResponse.json({ ok: true, validation: data });
}
