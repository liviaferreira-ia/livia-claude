// Trilha do curso (unidades e lições), organizada por nível CEFR (A1-C2).
// Segue o mesmo padrão de `exercises.ts`: nem todo nível tem trilha própria
// ainda — `resolveCourseLevel` cai pro nível populado mais próximo.

import { nearestLevelWithContent, type CefrLevel } from "@/data/placement";

export type LessonStatus = "done" | "now" | "locked";
export const LEARNING_CYCLE = [
  { id: "learn", label: "Aprender" },
  { id: "understand", label: "Compreender" },
  { id: "practice", label: "Praticar" },
  { id: "speak", label: "Falar" },
  { id: "mission", label: "Missão" },
  { id: "mastery", label: "Domínio" },
] as const;

export type LearningPhase = (typeof LEARNING_CYCLE)[number]["id"];
export type Lesson = {
  title: string;
  meta: string;
  status: LessonStatus;
  href?: string;
  phase?: LearningPhase;
};
export type UnitStatus = "done" | "current" | "locked";
export type Unit = {
  n: number;
  title: string;
  objective: string;
  status: UnitStatus;
  pct: number;
  lessons: Lesson[];
  canDo?: string[];
  languageFocus?: string[];
  pronunciation?: string;
  communicationStrategy?: string;
  mission?: string;
  checkpoint?: string;
};
export type Course = { pct: number; units: Unit[] };

const COURSE_A1: Course = {
  pct: 2,
  units: [
    {
      n: 1,
      title: "Hello!",
      objective: "Cumprimentar alguém, dizer seu nome e pedir o nome da outra pessoa.",
      status: "current",
      pct: 25,
      canDo: [
        "Cumprimentar e se despedir em situações simples.",
        "Dizer seu nome e perguntar o nome de alguém.",
        "Soletrar o próprio nome e pedir repetição quando necessário.",
      ],
      languageFocus: ["cumprimentos", "I am / You are", "my / your", "alfabeto"],
      pronunciation: "Alfabeto, contrações com I'm e ritmo de perguntas curtas.",
      communicationStrategy: "Sorry, can you repeat that, please?",
      mission: "Conversar por 2 minutos com a IA e se apresentar.",
      lessons: [
        {
          title: "Conhecendo alguém",
          meta: "Aprender · 6 min",
          status: "now",
          href: "/aluno/licao/apresentando-se",
          phase: "learn",
        },
        {
          title: "Ouvir nomes e cumprimentos",
          meta: "Compreender · 6 min",
          status: "now",
          href: "/aluno/licao/apresentando-se",
          phase: "understand",
        },
        {
          title: "Treinar am, are, my e your",
          meta: "Praticar · 8 min",
          status: "now",
          href: "/aluno/praticar",
          phase: "practice",
        },
        {
          title: "Dizer e soletrar seu nome",
          meta: "Falar · 5 min",
          status: "now",
          href: "/aluno/pronuncia",
          phase: "speak",
        },
        {
          title: "Primeiro encontro",
          meta: "Missão com IA · 5 min",
          status: "now",
          href: "/aluno/roleplay",
          phase: "mission",
        },
        {
          title: "Mostrar o que você consegue fazer",
          meta: "Domínio · 6 min",
          status: "locked",
          phase: "mastery",
        },
      ],
    },
    {
      n: 2,
      title: "About Me",
      objective: "Dar informações pessoais básicas e fazer perguntas simples sobre outra pessoa.",
      status: "locked",
      pct: 0,
      canDo: [
        "Dizer idade, país, nacionalidade, idioma e profissão.",
        "Perguntar e responder informações pessoais básicas.",
        "Criar um perfil pessoal curto e claro.",
      ],
      languageFocus: ["países e nacionalidades", "verbo to be", "he / she", "perguntas simples"],
      pronunciation: "Números, países e tonicidade de nacionalidades.",
      communicationStrategy: "How do you say ... in English?",
      mission: "Criar seu perfil e conhecer uma pessoa em uma conversa guiada.",
      lessons: [
        { title: "Informações pessoais", meta: "Aprender · 8 min", status: "locked", phase: "learn" },
        { title: "Ouvir perfis curtos", meta: "Compreender · 6 min", status: "locked", phase: "understand" },
        { title: "Montar perguntas e respostas", meta: "Praticar · 9 min", status: "locked", phase: "practice" },
        { title: "Falar sobre você", meta: "Falar · 6 min", status: "locked", phase: "speak" },
        { title: "Conhecer alguém", meta: "Missão com IA · 6 min", status: "locked", phase: "mission" },
        { title: "Perfil pessoal", meta: "Domínio · 7 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 3,
      title: "My Family",
      objective: "Apresentar familiares e pessoas próximas com frases simples.",
      status: "locked",
      pct: 0,
      canDo: [
        "Nomear familiares e explicar relações básicas.",
        "Apresentar uma pessoa usando nome e relação familiar.",
        "Compreender uma descrição curta de família.",
      ],
      languageFocus: ["família", "my / his / her / our / their", "possessive 's", "this is"],
      pronunciation: "Sons de this, mother, father e contrações com is.",
      communicationStrategy: "Who is this?",
      mission: "Apresentar três pessoas da sua família ou convivência para a IA.",
      lessons: [
        { title: "Pessoas importantes", meta: "Aprender · 7 min", status: "locked", phase: "learn" },
        { title: "Ouvir uma apresentação de família", meta: "Compreender · 7 min", status: "locked", phase: "understand" },
        { title: "Usar possessivos", meta: "Praticar · 9 min", status: "locked", phase: "practice" },
        { title: "Apresentar uma pessoa", meta: "Falar · 6 min", status: "locked", phase: "speak" },
        { title: "Álbum de família", meta: "Missão com IA · 6 min", status: "locked", phase: "mission" },
        { title: "Minha família em 5 frases", meta: "Domínio · 7 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 4,
      title: "My Daily Routine",
      objective: "Descrever uma rotina simples e informar horários.",
      status: "locked",
      pct: 0,
      canDo: [
        "Dizer o que faz em diferentes momentos do dia.",
        "Perguntar e informar horas simples.",
        "Compreender a sequência principal de uma rotina curta.",
      ],
      languageFocus: ["ações do dia", "present simple", "he / she + s", "horas e períodos"],
      pronunciation: "Terminação -s e ritmo de horários.",
      communicationStrategy: "What time do you ...?",
      mission: "Contar sua rotina da manhã e responder perguntas da IA.",
      checkpoint: "Checkpoint 1 · Unidades 1–4",
      lessons: [
        { title: "Um dia comum", meta: "Aprender · 8 min", status: "locked", phase: "learn" },
        { title: "Ouvir uma rotina", meta: "Compreender · 7 min", status: "locked", phase: "understand" },
        { title: "Organizar ações e horários", meta: "Praticar · 10 min", status: "locked", phase: "practice" },
        { title: "Contar sua manhã", meta: "Falar · 6 min", status: "locked", phase: "speak" },
        { title: "Entrevista sobre rotina", meta: "Missão com IA · 7 min", status: "locked", phase: "mission" },
        { title: "Checkpoint 1", meta: "Domínio · 15 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 5,
      title: "Food & Drinks",
      objective: "Pedir comida e bebida e expressar preferências básicas.",
      status: "locked",
      pct: 0,
      canDo: [
        "Dizer do que gosta e do que não gosta.",
        "Fazer um pedido simples com cortesia.",
        "Compreender perguntas previsíveis de um atendente.",
      ],
      languageFocus: ["comidas e bebidas", "like / don't like", "want / I'd like", "some / any"],
      pronunciation: "I'd like, please e nomes de alimentos frequentes.",
      communicationStrategy: "That's all, thank you.",
      mission: "Pedir uma bebida e algo para comer em um café virtual.",
      lessons: [
        { title: "Comidas e preferências", meta: "Aprender · 8 min", status: "locked", phase: "learn" },
        { title: "Ouvir um pedido", meta: "Compreender · 7 min", status: "locked", phase: "understand" },
        { title: "Montar pedidos simples", meta: "Praticar · 9 min", status: "locked", phase: "practice" },
        { title: "Pedir com clareza", meta: "Falar · 6 min", status: "locked", phase: "speak" },
        { title: "No café", meta: "Missão com IA · 7 min", status: "locked", phase: "mission" },
        { title: "Meu pedido completo", meta: "Domínio · 7 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 6,
      title: "My House",
      objective: "Descrever cômodos, móveis e a posição de objetos.",
      status: "locked",
      pct: 0,
      canDo: [
        "Nomear os principais cômodos e móveis.",
        "Dizer o que existe em um ambiente.",
        "Localizar objetos usando preposições simples.",
      ],
      languageFocus: ["casa e móveis", "there is / there are", "in / on / under", "next to"],
      pronunciation: "There is, there are e contraste entre room e living room.",
      communicationStrategy: "Where is the ...?",
      mission: "Descrever um cômodo para a IA identificar qual é.",
      lessons: [
        { title: "Minha casa", meta: "Aprender · 8 min", status: "locked", phase: "learn" },
        { title: "Ouvir a descrição de um quarto", meta: "Compreender · 7 min", status: "locked", phase: "understand" },
        { title: "Localizar objetos", meta: "Praticar · 9 min", status: "locked", phase: "practice" },
        { title: "Descrever um cômodo", meta: "Falar · 6 min", status: "locked", phase: "speak" },
        { title: "Que cômodo é esse?", meta: "Missão com IA · 6 min", status: "locked", phase: "mission" },
        { title: "Minha casa em frases", meta: "Domínio · 7 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 7,
      title: "Around Town",
      objective: "Perguntar onde ficam lugares e compreender direções muito simples.",
      status: "locked",
      pct: 0,
      canDo: [
        "Perguntar onde fica um lugar da cidade.",
        "Compreender indicações curtas e apoiadas pelo contexto.",
        "Dar uma direção simples usando comandos básicos.",
      ],
      languageFocus: ["lugares da cidade", "where is / is there", "go / turn", "left / right"],
      pronunciation: "Where is, turn e pares left/right.",
      communicationStrategy: "Excuse me, where is ...?",
      mission: "Encontrar um local seguindo as instruções da IA.",
      lessons: [
        { title: "Lugares da cidade", meta: "Aprender · 8 min", status: "locked", phase: "learn" },
        { title: "Ouvir direções", meta: "Compreender · 7 min", status: "locked", phase: "understand" },
        { title: "Seguir um mapa", meta: "Praticar · 9 min", status: "locked", phase: "practice" },
        { title: "Pedir ajuda na rua", meta: "Falar · 6 min", status: "locked", phase: "speak" },
        { title: "Encontre a estação", meta: "Missão com IA · 7 min", status: "locked", phase: "mission" },
        { title: "Rota correta", meta: "Domínio · 7 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 8,
      title: "Shopping",
      objective: "Perguntar preços e realizar uma compra simples.",
      status: "locked",
      pct: 0,
      canDo: [
        "Nomear cores, roupas e tamanhos frequentes.",
        "Perguntar e compreender preços simples.",
        "Escolher, aceitar ou recusar um produto com educação.",
      ],
      languageFocus: ["roupas, cores e tamanhos", "this / that", "these / those", "how much"],
      pronunciation: "Números de preços e contraste this/these.",
      communicationStrategy: "Do you have this in ...?",
      mission: "Comprar uma camiseta com cor e tamanho definidos.",
      checkpoint: "Checkpoint 2 · Unidades 5–8",
      lessons: [
        { title: "Escolhendo uma roupa", meta: "Aprender · 8 min", status: "locked", phase: "learn" },
        { title: "Ouvir preços e tamanhos", meta: "Compreender · 7 min", status: "locked", phase: "understand" },
        { title: "Comparar produtos", meta: "Praticar · 9 min", status: "locked", phase: "practice" },
        { title: "Perguntar preço e tamanho", meta: "Falar · 6 min", status: "locked", phase: "speak" },
        { title: "Na loja", meta: "Missão com IA · 7 min", status: "locked", phase: "mission" },
        { title: "Checkpoint 2", meta: "Domínio · 15 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 9,
      title: "Free Time",
      objective: "Conversar de forma simples sobre gostos, hobbies e habilidades.",
      status: "locked",
      pct: 0,
      canDo: [
        "Dizer quais atividades gosta ou não gosta de fazer.",
        "Perguntar sobre os hobbies de alguém.",
        "Dizer o que sabe ou não sabe fazer.",
      ],
      languageFocus: ["hobbies", "like + -ing", "love / hate", "can / can't"],
      pronunciation: "Can e can't em frases afirmativas e negativas.",
      communicationStrategy: "What do you like doing?",
      mission: "Descobrir dois interesses em comum com a IA.",
      lessons: [
        { title: "O que você gosta de fazer?", meta: "Aprender · 8 min", status: "locked", phase: "learn" },
        { title: "Ouvir pessoas falando de hobbies", meta: "Compreender · 7 min", status: "locked", phase: "understand" },
        { title: "Combinar gostos e habilidades", meta: "Praticar · 9 min", status: "locked", phase: "practice" },
        { title: "Falar do seu tempo livre", meta: "Falar · 6 min", status: "locked", phase: "speak" },
        { title: "Interesses em comum", meta: "Missão com IA · 7 min", status: "locked", phase: "mission" },
        { title: "Meu perfil de hobbies", meta: "Domínio · 7 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 10,
      title: "The Weekend",
      objective: "Contar poucas informações sobre um fim de semana recente.",
      status: "locked",
      pct: 0,
      canDo: [
        "Dizer onde esteve e como foi uma experiência recente.",
        "Contar duas ou três ações concluídas usando verbos frequentes.",
        "Compreender referências simples a ontem e ao fim de semana.",
      ],
      languageFocus: ["yesterday e weekend", "was / were", "went / had", "verbos frequentes"],
      pronunciation: "Was/were e terminações de verbos regulares frequentes.",
      communicationStrategy: "It was good / great / tiring.",
      mission: "Contar três fatos sobre seu último fim de semana com apoio da IA.",
      lessons: [
        { title: "Ontem e no fim de semana", meta: "Aprender · 8 min", status: "locked", phase: "learn" },
        { title: "Ouvir um relato curto", meta: "Compreender · 7 min", status: "locked", phase: "understand" },
        { title: "Organizar três fatos no passado", meta: "Praticar · 10 min", status: "locked", phase: "practice" },
        { title: "Contar como foi", meta: "Falar · 6 min", status: "locked", phase: "speak" },
        { title: "Meu último fim de semana", meta: "Missão com IA · 7 min", status: "locked", phase: "mission" },
        { title: "Relato em 3 frases", meta: "Domínio · 7 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 11,
      title: "Travel English",
      objective: "Resolver necessidades previsíveis em uma viagem com linguagem muito simples.",
      status: "locked",
      pct: 0,
      canDo: [
        "Localizar portão, transporte, quarto ou serviço essencial.",
        "Informar que tem uma reserva e pedir ajuda.",
        "Compreender números, horários e instruções curtas quando falados devagar.",
      ],
      languageFocus: ["aeroporto e hotel", "I have / I need", "where is", "números e horários"],
      pronunciation: "Gate, ticket, hotel, reservation e frases de emergência.",
      communicationStrategy: "I need help. Can you speak slowly?",
      mission: "Completar uma jornada guiada: aeroporto, hotel, restaurante e transporte.",
      lessons: [
        { title: "Frases essenciais de viagem", meta: "Aprender · 9 min", status: "locked", phase: "learn" },
        { title: "Ouvir avisos e atendentes", meta: "Compreender · 8 min", status: "locked", phase: "understand" },
        { title: "Escolher a frase certa", meta: "Praticar · 10 min", status: "locked", phase: "practice" },
        { title: "Pedir ajuda com clareza", meta: "Falar · 7 min", status: "locked", phase: "speak" },
        { title: "Jornada de viagem", meta: "Missão com IA · 12 min", status: "locked", phase: "mission" },
        { title: "Kit de sobrevivência", meta: "Domínio · 8 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 12,
      title: "Real Life English",
      objective: "Integrar o A1 para resolver situações básicas com apoio de um interlocutor cooperativo.",
      status: "locked",
      pct: 0,
      canDo: [
        "Responder perguntas pessoais e falar brevemente sobre rotina e preferências.",
        "Realizar uma troca simples em hotel, café, loja ou transporte.",
        "Pedir repetição, falar mais devagar e confirmar informações essenciais.",
      ],
      languageFocus: ["revisão integrada", "compreensão", "interação oral", "escrita curta"],
      pronunciation: "Inteligibilidade das frases-chave trabalhadas no A1.",
      communicationStrategy: "Sorry, can you repeat that more slowly?",
      mission: "Resolver quatro situações reais e receber um plano de revisão personalizado.",
      checkpoint: "Checkpoint 3 · Avaliação final A1",
      lessons: [
        { title: "Revisão das frases essenciais", meta: "Aprender · 10 min", status: "locked", phase: "learn" },
        { title: "Compreensão em situações reais", meta: "Compreender · 10 min", status: "locked", phase: "understand" },
        { title: "Preparação guiada", meta: "Praticar · 12 min", status: "locked", phase: "practice" },
        { title: "Entrevista oral A1", meta: "Falar · 8 min", status: "locked", phase: "speak" },
        { title: "Circuito da vida real", meta: "Missão com IA · 15 min", status: "locked", phase: "mission" },
        { title: "Avaliação final A1", meta: "Domínio · 30 min", status: "locked", phase: "mastery" },
      ],
    },
  ],
};

const COURSE_A2: Course = {
  pct: 0,
  units: [
    {
      n: 1,
      title: "Getting to Know You Better",
      objective: "Falar sobre si e conhecer outra pessoa com mais detalhes.",
      status: "current",
      pct: 0,
      canDo: [
        "Falar sobre trabalho, estudos, interesses e características pessoais.",
        "Fazer perguntas de seguimento para conhecer melhor alguém.",
        "Manter uma conversa pessoal guiada por três ou quatro minutos.",
      ],
      languageFocus: ["informações pessoais", "present simple", "advérbios de frequência", "object pronouns"],
      pronunciation: "Ritmo de perguntas, frequência e ligações em fala curta.",
      communicationStrategy: "What about you?",
      mission: "Participar de uma entrevista de apresentação de 3 a 4 minutos.",
      lessons: [
        { title: "Muito além do nome", meta: "Aprender · 8 min", status: "locked", phase: "learn" },
        { title: "Ouvir perfis mais detalhados", meta: "Compreender · 8 min", status: "locked", phase: "understand" },
        { title: "Perguntar e responder com naturalidade", meta: "Praticar · 10 min", status: "now", href: "/aluno/praticar", phase: "practice" },
        { title: "Falar sobre você", meta: "Falar · 7 min", status: "now", href: "/aluno/pronuncia", phase: "speak" },
        { title: "Entrevista de apresentação", meta: "Missão com IA · 8 min", status: "now", href: "/aluno/roleplay", phase: "mission" },
        { title: "Meu perfil completo", meta: "Domínio · 8 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 2,
      title: "Everyday Life",
      objective: "Descrever hábitos e explicar o que está acontecendo agora.",
      status: "locked",
      pct: 0,
      canDo: [
        "Descrever rotina, trabalho doméstico e horários com mais detalhes.",
        "Distinguir um hábito de uma ação em andamento.",
        "Compreender mudanças simples em uma rotina.",
      ],
      languageFocus: ["rotina e tarefas", "present simple", "present continuous", "expressões de frequência"],
      pronunciation: "Formas contraídas com be e terminação -ing.",
      communicationStrategy: "Usually I ..., but today I'm ...",
      mission: "Comparar sua rotina normal com o que está fazendo hoje.",
      lessons: [
        { title: "Rotinas reais", meta: "Aprender · 8 min", status: "locked", phase: "learn" },
        { title: "Hábito ou agora?", meta: "Compreender · 8 min", status: "locked", phase: "understand" },
        { title: "Escolher o tempo pelo contexto", meta: "Praticar · 10 min", status: "locked", phase: "practice" },
        { title: "Comparar dois dias", meta: "Falar · 7 min", status: "locked", phase: "speak" },
        { title: "Um dia fora da rotina", meta: "Missão com IA · 8 min", status: "locked", phase: "mission" },
        { title: "Minha rotina em contexto", meta: "Domínio · 8 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 3,
      title: "What Happened?",
      objective: "Contar acontecimentos passados e fazer perguntas sobre eles.",
      status: "locked",
      pct: 0,
      canDo: [
        "Contar o que fez em um fim de semana ou passeio.",
        "Perguntar e responder sobre uma experiência passada.",
        "Usar referências de tempo para situar acontecimentos.",
      ],
      languageFocus: ["atividades e eventos", "past simple", "did / didn't", "verbos regulares e irregulares"],
      pronunciation: "Terminações -ed e formas frequentes no passado.",
      communicationStrategy: "And what happened next?",
      mission: "Contar e responder perguntas sobre seu último fim de semana.",
      lessons: [
        { title: "Acontecimentos recentes", meta: "Aprender · 9 min", status: "locked", phase: "learn" },
        { title: "Ouvir sobre o fim de semana", meta: "Compreender · 8 min", status: "locked", phase: "understand" },
        { title: "Construir perguntas no passado", meta: "Praticar · 11 min", status: "locked", phase: "practice" },
        { title: "Contar o que aconteceu", meta: "Falar · 8 min", status: "locked", phase: "speak" },
        { title: "Meu último fim de semana", meta: "Missão com IA · 9 min", status: "locked", phase: "mission" },
        { title: "Relato e perguntas", meta: "Domínio · 9 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 4,
      title: "Stories & Experiences",
      objective: "Organizar e contar uma história curta em sequência.",
      status: "locked",
      pct: 0,
      canDo: [
        "Organizar acontecimentos com começo, desenvolvimento e final.",
        "Usar conectores simples para mostrar a sequência.",
        "Contar oralmente uma história curta e compreensível.",
      ],
      languageFocus: ["sequência de eventos", "past simple", "was / were", "first / then / finally"],
      pronunciation: "Pausas, ênfase e entonação para organizar uma narrativa.",
      communicationStrategy: "First ..., then ..., and finally ...",
      mission: "Contar uma história curta para a IA e responder uma pergunta sobre ela.",
      checkpoint: "Checkpoint 1 · Unidades 1–4 · fala obrigatória",
      lessons: [
        { title: "Como organizar uma história", meta: "Aprender · 9 min", status: "locked", phase: "learn" },
        { title: "Ouvir uma narrativa curta", meta: "Compreender · 9 min", status: "locked", phase: "understand" },
        { title: "Colocar eventos em ordem", meta: "Praticar · 10 min", status: "locked", phase: "practice" },
        { title: "Contar com começo, meio e fim", meta: "Falar · 8 min", status: "locked", phase: "speak" },
        { title: "Uma história para contar", meta: "Missão com IA · 10 min", status: "locked", phase: "mission" },
        { title: "Checkpoint 1 com speaking", meta: "Domínio · 18 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 5,
      title: "Food & Lifestyle",
      objective: "Conversar sobre alimentação, quantidades e hábitos saudáveis.",
      status: "locked",
      pct: 0,
      canDo: [
        "Descrever hábitos alimentares e refeições comuns.",
        "Perguntar e responder sobre quantidades.",
        "Dar uma sugestão simples para uma rotina mais saudável.",
      ],
      languageFocus: ["alimentos e ingredientes", "countable / uncountable", "much / many", "enough / a lot of"],
      pronunciation: "Quantidades, ingredientes e formas reduzidas em perguntas.",
      communicationStrategy: "How much / How many ...?",
      mission: "Analisar uma rotina alimentar e sugerir uma mudança possível.",
      lessons: [
        { title: "Comida, hábitos e saúde", meta: "Aprender · 9 min", status: "locked", phase: "learn" },
        { title: "Ouvir escolhas alimentares", meta: "Compreender · 8 min", status: "locked", phase: "understand" },
        { title: "Falar de quantidades", meta: "Praticar · 10 min", status: "locked", phase: "practice" },
        { title: "Descrever seus hábitos", meta: "Falar · 8 min", status: "locked", phase: "speak" },
        { title: "Um plano mais saudável", meta: "Missão com IA · 9 min", status: "locked", phase: "mission" },
        { title: "Meu dia de alimentação", meta: "Domínio · 9 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 6,
      title: "Shopping & Money",
      objective: "Comparar opções, comprar e solicitar uma troca com segurança.",
      status: "locked",
      pct: 0,
      canDo: [
        "Comparar preços, tamanhos e características de produtos.",
        "Perguntar sobre pagamento, desconto e disponibilidade.",
        "Explicar um problema e solicitar uma troca simples.",
      ],
      languageFocus: ["compras e dinheiro", "comparatives", "superlatives", "trocas e devoluções"],
      pronunciation: "Preços, números maiores e formas comparativas.",
      communicationStrategy: "Could I exchange this, please?",
      mission: "Escolher um produto e resolver uma troca com o vendedor virtual.",
      lessons: [
        { title: "Escolhas e preços", meta: "Aprender · 9 min", status: "locked", phase: "learn" },
        { title: "Ouvir comparações e condições", meta: "Compreender · 8 min", status: "locked", phase: "understand" },
        { title: "Comparar antes de comprar", meta: "Praticar · 10 min", status: "locked", phase: "practice" },
        { title: "Explicar o que precisa", meta: "Falar · 8 min", status: "locked", phase: "speak" },
        { title: "Compra e troca", meta: "Missão com IA · 10 min", status: "locked", phase: "mission" },
        { title: "A melhor opção", meta: "Domínio · 9 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 7,
      title: "My City",
      objective: "Descrever lugares, comparar regiões e orientar deslocamentos.",
      status: "locked",
      pct: 0,
      canDo: [
        "Descrever um bairro e seus principais serviços.",
        "Comparar duas regiões ou formas de transporte.",
        "Dar e compreender direções em uma rota curta.",
      ],
      languageFocus: ["bairro e transporte", "preposições", "there is / there are", "comparatives"],
      pronunciation: "Nomes de lugares, direções e agrupamentos consonantais.",
      communicationStrategy: "The easiest way to get there is ...",
      mission: "Orientar um turista até um lugar da cidade.",
      lessons: [
        { title: "Bairros e deslocamentos", meta: "Aprender · 9 min", status: "locked", phase: "learn" },
        { title: "Ouvir uma rota", meta: "Compreender · 8 min", status: "locked", phase: "understand" },
        { title: "Comparar lugares e transportes", meta: "Praticar · 10 min", status: "locked", phase: "practice" },
        { title: "Explicar como chegar", meta: "Falar · 8 min", status: "locked", phase: "speak" },
        { title: "Ajude um turista", meta: "Missão com IA · 9 min", status: "locked", phase: "mission" },
        { title: "Minha cidade em detalhes", meta: "Domínio · 9 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 8,
      title: "Travel",
      objective: "Conduzir uma viagem comum e resolver um problema simples no hotel.",
      status: "locked",
      pct: 0,
      canDo: [
        "Fazer ou alterar uma reserva usando pedidos educados.",
        "Compreender informações previsíveis de aeroporto, hotel e transporte.",
        "Explicar um problema de hospedagem e pedir uma solução.",
      ],
      languageFocus: ["viagem e reservas", "can / could", "would like", "pedidos e problemas"],
      pronunciation: "Could you, I'd like e vocabulário de reserva.",
      communicationStrategy: "I'd like to change my reservation.",
      mission: "Fazer check-in e resolver um problema no quarto.",
      checkpoint: "Checkpoint 2 · Unidades 5–8 · fala obrigatória",
      lessons: [
        { title: "Uma viagem completa", meta: "Aprender · 10 min", status: "locked", phase: "learn" },
        { title: "Ouvir atendentes e avisos", meta: "Compreender · 9 min", status: "locked", phase: "understand" },
        { title: "Fazer pedidos educados", meta: "Praticar · 11 min", status: "locked", phase: "practice" },
        { title: "Explicar um problema no hotel", meta: "Falar · 8 min", status: "locked", phase: "speak" },
        { title: "Reserva e check-in", meta: "Missão com IA · 12 min", status: "locked", href: "/aluno/licao/reservas-e-check-in", phase: "mission" },
        { title: "Checkpoint 2 com speaking", meta: "Domínio · 20 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 9,
      title: "Future Plans",
      objective: "Falar sobre planos, intenções e compromissos futuros.",
      status: "locked",
      pct: 0,
      canDo: [
        "Explicar planos e intenções para as próximas semanas.",
        "Informar compromissos já combinados.",
        "Fazer uma previsão ou decisão simples durante a conversa.",
      ],
      languageFocus: ["planos e metas", "going to", "present continuous for future", "will básico"],
      pronunciation: "Going to, formas contraídas e datas futuras.",
      communicationStrategy: "I'm planning to ...",
      mission: "Organizar um fim de semana combinando planos e horários com a IA.",
      lessons: [
        { title: "Planos, intenções e compromissos", meta: "Aprender · 9 min", status: "locked", phase: "learn" },
        { title: "Ouvir uma agenda", meta: "Compreender · 8 min", status: "locked", phase: "understand" },
        { title: "Escolher a forma de futuro", meta: "Praticar · 10 min", status: "locked", phase: "practice" },
        { title: "Contar seus próximos planos", meta: "Falar · 8 min", status: "locked", phase: "speak" },
        { title: "Planejar o fim de semana", meta: "Missão com IA · 9 min", status: "locked", phase: "mission" },
        { title: "Minha agenda futura", meta: "Domínio · 9 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 10,
      title: "Problems & Solutions",
      objective: "Explicar problemas cotidianos e discutir uma solução simples.",
      status: "locked",
      pct: 0,
      canDo: [
        "Explicar um problema simples de saúde, tecnologia ou viagem.",
        "Dar e compreender conselhos diretos.",
        "Dizer o que é necessário, permitido ou possível fazer.",
      ],
      languageFocus: ["problemas cotidianos", "should / shouldn't", "have to", "can / can't"],
      pronunciation: "Should, shouldn't, have to e palavras-chave do problema.",
      communicationStrategy: "The problem is that ...",
      mission: "Explicar um problema e negociar uma solução no atendimento ao cliente.",
      lessons: [
        { title: "Explicar o que está errado", meta: "Aprender · 9 min", status: "locked", phase: "learn" },
        { title: "Ouvir problemas e conselhos", meta: "Compreender · 8 min", status: "locked", phase: "understand" },
        { title: "Escolher uma solução", meta: "Praticar · 10 min", status: "locked", phase: "practice" },
        { title: "Pedir e dar conselho", meta: "Falar · 8 min", status: "locked", phase: "speak" },
        { title: "Atendimento ao cliente", meta: "Missão com IA · 10 min", status: "locked", phase: "mission" },
        { title: "Problema resolvido", meta: "Domínio · 9 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 11,
      title: "Social English",
      objective: "Iniciar, manter e encerrar uma conversa social comum.",
      status: "locked",
      pct: 0,
      canDo: [
        "Fazer, aceitar e recusar convites de forma educada.",
        "Sugerir uma atividade e combinar detalhes.",
        "Expressar preferência, concordar e discordar brevemente.",
      ],
      languageFocus: ["convites e sugestões", "would you like", "let's / why don't we", "prefer / rather"],
      pronunciation: "Entonação de convites e respostas educadas.",
      communicationStrategy: "That sounds good, but ...",
      mission: "Convidar alguém, negociar dia e horário e fechar um plano.",
      lessons: [
        { title: "Convites e preferências", meta: "Aprender · 9 min", status: "locked", phase: "learn" },
        { title: "Ouvir pessoas combinando um programa", meta: "Compreender · 8 min", status: "locked", phase: "understand" },
        { title: "Responder e sugerir alternativas", meta: "Praticar · 10 min", status: "locked", phase: "practice" },
        { title: "Manter uma conversa social", meta: "Falar · 8 min", status: "locked", phase: "speak" },
        { title: "Vamos fazer alguma coisa?", meta: "Missão com IA · 10 min", status: "locked", phase: "mission" },
        { title: "Convite combinado", meta: "Domínio · 9 min", status: "locked", phase: "mastery" },
      ],
    },
    {
      n: 12,
      title: "Real Life A2",
      objective: "Integrar o A2 para conduzir trocas comuns com mais independência.",
      status: "locked",
      pct: 0,
      canDo: [
        "Relatar passado, explicar rotina e apresentar planos em uma conversa.",
        "Resolver um problema previsível em viagem, compra ou atendimento.",
        "Iniciar e sustentar uma interação curta, pedindo esclarecimento quando necessário.",
      ],
      languageFocus: ["revisão integrada", "interação oral", "listening contextual", "writing de 70–100 palavras"],
      pronunciation: "Inteligibilidade, ritmo e autocorreção nas situações trabalhadas.",
      communicationStrategy: "Let me explain what happened.",
      mission: "Resolver situações de hotel, restaurante, transporte, vida social e trabalho.",
      checkpoint: "Checkpoint 3 · Avaliação final A2 · fala obrigatória",
      lessons: [
        { title: "Revisão das estratégias A2", meta: "Aprender · 10 min", status: "locked", phase: "learn" },
        { title: "Listening em contexto", meta: "Compreender · 10 min", status: "locked", phase: "understand" },
        { title: "Preparação por habilidade", meta: "Praticar · 12 min", status: "locked", phase: "practice" },
        { title: "Entrevista e descrição de imagem", meta: "Falar · 10 min", status: "locked", phase: "speak" },
        { title: "Circuito Real Life A2", meta: "Missão com IA · 18 min", status: "locked", phase: "mission" },
        { title: "Avaliação final A2", meta: "Domínio · 40 min", status: "locked", phase: "mastery" },
      ],
    },
  ],
};

const COURSE_B1: Course = {
  pct: 8,
  units: [
    {
      n: 1,
      title: "Experiências de vida",
      objective: "Falar sobre experiências e vivências usando present perfect.",
      status: "current",
      pct: 25,
      lessons: [
        { title: "Present perfect x passado simples", meta: "Gramática · 10 min", status: "done" },
        {
          title: "Múltipla escolha e completar (B1)",
          meta: "Prática · 12 min",
          status: "now",
          href: "/aluno/praticar",
        },
        {
          title: "Contando uma experiência",
          meta: "Conversa · 8 min",
          status: "now",
          href: "/aluno/licao/contando-uma-experiencia",
        },
        { title: "Roleplay: entrevista de experiências", meta: "Voz · 6 min", status: "locked" },
      ],
    },
    {
      n: 2,
      title: "Planos e hipóteses",
      objective: "Fazer planos, dar conselhos e imaginar situações hipotéticas.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Segunda condicional", meta: "Gramática · 9 min", status: "locked" },
        { title: "Conselhos com should/must", meta: "Gramática · 8 min", status: "locked" },
        { title: "Roleplay: pedindo conselho", meta: "Voz · 6 min", status: "locked" },
      ],
    },
    {
      n: 3,
      title: "Recomendações e opiniões",
      objective: "Usar voz passiva simples, relative clauses e discurso indireto básico.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Voz passiva no dia a dia", meta: "Gramática · 9 min", status: "locked" },
        { title: "Relative clauses (who/which)", meta: "Gramática · 8 min", status: "locked" },
        { title: "Tradução e ordenar frases (B1)", meta: "Prática · 10 min", status: "locked" },
      ],
    },
  ],
};

const COURSE_B2: Course = {
  pct: 8,
  units: [
    {
      n: 1,
      title: "Contando histórias",
      objective: "Narrar eventos e experiências recentes com mais precisão.",
      status: "current",
      pct: 25,
      lessons: [
        { title: "Past perfect x present perfect continuous", meta: "Gramática · 10 min", status: "done" },
        {
          title: "Múltipla escolha e completar (B2)",
          meta: "Prática · 12 min",
          status: "now",
          href: "/aluno/praticar",
        },
        {
          title: "Contando uma história real",
          meta: "Conversa · 8 min",
          status: "now",
          href: "/aluno/licao/contando-uma-historia",
        },
        { title: "Roleplay: contando o que aconteceu", meta: "Voz · 6 min", status: "locked" },
      ],
    },
    {
      n: 2,
      title: "Resolvendo problemas",
      objective: "Pedir serviços e lidar com imprevistos.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Voz passiva e causativo (have something done)", meta: "Gramática · 9 min", status: "locked" },
        { title: "Especulando com might/could have", meta: "Gramática · 8 min", status: "locked" },
        { title: "Roleplay: reclamação e solução", meta: "Voz · 6 min", status: "locked" },
      ],
    },
    {
      n: 3,
      title: "Conectando ideias com fluência",
      objective: "Usar conectivos, phrasal verbs e comparações elaboradas com naturalidade.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Conectivos: although, despite, however", meta: "Gramática · 9 min", status: "locked" },
        { title: "Phrasal verbs do dia a dia", meta: "Vocabulário · 8 min", status: "locked" },
        { title: "Tradução e ordenar frases (B2)", meta: "Prática · 10 min", status: "locked" },
      ],
    },
  ],
};

const COURSE_C1: Course = {
  pct: 8,
  units: [
    {
      n: 1,
      title: "Opiniões e debate",
      objective: "Argumentar, discordar com educação e defender um ponto de vista.",
      status: "current",
      pct: 25,
      lessons: [
        { title: "Conectivos de argumentação", meta: "Gramática · 10 min", status: "done" },
        {
          title: "Múltipla escolha e completar (C1)",
          meta: "Prática · 12 min",
          status: "now",
          href: "/aluno/praticar",
        },
        {
          title: "Discordando com tato",
          meta: "Conversa · 8 min",
          status: "now",
          href: "/aluno/licao/discordando-com-tato",
        },
        { title: "Roleplay: debate rápido", meta: "Voz · 6 min", status: "locked" },
      ],
    },
    {
      n: 2,
      title: "Comunicação no trabalho",
      objective: "Negociar prazos, dar feedback e escrever e-mails formais.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Voz passiva em relatórios", meta: "Gramática · 9 min", status: "locked" },
        { title: "E-mails formais", meta: "Escrita · 10 min", status: "locked" },
        { title: "Roleplay: negociação", meta: "Voz · 6 min", status: "locked" },
      ],
    },
    {
      n: 3,
      title: "Nuance e expressões idiomáticas",
      objective: "Usar phrasal verbs, collocations e inversão com naturalidade.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Phrasal verbs no trabalho", meta: "Vocabulário · 9 min", status: "locked" },
        { title: "Inversão para ênfase", meta: "Gramática · 10 min", status: "locked" },
        { title: "Tradução e ordenar frases (C1)", meta: "Prática · 10 min", status: "locked" },
      ],
    },
  ],
};

const COURSE_C2: Course = {
  pct: 8,
  units: [
    {
      n: 1,
      title: "Retórica e persuasão",
      objective: "Usar inversão enfática e condicionais invertidos para argumentar com sofisticação.",
      status: "current",
      pct: 25,
      lessons: [
        { title: "Inversão enfática e condicionais invertidos", meta: "Gramática · 10 min", status: "done" },
        {
          title: "Múltipla escolha e completar (C2)",
          meta: "Prática · 12 min",
          status: "now",
          href: "/aluno/praticar",
        },
        {
          title: "Construindo um argumento persuasivo",
          meta: "Conversa · 8 min",
          status: "now",
          href: "/aluno/licao/argumento-persuasivo",
        },
        { title: "Roleplay: debate de alto nível", meta: "Voz · 6 min", status: "locked" },
      ],
    },
    {
      n: 2,
      title: "Nuance e registro",
      objective: "Ajustar o tom entre formal e informal e usar expressões idiomáticas sofisticadas.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Subjuntivo e verbos de exigência", meta: "Gramática · 9 min", status: "locked" },
        { title: "Collocations e expressões fixas", meta: "Vocabulário · 8 min", status: "locked" },
        { title: "Roleplay: negociação de alto nível", meta: "Voz · 6 min", status: "locked" },
      ],
    },
    {
      n: 3,
      title: "Redação avançada",
      objective: "Escrever com coesão e precisão em contextos acadêmicos e profissionais.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Cleft sentences e ênfase", meta: "Gramática · 9 min", status: "locked" },
        { title: "Conectivos de alto registro", meta: "Escrita · 8 min", status: "locked" },
        { title: "Tradução e ordenar frases (C2)", meta: "Prática · 10 min", status: "locked" },
      ],
    },
  ],
};

export const COURSES: Record<CefrLevel, Course> = {
  A1: COURSE_A1,
  A2: COURSE_A2,
  B1: COURSE_B1,
  B2: COURSE_B2,
  C1: COURSE_C1,
  C2: COURSE_C2,
};

export function courseHasContent(level: CefrLevel): boolean {
  return COURSES[level].units.length > 0;
}

/** Nível de trilha a mostrar: o do aluno, ou o mais próximo já populado. */
export function resolveCourseLevel(level: CefrLevel): CefrLevel {
  return nearestLevelWithContent(level, courseHasContent, "A2");
}
