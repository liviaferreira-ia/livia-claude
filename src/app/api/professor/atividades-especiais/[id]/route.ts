import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/staff-server";
import {
  SPECIAL_BUCKET,
  assembleSpecialActivities,
  assignSpecialRecipients,
  loadSpecialActivityCollections,
  normalizeSpecialPayload,
  replaceSpecialTargets,
  signedSpecialAssets,
  targetsFromRows,
} from "@/lib/special-activities-server";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const session = await requireStaff();
  if (session.error) return session.error;
  const { id } = await context.params;
  try {
    const admin = createAdminClient();
    const collections = await loadSpecialActivityCollections(admin);
    const activity = assembleSpecialActivities(collections).find((item) => item.id === id);
    if (!activity) return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });
    const signedAssets = await signedSpecialAssets(admin, activity.assets);
    const { data: submissions, error: submissionError } = await admin.from("special_activity_submissions").select("*").eq("activity_id", id);
    if (submissionError) throw submissionError;
    const submissionIds = (submissions ?? []).map((submission) => submission.id);
    const versionsResult = submissionIds.length
      ? await admin.from("special_activity_submission_versions").select("*").in("submission_id", submissionIds).order("version_number", { ascending: false })
      : { data: [], error: null };
    if (versionsResult.error) throw versionsResult.error;
    const signedVersions = await Promise.all((versionsResult.data ?? []).map(async (version) => {
      const signed = await admin.storage.from(SPECIAL_BUCKET).createSignedUrl(version.storage_path, 3600);
      return { ...version, signed_url: signed.data?.signedUrl ?? null };
    }));
    const studentMap = new Map(collections.students.map((student) => [student.user_id, student]));
    const recipientStates = collections.recipients.filter((recipient) => recipient.activity_id === id).map((recipient) => {
      const student = studentMap.get(recipient.student_id);
      const submission = (submissions ?? []).find((item) => item.student_id === recipient.student_id);
      return {
        ...recipient,
        student_name: student?.student_name ?? null,
        level: student?.level ?? null,
        submission: submission ? { ...submission, versions: signedVersions.filter((version) => version.submission_id === submission.id) } : null,
      };
    });
    return NextResponse.json({ activity: { ...activity, assets: signedAssets, recipient_states: recipientStates }, students: collections.students });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível carregar a atividade." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: Context) {
  const session = await requireStaff();
  if (session.error) return session.error;
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const action = typeof body.action === "string" ? body.action : "save";
  const admin = createAdminClient();
  const { data: current, error: currentError } = await admin.from("special_activities").select("*").eq("id", id).maybeSingle();
  if (currentError) return NextResponse.json({ error: currentError.message }, { status: 500 });
  if (!current) return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });

  try {
    if (action === "save") {
      const normalized = normalizeSpecialPayload(body as Record<string, unknown>);
      const { error } = await admin.from("special_activities").update({ ...normalized.values, updated_by: session.user!.id }).eq("id", id);
      if (error) throw error;
      await replaceSpecialTargets(admin, id, normalized.targets);
      if (current.publication_status === "published") await assignSpecialRecipients(admin, id, normalized.targets);
      return NextResponse.json({ ok: true });
    }

    if (action === "publish") {
      const { data: targetRows, error: targetError } = await admin.from("special_activity_targets").select("activity_id,target_type,target_value").eq("activity_id", id);
      if (targetError) throw targetError;
      const targets = targetsFromRows(targetRows ?? []);
      const recipients = await assignSpecialRecipients(admin, id, targets);
      const { error } = await admin.from("special_activities").update({
        publication_status: "published", published_at: current.published_at ?? new Date().toISOString(),
        archived_at: null, updated_by: session.user!.id, updated_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
      return NextResponse.json({ ok: true, recipients });
    }

    if (action === "archive" || action === "restore") {
      const { error } = await admin.from("special_activities").update(action === "archive" ? {
        publication_status: "archived", archived_at: new Date().toISOString(), updated_by: session.user!.id, updated_at: new Date().toISOString(),
      } : {
        publication_status: "draft", archived_at: null, updated_by: session.user!.id, updated_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "duplicate") {
      const { id: _oldId, created_at: _createdAt, updated_at: _updatedAt, published_at: _publishedAt, archived_at: _archivedAt, ...copy } = current;
      void _oldId; void _createdAt; void _updatedAt; void _publishedAt; void _archivedAt;
      const { data: created, error } = await admin.from("special_activities").insert({
        ...copy, title: `${current.title} — cópia`, publication_status: "draft", starts_at: null, ends_at: null,
        duplicated_from: id, created_by: session.user!.id, updated_by: session.user!.id,
      }).select("id").single();
      if (error) throw error;
      const { data: targets } = await admin.from("special_activity_targets").select("target_type,target_value").eq("activity_id", id);
      if (targets?.length) await admin.from("special_activity_targets").insert(targets.map((target) => ({ ...target, activity_id: created.id })));
      const { data: assets } = await admin.from("special_activity_assets").select("*").eq("activity_id", id);
      for (const asset of assets ?? []) {
        const destination = `activities/${created.id}/${randomUUID()}-${asset.file_name.replace(/[^a-zA-Z0-9._-]+/g, "-")}`;
        const copied = await admin.storage.from(SPECIAL_BUCKET).copy(asset.storage_path, destination);
        if (!copied.error) await admin.from("special_activity_assets").insert({
          activity_id: created.id, file_name: asset.file_name, storage_path: destination,
          mime_type: asset.mime_type, file_size: asset.file_size, asset_kind: asset.asset_kind, uploaded_by: session.user!.id,
        });
      }
      return NextResponse.json({ id: created.id });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível atualizar a atividade." }, { status: 400 });
  }
}

export async function POST(request: Request, context: Context) {
  const session = await requireStaff();
  if (session.error) return session.error;
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (body?.action !== "delete_asset" || typeof body.asset_id !== "string") return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  const admin = createAdminClient();
  const { data: asset, error } = await admin.from("special_activity_assets").select("id,storage_path").eq("id", body.asset_id).eq("activity_id", id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!asset) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  const removed = await admin.storage.from(SPECIAL_BUCKET).remove([asset.storage_path]);
  if (removed.error) return NextResponse.json({ error: removed.error.message }, { status: 500 });
  const deleted = await admin.from("special_activity_assets").delete().eq("id", asset.id);
  if (deleted.error) return NextResponse.json({ error: deleted.error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: Context) {
  const session = await requireStaff();
  if (session.error) return session.error;
  const { id } = await context.params;
  const admin = createAdminClient();
  const [{ count: views }, { count: submissions }, { data: assets }] = await Promise.all([
    admin.from("special_activity_recipients").select("activity_id", { count: "exact", head: true }).eq("activity_id", id).not("viewed_at", "is", null),
    admin.from("special_activity_submissions").select("id", { count: "exact", head: true }).eq("activity_id", id),
    admin.from("special_activity_assets").select("storage_path").eq("activity_id", id),
  ]);
  if ((views ?? 0) > 0 || (submissions ?? 0) > 0) return NextResponse.json({ error: "Esta atividade já possui histórico. Arquive em vez de excluir." }, { status: 409 });
  if (assets?.length) await admin.storage.from(SPECIAL_BUCKET).remove(assets.map((asset) => asset.storage_path));
  const { error } = await admin.from("special_activities").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
