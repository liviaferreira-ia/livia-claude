import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { effectiveSpecialStatus } from "@/lib/special-activities-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  const admin = createAdminClient();
  const { data: recipients, error: recipientError } = await admin.from("special_activity_recipients")
    .select("activity_id,assigned_at,viewed_at").eq("student_id", user.id).order("assigned_at", { ascending: false });
  if (recipientError) return NextResponse.json({ error: recipientError.message }, { status: 500 });
  const ids = (recipients ?? []).map((row) => row.activity_id);
  if (!ids.length) return NextResponse.json({ current: [], history: [], unseenCount: 0 });
  const [{ data: activities, error }, { data: assets }, { data: submissions, error: submissionsError }] = await Promise.all([
    admin.from("special_activities").select("*").in("id", ids).eq("publication_status", "published"),
    admin.from("special_activity_assets").select("id,activity_id,file_name,mime_type,file_size,asset_kind,created_at,storage_path").in("activity_id", ids),
    admin.from("special_activity_submissions").select("id,activity_id,status,correction_status,feedback,submitted_at").in("activity_id", ids).eq("student_id", user.id),
  ]);
  if (error || submissionsError) return NextResponse.json({ error: (error || submissionsError)?.message }, { status: 500 });
  const recipientMap = new Map((recipients ?? []).map((row) => [row.activity_id, row]));
  const rows = (activities ?? []).map((activity) => {
    const recipient = recipientMap.get(activity.id)!;
    return {
      ...activity,
      effective_status: effectiveSpecialStatus(activity),
      targets: { mode: "students", levels: [], studentIds: [] },
      assets: (assets ?? []).filter((asset) => asset.activity_id === activity.id),
      metrics: { recipients: 0, viewed: 0, submissions: 0 },
      student_state: { ...recipient, is_new: !recipient.viewed_at, submission: (submissions ?? []).find((item) => item.activity_id === activity.id) ?? null },
    };
  }).filter((activity) => activity.effective_status !== "scheduled" && activity.effective_status !== "archived");
  const current = rows.filter((activity) => activity.effective_status === "available");
  const history = rows.filter((activity) => activity.effective_status === "ended");
  return NextResponse.json({ current, history, unseenCount: current.filter((activity) => activity.student_state.is_new).length });
}
