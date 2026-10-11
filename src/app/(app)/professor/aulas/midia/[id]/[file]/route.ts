import { requireStaff } from "@/lib/staff-server";
import { serveLessonMedia } from "@/lib/lesson-media-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string; file: string }> }) {
  const staff = await requireStaff();
  if (staff.error) return staff.error;
  const { id, file } = await params;
  return serveLessonMedia(request, id, file);
}
