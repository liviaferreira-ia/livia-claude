"use client";

import { createClient } from "@/lib/supabase/client";

// Vocabulário que o aluno salva pra revisar depois ("Minhas palavras").
// Guardado no navegador, como as demais estatísticas de estudo.

const KEY = "central_vocab_v1";

export type SavedWord = {
  en: string;
  pt: string;
  /** Frase de exemplo, quando a origem tinha uma. */
  example?: string;
  /** De onde veio (ex.: "Lição · Se apresentando"), só para exibição. */
  source?: string;
  addedAt: number;
};

function listLocalWords(): SavedWord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as SavedWord[]) : [];
    // Mais recentes primeiro.
    return [...parsed].sort((a, b) => b.addedAt - a.addedAt);
  } catch {
    return [];
  }
}

function persist(words: SavedWord[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(words));
  } catch {
    // storage indisponível (Safari privado) — ignoramos
  }
}

/** Salva a palavra. Repetir a mesma palavra não duplica, só atualiza. */
export async function listWords(): Promise<SavedWord[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("student_saved_words").select("en,pt,example,source,added_at").order("added_at", { ascending: false });
  if (!error && data) {
    const server = data.map((word) => ({ ...word, example: word.example ?? undefined, source: word.source ?? undefined, addedAt: new Date(word.added_at).getTime() }));
    const local = listLocalWords();
    for (const word of local) void saveWord(word);
    return server.length ? server : local;
  }
  return listLocalWords();
}

export async function saveWord(word: Omit<SavedWord, "addedAt">): Promise<void> {
  const key = word.en.trim().toLowerCase();
  if (!key) return;
  const rest = listLocalWords().filter((w) => w.en.trim().toLowerCase() !== key);
  persist([...rest, { ...word, addedAt: Date.now() }]);
  const supabase = createClient();
  await supabase.rpc("save_student_word", { p_en: word.en, p_pt: word.pt, p_example: word.example ?? null, p_source: word.source ?? null });
}

export async function removeWord(en: string): Promise<void> {
  const key = en.trim().toLowerCase();
  persist(listLocalWords().filter((w) => w.en.trim().toLowerCase() !== key));
  const supabase = createClient();
  await supabase.rpc("remove_student_word", { p_en: en });
}

export function isSaved(en: string): boolean {
  const key = en.trim().toLowerCase();
  return listLocalWords().some((w) => w.en.trim().toLowerCase() === key);
}
