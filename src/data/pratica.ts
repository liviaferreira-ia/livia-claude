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
  { front: "Good morning", sub: "saudação", back: "Bom dia", example: "Good morning, Mr Brown." },
  { front: "Excuse me", sub: "expressão de cortesia", back: "Com licença", example: "Excuse me, where is the bathroom?" },
  { front: "please", sub: "expressão de cortesia", back: "por favor", example: "A glass of water, please." },
  { front: "You're welcome", sub: "resposta de cortesia", back: "De nada", example: "You're welcome. Have a nice day!" },
  { front: "I don't understand", sub: "frase útil", back: "Eu não entendo", example: "Sorry, I don't understand." },
  { front: "Can you repeat that?", sub: "pedido", back: "Você pode repetir?", example: "Can you repeat that, please?" },
  { front: "How do you spell…?", sub: "pergunta", back: "Como se soletra…?", example: "How do you spell your last name?" },
  { front: "bathroom", sub: "substantivo", back: "banheiro", example: "The bathroom is on the first floor." },
  { front: "water", sub: "substantivo incontável", back: "água", example: "Can I have some water, please?" },
  { front: "help", sub: "verbo / substantivo", back: "ajudar / ajuda", example: "Can you help me, please?" },
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
    "This is my mother, and that is my father.",
    "Those are my three brothers.",
    "Please spell your last name slowly.",
    "Can you repeat that, please?",
    "The bathroom is on the third floor.",
    "There are three chairs in this room.",
    "She has a small black bag.",
    "Six students speak English.",
    "I want a glass of water, please.",
    "Is this your first English class?",
    "These shoes are thirty-three dollars.",
    "My birthday is on the fourth of May.",
    "The red dress is next to the blue shirt.",
    "Please close the front door.",
    "What's your phone number?",
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
// Vários cenários por nível: o aluno escolhe qual quer treinar. Cada cenário
// tem 5 turnos e dicas do que dizer em cada um.

export type RoleplayStep = { ai: string; hint: string };
export type Roleplay = {
  id: string;
  emoji: string;
  title: string;
  scenario: string;
  steps: RoleplayStep[];
};

const ROLEPLAYS_A1: Roleplay[] = [
  {
    id: "primeiro-encontro",
    emoji: "👋",
    title: "Primeiro encontro",
    scenario: "Você conhece alguém novo na aula de inglês. Apresente-se e pergunte sobre a pessoa.",
    steps: [
      { ai: "Hi! I'm Tom. What's your name?", hint: 'Diga seu nome: "My name is…" ou "I\'m…"' },
      { ai: "Nice to meet you! Where are you from?", hint: 'Diga de onde você é: "I\'m from Brazil."' },
      { ai: "Oh, nice! And what do you do?", hint: 'Fale sua ocupação: "I\'m a student." / "I\'m a teacher."' },
      { ai: "Cool! How old are you, if you don't mind me asking?", hint: 'Diga a idade: "I\'m 30 years old."' },
      { ai: "Great! See you in class tomorrow.", hint: 'Despeça-se: "See you tomorrow!" ou "Goodbye!"' },
    ],
  },
  {
    id: "minha-familia",
    emoji: "👨‍👩‍👧",
    title: "Apresentando a família",
    scenario: "Um colega quer conhecer sua família. Fale quantos irmãos você tem e o que eles fazem.",
    steps: [
      { ai: "Do you have any brothers or sisters?", hint: 'Use have/has: "I have two brothers." / "I don\'t have any."' },
      { ai: "Nice! What does your brother do?", hint: 'Ocupação na 3ª pessoa: "He is a teacher." / "He works in a bank."' },
      { ai: "And your parents? Do they live near you?", hint: 'Use they: "Yes, they live in São Paulo." / "No, they don\'t."' },
      { ai: "That's lovely. Do you have any pets?", hint: 'Responda: "Yes, I have a dog." / "No, I don\'t have any pets."' },
      { ai: "Thanks for telling me about your family!", hint: 'Retribua: "You\'re welcome!" ou "Thank you!"' },
    ],
  },
  {
    id: "na-sala-de-aula",
    emoji: "🎒",
    title: "Na sala de aula",
    scenario: "Primeiro dia de aula: pergunte o que você precisa saber para se localizar.",
    steps: [
      { ai: "Good morning! Are you a new student here?", hint: 'Confirme: "Yes, I am." ou "Yes, this is my first day."' },
      { ai: "Welcome! Do you have any questions?", hint: 'Pergunte algo: "What time does the class start?"' },
      { ai: "The class starts at 7 pm, twice a week.", hint: 'Pergunte o lugar: "Where is the classroom?"' },
      { ai: "It's room 12, on the second floor.", hint: 'Confirme que entendeu: "Room 12. Thank you!"' },
      { ai: "You're welcome. Have a great first class!", hint: 'Despeça-se: "Thank you! See you later."' },
    ],
  },
  {
    id: "cafe-da-manha",
    emoji: "☕",
    title: "Pedindo no café",
    scenario: "Você entra em um café e pede uma bebida e algo para comer.",
    steps: [
      { ai: "Good morning! What would you like?", hint: 'Peça uma bebida: "A coffee, please." / "An orange juice, please."' },
      { ai: "Sure. Would you like milk in your coffee?", hint: 'Responda: "Yes, please." ou "No, thank you."' },
      { ai: "Would you like something to eat?", hint: 'Peça ou recuse: "A cheese sandwich, please." / "No, thank you."' },
      { ai: "Anything else?", hint: 'Encerre o pedido: "No, that\'s all, thank you."' },
      { ai: "That's eight dollars, please.", hint: 'Entregue o pagamento: "Here you are."' },
    ],
  },
  {
    id: "comprando-uma-camiseta",
    emoji: "👕",
    title: "Comprando uma camiseta",
    scenario: "Você está em uma loja e quer comprar uma camiseta do tamanho e da cor certos.",
    steps: [
      { ai: "Hello! Can I help you?", hint: 'Diga o que procura: "Yes, I need a T-shirt."' },
      { ai: "What color would you like?", hint: 'Diga uma cor: "Blue, please."' },
      { ai: "What size are you?", hint: 'Informe o tamanho: "I\'m a medium." / "Small, please."' },
      { ai: "Here you are. Do you like it?", hint: 'Dê sua opinião: "Yes, it\'s nice." / "No, it\'s too big."' },
      { ai: "It's twenty dollars. Would you like to buy it?", hint: 'Decida: "Yes, please." / "No, thank you."' },
    ],
  },
  {
    id: "no-ponto-de-onibus",
    emoji: "🚌",
    title: "No ponto de ônibus",
    scenario: "Você precisa descobrir se está no ponto certo e a hora do próximo ônibus.",
    steps: [
      { ai: "Hi! Do you need help?", hint: 'Diga seu destino: "Yes. I want to go to the city center."' },
      { ai: "You can take bus number ten.", hint: 'Confirme o ônibus: "Bus number ten?"' },
      { ai: "Yes, that's right.", hint: 'Pergunte o horário: "What time is the next bus?"' },
      { ai: "It's at nine fifteen.", hint: 'Confirme a hora: "Nine fifteen. Thank you."' },
      { ai: "You're welcome. Have a good trip!", hint: 'Despeça-se: "Thank you. Goodbye!"' },
    ],
  },
  {
    id: "na-farmacia",
    emoji: "💊",
    title: "Na farmácia",
    scenario: "Você não está se sentindo bem e pede ajuda em uma farmácia.",
    steps: [
      { ai: "Hello. How can I help you?", hint: 'Diga o problema: "I have a headache."' },
      { ai: "Do you have a fever?", hint: 'Responda: "Yes, I do." ou "No, I don\'t."' },
      { ai: "Are you allergic to any medicine?", hint: 'Responda: "No, I\'m not." ou "Yes, I am."' },
      { ai: "You can take this medicine.", hint: 'Pergunte o preço: "How much is it?"' },
      { ai: "It's six dollars.", hint: 'Aceite e agradeça: "Okay. Thank you."' },
    ],
  },
  {
    id: "convite-para-o-cinema",
    emoji: "🎬",
    title: "Convite para o cinema",
    scenario: "Um amigo convida você para ir ao cinema e vocês combinam o dia e o horário.",
    steps: [
      { ai: "Hi! Do you like movies?", hint: 'Responda: "Yes, I do." ou "No, I don\'t."' },
      { ai: "Would you like to go to the cinema with me?", hint: 'Aceite: "Yes, I\'d love to." ou recuse: "Sorry, I can\'t."' },
      { ai: "Great! Are you free on Saturday?", hint: 'Responda: "Yes, I am." / "No, but I\'m free on Sunday."' },
      { ai: "What time is good for you?", hint: 'Sugira um horário: "Seven o\'clock is good."' },
      { ai: "Perfect. See you there!", hint: 'Confirme: "See you on Saturday!"' },
    ],
  },
];

const ROLEPLAYS_A2: Roleplay[] = [
  {
    id: "check-in-hotel",
    emoji: "🏨",
    title: "Check-in no hotel",
    scenario: "Você chega ao hotel à noite e precisa fazer o check-in.",
    steps: [
      { ai: "Good evening! Welcome to Central Hotel. How can I help you?", hint: 'Diga que tem uma reserva: "I have a reservation under Souza."' },
      { ai: "Let me check... Yes, for two nights, correct? Could I have your ID, please?", hint: 'Entregue o documento — "Here you are." — e pergunte: "What time is breakfast?"' },
      { ai: "Breakfast is from 7 to 10 am. Would you like a wake-up call?", hint: 'Responda: "Yes, please, at 7." ou "No, thank you."' },
      { ai: "Noted. Is there anything else you need?", hint: 'Peça algo: "Could you help me with my luggage?" ou "No, that\'s all."' },
      { ai: "Perfect. Here is your key card. Your room is 305. Enjoy your stay!", hint: 'Agradeça: "Thank you very much!"' },
    ],
  },
  {
    id: "no-restaurante",
    emoji: "🍽️",
    title: "No restaurante",
    scenario: "Você senta num restaurante e vai fazer o pedido — e pedir a conta no fim.",
    steps: [
      { ai: "Good evening! A table for how many?", hint: 'Diga quantas pessoas: "A table for two, please."' },
      { ai: "Here's the menu. Would you like something to drink first?", hint: 'Peça uma bebida: "I\'d like a water, please."' },
      { ai: "And what would you like to eat?", hint: 'Faça o pedido: "I\'d like the chicken, please."' },
      { ai: "Excellent choice. How was everything?", hint: 'Comente: "It was delicious, thank you."' },
      { ai: "I'm glad you liked it!", hint: 'Peça a conta: "Could I have the check, please?"' },
    ],
  },
  {
    id: "pedindo-informacoes",
    emoji: "🗺️",
    title: "Pedindo informações na rua",
    scenario: "Você está perdido numa cidade nova e precisa chegar à estação.",
    steps: [
      { ai: "Hello! You look a bit lost. Can I help?", hint: 'Peça ajuda: "Yes, please. Where is the station?"' },
      { ai: "The station? It's about ten minutes from here.", hint: 'Pergunte como ir: "How do I get there?"' },
      { ai: "Go straight and turn left at the traffic lights.", hint: 'Confirme: "Straight and then left. Is it far?"' },
      { ai: "Not far at all. You can walk, or take bus number 8.", hint: 'Pergunte o ônibus: "Where is the bus stop?"' },
      { ai: "Just across the street, next to the bakery.", hint: 'Agradeça: "Thank you very much for your help!"' },
    ],
  },
  {
    id: "fazendo-compras",
    emoji: "🛍️",
    title: "Fazendo compras",
    scenario: "Você quer comprar uma camiseta, mas precisa de outro tamanho.",
    steps: [
      { ai: "Hi there! Can I help you find anything?", hint: 'Diga o que procura: "I\'m looking for a t-shirt."' },
      { ai: "Sure! What size do you need?", hint: 'Diga o tamanho: "Medium, please." / "I need a large."' },
      { ai: "Here you go. Would you like to try it on?", hint: 'Responda: "Yes, please. Where is the fitting room?"' },
      { ai: "It's at the back, on the right. How does it fit?", hint: 'Comente: "It\'s too small. Do you have a bigger one?"' },
      { ai: "Let me check... Yes, here's a large one.", hint: 'Pergunte o preço: "How much is it?"' },
    ],
  },
];

const ROLEPLAYS_B1: Roleplay[] = [
  {
    id: "entrevista-experiencias",
    emoji: "✈️",
    title: "Entrevista de experiências",
    scenario: "Um colega quer saber sobre suas viagens e experiências. Use o present perfect.",
    steps: [
      { ai: "So, have you ever travelled abroad?", hint: 'Responda com present perfect: "Yes, I have." ou "No, I\'ve never travelled abroad."' },
      { ai: "Interesting! What's the best trip you've ever taken?", hint: 'Conte: "The best trip I\'ve ever taken was to…"' },
      { ai: "Nice! How long did you stay there?", hint: 'Agora no passado simples: "I stayed for two weeks."' },
      { ai: "And is there anywhere you haven't been but would love to visit?", hint: 'Use "I haven\'t been to… yet, but I\'d love to go."' },
      { ai: "You should definitely go. Thanks for sharing!", hint: 'Finalize: "Thanks for asking!" ou "It was nice talking to you."' },
    ],
  },
  {
    id: "pedindo-conselho",
    emoji: "💭",
    title: "Pedindo conselho",
    scenario: "Você recebeu uma proposta de emprego em outra cidade e está em dúvida.",
    steps: [
      { ai: "You look worried. Is everything okay?", hint: 'Explique: "I got a job offer in another city."' },
      { ai: "That's big news! What's the problem?", hint: 'Use a 2ª condicional: "If I took it, I would move away from my family."' },
      { ai: "I see. What would you do if money wasn't an issue?", hint: 'Responda: "If money wasn\'t an issue, I would…"' },
      { ai: "Honestly, I think you should go for it.", hint: 'Peça mais: "Do you think I should accept it?"' },
      { ai: "I do. You'd regret not trying.", hint: 'Agradeça: "Thanks, that really helps."' },
    ],
  },
  {
    id: "recomendando-um-lugar",
    emoji: "⭐",
    title: "Recomendando um lugar",
    scenario: "Um amigo vai visitar sua cidade e pede recomendações.",
    steps: [
      { ai: "I'm visiting your city next month. Where should I go?", hint: 'Recomende: "You should visit…" / "The best place is…"' },
      { ai: "Sounds great! Is it expensive?", hint: 'Compare: "It\'s cheaper than…" / "It\'s not as expensive as…"' },
      { ai: "Good to know. And where can I try the local food?", hint: 'Sugira: "There\'s a restaurant which serves…"' },
      { ai: "Perfect. Anything I should avoid?", hint: 'Avise: "I wouldn\'t go there at night." / "Avoid the city centre on Sundays."' },
      { ai: "Thanks! This is really helpful.", hint: 'Feche: "Let me know if you need anything else!"' },
    ],
  },
];

const ROLEPLAYS_B2: Roleplay[] = [
  {
    id: "contando-o-que-aconteceu",
    emoji: "🕐",
    title: "Contando o que aconteceu",
    scenario: "Você chegou atrasado a um compromisso. Explique o que houve usando past perfect.",
    steps: [
      { ai: "Hey, you're late! What happened?", hint: 'Explique: "By the time I got there, the train had already left."' },
      { ai: "Oh no. Had you been waiting long?", hint: 'Use past perfect continuous: "I\'d been waiting for about an hour."' },
      { ai: "That's frustrating. So how did you get here in the end?", hint: 'Conte o desfecho: "Eventually, I took a taxi." / "It turned out that…"' },
      { ai: "At least you made it. Did you manage to let anyone know?", hint: 'Responda: "I tried to call, but my phone had died."' },
      { ai: "Well, these things happen. Let's get started.", hint: 'Peça desculpas: "Sorry again for the delay."' },
    ],
  },
  {
    id: "reclamacao-e-solucao",
    emoji: "🔧",
    title: "Reclamação e solução",
    scenario: "O produto que você comprou chegou com defeito. Reclame com firmeza e educação.",
    steps: [
      { ai: "Customer service, how can I help you?", hint: 'Explique o problema: "I bought a laptop last week and it isn\'t working."' },
      { ai: "I'm sorry to hear that. What exactly is the issue?", hint: 'Detalhe: "It keeps switching off." / "The screen has stopped working."' },
      { ai: "I see. Have you tried restarting it?", hint: 'Responda: "Yes, I\'ve already tried that, but nothing changed."' },
      { ai: "In that case, we can repair it or replace it.", hint: 'Escolha e justifique: "I\'d rather have it replaced, since it\'s brand new."' },
      { ai: "Understood. We'll send a replacement this week.", hint: 'Confirme: "Could you confirm that by email, please?"' },
    ],
  },
  {
    id: "entrevista-de-emprego",
    emoji: "💼",
    title: "Entrevista de emprego",
    scenario: "Entrevista para uma vaga internacional. Fale da sua experiência com precisão.",
    steps: [
      { ai: "Thanks for coming. Tell me a bit about yourself.", hint: 'Resuma: "I\'ve been working in marketing for five years."' },
      { ai: "What would you say is your biggest achievement?", hint: 'Conte: "I led a project which increased sales by 30%."' },
      { ai: "Impressive. And how do you handle pressure?", hint: 'Use be used to: "I\'m used to working under tight deadlines."' },
      { ai: "Why are you leaving your current job?", hint: 'Seja diplomático: "I\'m looking for a role where I can grow further."' },
      { ai: "Great. Do you have any questions for us?", hint: 'Pergunte algo: "Could you tell me more about the team?"' },
    ],
  },
];

const ROLEPLAYS_C1: Roleplay[] = [
  {
    id: "debate-rapido",
    emoji: "⚖️",
    title: "Debate rápido",
    scenario: "Um colega defende uma opinião forte. Discorde com tato, sem soar agressivo.",
    steps: [
      { ai: "I think remote work has completely destroyed team creativity.", hint: 'Reconheça e discorde: "I see your point, but I\'m not entirely convinced…"' },
      { ai: "But the data shows productivity dropped. How do you explain that?", hint: 'Conceda parcialmente: "Admittedly, that\'s a valid point; however,…"' },
      { ai: "Fair enough. So what would you attribute the drop to?", hint: 'Apresente sua explicação: "I\'d argue that…" / "In light of…"' },
      { ai: "Interesting. But surely the office solves that?", hint: 'Rebata: "Not necessarily. To some extent, the problem is…"' },
      { ai: "That's an interesting angle. Maybe we can find some common ground.", hint: 'Feche: "Let\'s find some common ground." / "I think we broadly agree."' },
    ],
  },
  {
    id: "negociacao",
    emoji: "🤝",
    title: "Negociação de prazo",
    scenario: "O cliente quer o projeto duas semanas antes. Negocie sem prometer o impossível.",
    steps: [
      { ai: "We need the project delivered two weeks earlier than agreed.", hint: 'Ganhe tempo: "I understand the urgency, but let me explain the constraints."' },
      { ai: "The board is putting a lot of pressure on us.", hint: 'Ofereça alternativa: "We could deliver part of it earlier, provided that…"' },
      { ai: "What exactly could you deliver by then?", hint: 'Seja específico: "We could have the core features ready, bearing in mind that…"' },
      { ai: "And what would you need from us to make that work?", hint: 'Peça contrapartida: "We\'d need approval within 48 hours."' },
      { ai: "That sounds reasonable. Let's put it in writing.", hint: 'Confirme: "I\'ll send a revised timeline for your approval."' },
    ],
  },
  {
    id: "feedback-dificil",
    emoji: "🗣️",
    title: "Dando um feedback difícil",
    scenario: "Você precisa apontar um problema no trabalho de um colega, sem desmotivá-lo.",
    steps: [
      { ai: "You wanted to talk about my report?", hint: 'Comece pelo positivo: "Yes — first, the research is genuinely strong."' },
      { ai: "Thanks. I sense there's a 'but' coming.", hint: 'Introduza a crítica: "There is, though I\'d frame it as an opportunity…"' },
      { ai: "Go on, I can take it.", hint: 'Seja específico: "The conclusion isn\'t fully substantiated by the data."' },
      { ai: "Hmm. I thought the numbers spoke for themselves.", hint: 'Sustente com tato: "To some extent they do; however, a reader might…"' },
      { ai: "Fair. What would you suggest I change?", hint: 'Ofereça caminho: "I\'d recommend that you add a section on…"' },
    ],
  },
];

const ROLEPLAYS_C2: Roleplay[] = [
  {
    id: "debate-alto-nivel",
    emoji: "🏛️",
    title: "Debate de alto nível",
    scenario: "Você defende uma proposta diante de um conselho cético. Use recursos retóricos.",
    steps: [
      { ai: "Why should the board approve this proposal now rather than next year?", hint: 'Use inversão: "Not only does it reduce costs, but it also…"' },
      { ai: "The figures are compelling, but the risk seems considerable.", hint: 'Conceda e reforce: "While I concede that point, the evidence substantiates…"' },
      { ai: "And what if the market shifts before implementation?", hint: 'Condicional invertido: "Should the market shift, we would…"' },
      { ai: "Some would say this is a solution in search of a problem.", hint: 'Rebata com força: "By no means. The case in point is…"' },
      { ai: "Very well. You've made a persuasive case. We'll put it to a vote.", hint: 'Encerre: "That is precisely why I\'d urge you to act now."' },
    ],
  },
  {
    id: "negociacao-alto-nivel",
    emoji: "📜",
    title: "Negociação de alto nível",
    scenario: "Negociação contratual delicada. Ceda no acessório para ganhar no essencial.",
    steps: [
      { ai: "Our position is that the exclusivity clause must remain as drafted.", hint: 'Abra espaço: "I appreciate the rationale, albeit with some reservations."' },
      { ai: "What specifically concerns you about it?", hint: 'Seja preciso: "Insofar as it restricts our other partnerships, it\'s untenable."' },
      { ai: "We could limit the scope. Would that help?", hint: 'Conceda algo: "That would go some way, provided the term is shortened."' },
      { ai: "You're asking for a great deal here.", hint: 'Justifique: "Had we not already conceded on pricing, I\'d agree with you."' },
      { ai: "Point taken. Let's draft a revised clause.", hint: 'Feche: "It goes without saying that we\'ll review it carefully."' },
    ],
  },
  {
    id: "posicao-impopular",
    emoji: "🎯",
    title: "Defendendo uma posição impopular",
    scenario: "Toda a equipe discorda de você. Sustente seu argumento com elegância.",
    steps: [
      { ai: "Everyone else thinks we should launch now. Why don't you?", hint: 'Firme e educado: "Much as I respect the consensus, I\'d urge caution."' },
      { ai: "But we've tested this thoroughly.", hint: 'Questione a premissa: "Notwithstanding the testing, the sample was hardly representative."' },
      { ai: "So you'd delay the whole launch over that?", hint: 'Reformule: "Not the launch itself — rather, the scope of it."' },
      { ai: "That's a subtle distinction.", hint: 'Enfatize: "It is precisely that distinction which matters here."' },
      { ai: "All right. Put your case to the team on Monday.", hint: 'Aceite: "I shall, and I\'ll substantiate every claim."' },
    ],
  },
];

export const ROLEPLAYS: Record<CefrLevel, Roleplay[]> = {
  A1: ROLEPLAYS_A1,
  A2: ROLEPLAYS_A2,
  B1: ROLEPLAYS_B1,
  B2: ROLEPLAYS_B2,
  C1: ROLEPLAYS_C1,
  C2: ROLEPLAYS_C2,
};

export function resolveRoleplayLevel(level: CefrLevel): CefrLevel {
  return nearestLevelWithContent(level, (l) => ROLEPLAYS[l].length > 0, "A2");
}
