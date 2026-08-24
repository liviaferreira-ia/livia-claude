import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { effectiveSpecialStatus, signedSpecialAssets, SPECIAL_BUCKET } from "@/lib/special-activities-server";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  const { id } = await context.params;
  const admin = createAdminClient();
  const [{ data: recipient, error: recipientError }, { data: activity, error: activityError }, { data: submission, error: submissionError }] = await Promise.all([
    admin.from("special_activity_recipients").select("activity_id,student_id,assigned_at,viewed_at").eq("activity_id", id).eq("student_id", user.id).maybeSingle(),
    admin.from("special_activities").select("*").eq("id", id).maybeSingle(),
    admin.from("special_activity_submissions").select("*").eq("activity_id", id).eq("student_id", user.id).maybeSingle(),
  ]);
  if (recipientError || activityError || submissionError) return NextResponse.json({ error: (recipientError || activityError || submissionError)?.message }, { status: 500 });
  if (!recipient || !activity || activity.publication_status !== "published") return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });
  const status = effectiveSpecialStatus(activity);
  if (status === "scheduled" || status === "archived") return NextResponse.json({ error: "Esta atividade ainda não está disponível." }, { status: 403 });
  const now = new Date().toISOString();
  const { error: viewError } = await admin.from("special_activity_recipients").update({
    viewed_at: recipient.viewed_at ?? now, last_opened_at: now,
  }).eq("activity_id", id).eq("student_id", user.id);
  if (viewError) return NextResponse.json({ error: viewError.message }, { status: 500 });
  const { data: assets, error: assetError } = await admin.from("special_activity_assets").select("*").eq("activity_id", id).order("created_at");
  if (assetError) return NextResponse.json({ error: assetError.message }, { status: 500 });
  let submissionWithVersions = null;
  if (submission) {
    const { data: versions, error: versionsError } = await admin.from("special_activity_submission_versions").select("*").eq("submission_id", submission.id).order("version_number", { ascending: false });
    if (versionsError) return NextResponse.json({ error: versionsError.message }, { status: 500 });
    const signedVersions = await Promise.all((versions ?? []).map(async (version) => {
      const signed = await admin.storage.from(SPECIAL_BUCKET).createSignedUrl(version.storage_path, 3600);
      return { ...version, signed_url: signed.data?.signedUrl ?? null };
    }));
    submissionWithVersions = { ...submission, versions: signedVersions };
  }
  return NextResponse.json({ activity: {
    ...activity,
    effective_status: status,
    targets: { mode: "students", levels: [], studentIds: [] },
    assets: await signedSpecialAssets(admin, assets ?? []),
    metrics: { recipients: 0, viewed: 0, submissions: 0 },
    student_state: { assigned_at: recipient.assigned_at, viewed_at: recipient.viewed_at ?? now, is_new: false, submission: submissionWithVersions },
  } });
}
