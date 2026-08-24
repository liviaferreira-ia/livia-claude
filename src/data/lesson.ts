// Conteúdo estruturado das lições (Introdução → Vocabulário → Listening →
// Expressões → Tarefa final). Cada lição tem um slug próprio e vive em
// /aluno/licao/<slug>. `LESSONS_BY_LEVEL` diz quais lições existem em cada
// nível CEFR — nem todo nível tem lição ainda, igual ao banco de exercícios.

import { nearestLevelWithContent, type CefrLevel } from "@/data/placement";

export type Vocab = { en: string; pt: string };
export type Expression = { en: string; pt: string };
export type DialogueLine = { who: string; en: string; pt: string };

export type Multiple = {
  kind: "mc";
  type: string;
  prompt: string;
  hint: string;
  options: string[];
  answer: number;
  feedbackOk: string;
  feedbackNo: string;
};

export type Fill = {
  kind: "fill";
  type: string;
  prompt: string;
  hint: string;
  answers: string[];
  feedbackOk: string;
  feedbackNo: string;
};

export type Question = Multiple | Fill;

export type StepId = "intro" | "vocabulario" | "listening" | "expressoes" | "exercicios";

export type Lesson = {
  slug: string;
  level: CefrLevel;
  unit: string;
  title: string;
  intro: string;
  vocab: { title: string; hint: string; items: Vocab[] };
  listening: { title: string; hint: string; lines: DialogueLine[] };
  expressions: { title: string; hint: string; items: Expression[] };
  exercises: { title: string; praise: string; questions: Question[] };
};

// ================= A1 · Unidade 1 =================

const APRESENTANDO_SE: Lesson = {
  slug: "apresentando-se",
  level: "A1",
  unit: "Unidade 1 · Primeiros passos",
  title: "Se apresentando",
  intro:
    "Nesta lição você vai aprender a se apresentar em inglês: dizer seu nome, de onde você é e cumprimentar alguém pela primeira vez. Vamos ver as palavras essenciais, ouvir duas pessoas se conhecendo, treinar as frases mais usadas e praticar no final. Leva uns 6 minutos!",
  vocab: {
    title: "Palavras para se apresentar",
    hint: "Toque em “Ouvir” para escutar a pronúncia de cada palavra.",
    items: [
      { en: "hello", pt: "olá" },
      { en: "hi", pt: "oi" },
      { en: "name", pt: "nome" },
      { en: "friend", pt: "amigo(a)" },
      { en: "student", pt: "aluno(a)" },
      { en: "teacher", pt: "professor(a)" },
      { en: "Brazil", pt: "Brasil" },
      { en: "goodbye", pt: "tchau" },
    ],
  },
  listening: {
    title: "Duas pessoas se conhecendo",
    hint: "Ana e Tom se encontram pela primeira vez. Ouça cada fala antes de ler a tradução.",
    lines: [
      { who: "Ana", en: "Hello! My name is Ana. What's your name?", pt: "Olá! Meu nome é Ana. Qual é o seu nome?" },
      { who: "Tom", en: "Hi, Ana! I'm Tom. Nice to meet you.", pt: "Oi, Ana! Eu sou o Tom. Prazer em conhecer você." },
      {
        who: "Ana",
        en: "Nice to meet you too! Where are you from?",
        pt: "Prazer em conhecer você também! De onde você é?",
      },
      { who: "Tom", en: "I'm from Canada. And you?", pt: "Eu sou do Canadá. E você?" },
      { who: "Ana", en: "I'm from Brazil. I'm a student here.", pt: "Eu sou do Brasil. Eu sou aluna aqui." },
    ],
  },
  expressions: {
    title: "Frases para o primeiro “oi”",
    hint: "Frases que você vai usar sempre que conhecer alguém. Toque em “Ouvir” e repita em voz alta.",
    items: [
      { en: "Hello! My name is Ana.", pt: "Olá! Meu nome é Ana." },
      { en: "What's your name?", pt: "Qual é o seu nome?" },
      { en: "Nice to meet you!", pt: "Prazer em conhecer você!" },
      { en: "Where are you from?", pt: "De onde você é?" },
      { en: "I'm from Brazil.", pt: "Eu sou do Brasil." },
      { en: "How are you?", pt: "Como você está?" },
    ],
  },
  exercises: {
    title: "Pratique tudo",
    praise: "Excelente! Você já sabe se apresentar em inglês. 🎉",
    questions: [
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "Hello! My name ___ Ana.",
        hint: "Você está dizendo o seu nome.",
        options: ["am", "is", "are", "be"],
        answer: 1,
        feedbackOk: "Correto! Com “my name” usamos is. → “My name is Ana.”",
        feedbackNo: "Com “my name” usamos is. → “My name is Ana.”",
      },
      {
        kind: "fill",
        type: "Complete a frase",
        prompt: "I ___ from Brazil.",
        hint: "Você está dizendo de onde você é. (uma palavra)",
        answers: ["am"],
        feedbackOk: "Isso! Com o sujeito “I” usamos am. → “I am from Brazil.”",
        feedbackNo: "Com o sujeito “I” usamos am. → “I am from Brazil.”",
      },
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "Where ___ you from?",
        hint: "Você quer saber de onde a pessoa é.",
        options: ["is", "am", "are", "do"],
        answer: 2,
        feedbackOk: "Perfeito! Com “you” usamos are. → “Where are you from?”",
        feedbackNo: "Com “you” usamos are. → “Where are you from?”",
      },
      {
        kind: "fill",
        type: "Tradução PT → EN",
        prompt: "Prazer em conhecer você! → Nice to ___ you!",
        hint: "O verbo “conhecer” nesse cumprimento. (uma palavra)",
        answers: ["meet"],
        feedbackOk: "Muito bem! “Nice to meet you!”",
        feedbackNo: "O verbo é meet. → “Nice to meet you!”",
      },
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "___ your name?",
        hint: "Você está perguntando o nome da pessoa.",
        options: ["What's", "Who's", "Where's", "How's"],
        answer: 0,
        feedbackOk: "Exato! “What's your name?” = Qual é o seu nome?",
        feedbackNo: "Perguntamos com What's. → “What's your name?”",
      },
    ],
  },
};

// ================= A2 · Unidade 1 =================

const CONHECENDO_VOCE_MELHOR: Lesson = {
  slug: "conhecendo-voce-melhor",
  level: "A2",
  unit: "Unidade 1 · Getting to Know You Better",
  title: "Conhecendo você melhor",
  intro: "Nesta lição você vai ampliar sua apresentação: falar de trabalho ou estudos, interesses, rotina e personalidade, além de fazer perguntas para manter a conversa.",
  vocab: {
    title: "Informações pessoais com mais detalhes",
    hint: "Ouça e repita cada expressão antes de montar seu perfil.",
    items: [
      { en: "I work as...", pt: "Eu trabalho como..." },
      { en: "I'm studying...", pt: "Eu estou estudando..." },
      { en: "in my free time", pt: "no meu tempo livre" },
      { en: "outgoing", pt: "extrovertido(a)" },
      { en: "organized", pt: "organizado(a)" },
      { en: "usually", pt: "geralmente" },
      { en: "sometimes", pt: "às vezes" },
      { en: "interested in", pt: "interessado(a) em" },
    ],
  },
  listening: {
    title: "Dois colegas se conhecem",
    hint: "Perceba como cada resposta abre espaço para uma nova pergunta.",
    lines: [
      { who: "Nina", en: "What do you do, Leo?", pt: "O que você faz, Leo?" },
      { who: "Leo", en: "I work as a designer, and I'm studying English at night.", pt: "Trabalho como designer e estudo inglês à noite." },
      { who: "Nina", en: "Nice! What do you usually do in your free time?", pt: "Legal! O que você geralmente faz no tempo livre?" },
      { who: "Leo", en: "I usually cook or meet my friends. What about you?", pt: "Geralmente cozinho ou encontro meus amigos. E você?" },
    ],
  },
  expressions: {
    title: "Perguntas que mantêm a conversa",
    hint: "Use uma resposta e uma pergunta de acompanhamento.",
    items: [
      { en: "What do you do?", pt: "O que você faz?" },
      { en: "What are you interested in?", pt: "Em que você se interessa?" },
      { en: "What do you usually do on weekends?", pt: "O que você geralmente faz nos fins de semana?" },
      { en: "How would you describe yourself?", pt: "Como você se descreveria?" },
      { en: "What about you?", pt: "E você?" },
    ],
  },
  exercises: {
    title: "Meu perfil em inglês",
    praise: "Muito bem! Você já consegue se apresentar com mais detalhes e manter a conversa.",
    questions: [
      { kind: "mc", type: "Escolha a opção correta", prompt: "I ___ work from home on Fridays.", hint: "Use um advérbio de frequência.", options: ["usually", "yesterday", "now", "last"], answer: 0, feedbackOk: "Correto! Usually indica um hábito.", feedbackNo: "A opção adequada é usually: I usually work from home on Fridays." },
      { kind: "fill", type: "Complete a frase", prompt: "I'm interested ___ photography.", hint: "Uma preposição.", answers: ["in"], feedbackOk: "Isso! Dizemos interested in.", feedbackNo: "A expressão é interested in." },
      { kind: "mc", type: "Escolha a pergunta", prompt: "Quero saber a profissão de alguém.", hint: "Qual pergunta é usada para ocupação?", options: ["What do you do?", "Where do you do?", "How do you work?", "Who are you do?"], answer: 0, feedbackOk: "Perfeito! What do you do? pergunta a ocupação.", feedbackNo: "Use What do you do? para perguntar a ocupação." },
      { kind: "fill", type: "Tradução PT → EN", prompt: "E você? → What ___ you?", hint: "Uma preposição.", answers: ["about"], feedbackOk: "Muito bem! What about you?", feedbackNo: "A palavra é about." },
      { kind: "mc", type: "Escolha a opção correta", prompt: "She ___ English at night.", hint: "Rotina de she.", options: ["study", "studies", "studying", "studied"], answer: 1, feedbackOk: "Correto! Com she, usamos studies.", feedbackNo: "No present simple, she studies." },
    ],
  },
};

// ================= A2 · Unidade 3 =================

const RESERVAS_E_CHECK_IN: Lesson = {
  slug: "reservas-e-check-in",
  level: "A2",
  unit: "Unidade 3 · No hotel",
  title: "Reservas e check-in",
  intro:
    "Nesta lição você vai aprender a reservar um quarto e fazer o check-in em inglês. Vamos ver o vocabulário do hotel, ouvir uma conversa real, treinar as expressões mais úteis e, no fim, praticar tudo junto. Leva uns 15 minutos — sem pressa!",
  vocab: {
    title: "Palavras do hotel",
    hint: "Toque em “Ouvir” para escutar a pronúncia de cada palavra.",
    items: [
      { en: "reservation", pt: "reserva" },
      { en: "check-in", pt: "registro de entrada" },
      { en: "front desk", pt: "recepção" },
      { en: "room", pt: "quarto" },
      { en: "key card", pt: "cartão-chave" },
      { en: "breakfast", pt: "café da manhã" },
      { en: "luggage", pt: "bagagem" },
      { en: "guest", pt: "hóspede" },
    ],
  },
  listening: {
    title: "Ouvir uma conversa",
    hint: "Um check-in no hotel. Ouça cada fala e tente entender antes de ler a tradução.",
    lines: [
      {
        who: "Recepção",
        en: "Good evening! Welcome to Central Hotel.",
        pt: "Boa noite! Bem-vindo ao Central Hotel.",
      },
      { who: "Hóspede", en: "Hello. I have a reservation under Souza.", pt: "Olá. Tenho uma reserva no nome Souza." },
      {
        who: "Recepção",
        en: "Let me check... Yes, for two nights. Could I have your ID, please?",
        pt: "Deixe-me verificar... Sim, para duas noites. Pode me dar seu documento, por favor?",
      },
      { who: "Hóspede", en: "Here you are. What time is breakfast?", pt: "Aqui está. Que horas é o café da manhã?" },
      {
        who: "Recepção",
        en: "Breakfast is from 7 to 10 am. Here is your key card.",
        pt: "O café da manhã é das 7 às 10h. Aqui está seu cartão-chave.",
      },
    ],
  },
  expressions: {
    title: "Fazendo o check-in",
    hint: "Frases úteis para usar no hotel. Toque em “Ouvir” e repita em voz alta.",
    items: [
      { en: "I have a reservation under Souza.", pt: "Tenho uma reserva no nome Souza." },
      { en: "Could I check in, please?", pt: "Eu poderia fazer o check-in, por favor?" },
      { en: "What time is breakfast?", pt: "Que horas é o café da manhã?" },
      { en: "Is breakfast included?", pt: "O café da manhã está incluído?" },
      { en: "Could you help me with my luggage?", pt: "Você poderia me ajudar com a bagagem?" },
    ],
  },
  exercises: {
    title: "Pratique tudo",
    praise: "Excelente! Você domina o vocabulário do hotel. 🎉",
    questions: [
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "Good evening. I ___ a reservation under the name Souza.",
        hint: "Você chega ao hotel e informa que tem uma reserva.",
        options: ["has", "have", "had", "having"],
        answer: 1,
        feedbackOk: "Correto! Com o sujeito “I” usamos have. → “I have a reservation.”",
        feedbackNo: "Com o sujeito “I” usamos have. → “I have a reservation.”",
      },
      {
        kind: "fill",
        type: "Complete a frase",
        prompt: "___ time is breakfast?",
        hint: "Você quer saber o horário do café da manhã. (uma palavra)",
        answers: ["what"],
        feedbackOk: "Perfeito! “What time is breakfast?” = Que horas é o café da manhã?",
        feedbackNo: "A palavra é What. → “What time is breakfast?”",
      },
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "Could I ___ in now, please?",
        hint: "Você quer fazer o registro de entrada no hotel.",
        options: ["check", "checking", "checked", "to check"],
        answer: 0,
        feedbackOk: "Isso! Depois de “Could I” usamos o verbo na forma base: check in.",
        feedbackNo: "Depois de “Could I” o verbo fica na forma base: “Could I check in?”",
      },
      {
        kind: "fill",
        type: "Tradução PT → EN",
        prompt: "Eu tenho uma reserva. → I ___ a reservation.",
        hint: "Lembre da regra do sujeito “I”.",
        answers: ["have"],
        feedbackOk: "Muito bem! “I have a reservation.”",
        feedbackNo: "A forma é have. → “I have a reservation.”",
      },
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "Breakfast is served ___ 7 to 10 am.",
        hint: "Indicando o intervalo de horário.",
        options: ["in", "from", "at", "since"],
        answer: 1,
        feedbackOk: "Exato! Usamos from ... to para intervalos: “from 7 to 10 am.”",
        feedbackNo: "Para um intervalo usamos from ... to: “from 7 to 10 am.”",
      },
    ],
  },
};

// ================= B1 · Unidade 1 =================

const WHO_I_AM: Lesson = {
  slug: "who-i-am",
  level: "B1",
  unit: "Unidade 1 · Who I Am",
  title: "Who I Am",
  intro: "Nesta lição você vai construir uma apresentação mais autêntica: descrever sua personalidade, interesses e experiências, conectando passado e presente com clareza.",
  vocab: {
    title: "Identidade, valores e trajetória",
    hint: "Ouça e pense em um exemplo verdadeiro sobre você.",
    items: [
      { en: "open-minded", pt: "mente aberta" },
      { en: "reliable", pt: "confiável" },
      { en: "curious", pt: "curioso(a)" },
      { en: "background", pt: "histórico / trajetória" },
      { en: "achievement", pt: "conquista" },
      { en: "challenge", pt: "desafio" },
      { en: "value", pt: "valorizar" },
      { en: "grow", pt: "crescer / se desenvolver" },
    ],
  },
  listening: {
    title: "Uma apresentação profissional e pessoal",
    hint: "Observe como Maya conecta uma experiência passada à pessoa que é hoje.",
    lines: [
      { who: "Maya", en: "I'm a curious and practical person. I've always enjoyed solving problems.", pt: "Sou uma pessoa curiosa e prática. Sempre gostei de resolver problemas." },
      { who: "Ben", en: "Has that influenced your career?", pt: "Isso influenciou sua carreira?" },
      { who: "Maya", en: "Definitely. I started in customer service, but I moved into technology three years ago.", pt: "Com certeza. Comecei em atendimento, mas migrei para tecnologia há três anos." },
      { who: "Ben", en: "What have you learned from that change?", pt: "O que você aprendeu com essa mudança?" },
      { who: "Maya", en: "I've learned to adapt quickly and ask better questions.", pt: "Aprendi a me adaptar rapidamente e fazer perguntas melhores." },
    ],
  },
  expressions: {
    title: "Apresentando quem você é",
    hint: "Conecte característica, evidência e aprendizado.",
    items: [
      { en: "I'd describe myself as...", pt: "Eu me descreveria como..." },
      { en: "I've always been interested in...", pt: "Sempre me interessei por..." },
      { en: "That experience taught me to...", pt: "Essa experiência me ensinou a..." },
      { en: "One thing I really value is...", pt: "Uma coisa que valorizo muito é..." },
      { en: "How did that affect you?", pt: "Como isso afetou você?" },
    ],
  },
  exercises: {
    title: "Minha identidade e trajetória",
    praise: "Excelente! Você conectou identidade, experiência e aprendizado em nível B1.",
    questions: [
      { kind: "mc", type: "Escolha a opção correta", prompt: "I've always ___ interested in languages.", hint: "Present perfect com estado contínuo.", options: ["be", "been", "being", "was"], answer: 1, feedbackOk: "Correto! I've always been interested in...", feedbackNo: "Depois de have, usamos been." },
      { kind: "fill", type: "Complete a frase", prompt: "That experience taught me ___ adapt quickly.", hint: "Uma palavra.", answers: ["to"], feedbackOk: "Isso! Taught me to adapt.", feedbackNo: "Use to antes do verbo: taught me to adapt." },
      { kind: "mc", type: "Escolha a opção correta", prompt: "I ___ into technology three years ago.", hint: "A ação tem tempo passado definido.", options: ["have moved", "move", "moved", "have move"], answer: 2, feedbackOk: "Perfeito! Three years ago pede past simple: moved.", feedbackNo: "Com ago, usamos past simple: moved." },
      { kind: "fill", type: "Tradução PT → EN", prompt: "Eu me descreveria como curioso. → I'd describe myself ___ curious.", hint: "Uma preposição.", answers: ["as"], feedbackOk: "Muito bem! Describe myself as curious.", feedbackNo: "A expressão é describe myself as." },
      { kind: "mc", type: "Escolha a melhor continuação", prompt: "I've changed careers twice. ___", hint: "Demonstre interesse e aprofunde.", options: ["How did that affect you?", "Where you affect?", "Did affect that?", "How that you did?"], answer: 0, feedbackOk: "Exato! A pergunta mantém a conversa e pede reflexão.", feedbackNo: "Use How did that affect you?" },
    ],
  },
};

// ================= B1 · Unidade 2 =================

const CONTANDO_UMA_EXPERIENCIA: Lesson = {
  slug: "contando-uma-experiencia",
  level: "B1",
  unit: "Unidade 1 · Experiências de vida",
  title: "Contando uma experiência",
  intro:
    "Nesta lição você vai aprender a falar sobre coisas que já viveu — viagens, conquistas, primeiras vezes — usando o present perfect. A diferença entre “I went” e “I have been” é o coração desta aula. Vamos ver o vocabulário, ouvir uma conversa real, treinar as frases e praticar. Uns 8 minutos.",
  vocab: {
    title: "Palavras de experiência",
    hint: "Toque em “Ouvir” para escutar a pronúncia de cada palavra.",
    items: [
      { en: "experience", pt: "experiência" },
      { en: "abroad", pt: "no exterior" },
      { en: "ever", pt: "alguma vez" },
      { en: "never", pt: "nunca" },
      { en: "already", pt: "já" },
      { en: "yet", pt: "ainda" },
      { en: "achievement", pt: "conquista" },
      { en: "unforgettable", pt: "inesquecível" },
    ],
  },
  listening: {
    title: "Falando sobre viagens",
    hint: "Duas amigas comparam experiências. Repare em quando elas usam “have been” e quando usam “went”.",
    lines: [
      { who: "Clara", en: "Have you ever been abroad?", pt: "Você já esteve no exterior?" },
      {
        who: "Júlia",
        en: "Yes, I have! I went to Portugal last year.",
        pt: "Sim, já! Eu fui a Portugal no ano passado.",
      },
      {
        who: "Clara",
        en: "Nice! I've never travelled outside Brazil, but I'd love to.",
        pt: "Que legal! Eu nunca viajei para fora do Brasil, mas adoraria.",
      },
      {
        who: "Júlia",
        en: "You should go. It was an unforgettable experience.",
        pt: "Você deveria ir. Foi uma experiência inesquecível.",
      },
      {
        who: "Clara",
        en: "I haven't saved enough money yet, but I've already started planning.",
        pt: "Ainda não juntei dinheiro suficiente, mas já comecei a planejar.",
      },
    ],
  },
  expressions: {
    title: "Frases para contar o que você viveu",
    hint: "Frases que aparecem sempre que alguém conta uma experiência. Ouça e repita em voz alta.",
    items: [
      { en: "Have you ever been to London?", pt: "Você já esteve em Londres?" },
      { en: "I've never tried sushi.", pt: "Eu nunca experimentei sushi." },
      { en: "I've already finished the course.", pt: "Eu já terminei o curso." },
      { en: "I haven't decided yet.", pt: "Eu ainda não decidi." },
      { en: "It was an unforgettable experience.", pt: "Foi uma experiência inesquecível." },
      { en: "That's the best trip I've ever taken.", pt: "Essa é a melhor viagem que eu já fiz." },
    ],
  },
  exercises: {
    title: "Pratique tudo",
    praise: "Excelente! Você já domina o present perfect. 🎉",
    questions: [
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "___ you ever been to London?",
        hint: "Perguntando sobre uma experiência de vida, sem dizer quando.",
        options: ["Did", "Have", "Are", "Do"],
        answer: 1,
        feedbackOk: "Correto! Experiência de vida pede present perfect: “Have you ever been…?”",
        feedbackNo: "Para experiências de vida usamos present perfect: “Have you ever been…?”",
      },
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "I ___ to Portugal last year.",
        hint: "Tem um tempo definido no passado (“last year”).",
        options: ["have gone", "went", "have been", "go"],
        answer: 1,
        feedbackOk: "Isso! Com tempo definido no passado usamos o passado simples: “I went last year.”",
        feedbackNo: "Com um tempo definido (“last year”) usamos o passado simples: “I went to Portugal last year.”",
      },
      {
        kind: "fill",
        type: "Complete a frase",
        prompt: "I've ___ travelled outside Brazil.",
        hint: "Você quer dizer que isso nunca aconteceu na sua vida. (uma palavra)",
        answers: ["never"],
        feedbackOk: "Perfeito! “I've never travelled outside Brazil.”",
        feedbackNo: "A palavra é never. → “I've never travelled outside Brazil.”",
      },
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "I haven't decided ___.",
        hint: "Algo que não aconteceu até agora, mas ainda pode acontecer.",
        options: ["already", "ever", "yet", "still"],
        answer: 2,
        feedbackOk: "Exato! Em frases negativas usamos yet no final: “I haven't decided yet.”",
        feedbackNo: "Em frases negativas usamos yet no final: “I haven't decided yet.”",
      },
      {
        kind: "fill",
        type: "Tradução PT → EN",
        prompt: "Eu já terminei o curso. → I've ___ finished the course.",
        hint: "O “já” de algo concluído antes do esperado. (uma palavra)",
        answers: ["already"],
        feedbackOk: "Muito bem! “I've already finished the course.”",
        feedbackNo: "A palavra é already. → “I've already finished the course.”",
      },
    ],
  },
};

// ================= B2 · Unidade 1 =================

const IDENTITY_PERSONAL_DEVELOPMENT: Lesson = {
  slug: "identity-personal-development",
  level: "B2",
  unit: "Unidade 1 · Identity & Personal Development",
  title: "Identity & Personal Development",
  intro: "Nesta lição você vai construir uma reflexão mais profunda sobre quem é, como mudou e o que vem desenvolvendo. O foco não é apenas descrever características, mas relacionar experiências, hábitos e escolhas à sua identidade atual.",
  vocab: {
    title: "Desenvolvimento pessoal com nuance",
    hint: "Ouça as expressões e pense em uma evidência verdadeira para cada uma.",
    items: [
      { en: "self-aware", pt: "consciente de si" },
      { en: "resilient", pt: "resiliente" },
      { en: "adaptable", pt: "adaptável" },
      { en: "strength", pt: "ponto forte" },
      { en: "weakness", pt: "ponto a desenvolver" },
      { en: "mindset", pt: "mentalidade" },
      { en: "turning point", pt: "momento decisivo" },
      { en: "work on", pt: "trabalhar para melhorar" },
    ],
  },
  listening: {
    title: "Uma mudança construída ao longo do tempo",
    hint: "Observe a diferença entre uma mudança concluída e um processo que continua.",
    lines: [
      { who: "Interviewer", en: "How would you say you've changed over the last few years?", pt: "Como você diria que mudou nos últimos anos?" },
      { who: "Sam", en: "I've become more self-aware, especially since I started leading a team.", pt: "Tornei-me mais consciente de mim, especialmente desde que comecei a liderar uma equipe." },
      { who: "Interviewer", en: "Was there a particular turning point?", pt: "Houve algum momento decisivo?" },
      { who: "Sam", en: "Yes. I received difficult feedback two years ago, and it changed the way I communicate.", pt: "Sim. Recebi um feedback difícil há dois anos, e isso mudou minha forma de me comunicar." },
      { who: "Interviewer", en: "What have you been working on recently?", pt: "Em que você vem trabalhando recentemente?" },
      { who: "Sam", en: "I've been working on listening more carefully before offering a solution.", pt: "Venho trabalhando em ouvir com mais atenção antes de oferecer uma solução." },
    ],
  },
  expressions: {
    title: "Conectando passado, presente e desenvolvimento",
    hint: "Use as estruturas para acrescentar evidência e reflexão, não apenas uma lista de adjetivos.",
    items: [
      { en: "Looking back, I'd say...", pt: "Olhando para trás, eu diria..." },
      { en: "One of my main strengths is...", pt: "Um dos meus principais pontos fortes é..." },
      { en: "I've become more... since...", pt: "Eu me tornei mais... desde..." },
      { en: "I've been working on...", pt: "Venho trabalhando em..." },
      { en: "That experience changed the way I...", pt: "Essa experiência mudou a forma como eu..." },
    ],
  },
  exercises: {
    title: "Minha trajetória de desenvolvimento",
    praise: "Excelente! Você conectou mudança, duração e reflexão com a precisão esperada no B2.",
    questions: [
      { kind: "mc", type: "Escolha a opção correta", prompt: "I've ___ more confident since I started presenting regularly.", hint: "Mudança que ocorreu ao longo do tempo.", options: ["become", "became", "becoming", "been become"], answer: 0, feedbackOk: "Correto! Present perfect: I've become more confident.", feedbackNo: "Depois de have usamos o particípio become: I've become." },
      { kind: "fill", type: "Complete a frase", prompt: "I've been working ___ my communication skills for months.", hint: "Uma preposição.", answers: ["on"], feedbackOk: "Isso! Work on significa trabalhar para desenvolver algo.", feedbackNo: "A expressão é work on." },
      { kind: "mc", type: "Escolha a opção correta", prompt: "I ___ difficult feedback two years ago.", hint: "O momento passado está definido.", options: ["have received", "receive", "received", "have been receiving"], answer: 2, feedbackOk: "Perfeito! Two years ago pede past simple: received.", feedbackNo: "Com um tempo passado definido, usamos received." },
      { kind: "fill", type: "Complete a frase", prompt: "What have you been ___ on recently?", hint: "Forma -ing do verbo work.", answers: ["working"], feedbackOk: "Muito bem! Have been working descreve um processo recente.", feedbackNo: "A forma correta é working." },
      { kind: "mc", type: "Escolha a melhor resposta", prompt: "What is one of your strengths?", hint: "A resposta B2 inclui característica e evidência.", options: ["I'm adaptable because I've learned to work well with different teams.", "Adaptable.", "I adaptation very.", "I was strength."], answer: 0, feedbackOk: "Exato! A resposta apresenta a força e a sustenta com evidência.", feedbackNo: "No B2, escolha a resposta que acrescenta uma justificativa concreta." },
    ],
  },
};

// ================= B2 · Unidade 2 =================

const CONTANDO_UMA_HISTORIA: Lesson = {
  slug: "contando-uma-historia",
  level: "B2",
  unit: "Unidade 2 · Experiences & Storytelling",
  title: "Contando uma história real",
  intro:
    "Nesta lição você vai aprender a narrar um acontecimento com precisão: o que já tinha acontecido antes, o que você estava fazendo quando algo interrompeu, e como terminou. Past perfect e present perfect continuous são as ferramentas. Uns 8 minutos.",
  vocab: {
    title: "Palavras para narrar",
    hint: "Toque em “Ouvir” para escutar a pronúncia de cada palavra.",
    items: [
      { en: "meanwhile", pt: "enquanto isso" },
      { en: "eventually", pt: "no fim das contas" },
      { en: "suddenly", pt: "de repente" },
      { en: "by the time", pt: "quando (já)" },
      { en: "to turn out", pt: "acabar sendo / revelar-se" },
      { en: "to realize", pt: "perceber / dar-se conta" },
      { en: "delay", pt: "atraso" },
      { en: "on purpose", pt: "de propósito" },
    ],
  },
  listening: {
    title: "A história do voo perdido",
    hint: "Rafael conta como perdeu um voo. Repare em “had already left” e “had been waiting”.",
    lines: [
      { who: "Bia", en: "So, what happened at the airport?", pt: "Então, o que aconteceu no aeroporto?" },
      {
        who: "Rafael",
        en: "By the time I arrived, the plane had already left.",
        pt: "Quando eu cheguei, o avião já tinha partido.",
      },
      {
        who: "Bia",
        en: "No way! Had you left home late?",
        pt: "Não acredito! Você tinha saído de casa tarde?",
      },
      {
        who: "Rafael",
        en: "Not at all. I'd been waiting in traffic for two hours.",
        pt: "De jeito nenhum. Eu estava esperando no trânsito havia duas horas.",
      },
      {
        who: "Rafael",
        en: "It turned out there was an accident. Eventually, they put me on the next flight.",
        pt: "Acabou que tinha um acidente. No fim das contas, me colocaram no voo seguinte.",
      },
    ],
  },
  expressions: {
    title: "Frases para encadear a história",
    hint: "Frases que dão ritmo à narrativa. Ouça e repita em voz alta.",
    items: [
      { en: "By the time I arrived, it had already started.", pt: "Quando eu cheguei, já tinha começado." },
      { en: "I'd been waiting for two hours when they called me.", pt: "Eu estava esperando havia duas horas quando me chamaram." },
      { en: "It turned out that the flight was cancelled.", pt: "Acabou que o voo foi cancelado." },
      { en: "To cut a long story short, we missed it.", pt: "Resumindo a história, nós perdemos." },
      { en: "Meanwhile, my luggage was on its way to Lisbon.", pt: "Enquanto isso, minha bagagem estava a caminho de Lisboa." },
      { en: "Eventually, everything worked out.", pt: "No fim das contas, tudo deu certo." },
    ],
  },
  exercises: {
    title: "Pratique tudo",
    praise: "Excelente! Sua narrativa em inglês ficou muito mais precisa. 🎉",
    questions: [
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "By the time I arrived, the plane ___ already left.",
        hint: "Uma ação que terminou ANTES de outra ação no passado.",
        options: ["has", "had", "was", "would"],
        answer: 1,
        feedbackOk: "Correto! Para o “passado antes do passado” usamos past perfect: “had already left.”",
        feedbackNo: "Para uma ação anterior a outra no passado usamos past perfect: “had already left.”",
      },
      {
        kind: "fill",
        type: "Complete a frase",
        prompt: "I'd ___ waiting for two hours when they finally called me.",
        hint: "Ação em andamento que durou até outro momento do passado. (uma palavra)",
        answers: ["been"],
        feedbackOk: "Perfeito! “I'd been waiting for two hours…” (past perfect continuous)",
        feedbackNo: "A forma é been. → “I'd been waiting for two hours…”",
      },
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "It ___ out that the flight had been cancelled.",
        hint: "O phrasal verb de “acabou que / revelou-se que”.",
        options: ["came", "turned", "went", "found"],
        answer: 1,
        feedbackOk: "Isso! “It turned out that…” = Acabou que…",
        feedbackNo: "O phrasal verb é turn out. → “It turned out that…”",
      },
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "___, my luggage was already on its way to Lisbon.",
        hint: "Conectando duas coisas que aconteciam ao mesmo tempo.",
        options: ["Meanwhile", "However", "Therefore", "Instead"],
        answer: 0,
        feedbackOk: "Exato! Meanwhile = enquanto isso.",
        feedbackNo: "O conectivo de simultaneidade é Meanwhile (enquanto isso).",
      },
      {
        kind: "fill",
        type: "Tradução PT → EN",
        prompt: "No fim das contas, tudo deu certo. → ___, everything worked out.",
        hint: "O advérbio de “no fim das contas / por fim”. (uma palavra)",
        answers: ["eventually"],
        feedbackOk: "Muito bem! “Eventually, everything worked out.”",
        feedbackNo: "A palavra é Eventually. Cuidado: não significa “eventualmente”, e sim “no fim das contas”.",
      },
    ],
  },
};

// ================= C1 · Unidade 1 =================

const IDENTITY_VALUES_PERSPECTIVE: Lesson = {
  slug: "identity-values-perspective",
  level: "C1",
  unit: "Unidade 1 · Identity, Values & Perspective",
  title: "Identity, Values & Perspective",
  intro: "Nesta lição você vai além de descrever quem é: vai explicar como experiências, valores e decisões moldaram sua visão de mundo, controlando ressalva, ênfase e grau de convicção.",
  vocab: {
    title: "Valores, perspectiva e influência",
    hint: "Ouça cada item e associe-o a uma escolha ou experiência concreta.",
    items: [
      { en: "deeply held belief", pt: "convicção profundamente arraigada" },
      { en: "guiding principle", pt: "princípio orientador" },
      { en: "worldview", pt: "visão de mundo" },
      { en: "assumption", pt: "pressuposto" },
      { en: "open to revision", pt: "aberto(a) a revisão" },
      { en: "shape one's perspective", pt: "moldar a perspectiva de alguém" },
      { en: "stand by a decision", pt: "sustentar uma decisão" },
      { en: "reassess", pt: "reavaliar" },
    ],
  },
  listening: {
    title: "Como uma perspectiva se transforma",
    hint: "Observe como a falante equilibra convicção, ressalva e mudança de opinião.",
    lines: [
      { who: "Interviewer", en: "Which value has had the greatest influence on your decisions?", pt: "Qual valor teve maior influência nas suas decisões?" },
      { who: "Leah", en: "I tend to place a great deal of value on independence, although my understanding of it has changed considerably.", pt: "Tendo a valorizar muito a independência, embora minha compreensão dela tenha mudado consideravelmente." },
      { who: "Interviewer", en: "What prompted that change?", pt: "O que provocou essa mudança?" },
      { who: "Leah", en: "What really shaped my perspective was leading a team through a difficult period.", pt: "O que realmente moldou minha perspectiva foi liderar uma equipe durante um período difícil." },
      { who: "Leah", en: "I came to realize that independence doesn't necessarily mean working in isolation.", pt: "Percebi que independência não significa necessariamente trabalhar de forma isolada." },
    ],
  },
  expressions: {
    title: "Nuance, convicção e revisão",
    hint: "Combine uma posição, uma ressalva e uma evidência.",
    items: [
      { en: "I tend to believe that...", pt: "Tendo a acreditar que..." },
      { en: "To some extent, I agree...", pt: "Até certo ponto, concordo..." },
      { en: "What really shaped my opinion was...", pt: "O que realmente moldou minha opinião foi..." },
      { en: "That isn't necessarily to say that...", pt: "Isso não significa necessariamente que..." },
      { en: "I've come to reassess...", pt: "Passei a reavaliar..." },
    ],
  },
  exercises: {
    title: "Minha perspectiva em contexto",
    praise: "Excelente! Você articulou posição, ressalva e influência com controle de nível C1.",
    questions: [
      { kind: "mc", type: "Escolha a formulação mais nuançada", prompt: "___, I agree with that perspective, although there are important exceptions.", hint: "Concordância parcial.", options: ["To some extent", "Completely always", "Without doubt all", "At every extent"], answer: 0, feedbackOk: "Correto! To some extent limita a concordância com precisão.", feedbackNo: "Use To some extent para sinalizar concordância parcial." },
      { kind: "fill", type: "Complete a frase", prompt: "What really ___ my perspective was leading a diverse team.", hint: "Verbo: moldar, no passado.", answers: ["shaped"], feedbackOk: "Isso! Shaped indica a influência que formou a perspectiva.", feedbackNo: "A forma correta é shaped." },
      { kind: "mc", type: "Escolha a opção correta", prompt: "That doesn't necessarily ___ that independence requires isolation.", hint: "Estrutura: doesn't + verbo base.", options: ["means", "mean", "meaning", "meant"], answer: 1, feedbackOk: "Perfeito! Depois de doesn't, usamos mean.", feedbackNo: "A estrutura exige o verbo base: doesn't mean." },
      { kind: "fill", type: "Complete a frase", prompt: "I've come to ___ some of my earlier assumptions.", hint: "Verbo: reavaliar.", answers: ["reassess"], feedbackOk: "Muito bem! Come to reassess expressa mudança reflexiva.", feedbackNo: "A palavra é reassess." },
      { kind: "mc", type: "Escolha a resposta C1", prompt: "Has your view of success changed?", hint: "Procure posição, mudança e evidência.", options: ["Yes, completely.", "I've come to see success less as status and more as the ability to make choices that align with my values.", "Success changed me yes.", "I think success is good."], answer: 1, feedbackOk: "Exato! A resposta define a mudança com contraste e precisão.", feedbackNo: "A melhor resposta explica como a definição mudou e qual valor passou a orientá-la." },
    ],
  },
};

// ================= C1 · Unidade 3 =================

const DISCORDANDO_COM_TATO: Lesson = {
  slug: "discordando-com-tato",
  level: "C1",
  unit: "Unidade 3 · Debate & Critical Thinking",
  title: "Discordando com tato",
  intro:
    "Nesta lição você vai aprender a discordar sem soar agressivo — reconhecer o ponto do outro, suavizar a objeção e ainda assim defender sua posição. É a diferença entre “You're wrong” e “I see your point, but…”. Uns 8 minutos.",
  vocab: {
    title: "Vocabulário de argumentação",
    hint: "Toque em “Ouvir” para escutar a pronúncia de cada expressão.",
    items: [
      { en: "to some extent", pt: "até certo ponto" },
      { en: "admittedly", pt: "é verdade que / reconheço que" },
      { en: "nonetheless", pt: "ainda assim" },
      { en: "a valid point", pt: "um argumento válido" },
      { en: "to oversimplify", pt: "simplificar demais" },
      { en: "common ground", pt: "ponto em comum" },
      { en: "to concede", pt: "conceder / admitir" },
      { en: "nuance", pt: "nuance / sutileza" },
    ],
  },
  listening: {
    title: "Discordando numa reunião",
    hint: "Dois colegas discordam sobre trabalho remoto — sem nenhuma grosseria. Repare nas suavizações.",
    lines: [
      {
        who: "Helena",
        en: "I think remote work has hurt our team's creativity.",
        pt: "Eu acho que o trabalho remoto prejudicou a criatividade do time.",
      },
      {
        who: "Marcos",
        en: "I see your point, and to some extent I agree.",
        pt: "Entendo seu ponto, e até certo ponto eu concordo.",
      },
      {
        who: "Marcos",
        en: "That said, I'm not entirely convinced the format is to blame.",
        pt: "Dito isso, não estou totalmente convencido de que o formato seja o culpado.",
      },
      {
        who: "Helena",
        en: "That's a fair objection. What would you attribute it to?",
        pt: "É uma objeção justa. A que você atribuiria isso?",
      },
      {
        who: "Marcos",
        en: "Admittedly it's complex, but I'd say we simply stopped meeting regularly.",
        pt: "Reconheço que é complexo, mas eu diria que simplesmente paramos de nos reunir com frequência.",
      },
    ],
  },
  expressions: {
    title: "Frases para discordar com elegância",
    hint: "O tom é tão importante quanto o argumento. Ouça e repita em voz alta.",
    items: [
      { en: "I see your point, but…", pt: "Entendo seu ponto, mas…" },
      { en: "That's a valid point; however,…", pt: "É um argumento válido; no entanto,…" },
      { en: "I'm not entirely convinced that…", pt: "Não estou totalmente convencido de que…" },
      { en: "I'd argue the opposite, actually.", pt: "Na verdade, eu argumentaria o contrário." },
      { en: "Wouldn't you agree that…?", pt: "Você não concordaria que…?" },
      { en: "Let's try to find some common ground.", pt: "Vamos tentar encontrar um ponto em comum." },
    ],
  },
  exercises: {
    title: "Pratique tudo",
    praise: "Excelente! Você discorda com precisão e diplomacia. 🎉",
    questions: [
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "That's a valid point; ___, the data suggests otherwise.",
        hint: "Um conectivo formal de contraste, no meio da frase.",
        options: ["however", "although", "despite", "even"],
        answer: 0,
        feedbackOk: "Correto! However conecta duas orações independentes: “…; however, the data…”",
        feedbackNo: "Use however depois do ponto e vírgula. Although liga orações sem pontuação forte.",
      },
      {
        kind: "fill",
        type: "Complete a frase",
        prompt: "I'm not ___ convinced that remote work is the cause.",
        hint: "Suavizando a discordância: “não estou TOTALMENTE convencido”. (uma palavra)",
        answers: ["entirely", "fully", "completely"],
        feedbackOk: "Perfeito! “I'm not entirely convinced…” soa muito mais diplomático que “I disagree.”",
        feedbackNo: "Uma boa opção é entirely. → “I'm not entirely convinced that…”",
      },
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "___ it's a complex issue, but I'd still question that conclusion.",
        hint: "Reconhecendo algo antes de objetar.",
        options: ["Admittedly", "Obviously", "Hopefully", "Rarely"],
        answer: 0,
        feedbackOk: "Isso! Admittedly = reconheço que — abre espaço antes da objeção.",
        feedbackNo: "O advérbio de concessão é Admittedly (reconheço que / é verdade que).",
      },
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "I agree ___ some extent, but not completely.",
        hint: "A preposição fixa dessa expressão de grau.",
        options: ["in", "at", "to", "on"],
        answer: 2,
        feedbackOk: "Exato! A expressão fixa é to some extent (até certo ponto).",
        feedbackNo: "A expressão fixa é to some extent — sempre com to.",
      },
      {
        kind: "fill",
        type: "Tradução PT → EN",
        prompt: "Vamos encontrar um ponto em comum. → Let's find some common ___.",
        hint: "A palavra literalmente significa “terreno”. (uma palavra)",
        answers: ["ground"],
        feedbackOk: "Muito bem! “Let's find some common ground.”",
        feedbackNo: "A palavra é ground. → “common ground” = ponto em comum.",
      },
    ],
  },
};

// ================= C2 · Unidade 1 =================

const ARGUMENTO_PERSUASIVO: Lesson = {
  slug: "argumento-persuasivo",
  level: "C2",
  unit: "Unidade 1 · Retórica e persuasão",
  title: "Construindo um argumento persuasivo",
  intro:
    "Nesta lição você vai usar recursos retóricos de alto nível: inversão enfática, condicionais invertidos e a arte de conceder um ponto para fortalecer o seu. É o inglês de quem convence uma sala. Uns 8 minutos.",
  vocab: {
    title: "Vocabulário de retórica",
    hint: "Toque em “Ouvir” para escutar a pronúncia de cada palavra.",
    items: [
      { en: "compelling", pt: "convincente / irresistível" },
      { en: "premise", pt: "premissa" },
      { en: "to undermine", pt: "minar / enfraquecer" },
      { en: "to substantiate", pt: "fundamentar / comprovar" },
      { en: "to refute", pt: "refutar" },
      { en: "to concede", pt: "conceder / admitir" },
      { en: "compelling evidence", pt: "evidência contundente" },
      { en: "at odds with", pt: "em desacordo com" },
    ],
  },
  listening: {
    title: "Defendendo uma proposta",
    hint: "Uma diretora defende um investimento. Repare nas inversões: “Not only does…”, “Rarely have I…”.",
    lines: [
      {
        who: "Diretora",
        en: "Not only does this proposal reduce costs, but it also shortens delivery time.",
        pt: "Esta proposta não apenas reduz custos, como também encurta o prazo de entrega.",
      },
      {
        who: "Conselheiro",
        en: "The premise is sound, though the figures need to be substantiated.",
        pt: "A premissa é sólida, embora os números precisem ser fundamentados.",
      },
      {
        who: "Diretora",
        en: "Granted. Rarely have I seen a case this well documented, however.",
        pt: "Concedo. Ainda assim, raramente vi um caso tão bem documentado.",
      },
      {
        who: "Conselheiro",
        en: "Had we adopted this two years ago, we would have avoided the loss.",
        pt: "Se tivéssemos adotado isso dois anos atrás, teríamos evitado o prejuízo.",
      },
      {
        who: "Diretora",
        en: "Precisely. That is exactly why I'd urge the board to act now.",
        pt: "Exatamente. É precisamente por isso que eu insistiria para o conselho agir agora.",
      },
    ],
  },
  expressions: {
    title: "Frases de alto impacto",
    hint: "Estruturas que dão peso retórico ao argumento. Ouça e repita em voz alta.",
    items: [
      { en: "Not only does it save time, but it also cuts costs.", pt: "Não apenas economiza tempo, como também corta custos." },
      { en: "Had we acted sooner, we would have avoided this.", pt: "Se tivéssemos agido antes, teríamos evitado isso." },
      { en: "Rarely have I seen such a compelling case.", pt: "Raramente vi um caso tão convincente." },
      { en: "That is precisely why we must act now.", pt: "É precisamente por isso que devemos agir agora." },
      { en: "While I concede that point, the conclusion doesn't follow.", pt: "Embora eu conceda esse ponto, a conclusão não se sustenta." },
      { en: "The evidence firmly substantiates this claim.", pt: "As evidências fundamentam solidamente essa afirmação." },
    ],
  },
  exercises: {
    title: "Pratique tudo",
    praise: "Impecável! Sua retórica em inglês está em nível nativo. 🎉",
    questions: [
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "Not only ___ this proposal reduce costs, but it also saves time.",
        hint: "Depois de “Not only” no início da frase, a ordem se inverte.",
        options: ["this", "does", "it", "is"],
        answer: 1,
        feedbackOk: "Correto! “Not only” no início força a inversão: “Not only does this proposal reduce…”",
        feedbackNo: "“Not only” no início exige inversão com o auxiliar: “Not only does this proposal reduce…”",
      },
      {
        kind: "fill",
        type: "Complete a frase",
        prompt: "___ we acted sooner, we would have avoided the loss.",
        hint: "Condicional invertido: substitui “If we had…” sem usar “if”. (uma palavra)",
        answers: ["had"],
        feedbackOk: "Perfeito! “Had we acted sooner…” = “If we had acted sooner…”, com mais formalidade.",
        feedbackNo: "A forma é Had. → “Had we acted sooner, we would have avoided the loss.”",
      },
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "Rarely ___ I seen such a compelling case.",
        hint: "Advérbio negativo no início também inverte a ordem.",
        options: ["have", "had", "did", "was"],
        answer: 0,
        feedbackOk: "Isso! “Rarely have I seen…” — o advérbio negativo puxa o auxiliar para frente.",
        feedbackNo: "Com “Rarely” no início invertemos: “Rarely have I seen such a compelling case.”",
      },
      {
        kind: "mc",
        type: "Escolha a opção correta",
        prompt: "The board insisted that the report ___ reviewed before Friday.",
        hint: "Subjuntivo depois de verbos de exigência (insist, demand, require).",
        options: ["is", "was", "be", "will be"],
        answer: 2,
        feedbackOk: "Exato! Depois de insist that usamos o subjuntivo: “that the report be reviewed.”",
        feedbackNo: "Verbos de exigência pedem subjuntivo: “insisted that the report be reviewed.”",
      },
      {
        kind: "fill",
        type: "Tradução PT → EN",
        prompt: "As evidências fundamentam essa afirmação. → The evidence ___ this claim.",
        hint: "O verbo formal de “dar base / comprovar”. (uma palavra)",
        answers: ["substantiates"],
        feedbackOk: "Muito bem! “The evidence substantiates this claim.”",
        feedbackNo: "O verbo é substantiates. → “The evidence substantiates this claim.”",
      },
    ],
  },
};

export const LESSONS: Record<string, Lesson> = {
  [APRESENTANDO_SE.slug]: APRESENTANDO_SE,
  [CONHECENDO_VOCE_MELHOR.slug]: CONHECENDO_VOCE_MELHOR,
  [RESERVAS_E_CHECK_IN.slug]: RESERVAS_E_CHECK_IN,
  [WHO_I_AM.slug]: WHO_I_AM,
  [CONTANDO_UMA_EXPERIENCIA.slug]: CONTANDO_UMA_EXPERIENCIA,
  [IDENTITY_PERSONAL_DEVELOPMENT.slug]: IDENTITY_PERSONAL_DEVELOPMENT,
  [CONTANDO_UMA_HISTORIA.slug]: CONTANDO_UMA_HISTORIA,
  [IDENTITY_VALUES_PERSPECTIVE.slug]: IDENTITY_VALUES_PERSPECTIVE,
  [DISCORDANDO_COM_TATO.slug]: DISCORDANDO_COM_TATO,
  [ARGUMENTO_PERSUASIVO.slug]: ARGUMENTO_PERSUASIVO,
};

/** Lições de cada nível, na ordem em que devem ser feitas. */
export const LESSONS_BY_LEVEL: Record<CefrLevel, string[]> = {
  A1: [APRESENTANDO_SE.slug],
  A2: [CONHECENDO_VOCE_MELHOR.slug, RESERVAS_E_CHECK_IN.slug],
  B1: [WHO_I_AM.slug, CONTANDO_UMA_EXPERIENCIA.slug],
  B2: [IDENTITY_PERSONAL_DEVELOPMENT.slug, CONTANDO_UMA_HISTORIA.slug],
  C1: [IDENTITY_VALUES_PERSPECTIVE.slug, DISCORDANDO_COM_TATO.slug],
  C2: [ARGUMENTO_PERSUASIVO.slug],
};

export function levelHasLesson(level: CefrLevel): boolean {
  return LESSONS_BY_LEVEL[level].length > 0;
}

/** Nível de lição a mostrar pro aluno, caindo pro mais próximo que já tem conteúdo. */
export function resolveLessonLevel(level: CefrLevel): CefrLevel {
  return nearestLevelWithContent(level, levelHasLesson, "A2");
}

/** As 5 etapas da lição, na ordem, já com o link de cada uma. */
export function lessonSteps(lesson: Lesson) {
  const base = `/aluno/licao/${lesson.slug}`;
  return [
    { id: "intro" as StepId, eyebrow: "Introdução", title: "Comece por aqui", href: `${base}/intro` },
    { id: "vocabulario" as StepId, eyebrow: "Vocabulário", title: lesson.vocab.title, href: `${base}/vocabulario` },
    { id: "listening" as StepId, eyebrow: "Listening", title: lesson.listening.title, href: `${base}/listening` },
    { id: "expressoes" as StepId, eyebrow: "Expressões", title: lesson.expressions.title, href: `${base}/expressoes` },
    { id: "exercicios" as StepId, eyebrow: "Tarefa final", title: lesson.exercises.title, href: `${base}/exercicios` },
  ];
}
