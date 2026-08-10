// Banco de questões do teste de nivelamento (diagnóstico de entrada).
// 3 perguntas por nível CEFR, dificuldade crescente de A1 a C2.
// O teste é adaptativo: sobe de nível enquanto o aluno acerta e para no
// primeiro nível em que ele não atinge o mínimo de acertos.

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type PlacementQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
};

export const LEVEL_ORDER: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const LEVEL_LABEL: Record<CefrLevel, string> = {
  A1: "Iniciante",
  A2: "Iniciante",
  B1: "Intermediário",
  B2: "Avançado",
  C1: "Avançado",
  C2: "Avançado",
};

export function levelBadge(level: CefrLevel): string {
  return `${level} · ${LEVEL_LABEL[level]}`;
}

/**
 * Encontra o nível populado mais próximo de `level` segundo `hasContent`.
 * Usado por praticar/curso enquanto nem todo nível tem conteúdo próprio ainda.
 */
export function nearestLevelWithContent(
  level: CefrLevel,
  hasContent: (l: CefrLevel) => boolean,
  fallback: CefrLevel,
): CefrLevel {
  if (hasContent(level)) return level;
  const idx = LEVEL_ORDER.indexOf(level);
  for (let d = 1; d < LEVEL_ORDER.length; d++) {
    const lower = LEVEL_ORDER[idx - d];
    if (lower && hasContent(lower)) return lower;
    const upper = LEVEL_ORDER[idx + d];
    if (upper && hasContent(upper)) return upper;
  }
  return fallback;
}

export const QUESTIONS_PER_LEVEL = 3;
export const PASS_THRESHOLD = 2; // mínimo de acertos no bloco para subir de nível

export const PLACEMENT_BANK: Record<CefrLevel, PlacementQuestion[]> = {
  A1: [
    { id: "p-a1-1", prompt: "I ___ from Brazil.", options: ["am", "is", "are", "be"], answer: 0, explain: "Com 'I' usamos am." },
    { id: "p-a1-2", prompt: "She ___ a teacher.", options: ["am", "is", "are", "be"], answer: 1, explain: "Com 'she' usamos is." },
    { id: "p-a1-3", prompt: "This is ___ apple.", options: ["a", "an", "the", "some"], answer: 1, explain: "Antes de som de vogal usamos an." },
  ],
  A2: [
    { id: "p-a2-1", prompt: "He ___ (go) to school every day.", options: ["go", "goes", "going", "gone"], answer: 1, explain: "3ª pessoa no present simple: goes." },
    { id: "p-a2-2", prompt: "We ___ to the beach yesterday.", options: ["go", "goes", "went", "gone"], answer: 2, explain: "Yesterday indica passado: went." },
    { id: "p-a2-3", prompt: "There ___ two books on the table.", options: ["is", "are", "be", "was"], answer: 1, explain: "Plural (two books) usa are." },
  ],
  B1: [
    { id: "p-b1-1", prompt: "If it rains tomorrow, I ___ at home.", options: ["stay", "stays", "will stay", "would stay"], answer: 2, explain: "Primeira condicional: if + presente, will + verbo." },
    { id: "p-b1-2", prompt: "She has lived in London ___ five years.", options: ["for", "since", "during", "ago"], answer: 0, explain: "Período de tempo (quantidade): for." },
    { id: "p-b1-3", prompt: "I wish I ___ more time to travel.", options: ["have", "had", "has", "having"], answer: 1, explain: "Wish + passado simples para desejo no presente: had." },
  ],
  B2: [
    { id: "p-b2-1", prompt: "By the time we arrived, the movie ___ already started.", options: ["has", "had", "was", "is"], answer: 1, explain: "Past perfect para ação anterior a outra no passado: had started." },
    { id: "p-b2-2", prompt: "He suggested ___ the meeting until Friday.", options: ["to postpone", "postponing", "postpone", "postponed"], answer: 1, explain: "Suggest + verbo com -ing: postponing." },
    { id: "p-b2-3", prompt: "Despite ___ hard, she failed the exam.", options: ["study", "studies", "studying", "studied"], answer: 2, explain: "Despite + verbo com -ing: studying." },
  ],
  C1: [
    { id: "p-c1-1", prompt: "Hardly ___ the game started when it began to rain.", options: ["had", "has", "did", "was"], answer: 0, explain: "Inversão com hardly...when: Hardly had the game started..." },
    { id: "p-c1-2", prompt: "Not only ___ late, but he also forgot the documents.", options: ["he was", "was he", "he is", "is he"], answer: 1, explain: "Inversão após 'not only' no início da frase: was he." },
    { id: "p-c1-3", prompt: "It's high time we ___ a decision.", options: ["make", "made", "making", "makes"], answer: 1, explain: "'It's (high) time' + passado simples com sentido de presente: made." },
  ],
  C2: [
    { id: "p-c2-1", prompt: "Were it not for your help, I ___ have failed.", options: ["would", "will", "should", "could"], answer: 0, explain: "Condicional invertido (Were it not for) + would have: 3ª condicional formal." },
    { id: "p-c2-2", prompt: "No sooner ___ left than it started raining.", options: ["had he", "he had", "has he", "he has"], answer: 0, explain: "Inversão com 'no sooner...than': had he left." },
    { id: "p-c2-3", prompt: "She would rather you ___ him the truth.", options: ["tell", "told", "telling", "tells"], answer: 1, explain: "'would rather + sujeito' + passado simples (sentido presente): told." },
  ],
};
