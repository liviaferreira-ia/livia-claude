import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/staff-server";
import { safeContentType, safeSpecialFileName, SPECIAL_BUCKET } from "@/lib/special-activities-server";

const MAX_SIZE = 20 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "png", "jpg", "jpeg", "webp", "mp3", "m4a", "wav", "mp4", "zip"]);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (session.error) return session.error;
  const { id } = await context.params;
  const admin = createAdminClient();
  const { data: activity } = await admin.from("special_activities").select("id").eq("id", id).maybeSingle();
  if (!activity) return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Selecione um arquivo." }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_SIZE) return NextResponse.json({ error: "O arquivo deve ter no máximo 20 MB." }, { status: 400 });
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(extension)) return NextResponse.json({ error: "Formato de arquivo não autorizado." }, { status: 400 });
  const storagePath = `activities/${id}/${safeSpecialFileName(file.name)}`;
  const contentType = safeContentType(extension);
  const upload = await admin.storage.from(SPECIAL_BUCKET).upload(storagePath, new Uint8Array(await file.arrayBuffer()), {
    contentType, upsert: false, cacheControl: "3600",
  });
  if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });
  const { data, error } = await admin.from("special_activity_assets").insert({
    activity_id: id, file_name: file.name.slice(0, 240), storage_path: storagePath,
    mime_type: contentType, file_size: file.size, asset_kind: "material", uploaded_by: session.user!.id,
  }).select("id").single();
  if (error) {
    await admin.storage.from(SPECIAL_BUCKET).remove([storagePath]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
