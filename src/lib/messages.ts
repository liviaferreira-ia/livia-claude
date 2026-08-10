"use client";

import { createClient } from "@/lib/supabase/client";

export type Message = {
  id: string;
  user_id: string;
  sender: "student" | "tutor";
  body: string;
  created_at: string;
};

/** Recados do aluno logado, mais recentes por último. */
export async function listMyMessages(): Promise<{ data: Message[]; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as Message[], error: null };
}

/** Envia um recado do aluno para o tutor. */
export async function sendMessage(body: string): Promise<{ error: string | null }> {
  const text = body.trim();
  if (!text) return { error: "Escreva uma mensagem." };

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return { error: "Você precisa estar logado." };

  const { error } = await supabase
    .from("messages")
    .insert({ user_id: uid, sender: "student", body: text });
  if (error) return { error: error.message };
  return { error: null };
}
