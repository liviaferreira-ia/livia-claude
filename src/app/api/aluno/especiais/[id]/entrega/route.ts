import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { effectiveSpecialStatus, safeSpecialFileName, SPECIAL_BUCKET } from "@/lib/special-activities-server";

const FORMAT_EXTENSIONS: Record<string, string[]> = {
  pdf: ["pdf"], docx: ["doc", "docx"], image: ["jpg", "jpeg", "png", "webp", "gif"],
  audio: ["mp3", "m4a", "wav", "ogg"], video: ["mp4", "mov", "webm"],
  presentation: ["ppt", "pptx"], zip: ["zip"],
};

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  const { id } = await context.params;
  const admin = createAdminClient();
  const [{ data: recipient }, { data: activity, error: activityError }] = await Promise.all([
    admin.from("special_activity_recipients").select("activity_id").eq("activity_id", id).eq("student_id", user.id).maybeSingle(),
    admin.from("special_activities").select("*").eq("id", id).maybeSingle(),
  ]);
  if (activityError) return NextResponse.json({ error: activityError.message }, { status: 500 });
  if (!recipient || !activity || activity.publication_status !== "published") return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });
  if (!activity.requires_submission) return NextResponse.json({ error: "Esta atividade não exige entrega." }, { status: 400 });
  if (effectiveSpecialStatus(activity) !== "available") return NextResponse.json({ error: "O prazo desta atividade não está aberto." }, { status: 409 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Selecione um arquivo para enviar." }, { status: 400 });
  const maxBytes = Number(activity.max_file_mb || 20) * 1024 * 1024;
  if (file.size > maxBytes) return NextResponse.json({ error: `O arquivo ultrapassa o limite de ${activity.max_file_mb || 20} MB.` }, { status: 413 });
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const allowed = (activity.allowed_formats ?? []).some((format: string) => FORMAT_EXTENSIONS[format]?.includes(extension));
  if (!allowed) return NextResponse.json({ error: "Este formato de arquivo não é aceito nesta atividade." }, { status: 415 });

  const { data: existing, error: existingError } = await admin.from("special_activity_submissions")
    .select("id").eq("activity_id", id).eq("student_id", user.id).maybeSingle();
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
  if (existing && !activity.allow_replacement) return NextResponse.json({ error: "Esta atividade não permite substituir a entrega." }, { status: 409 });

  let submissionId = existing?.id as string | undefined;
  let createdSubmission = false;
  if (!submissionId) {
    const created = await admin.from("special_activity_submissions").insert({ activity_id: id, student_id: user.id }).select("id").single();
    if (created.error) return NextResponse.json({ error: created.error.message }, { status: 500 });
    submissionId = created.data.id;
    createdSubmission = true;
  }
  const { data: lastVersion, error: versionError } = await admin.from("special_activity_submission_versions")
    .select("version_number").eq("submission_id", submissionId).order("version_number", { ascending: false }).limit(1).maybeSingle();
  if (versionError) return NextResponse.json({ error: versionError.message }, { status: 500 });
  const versionNumber = Number(lastVersion?.version_number ?? 0) + 1;
  const storagePath = `submissions/${id}/${user.id}/${safeSpecialFileName(file.name)}`;
  const uploaded = await admin.storage.from(SPECIAL_BUCKET).upload(storagePath, new Uint8Array(await file.arrayBuffer()), { contentType: file.type || "application/octet-stream", upsert: false });
  if (uploaded.error) {
    if (createdSubmission) await admin.from("special_activity_submissions").delete().eq("id", submissionId);
    return NextResponse.json({ error: uploaded.error.message }, { status: 500 });
  }
  const inserted = await admin.from("special_activity_submission_versions").insert({
    submission_id: submissionId, version_number: versionNumber, file_name: file.name.slice(0, 180),
    storage_path: storagePath, mime_type: file.type || null, file_size: file.size,
  });
  if (inserted.error) {
    await admin.storage.from(SPECIAL_BUCKET).remove([storagePath]);
    if (createdSubmission) await admin.from("special_activity_submissions").delete().eq("id", submissionId);
    return NextResponse.json({ error: inserted.error.message }, { status: 500 });
  }
  const submittedAt = new Date().toISOString();
  const updated = await admin.from("special_activity_submissions").update({
    status: "submitted", correction_status: "not_reviewed", submitted_at: submittedAt,
  }).eq("id", submissionId);
  if (updated.error) return NextResponse.json({ error: updated.error.message }, { status: 500 });
  return NextResponse.json({ submission: {
    id: submissionId, status: "submitted", correction_status: "not_reviewed", feedback: null,
    submitted_at: submittedAt, versions: [{ version_number: versionNumber, file_name: file.name, file_size: file.size, mime_type: file.type || null, created_at: submittedAt }],
  } });
}
