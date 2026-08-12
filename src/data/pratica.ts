// Conteúdo por nível CEFR das três práticas curtas: revisão (flashcards),
// pronúncia (frases para repetir) e roleplay (diálogo guiado por voz).
// Mesmo padrão de `exercises.ts` e `lesson.ts`: cada nível tem o seu, e o
// resolver cai pro nível populado mais próximo se algum ficar vazio.

import { nearestLevelWithContent, type CefrLevel } from "@/data/placement";

// ---------------------------------------------------------------- Flashcards

export type Card = { front: string; sub: string; back: string; example: string };

const FLASHCARDS_A1: Card[] = [
  { front: "to be (am / is / are)", sub: "verbo", back: "ser ou estar", example: "I am a student. She is my sister." },
  { front: "name", sub: "substantivo", back: "nome", example: "What's your name?" },
  { front: "brother / sister", sub: "substantivo", back: "irmão / irmã", example: "I have two brothers." },
  { front: "How old…?", sub: "pergunta", back: "Quantos anos…?", example: "How old are you?" },
  { front: "this / these", sub: "demonstrativo", back: "este / estes", example: "This is my book. These are my keys." },
  { front: "can't", sub: "modal negativo", back: "não consigo / não sei", example: "I can't speak French." },
  { front: "children", sub: "plural irregular de child", back: "crianças", example: "The children are in the garden." },
];

const FLASHCARDS_A2: Card[] = [
  { front: "reservation", sub: "substantivo", back: "reserva", example: "I have a reservation under Souza." },
  { front: "check-in", sub: "substantivo / verbo", back: "registro de entrada", example: "What time is check-in?" },
  { front: "breakfast", sub: "substantivo", back: "café da manhã", example: "Breakfast is from 7 to 10 am." },
  { front: "to go → went", sub: "passado simples", back: "ir → foi/fui", example: "I went to Rio last month." },
  { front: "What time…?", sub: "pergunta", back: "Que horas…?", example: "What time is breakfast?" },
  { front: "luggage", sub: "substantivo incontável", back: "bagagem", example: "Could you help me with my luggage?" },
  { front: "next to", sub: "preposição", back: "ao lado de", example: "The restaurant is next to the hotel." },
];

const FLASHCARDS_B1: Card[] = [
  { front: "Have you ever…?", sub: "present perfect", back: "Você já…? (na vida)", example: "Have you ever been to Japan?" },
  { front: "already / yet", sub: "advérbio", back: "já / ainda (negativa)", example: "I've already finished. I haven't decided yet." },
  { front: "for / since", sub: "preposição", back: "há (duração) / desde (ponto)", example: "for five years · since 2019" },
  { front: "used to", sub: "hábito no passado", back: "costumava", example: "I used to live in Rio." },
  { front: "been / gone", sub: "particípio", back: "foi e voltou / foi e está lá", example: "She's gone to the bank." },
  { front: "to look forward to", sub: "phrasal verb + gerúndio", back: "estar ansioso por", example: "I'm looking forward to seeing you." },
  { front: "unforgettable", sub: "adjetivo", back: "inesquecível", example: "It was an unforgettable experience." },
];

const FLASHCARDS_B2: Card[] = [
  { front: "by the time", sub: "conector", back: "quando (já)", example: "By the time I arrived, it had already started." },
  { front: "to turn out", sub: "phrasal verb", back: "acabar sendo / revelar-se", example: "It turned out to be a mistake." },
  { front: "eventually", sub: "advérbio (falso amigo)", back: "no fim das contas — NÃO é 'eventualmente'", example: "Eventually, we found it." },
  { front: "meanwhile", sub: "advérbio", back: "enquanto isso", example: "Meanwhile, she was still waiting." },
  { front: "to put up with", sub: "phrasal verb", back: "tolerar, aguentar", example: "I can't put up with this noise." },
  { front: "I wish he would…", sub: "wish + would", back: "queria que ele… (irritação)", example: "I wish he would stop complaining." },
  { front: "as if", sub: "conector", back: "como se", example: "She talks as if she knew everything." },
];

const FLASHCARDS_C1: Card[] = [
  { front: "to some extent", sub: "expressão de grau", back: "até certo ponto", example: "I agree to some extent, but not entirely." },
  { front: "admittedly", sub: "advérbio de concessão", back: "reconheço que / é verdade que", example: "Admittedly, the issue is complex." },
  { front: "on the grounds that", sub: "conector formal", back: "sob a justificativa de que", example: "It was rejected on the grounds that it lacked funding." },
  { front: "to bear in mind", sub: "collocation", back: "ter em mente", example: "Bear in mind that the deadline is final." },
  { front: "in light of", sub: "locução prepositiva", back: "à luz de, em vista de", example: "In light of the findings, we revised our stance." },
  { front: "common ground", sub: "substantivo", back: "ponto em comum", example: "Let's try to find some common ground." },
  { front: "to concede", sub: "verbo", back: "conceder, admitir um ponto", example: "I concede that the data is limited." },
];

const FLASHCARDS_C2: Card[] = [
  { front: "by no means", sub: "expressão enfática", back: "de forma alguma", example: "This is by no means a complete solution." },
  { front: "a case in point", sub: "expressão", back: "um exemplo emblemático", example: "Her handling of the crisis is a case in point." },
  { front: "albeit", sub: "conector formal", back: "ainda que (+ sintagma)", example: "The proposal was accepted, albeit with reservations." },
  { front: "notwithstanding", sub: "preposição formal", back: "não obstante, apesar de", example: "Notwithstanding all its flaws, the study remains influential." },
  { front: "to substantiate", sub: "verbo", back: "fundamentar, comprovar", example: "The evidence substantiates this claim." },
  { front: "vested interest", sub: "collocation", back: "interesse próprio em jogo", example: "They have a vested interest in the status quo." },
  { front: "lest", sub: "conjunção muito formal", back: "para que não / com receio de que", example: "They proceeded cautiously lest it set a precedent." },
];

export const FLASHCARDS: Record<CefrLevel, Card[]> = {
  A1: FLASHCARDS_A1,
  A2: FLASHCARDS_A2,
  B1: FLASHCARDS_B1,
  B2: FLASHCARDS_B2,
  C1: FLASHCARDS_C1,
  C2: FLASHCARDS_C2,
};

export function resolveFlashcardLevel(level: CefrLevel): CefrLevel {
  return nearestLevelWithContent(level, (l) => FLASHCARDS[l].length > 0, "A2");
}

// ---------------------------------------------------------------- Pronúncia
// Frases escolhidas para treinar sons que costumam pegar quem fala português:
// "th", -ed final, encontros consonantais e sílaba tônica.

export const PRONUNCIATION: Record<CefrLevel, string[]> = {
  A1: [
    "Hello, my name is Ana.",
    "I am from Brazil.",
    "Nice to meet you.",
    "This is my brother.",
    "How old are you?",
    "Thank you very much.",
  ],
  A2: [
    "I have a reservation.",
    "What time is breakfast?",
    "Could you help me, please?",
    "I would like a coffee.",
    "Where is the station?",
    "Thank you very much.",
  ],
  B1: [
    "I've never been to Japan.",
    "She has worked here since 2019.",
    "I'm looking forward to seeing you.",
    "They haven't decided yet.",
    "It was an unforgettable experience.",
    "Would you mind repeating that?",
  ],
  B2: [
    "By the time we arrived, the film had already started.",
    "I had been waiting for over an hour.",
    "It turned out to be a misunderstanding.",
    "I can't put up with this noise any longer.",
    "She talks as if she knew everything.",
    "Despite working hard, he failed the exam.",
  ],
  C1: [
    "I see your point, but I'm not entirely convinced.",
    "We should take the long-term costs into consideration.",
    "The proposal was rejected on the grounds that it lacked funding.",
    "In light of the recent findings, we revised our stance.",
    "Rarely have I seen such a compelling argument.",
    "Let's try to find some common ground.",
  ],
  C2: [
    "Not only does it save time, but it also reduces costs.",
    "Had it not been for her intervention, the deal would have collapsed.",
    "The findings were, to say the least, unexpected.",
    "It goes without saying that transparency is essential.",
    "Notwithstanding all its flaws, the study remains influential.",
    "Such was the outcry that the policy was withdrawn.",
  ],
};

export function resolvePronunciationLevel(level: CefrLevel): CefrLevel {
  return nearestLevelWithContent(level, (l) => PRONUNCIATION[l].length > 0, "A2");
}

// ---------------------------------------------------------------- Roleplay

export type RoleplayStep = { ai: string; hint: string };
export type Roleplay = { title: string; scenario: string; steps: RoleplayStep[] };

export const ROLEPLAYS: Record<CefrLevel, Roleplay> = {
  A1: {
    title: "Primeiro encontro",
    scenario: "Você conhece alguém novo numa aula de inglês. Apresente-se e pergunte sobre a pessoa.",
    steps: [
      { ai: "Hi! I'm Tom. What's your name?", hint: 'Diga seu nome: "My name is…" ou "I\'m…"' },
      { ai: "Nice to meet you! Where are you from?", hint: 'Diga de onde você é: "I\'m from Brazil."' },
      { ai: "Oh, nice! And what do you do?", hint: 'Fale sua ocupação: "I\'m a student." / "I\'m a teacher."' },
      { ai: "Great! See you in class tomorrow.", hint: 'Despeça-se: "See you tomorrow!" ou "Goodbye!"' },
    ],
  },
  A2: {
    title: "Check-in no hotel",
    scenario: "Você chega ao hotel à noite e precisa fazer o check-in.",
    steps: [
      { ai: "Good evening! Welcome to Central Hotel. How can I help you?", hint: 'Diga que tem uma reserva: "I have a reservation under Souza."' },
      { ai: "Let me check... Yes, for two nights, correct? Could I have your ID, please?", hint: 'Entregue o documento — "Here you are." — e pergunte: "What time is breakfast?"' },
      { ai: "Breakfast is from 7 to 10 am. Would you like a wake-up call?", hint: 'Responda: "Yes, please, at 7." ou "No, thank you."' },
      { ai: "Perfect. Here is your key card. Your room is 305. Enjoy your stay!", hint: 'Agradeça: "Thank you very much!"' },
    ],
  },
  B1: {
    title: "Entrevista de experiências",
    scenario: "Um colega quer saber sobre suas viagens e experiências. Use o present perfect.",
    steps: [
      { ai: "So, have you ever travelled abroad?", hint: 'Responda com present perfect: "Yes, I have." ou "No, I\'ve never travelled abroad."' },
      { ai: "Interesting! What's the best trip you've ever taken?", hint: 'Conte: "The best trip I\'ve ever taken was to…"' },
      { ai: "Nice! And is there anywhere you haven't been but would love to visit?", hint: 'Use "I haven\'t been to… yet, but I\'d love to go."' },
      { ai: "You should definitely go. Thanks for sharing!", hint: 'Finalize: "Thanks for asking!" ou "It was nice talking to you."' },
    ],
  },
  B2: {
    title: "Contando o que aconteceu",
    scenario: "Você chegou atrasado a um compromisso. Explique o que houve usando past perfect.",
    steps: [
      { ai: "Hey, you're late! What happened?", hint: 'Explique: "By the time I got there, the train had already left."' },
      { ai: "Oh no. Had you been waiting long?", hint: 'Use past perfect continuous: "I\'d been waiting for about an hour."' },
      { ai: "That's frustrating. So how did you get here in the end?", hint: 'Conte o desfecho: "Eventually, I took a taxi." / "It turned out that…"' },
      { ai: "Well, at least you made it. Let's get started.", hint: 'Peça desculpas: "Sorry again for the delay."' },
    ],
  },
  C1: {
    title: "Debate rápido",
    scenario: "Um colega defende uma opinião forte. Discorde com tato, sem soar agressivo.",
    steps: [
      { ai: "I think remote work has completely destroyed team creativity.", hint: 'Reconheça e discorde: "I see your point, but I\'m not entirely convinced…"' },
      { ai: "But the data shows productivity dropped. How do you explain that?", hint: 'Conceda parcialmente: "Admittedly, that\'s a valid point; however,…"' },
      { ai: "Fair enough. So what would you attribute the drop to?", hint: 'Apresente sua explicação: "I\'d argue that…" / "In light of…"' },
      { ai: "That's an interesting angle. Maybe we can find some common ground.", hint: 'Feche: "Let\'s find some common ground." / "I think we broadly agree."' },
    ],
  },
  C2: {
    title: "Debate de alto nível",
    scenario: "Você defende uma proposta diante de um conselho cético. Use recursos retóricos.",
    steps: [
      { ai: "Why should the board approve this proposal now rather than next year?", hint: 'Use inversão: "Not only does it reduce costs, but it also…"' },
      { ai: "The figures are compelling, but the risk seems considerable.", hint: 'Conceda e reforce: "While I concede that point, the evidence substantiates…"' },
      { ai: "And what if the market shifts before implementation?", hint: 'Condicional invertido: "Should the market shift, we would…"' },
      { ai: "Very well. You've made a persuasive case. We'll put it to a vote.", hint: 'Encerre com força: "That is precisely why I\'d urge you to act now."' },
    ],
  },
};

export function resolveRoleplayLevel(level: CefrLevel): CefrLevel {
  return nearestLevelWithContent(level, (l) => ROLEPLAYS[l].steps.length > 0, "A2");
}
