import { A1_DRAFTS } from "@/data/a1Drafts";
import { createClient } from "@/lib/supabase/server";
import { isLessonPublished } from "@/lib/lesson-reviews-server";
import { serveLessonMedia } from "@/lib/lesson-media-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string; file: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(null, { status: 401 });
  const { id, file } = await params;
  const lesson = A1_DRAFTS.find((item) => item.id === id);
  if (!lesson) return new Response(null, { status: 404 });
  try { if (!await isLessonPublished(lesson)) return new Response(null, { status: 404 }); }
  catch { return new Response(null, { status: 503, headers: { "Cache-Control": "private, no-store" } }); }
  return serveLessonMedia(request, id, file);
}
