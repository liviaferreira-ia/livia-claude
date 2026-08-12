"use client";

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

export function listWords(): SavedWord[] {
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
export function saveWord(word: Omit<SavedWord, "addedAt">): void {
  const key = word.en.trim().toLowerCase();
  if (!key) return;
  const rest = listWords().filter((w) => w.en.trim().toLowerCase() !== key);
  persist([...rest, { ...word, addedAt: Date.now() }]);
}

export function removeWord(en: string): void {
  const key = en.trim().toLowerCase();
  persist(listWords().filter((w) => w.en.trim().toLowerCase() !== key));
}

export function isSaved(en: string): boolean {
  const key = en.trim().toLowerCase();
  return listWords().some((w) => w.en.trim().toLowerCase() === key);
}
