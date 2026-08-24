import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function requireStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "teacher" && profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Área exclusiva da equipe da escola." }, { status: 403 }) };
  }
  return { user, role: profile.role };
}

